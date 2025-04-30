/**
 * Service Booking System
 * Handles the entire booking workflow for pet services
 */

// Global Variables
let currentUser = null;
let selectedServices = [];
let userPets = [];
let selectedPet = null;
let allServices = [];
let today = new Date();
today.setHours(0, 0, 0, 0);

// Format date as YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

// Format currency 
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

async function initializeAuth() {
    try {
        if (!window.authService) {
            console.warn('Auth service not found. User will be treated as unauthenticated.');
            currentUser = null;
            return;
        }

        const user = window.authService.getCurrentUser();
        if (user && user.id && user.username) {
            currentUser = user;
            console.log('Authenticated user from authService:', currentUser);
            localStorage.setItem('currentUser', JSON.stringify(user)); // Sync localStorage
        } else {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    if (parsedUser.id && parsedUser.username) {
                        currentUser = parsedUser;
                        console.log('Authenticated user from localStorage:', currentUser);
                    } else {
                        console.warn('Stored user data is incomplete:', parsedUser);
                        currentUser = null;
                    }
                } catch (e) {
                    console.error('Failed to parse stored user:', e);
                    currentUser = null;
                }
            } else {
                console.log('No authenticated user found.');
                currentUser = null;
            }
        }

        updateAuthUI();
    } catch (error) {
        console.error('Authentication initialization failed:', error);
        currentUser = null;
        updateAuthUI();
        showAlert('danger', 'Authentication error. Please log in again.');
    }
}

// Initialize the booking system
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing booking system');
    
    // Set minimum date for booking to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        dateInput.min = formatDate(tomorrow);
    }

    // Initialize authentication
    await initializeAuth();
    
    // Check if API service is available and initialized
    if (!window.apiService) {
        console.error('API Service not found. Make sure api-service.js is loaded before service.js');
        showAlert('danger', 'System configuration error. Please contact support.');
        return;
    }
    
    // Wait for API service to initialize
    try {
        await window.apiService.init();
    } catch (error) {
        console.warn('API Service initialization failed, continuing in offline mode', error);
        // Continue with offline mode - we'll use mock data
    }
    
    // Replace placeholder images with reliable ones
    replacePlaceholderImages();
    
    // Load services for step 1
    await loadServices();
    
    // Add event listeners for navigation buttons
    setupNavigationButtons();
    
    // Set up form handlers
    setupFormHandlers();
    
    // Set up event listeners for pet selection
    setupPetSelectionHandlers();
    
    // Set up booking confirmation
    setupBookingConfirmation();
}); 

// Show alert message
function showAlert(type, message, duration = 5000) {
    // Create alert container if it doesn't exist
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.className = 'position-fixed top-0 start-50 translate-middle-x p-3';
        alertContainer.style.zIndex = '9999';
        document.body.appendChild(alertContainer);
    }
    
    // Create alert element
    const alertId = 'alert-' + Date.now();
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    // Add alert to container
    alertContainer.insertAdjacentHTML('beforeend', alertHtml);
    
    // Auto-dismiss after duration
    if (duration > 0) {
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                if (typeof bootstrap !== 'undefined' && bootstrap.Alert) {
                    const bsAlert = new bootstrap.Alert(alertElement);
                    bsAlert.close();
                } else {
                    alertElement.remove();
                }
            }
        }, duration);
    }
}

// Update Auth UI based on login status
function updateAuthUI() {
    // Add login/profile button to navbar if it doesn't exist
    const navbar = document.querySelector('.navbar-nav');
    if (!navbar) return;
    
    // Check if auth buttons already exist
    if (!document.querySelector('.nav-auth')) {
        const authLi = document.createElement('li');
        authLi.className = 'nav-item nav-auth';
        
        if (currentUser) {
            // User is logged in - show profile & logout
            authLi.innerHTML = `
                <div class="dropdown">
                    <a class="nav-link dropdown-toggle" href="#" role="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-user-circle"></i> ${currentUser.username}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li><a class="dropdown-item" href="#" id="myBookingsBtn">My Bookings</a></li>
                        <li><a class="dropdown-item" href="#" id="myProfileBtn">My Profile</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" id="logoutBtn">Logout</a></li>
                    </ul>
                </div>
            `;
        } else {
            // User is not logged in - show login/register
            authLi.innerHTML = `
                <a class="nav-link" href="index.html">
                    <i class="fas fa-home"></i> Return to Home
                </a>
            `;
        }
        
        navbar.appendChild(authLi);
        
        // Add event listeners for dropdown items
        if (currentUser) {
            document.getElementById('myBookingsBtn')?.addEventListener('click', function(e) {
                e.preventDefault();
                loadUserBookings();
            });
            
            document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
                e.preventDefault();
                window.authService.logout();
                window.location.href = 'index.html'; // Redirect to home page after logout
            });
        }
    }
}

// Set up navigation buttons between steps
function setupNavigationButtons() {
    // Next step buttons
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', function() {
            const nextTab = this.getAttribute('data-next');
            
            // Validate current step before proceeding
            const currentStep = document.querySelector('.tab-pane.active').id;
            if (!validateStep(currentStep)) {
                return;
            }
            
            // If going to step 2, load pets
            if (nextTab === 'step2-tab' && currentUser) {
                loadUserPets();
            }
            
            // If going to step 4, update summary
            if (nextTab === 'step4-tab') {
                updateBookingSummary();
            }
            
            // Switch to next tab
            document.getElementById(nextTab).click();
        });
    });
    
    // Previous step buttons
    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', function() {
            const prevTab = this.getAttribute('data-prev');
            document.getElementById(prevTab).click();
        });
    });
}

// Validate each step before proceeding
function validateStep(stepId) {
    switch(stepId) {
        case 'step1':
            if (selectedServices.length === 0) {
                alert('Please select at least one service.');
                return false;
            }
            return true;
        
        case 'step2':
            if (!currentUser) {
                // Show alert instead of redirecting
                showAlert('warning', 'You need to be logged in to continue. Please log in from the homepage.');
                return false;
            }
            
            if (!selectedPet) {
                alert('Please select a pet or add a new one.');
                return false;
            }
            return true;
            
        case 'step3':
            const dateInput = document.getElementById('booking-date');
            const timeInput = document.getElementById('booking-time');
            
            if (!dateInput.value) {
                alert('Please select a date for your appointment.');
                dateInput.focus();
                return false;
            }
            
            if (!timeInput.value) {
                alert('Please select a time for your appointment.');
                timeInput.focus();
                return false;
            }
            
            // Validate that selected date is not in the past
            const selectedDate = new Date(dateInput.value);
            if (selectedDate < today) {
                alert('Please select a future date for your appointment.');
                dateInput.focus();
                return false;
            }
            
            return true;
    }
    
    return true;
}

// Load services from API
async function loadServices() {
    try {
        const servicesContainer = document.getElementById('services-container');
        if (!servicesContainer) return;

        servicesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading services...</p>
            </div>
        `;

        const response = await fetch(`${window.apiService.API_BASE_URL}/services`);
        if (!response.ok) {
            throw new Error(`Failed to load services: ${response.status} ${response.statusText}`);
        }

        const services = await response.json();
        allServices = Array.isArray(services) ? services : [services];
        const activeServices = allServices.filter(service => service.active);

        updateServicesUI(activeServices);

        const storedServices = localStorage.getItem('selectedServices');
        if (storedServices) {
            try {
                const parsedServices = JSON.parse(storedServices);
                selectedServices = parsedServices.filter(s => allServices.some(as => as.id === s.id));
                selectedServices.forEach(service => {
                    const serviceCard = document.querySelector(`.service-card[data-service-id="${CSS.escape(service.id)}"]`);
                    if (serviceCard) {
                        serviceCard.classList.add('selected');
                        const selectBtn = serviceCard.querySelector('.select-service-btn');
                        if (selectBtn) {
                            selectBtn.innerHTML = '<i class="fas fa-check-circle"></i> Selected';
                            selectBtn.classList.replace('btn-outline-primary', 'btn-success');
                        }
                    }
                });
            } catch (error) {
                console.error('Error parsing stored services:', error);
            }
        }

    } catch (error) {
        console.error('Error loading services:', error);
        const servicesContainer = document.getElementById('services-container');
        if (servicesContainer) {
            servicesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle"></i> Failed to load services. Please try again later.
                    </div>
                </div>
            `;
        }
    }
}

// Update services UI
function updateServicesUI(services) {
    const servicesContainer = document.getElementById('services-container');
    if (!servicesContainer) return;
    
    if (!services || services.length === 0) {
        servicesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> No services available at the moment.
                </div>
            </div>
        `;
        return;
    }
    
    // Clear container
    servicesContainer.innerHTML = '';
    
    // Add service cards
    services.forEach(service => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        const card = document.createElement('div');
        card.className = 'card h-100 service-card';
        card.setAttribute('data-service-id', service.id);
        
        // Check if service is already selected
        if (selectedServices.some(s => s.id === service.id)) {
            card.classList.add('selected');
        }
        
        // Default image if not provided
        const imageUrl = service.images || 'https://via.placeholder.com/300x200?text=Pet+Service';
        
        card.innerHTML = `
            <div class="position-relative">
                <img src="${imageUrl}" class="card-img-top" alt="${service.name}">
                <div class="badge bg-primary position-absolute top-0 end-0 m-2">
                    ${formatCurrency(service.price)}
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">${service.name}</h5>
                <p class="card-text">${service.description || 'No description available'}</p>
            </div>
            <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
                <span class="text-muted">
                    <i class="fas fa-clock"></i> ${service.duration || 60} min
                </span>
                <button class="btn ${selectedServices.some(s => s.id === service.id) ? 'btn-success' : 'btn-outline-primary'} select-service-btn">
                    ${selectedServices.some(s => s.id === service.id) ? '<i class="fas fa-check-circle"></i> Selected' : '<i class="fas fa-plus-circle"></i> Select'}
                </button>
            </div>
        `;
        
        // Add event listener for service selection
        card.addEventListener('click', function() {
            selectService(service.id);
        });
        
        col.appendChild(card);
        servicesContainer.appendChild(col);
    });
}

// Select or deselect a service
function selectService(serviceId) {
    const service = allServices.find(s => s.id === serviceId);
    if (!service) return;
    
    const serviceCard = document.querySelector(`.service-card[data-service-id="${CSS.escape(serviceId)}"]`);
    const selectBtn = serviceCard?.querySelector('.select-service-btn');
    
    // Check if service is already selected
    const isSelected = selectedServices.some(s => s.id === serviceId);
    
    if (isSelected) {
        // Remove service from selection
        selectedServices = selectedServices.filter(s => s.id !== serviceId);
        
        // Update UI
        serviceCard?.classList.remove('selected');
        if (selectBtn) {
            selectBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Select';
            selectBtn.classList.replace('btn-success', 'btn-outline-primary');
        }
    } else {
        // Add service to selection
        selectedServices.push(service);
        
        // Update UI
        serviceCard?.classList.add('selected');
        if (selectBtn) {
            selectBtn.innerHTML = '<i class="fas fa-check-circle"></i> Selected';
            selectBtn.classList.replace('btn-outline-primary', 'btn-success');
        }
    }

    localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
}

// Set up form handlers
function setupFormHandlers() {
    // Add event listener to date input to update available times
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            // Could implement logic to fetch available times for the selected date
            // For now, all times are available
        });
    }
    
    // Add New Pet button
    const addNewPetBtn = document.getElementById('add-new-pet-btn');
    if (addNewPetBtn) {
        addNewPetBtn.addEventListener('click', function() {
            // Show add pet modal
            const addPetModal = new bootstrap.Modal(document.getElementById('addPetModal'));
            addPetModal.show();
        });
    }
    
    // Save Pet button
    const savePetBtn = document.getElementById('save-pet-btn');
    if (savePetBtn) {
        savePetBtn.addEventListener('click', savePet);
    }
    
    // Add refresh pets button handler
    const refreshPetsBtn = document.getElementById('refresh-pets-btn');
    if (refreshPetsBtn) {
        refreshPetsBtn.addEventListener('click', function() {
            // Try to get fresh auth data
            if (window.authService) {
                try {
                    currentUser = window.authService.getCurrentUser();
                } catch (e) {
                    console.error('Failed to refresh user data:', e);
                }
            }
            
            // Reload pets
            loadUserPets();
        });
    }
}

// Validate pet form
function validatePetForm() {
    const petName = document.getElementById('pet-name');
    const petSpecies = document.getElementById('pet-species');

    if (!petName) {
        console.error('Pet name field not found');
        showAlert('danger', 'Form error: Required fields not found');
        return false;
    }

    if (!petName.value.trim()) {
        showAlert('danger', 'Pet name is required');
        petName.focus();
        return false;
    }

    if (petSpecies && !petSpecies.value) {
        showAlert('danger', 'Please select a species');
        petSpecies.focus();
        return false;
    }

    return true;
}

// Save pet
async function savePet() {
    if (!validatePetForm()) {
        return;
    }

    try {
        const saveBtn = document.getElementById('save-pet-btn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

        const petData = {
            name: document.getElementById('pet-name').value,
            species: document.getElementById('pet-species')?.value || '',
            breed: document.getElementById('pet-breed').value,
            birthDate: document.getElementById('pet-birthdate')?.value || null,
            gender: document.getElementById('pet-gender').value,
            weight: parseFloat(document.getElementById('pet-weight').value) || 0,
            vaccinated: document.getElementById('pet-vaccinated').checked,
            healthNotes: document.getElementById('pet-notes').value,
            ownerId: currentUser.id
        };

        const petId = document.getElementById('pet-id-hidden').value;
        const url = petId
            ? `${window.apiService.API_BASE_URL}/pets/${petId}`
            : `${window.apiService.API_BASE_URL}/pets/owner/${currentUser.id}`;
        const method = petId ? 'PUT' : 'POST';

        console.log(`Sending ${method} request to: ${url}`);

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify(petData)
        });

        if (!response.ok) {
            let errorMessage = 'Failed to save pet';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`;
            } catch {
                errorMessage = `Error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const savedPet = await response.json();
        console.log('Pet saved successfully:', savedPet);

        if (petId) {
            const index = userPets.findIndex(p => p.id === petId);
            if (index >= 0) {
                userPets[index] = savedPet;
            }
        } else {
            userPets.push(savedPet);
        }

        closeModal('addPetModal');

        updatePetList();
        showAlert('success', `Pet ${petId ? 'updated' : 'added'} successfully!`);

        if (savedPet.id) {
            selectPet(savedPet.id);
        }
    } catch (error) {
        console.error('Error saving pet:', error);
        showAlert('danger', error.message || 'Failed to save pet due to a network or server error.');
    } finally {
        const saveBtn = document.getElementById('save-pet-btn');
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Save Pet';
    }
}

// Load user's pets
async function loadUserPets() {
    // Check if user is logged in and has ID
    if (!currentUser) {
        console.warn('Cannot load pets: User not logged in');
        document.getElementById('pet-list').innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i> You need to be logged in to view your pets.
                    <div class="mt-2">
                        <a href="index.html" class="btn btn-primary btn-sm">
                            <i class="fas fa-sign-in-alt"></i> Log in from Homepage
                        </a>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    if (!currentUser.id) {
        console.warn('Cannot load pets: User has no ID', currentUser);
        document.getElementById('pet-list').innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i> Your login session appears to be incomplete.
                    <div class="mt-2">
                        <a href="index.html" class="btn btn-primary btn-sm">
                            <i class="fas fa-sign-in-alt"></i> Please log in again
                        </a>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    try {
        // Show loading state
        document.getElementById('pet-list').innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading your pets...</p>
            </div>
        `;
        
        console.log(`Attempting to load pets for user ID: ${currentUser.id}`);
        
        // Fetch user's pets from API
        const response = await fetch(`${window.apiService.API_BASE_URL}/pets/owner/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });
        
        // Check for 404 (no pets) vs other errors
        if (response.status === 404) {
            // No pets found - this is normal for new users
            console.log('No pets found for user');
            userPets = [];
            updatePetList();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Failed to load pets: ${response.status} ${response.statusText}`);
        }
        
        // Get pets data
        const data = await response.json();
        userPets = Array.isArray(data) ? data : [data];
        
        // Update UI
        updatePetList();
        
    } catch (error) {
        console.error('Error loading pets:', error);
        
        document.getElementById('pet-list').innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i> ${error.message || 'Failed to load your pets.'}
                </div>
                <div class="mt-3">
                    <button class="btn btn-outline-primary" id="retry-load-pets">
                        <i class="fas fa-sync"></i> Try Again
                    </button>
                    <button class="btn btn-success ms-2" id="add-new-pet-btn">
                        <i class="fas fa-plus"></i> Add New Pet
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener for retry button
        document.getElementById('retry-load-pets')?.addEventListener('click', () => {
            loadUserPets();
        });
        
        // Add event listener for add new pet button
        document.getElementById('add-new-pet-btn')?.addEventListener('click', () => {
            showAddPetForm();
        });
    }
}

// Update pet list in UI
function updatePetList() {
    const petList = document.getElementById('pet-list');
    if (!petList) return;
    
    if (!userPets || userPets.length === 0) {
        petList.innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> You don't have any pets registered yet.
                </div>
                <button class="btn btn-success mt-3" id="no-pets-add-btn">
                    <i class="fas fa-plus-circle"></i> Add Your First Pet
                </button>
            </div>
        `;
        
        // Add event listener for the add button
        document.getElementById('no-pets-add-btn')?.addEventListener('click', function() {
            showAddPetForm();
        });
        
        return;
    }
    
    // Clear container
    petList.innerHTML = '';
    
    // Add pet cards
    userPets.forEach(pet => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        const card = document.createElement('div');
        card.className = 'card pet-card';
        card.setAttribute('data-pet-id', pet.id);
        
        card.innerHTML = `
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <div class="pet-icon me-3">
                            <i class="fas fa-paw fa-2x text-primary"></i>
                        </div>
                        <div>
                            <h5 class="card-title mb-0">${pet.name}</h5>
                            <p class="card-text text-muted">${pet.breed || 'Unknown breed'}</p>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-secondary edit-pet-btn" data-pet-id="${pet.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                <div class="mt-3">
                    <span class="badge ${pet.gender === 'Male' ? 'bg-info' : 'bg-danger'}">${pet.gender || 'Unknown'}</span>
                    ${pet.vaccinated ? '<span class="badge bg-success ms-1">Vaccinated</span>' : ''}
                    ${pet.species ? `<span class="badge bg-primary ms-1">${pet.species}</span>` : ''}
                </div>
            </div>
        `;
        
        col.appendChild(card);
        petList.appendChild(col);
        
        // Add event listener for pet selection (to the card but not the edit button)
        card.addEventListener('click', function(e) {
            // Don't select pet if edit button was clicked
            if (!e.target.closest('.edit-pet-btn')) {
                selectPet(pet.id);
            }
        });
        
        // Add event listener for edit button
        const editBtn = card.querySelector('.edit-pet-btn');
        if (editBtn) {
            editBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent selection
                showAddPetForm(pet.id);
            });
        }
    });
}

// Set up event listeners for pet selection
function setupPetSelectionHandlers() {
    // Event delegation for pet selection
    document.getElementById('pet-list')?.addEventListener('click', function(e) {
        const petCard = e.target.closest('.pet-card');
        if (!petCard) return;
        
        const petId = petCard.getAttribute('data-pet-id');
        selectPet(petId);
    });
}

// Select a pet
function selectPet(petId) {
    selectedPet = userPets.find(pet => pet.id === petId);
    if (!selectedPet) {
        console.warn(`Pet with ID ${petId} not found`);
        showAlert('warning', 'Selected pet not found. Please try again.');
        return;
    }

    document.querySelectorAll('.pet-card').forEach(card => {
        card.classList.remove('border-primary', 'bg-light');
    });

    const selectedCard = document.querySelector(`.pet-card[data-pet-id="${CSS.escape(petId)}"]`);
    if (selectedCard) {
        selectedCard.classList.add('border-primary', 'bg-light');
    } else {
        console.warn(`Pet card for ID ${petId} not found in DOM`);
    }

    updatePetDetails();
}

// Update pet details in the UI
function updatePetDetails() {
    const detailsContainer = document.getElementById('selected-pet-details');
    if (!detailsContainer) return;
    
    if (!selectedPet) {
        detailsContainer.innerHTML = '<p class="text-muted">Please select a pet to see details</p>';
        return;
    }
    
    detailsContainer.innerHTML = `
        <div class="mb-3">
            <strong>Name:</strong> ${selectedPet.name}
        </div>
        <div class="mb-3">
            <strong>Breed:</strong> ${selectedPet.breed || 'Not specified'}
        </div>
        <div class="mb-3">
            <strong>Gender:</strong> ${selectedPet.gender || 'Not specified'}
        </div>
        <div class="mb-3">
            <strong>Weight:</strong> ${selectedPet.weight ? selectedPet.weight + ' kg' : 'Not specified'}
        </div>
        <div class="mb-3">
            <strong>Health Notes:</strong> 
            <p class="text-muted">${selectedPet.healthNotes || 'No health notes provided'}</p>
        </div>
    `;
}

// Set up booking confirmation
function setupBookingConfirmation() {
    const confirmBtn = document.getElementById('confirm-booking-btn');
    if (!confirmBtn) return;

    confirmBtn.addEventListener('click', async function() {
        const termsCheckbox = document.getElementById('terms-checkbox');
        const dateInput = document.getElementById('booking-date');
        const timeInput = document.getElementById('booking-time');

        if (!termsCheckbox.checked) {
            showAlert('warning', 'Please accept the terms and conditions to proceed.');
            return;
        }

        if (!currentUser) {
            showAlert('warning', 'You need to be logged in to complete your booking. Please log in from the homepage.');
            return;
        }

        if (!selectedPet) {
            showAlert('warning', 'Please select a pet for the booking.');
            return;
        }

        if (!dateInput.value || !timeInput.value) {
            showAlert('warning', 'Please select both a date and time for your appointment.');
            return;
        }

        const selectedDate = new Date(dateInput.value);
        if (selectedDate < today) {
            showAlert('warning', 'Please select a future date for your appointment.');
            return;
        }

        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

        try {
            const bookingData = {
                user: { id: currentUser.id },
                pet: { id: selectedPet.id },
                services: selectedServices.map(service => ({ id: service.id })),
                bookingDate: dateInput.value,
                startTime: timeInput.value,
                notes: document.getElementById('booking-notes').value || '',
                status: 'PENDING'
            };

            const response = await fetch(`${window.apiService.API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                let errorMessage = 'Failed to create booking';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`;
                } catch {
                    errorMessage = `Error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const booking = await response.json();
            showBookingDetailModal(booking);

            selectedServices = [];
            localStorage.removeItem('selectedServices'); // Clear stored services
            selectedPet = null;
            dateInput.value = '';
            timeInput.value = '';
            document.getElementById('booking-notes').value = '';
            termsCheckbox.checked = false;

        } catch (error) {
            console.error('Error creating booking:', error);
            showAlert('danger', error.message || 'An error occurred while processing your booking.');
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = 'Confirm Booking';
        }
    });

    // Go to bookings button in success modal
    const goToBookingsBtn = document.getElementById('go-to-bookings');
    if (goToBookingsBtn) {
        goToBookingsBtn.addEventListener('click', function() {
            // Close current modal
            const currentModal = bootstrap.Modal.getInstance(document.getElementById('bookingDetailModal'));
            currentModal?.hide();

            // Show bookings modal
            loadUserBookings();
        });
    }
}

// Update booking summary in step 4
function updateBookingSummary() {
    // Update services list
    const servicesList = document.getElementById('summary-services');
    if (servicesList) {
        servicesList.innerHTML = '';
        
        let total = 0;
        
        selectedServices.forEach(service => {
            const serviceItem = document.createElement('div');
            serviceItem.className = 'mb-2';
            serviceItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <span>${service.name}</span>
                    <span>${formatCurrency(service.price)}</span>
                </div>
            `;
            servicesList.appendChild(serviceItem);
            
            // Add to total
            total += service.price;
        });
        
        // Add separator line
        if (selectedServices.length > 0) {
            const separator = document.createElement('hr');
            separator.className = 'my-2';
            servicesList.appendChild(separator);
        }
        
        // Update total
        document.getElementById('summary-total').textContent = formatCurrency(total);
    }
    
    // Update pet info
    document.getElementById('summary-pet').textContent = selectedPet ? 
        `${selectedPet.name} (${selectedPet.breed || 'Unknown breed'})` : 'Not selected';
    
    // Update date and time
    const dateInput = document.getElementById('booking-date');
    const timeInput = document.getElementById('booking-time');
    
    document.getElementById('summary-date').textContent = dateInput.value ? 
        new Date(dateInput.value).toLocaleDateString() : 'Not selected';
    
    document.getElementById('summary-time').textContent = timeInput.value ? 
        timeInput.value : 'Not selected';
    
    // Update notes
    const notesInput = document.getElementById('booking-notes');
    document.getElementById('summary-notes').textContent = notesInput.value || 'None';
}

// Function to show the add pet form for a new pet or editing existing pet
function showAddPetForm(petId = null) {
    // Reset form
    clearPetForm();
    
    // If pet ID is provided, populate form with pet data
    if (petId) {
        const pet = userPets.find(p => p.id === petId);
        if (pet) {
            document.getElementById('pet-id-hidden').value = pet.id;
            document.getElementById('pet-name').value = pet.name || '';
            
            if (document.getElementById('pet-species')) {
                document.getElementById('pet-species').value = pet.species || '';
            }
            
            document.getElementById('pet-breed').value = pet.breed || '';
            
            if (document.getElementById('pet-birthdate') && pet.birthDate) {
                document.getElementById('pet-birthdate').value = pet.birthDate;
            }
            
            document.getElementById('pet-gender').value = pet.gender || '';
            document.getElementById('pet-weight').value = pet.weight || '';
            document.getElementById('pet-vaccinated').checked = pet.vaccinated || false;
            document.getElementById('pet-notes').value = pet.healthNotes || '';
            
            // Update modal title
            const modalTitle = document.getElementById('addPetModalLabel');
            if (modalTitle) {
                modalTitle.textContent = 'Edit Pet';
            }
        }
    } else {
        // Update modal title for new pet
        const modalTitle = document.getElementById('addPetModalLabel');
        if (modalTitle) {
            modalTitle.textContent = 'Add New Pet';
        }
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('addPetModal'));
    modal.show();
}

// Clear pet form fields
function clearPetForm() {
    document.getElementById('pet-id-hidden').value = '';
    document.getElementById('pet-name').value = '';
    if (document.getElementById('pet-species')) {
        document.getElementById('pet-species').value = '';
    }
    document.getElementById('pet-breed').value = '';
    if (document.getElementById('pet-birthdate')) {
        document.getElementById('pet-birthdate').value = '';
    }
    document.getElementById('pet-gender').value = '';
    document.getElementById('pet-weight').value = '';
    document.getElementById('pet-vaccinated').checked = false;
    document.getElementById('pet-notes').value = '';
}

// Load user's bookings
async function loadUserBookings() {
    if (!currentUser) {
        showAlert('warning', 'Please log in to view your bookings.');
        return;
    }

    try {
        const response = await fetch(`${window.apiService.API_BASE_URL}/bookings/user/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load bookings: ${response.status} ${response.statusText}`);
        }

        const bookings = await response.json();
        const modalBody = document.getElementById('bookingsModalBody');
        if (!modalBody) {
            console.error('Bookings modal body not found');
            return;
        }

        if (!bookings || bookings.length === 0) {
            modalBody.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> You have no bookings yet.
                </div>
            `;
        } else {
            modalBody.innerHTML = `
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>_Time</th>
                            <th>Pet</th>
                            <th>Services</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bookings.map(booking => `
                            <tr>
                                <td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
                                <td>${booking.startTime}</td>
                                <td>${booking.pet.name}</td>
                                <td>${booking.services.map(s => s.name).join(', ')}</td>
                                <td><span class="badge bg-${booking.status === 'PENDING' ? 'warning' : booking.status === 'CONFIRMED' ? 'success' : 'danger'}">${booking.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        const modal = new bootstrap.Modal(document.getElementById('bookingsModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading bookings:', error);
        showAlert('danger', error.message || 'Failed to load your bookings.');
    }
}

function replacePlaceholderImages() {
    const placeholderImages = document.querySelectorAll('img[src*="via.placeholder.com"]');
    const fallbackImage = '/assets/images/fallback-pet.jpg'; // Replace with your fallback image path

    placeholderImages.forEach(img => {
        const altText = img.getAttribute('alt') || 'Pet Image';
        let newSrc;

        if (img.src.includes('150x50')) {
            newSrc = '/assets/images/logo.png'; // Replace with your logo path
        } else if (img.src.includes('400x200')) {
            newSrc = '/assets/images/banner.jpg'; // Replace with your banner path
        } else {
            newSrc = `/assets/images/${altText.toLowerCase().replace(/\s+/g, '-')}.jpg`; // Dynamic fallback
        }

        img.src = newSrc;
        img.onerror = () => {
            img.src = fallbackImage;
            console.warn(`Failed to load image: ${newSrc}, using fallback`);
        };
    });
}

function closeModal(modalId) {
    if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
        console.warn('Bootstrap Modal not available');
        return;
    }

    const modalElement = document.getElementById(modalId);
    if (!modalElement) {
        console.warn(`Modal with ID ${modalId} not found`);
        return;
    }

    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modal.hide();
}

function showBookingDetailModal(booking) {
    if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
        console.warn('Bootstrap Modal not available');
        showAlert('success', 'Booking created successfully!');
        return;
    }

    const modalElement = document.getElementById('bookingDetailModal');
    if (!modalElement) {
        console.warn('Booking detail modal not found');
        showAlert('success', 'Booking created successfully!');
        return;
    }

    const modalBody = modalElement.querySelector('.modal-body');
    if (modalBody) {
        modalBody.innerHTML = `
            <p><strong>Booking ID:</strong> ${booking.id}</p>
            <p><strong>Pet:</strong> ${booking.pet.name}</p>
            <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.startTime}</p>
            <p><strong>Services:</strong> ${booking.services.map(s => s.name).join(', ')}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
        `;
    }

    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}
