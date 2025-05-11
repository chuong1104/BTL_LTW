/**
 * Admin Bookings Handler
 * Manages bookings in the admin dashboard
 */

// Global variables
let adminBookings = [];
let currentBooking = null;
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let statusFilter = '';
let dateFilter = '';
let searchTerm = '';
let isApiAvailable = true;

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing admin bookings handler');
    
    // Check if on admin page and appointment section exists
    if (document.getElementById('appointments-section')) {
        console.log('Appointments section found');
        setupAppointmentHandlers();
        loadAllBookings();
    }
    
    // Check if booking panel exists (in case we're using the separate panel)
    if (document.getElementById('bookings-panel')) {
        console.log('Bookings panel found');
        setupBookingFilters();
        loadAllBookings();
    }
});

// Set up booking filters
function setupBookingFilters() {
    console.log('Setting up booking filters');
    
    // Status filter
    const statusFilterEl = document.getElementById('booking-status-filter');
    if (statusFilterEl) {
        statusFilterEl.addEventListener('change', function() {
            statusFilter = this.value;
            currentPage = 1;
            loadAllBookings();
        });
    }
    
    // Date filter
    const dateFilterEl = document.getElementById('booking-date-filter');
    if (dateFilterEl) {
        dateFilterEl.addEventListener('change', function() {
            dateFilter = this.value;
            currentPage = 1;
            loadAllBookings();
        });
    }
    
    // Search filter
    const searchInput = document.getElementById('booking-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchTerm = this.value;
            currentPage = 1;
            loadAllBookings();
        });
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-bookings');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadAllBookings();
        });
    }
    
    // Booking action buttons
    setupBookingActionButtons();
}

// Set up appointment section in the dashboard
function setupAppointmentHandlers() {
    console.log('Setting up appointment handlers');
    
    // Add appointment button
    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', function() {
            showBookingModal();
        });
    }
    
    // Setup appointments table events (delegation)
    const appointmentsTable = document.getElementById('appointments-table-body');
    if (appointmentsTable) {
        appointmentsTable.addEventListener('click', function(e) {
            const target = e.target.closest('button');
            if (!target) return;
            
            const action = target.getAttribute('data-action');
            const row = target.closest('tr');
            const bookingId = row.getAttribute('data-id');
            
            if (action === 'edit') {
                editBooking(bookingId);
            } else if (action === 'delete') {
                confirmDeleteBooking(bookingId);
            } else if (action === 'view') {
                viewBookingDetails(bookingId);
            }
        });
    }
}

// Set up booking action buttons
function setupBookingActionButtons() {
    console.log('Setting up booking action buttons');
    
    // Confirm booking
    const confirmBtn = document.getElementById('admin-confirm-booking');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            updateBookingStatus('CONFIRMED');
        });
    }
    
    // Complete booking
    const completeBtn = document.getElementById('admin-complete-booking');
    if (completeBtn) {
        completeBtn.addEventListener('click', function() {
            updateBookingStatus('COMPLETED');
        });
    }
    
    // Cancel booking
    const cancelBtn = document.getElementById('admin-cancel-booking');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            updateBookingStatus('CANCELLED');
        });
    }
    
    // Save booking button in the modal
    const saveBookingBtn = document.getElementById('save-booking-btn');
    if (saveBookingBtn) {
        saveBookingBtn.addEventListener('click', function() {
            saveBooking();
        });
    }
}

// Load all bookings with proper API call
async function loadAllBookings() {
    try {
        console.log('Loading all bookings');
        
        // Show loading state in both possible tables
        const adminBookingsTable = document.getElementById('admin-bookings-table');
        const appointmentsTableBody = document.getElementById('appointments-table-body');
        
        const loadingHtml = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading bookings...</p>
                </td>
            </tr>
        `;
        
        if (adminBookingsTable) adminBookingsTable.innerHTML = loadingHtml;
        if (appointmentsTableBody) appointmentsTableBody.innerHTML = loadingHtml;
        
        // Check if API service is available
        if (!window.apiService || !window.apiService.API_BASE_URL) {
            console.warn('API service not available, using mock data');
            isApiAvailable = false;
            adminBookings = getMockBookings();
            updateBookingsTable();
            updatePagination();
            return;
        }
        
        // Fetch bookings from API
        const url = new URL(`${window.apiService.API_BASE_URL}/bookings`);
        
        // Add query parameters
        if (statusFilter) url.searchParams.append('status', statusFilter);
        if (dateFilter) url.searchParams.append('date', dateFilter);
        if (searchTerm) url.searchParams.append('search', searchTerm);
        
        // Add pagination
        url.searchParams.append('page', currentPage - 1); // API uses 0-based indexing
        url.searchParams.append('size', pageSize);
        
        console.log('Fetching bookings from:', url.toString());
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
        }
        
        // Process response data
        const data = await response.json();
        
        // Check if response is paginated or a simple array
        if (data.content && Array.isArray(data.content)) {
            // Paginated response
            adminBookings = data.content;
            totalPages = data.totalPages || 1;
        } else if (Array.isArray(data)) {
            // Simple array response
            adminBookings = data;
            totalPages = Math.ceil(adminBookings.length / pageSize);
        } else {
            console.error('Unexpected response format:', data);
            throw new Error('Unexpected response format from API');
        }
        
        // Update UI
        updateBookingsTable();
        updatePagination();
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        
        // Show error in tables
        const errorHtml = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle"></i> Error loading bookings: ${error.message}
                    </div>
                </td>
            </tr>
        `;
        
        const adminBookingsTable = document.getElementById('admin-bookings-table');
        const appointmentsTableBody = document.getElementById('appointments-table-body');
        
        if (adminBookingsTable) adminBookingsTable.innerHTML = errorHtml;
        if (appointmentsTableBody) appointmentsTableBody.innerHTML = errorHtml;
        
        // Fallback to mock data
        adminBookings = getMockBookings();
        updateBookingsTable();
        updatePagination();
    }
}

// Update bookings table
function updateBookingsTable() {
    console.log('Updating bookings table with', adminBookings.length, 'bookings');
    
    // Update both possible table locations
    updateAdminBookingsTable();
    updateAppointmentsTable();
}

// Update admin bookings table in the dedicated panel
function updateAdminBookingsTable() {
    const tableBody = document.getElementById('admin-bookings-table');
    if (!tableBody) return;
    
    if (!adminBookings || adminBookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i> No bookings found.
                    </div>
                </td>
            </tr>
        `;
        
        const showingCount = document.getElementById('booking-showing');
        if (showingCount) {
            showingCount.textContent = 'Showing 0 of 0 bookings';
        }
        return;
    }
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Update bookings count
    const showingCount = document.getElementById('booking-showing');
    if (showingCount) {
        showingCount.textContent = `Showing ${adminBookings.length} bookings`;
    }
    
    // Add booking rows
    adminBookings.forEach(booking => {
        const row = document.createElement('tr');
        
        // Format date and time
        const bookingDate = new Date(booking.bookingDate).toLocaleDateString();
        const bookingTime = booking.startTime ? booking.startTime.substring(0, 5) : 'N/A';
        
        // Get service names
        const serviceNames = Array.isArray(booking.services) 
            ? booking.services.map(s => s.name).join(', ')
            : 'No services';
        
        // Get status badge class
        let statusBadgeClass = 'bg-secondary';
        switch (booking.status) {
            case 'PENDING':
                statusBadgeClass = 'bg-warning text-dark';
                break;
            case 'CONFIRMED':
                statusBadgeClass = 'bg-primary';
                break;
            case 'COMPLETED':
                statusBadgeClass = 'bg-success';
                break;
            case 'CANCELLED':
                statusBadgeClass = 'bg-danger';
                break;
        }
        
        // For shortened ID display
        const shortId = booking.id.length > 8 ? booking.id.substring(0, 8) + '...' : booking.id;
        
        row.innerHTML = `
            <td>${shortId}</td>
            <td>${booking.user ? booking.user.username : 'Unknown'}</td>
            <td>${booking.pet ? booking.pet.name : 'Unknown'}</td>
            <td>${serviceNames}</td>
            <td>${bookingDate} ${bookingTime}</td>
            <td><span class="badge ${statusBadgeClass}">${booking.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary view-booking-btn" data-booking-id="${booking.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        // Add view button event
        const viewBtn = row.querySelector('.view-booking-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                showBookingDetails(booking);
            });
        }
        
        tableBody.appendChild(row);
    });
}

// Update appointments table in the dashboard section
function updateAppointmentsTable() {
    const tableBody = document.getElementById('appointments-table-body');
    if (!tableBody) return;
    
    if (!adminBookings || adminBookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i> No appointments found.
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add booking rows
    adminBookings.forEach(booking => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', booking.id);
        
        // Format date and time
        const bookingDate = new Date(booking.bookingDate).toLocaleDateString();
        const bookingTime = booking.startTime ? booking.startTime.substring(0, 5) : 'N/A';
        
        // Get service names
        const serviceNames = Array.isArray(booking.services) 
            ? booking.services.map(s => s.name).join(', ')
            : 'No services';
        
        // Map status to display labels
        let statusClass;
        let statusDisplay;
        switch (booking.status) {
            case 'PENDING':
                statusClass = 'pending';
                statusDisplay = 'Pending';
                break;
            case 'CONFIRMED':
                statusClass = 'confirmed';
                statusDisplay = 'Confirmed';
                break;
            case 'COMPLETED':
                statusClass = 'completed';
                statusDisplay = 'Completed';
                break;
            case 'CANCELLED':
                statusClass = 'cancelled';
                statusDisplay = 'Cancelled';
                break;
            default:
                statusClass = 'pending';
                statusDisplay = booking.status;
        }
        
        // For shortened ID display
        const shortId = booking.id.length > 8 ? booking.id.substring(0, 8) + '...' : booking.id;
        
        row.innerHTML = `
            <td><input type="checkbox" class="select-item" /></td>
            <td>${shortId}</td>
            <td>${booking.user ? booking.user.username : 'Unknown'}</td>
            <td>${booking.pet ? booking.pet.name : 'Unknown'}</td>
            <td>${serviceNames}</td>
            <td>${bookingDate} ${bookingTime}</td>
            <td>Assigned Staff</td>
            <td><span class="status ${statusClass}">${statusDisplay}</span></td>
            <td class="actions">
                <button class="icon-btn edit-btn" data-action="edit"><i class="fas fa-edit"></i></button>
                <button class="icon-btn delete-btn" data-action="delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Update pagination
function updatePagination() {
    const paginationContainers = [
        document.getElementById('booking-pagination'),
        // Add any other pagination containers here
    ];
    
    paginationContainers.forEach(container => {
        if (!container) return;
        
        // Clear pagination
        container.innerHTML = '';
        
        // If only one page, don't show pagination
        if (totalPages <= 1) return;
        
        const ul = document.createElement('ul');
        ul.className = 'pagination';
        
        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>`;
        ul.appendChild(prevLi);
        
        // Page numbers
        const maxPages = 5; // Maximum number of page links to show
        const startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
        const endPage = Math.min(totalPages, startPage + maxPages - 1);
        
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            ul.appendChild(li);
        }
        
        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>`;
        ul.appendChild(nextLi);
        
        // Add click events
        ul.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (e.target.tagName === 'A' && e.target.hasAttribute('data-page')) {
                const page = parseInt(e.target.getAttribute('data-page'));
                
                if (page >= 1 && page <= totalPages) {
                    currentPage = page;
                    loadAllBookings();
                }
            }
        });
        
        container.appendChild(ul);
    });
}

// Show booking details
function showBookingDetails(booking) {
    console.log('Showing booking details:', booking);
    
    // Store current booking
    currentBooking = booking;
    
    // We need to ensure the modal element exists
    const modalElement = document.getElementById('admin-booking-modal');
    if (!modalElement) {
        console.error('Admin booking modal not found in the DOM');
        return;
    }
    
    // Check if bootstrap is available
    if (typeof bootstrap === 'undefined') {
        console.warn('Bootstrap not available. Loading alternative modal handling.');
        modalElement.style.display = 'block';
        // Implement a basic modal show mechanism if bootstrap is not available
    } else {
        // Use Bootstrap modal
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
    
    // Update modal content
    // Customer information
    const customerElement = document.getElementById('admin-booking-customer');
    const emailElement = document.getElementById('admin-booking-email');
    const phoneElement = document.getElementById('admin-booking-phone');
    
    if (customerElement) customerElement.textContent = booking.user ? booking.user.username : 'N/A';
    if (emailElement) emailElement.textContent = booking.user ? booking.user.email : 'N/A';
    if (phoneElement) phoneElement.textContent = booking.user && booking.user.phoneNumber ? booking.user.phoneNumber : 'N/A';
    
    // Pet information
    const petNameElement = document.getElementById('admin-booking-pet-name');
    const petBreedElement = document.getElementById('admin-booking-pet-breed');
    const petGenderElement = document.getElementById('admin-booking-pet-gender');
    
    if (petNameElement) petNameElement.textContent = booking.pet ? booking.pet.name : 'N/A';
    if (petBreedElement) petBreedElement.textContent = booking.pet && booking.pet.breed ? booking.pet.breed : 'N/A';
    if (petGenderElement) petGenderElement.textContent = booking.pet && booking.pet.gender ? booking.pet.gender : 'N/A';
    
    // Update services list
    const servicesContainer = document.getElementById('admin-booking-services');
    if (servicesContainer) {
        servicesContainer.innerHTML = '';
        
        let totalPrice = 0;
        
        if (Array.isArray(booking.services) && booking.services.length > 0) {
            booking.services.forEach(service => {
                const div = document.createElement('div');
                div.className = 'mb-2';
                div.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <span>${service.name}</span>
                        <span>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)}</span>
                    </div>
                `;
                servicesContainer.appendChild(div);
                
                totalPrice += service.price;
            });
        } else {
            servicesContainer.innerHTML = '<p class="text-muted">No services selected</p>';
        }
        
        // Update total price
        const totalElement = document.getElementById('admin-booking-total');
        if (totalElement) {
            totalElement.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice);
        }
    }
    
    // Update booking info
    const dateElement = document.getElementById('admin-booking-date');
    const timeElement = document.getElementById('admin-booking-time');
    const statusElement = document.getElementById('admin-booking-status');
    const notesElement = document.getElementById('admin-booking-notes');
    
    if (dateElement) dateElement.textContent = new Date(booking.bookingDate).toLocaleDateString();
    if (timeElement) timeElement.textContent = booking.startTime ? booking.startTime.substring(0, 5) : 'N/A';
    
    if (statusElement) {
        statusElement.textContent = booking.status;
        
        // Set status badge color
        statusElement.className = 'badge';
        switch (booking.status) {
            case 'PENDING':
                statusElement.classList.add('bg-warning', 'text-dark');
                break;
            case 'CONFIRMED':
                statusElement.classList.add('bg-primary');
                break;
            case 'COMPLETED':
                statusElement.classList.add('bg-success');
                break;
            case 'CANCELLED':
                statusElement.classList.add('bg-danger');
                break;
            default:
                statusElement.classList.add('bg-secondary');
        }
    }
    
    if (notesElement) notesElement.textContent = booking.notes || 'No notes provided';
    
    // Update action buttons visibility based on current status
    updateActionButtons(booking.status);
}

// Update action buttons based on booking status
function updateActionButtons(status) {
    const confirmBtn = document.getElementById('admin-confirm-booking');
    const completeBtn = document.getElementById('admin-complete-booking');
    const cancelBtn = document.getElementById('admin-cancel-booking');
    
    if (!confirmBtn || !completeBtn || !cancelBtn) return;
    
    switch (status) {
        case 'PENDING':
            confirmBtn.style.display = 'block';
            completeBtn.style.display = 'none';
            cancelBtn.style.display = 'block';
            break;
        case 'CONFIRMED':
            confirmBtn.style.display = 'none';
            completeBtn.style.display = 'block';
            cancelBtn.style.display = 'block';
            break;
        case 'COMPLETED':
            confirmBtn.style.display = 'none';
            completeBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            break;
        case 'CANCELLED':
            confirmBtn.style.display = 'none';
            completeBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            break;
        default:
            confirmBtn.style.display = 'block';
            completeBtn.style.display = 'block';
            cancelBtn.style.display = 'block';
    }
}

// Update booking status with proper API call
async function updateBookingStatus(status) {
    if (!currentBooking) {
        console.error('No booking selected for status update');
        return;
    }
    
    try {
        // Disable action buttons to prevent multiple submissions
        const actionButtons = document.querySelectorAll('#admin-booking-actions button');
        actionButtons.forEach(btn => btn.disabled = true);
        
        console.log(`Updating booking ${currentBooking.id} status to ${status}`);
        
        // Call API to update status
        const response = await fetch(`${window.apiService.API_BASE_URL}/bookings/${currentBooking.id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to update status: ${response.status} ${response.statusText}`);
        }
        
        // Show success message
        showSuccessToast(`Booking status updated to ${status}`);
        
        // Close modal
        closeBookingModal();
        
        // Reload bookings
        loadAllBookings();
        
    } catch (error) {
        console.error('Error updating booking status:', error);
        
        // Show error message
        alert(`Failed to update booking status: ${error.message}`);
        
    } finally {
        // Re-enable buttons
        const actionButtons = document.querySelectorAll('#admin-booking-actions button');
        actionButtons.forEach(btn => btn.disabled = false);
    }
}

// Close booking modal
function closeBookingModal() {
    const modalElement = document.getElementById('admin-booking-modal');
    if (!modalElement) return;
    
    if (typeof bootstrap === 'undefined') {
        modalElement.style.display = 'none';
    } else {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }
}

// Show booking modal for adding/editing
function showBookingModal(bookingId) {
    console.log('Showing booking modal for ID:', bookingId);
    
    // Reset form
    const form = document.getElementById('booking-form');
    if (form) form.reset();
    
    // Set modal title based on whether we're adding or editing
    const modalTitle = document.getElementById('bookingModalLabel');
    if (modalTitle) {
        modalTitle.textContent = bookingId ? 'Edit Appointment' : 'Add Appointment';
    }
    
    // Set booking ID
    const bookingIdInput = document.getElementById('booking-id');
    if (bookingIdInput) {
        bookingIdInput.value = bookingId || '';
    }
    
    // If editing, populate form with booking data
    if (bookingId) {
        const booking = adminBookings.find(b => b.id === bookingId);
        if (booking) {
            populateBookingForm(booking);
        } else {
            console.error('Booking not found:', bookingId);
        }
    } else {
        // If adding, we might need to load users, pets, and services
        loadFormDependencies();
    }
    
    // Show modal
    const modalElement = document.getElementById('bookingModal');
    if (!modalElement) {
        console.error('Booking modal not found');
        return;
    }
    
    if (typeof bootstrap === 'undefined') {
        modalElement.style.display = 'block';
    } else {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// Load users, pets, and services for the booking form
async function loadFormDependencies() {
    console.log('Loading form dependencies');
    
    try {
        if (!isApiAvailable) {
            // Use mock data
            populateUserSelect(getMockUsers());
            populateServiceSelect(getMockServices());
            return;
        }
        
        // Load users
        const usersResponse = await fetch(`${window.apiService.API_BASE_URL}/users`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        
        if (usersResponse.ok) {
            const users = await usersResponse.json();
            populateUserSelect(users);
        } else {
            console.error('Failed to load users');
            populateUserSelect(getMockUsers());
        }
        
        // Load services
        const servicesResponse = await fetch(`${window.apiService.API_BASE_URL}/services`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        
        if (servicesResponse.ok) {
            const services = await servicesResponse.json();
            populateServiceSelect(services);
        } else {
            console.error('Failed to load services');
            populateServiceSelect(getMockServices());
        }
        
        // Pets will be loaded when a user is selected
        
    } catch (error) {
        console.error('Error loading form dependencies:', error);
        
        // Fall back to mock data
        populateUserSelect(getMockUsers());
        populateServiceSelect(getMockServices());
    }
}

// Populate user select dropdown
function populateUserSelect(users) {
    const userSelect = document.getElementById('booking-user');
    if (!userSelect) return;
    
    userSelect.innerHTML = '<option value="">Select a customer</option>';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.username;
        userSelect.appendChild(option);
    });
    
    // Add change event to load pets when user is selected
    userSelect.addEventListener('change', function() {
        const userId = this.value;
        if (userId) {
            loadUserPets(userId);
        } else {
            const petSelect = document.getElementById('booking-pet');
            if (petSelect) {
                petSelect.innerHTML = '<option value="">Select a pet</option>';
            }
        }
    });
}

// Load pets for a selected user
async function loadUserPets(userId) {
    console.log('Loading pets for user:', userId);
    
    const petSelect = document.getElementById('booking-pet');
    if (!petSelect) return;
    
    // Show loading
    petSelect.innerHTML = '<option value="">Loading pets...</option>';
    
    try {
        if (!isApiAvailable) {
            // Use mock data
            const mockPets = getMockPets().filter(p => p.owner && p.owner.id === userId);
            populatePetSelect(mockPets);
            return;
        }
        
        const response = await fetch(`${window.apiService.API_BASE_URL}/pets/owner/${userId}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load pets: ${response.status} ${response.statusText}`);
        }
        
        const pets = await response.json();
        populatePetSelect(pets);
        
    } catch (error) {
        console.error('Error loading pets:', error);
        
        // Fall back to mock data
        const mockPets = getMockPets().filter(p => p.owner && p.owner.id === userId);
        populatePetSelect(mockPets);
    }
}

// Populate pet select dropdown
function populatePetSelect(pets) {
    const petSelect = document.getElementById('booking-pet');
    if (!petSelect) return;
    
    petSelect.innerHTML = '<option value="">Select a pet</option>';
    
    if (!pets || pets.length === 0) {
        petSelect.innerHTML += '<option value="" disabled>No pets found</option>';
        return;
    }
    
    pets.forEach(pet => {
        const option = document.createElement('option');
        option.value = pet.id;
        option.textContent = `${pet.name} (${pet.breed || 'Unknown'})`;
        petSelect.appendChild(option);
    });
}

// Populate service select dropdown
function populateServiceSelect(services) {
    const serviceSelect = document.getElementById('booking-services');
    if (!serviceSelect) return;
    
    serviceSelect.innerHTML = '';
    
    if (!services || services.length === 0) {
        serviceSelect.innerHTML = '<option value="" disabled>No services found</option>';
        return;
    }
    
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = `${service.name} (${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)})`;
        serviceSelect.appendChild(option);
    });
}

// Populate booking form with booking data
function populateBookingForm(booking) {
    console.log('Populating booking form with data:', booking);
    
    // User
    const userSelect = document.getElementById('booking-user');
    if (userSelect && booking.user) {
        // We might need to add the option if it doesn't exist
        let option = userSelect.querySelector(`option[value="${booking.user.id}"]`);
        if (!option) {
            option = document.createElement('option');
            option.value = booking.user.id;
            option.textContent = booking.user.username;
            userSelect.appendChild(option);
        }
        userSelect.value = booking.user.id;
        
        // Load pets for this user
        loadUserPets(booking.user.id);
    }
    
    // We need to wait for pets to load before selecting the pet
    setTimeout(() => {
        // Pet
        const petSelect = document.getElementById('booking-pet');
        if (petSelect && booking.pet) {
            // We might need to add the option if it doesn't exist
            let option = petSelect.querySelector(`option[value="${booking.pet.id}"]`);
            if (!option) {
                option = document.createElement('option');
                option.value = booking.pet.id;
                option.textContent = `${booking.pet.name} (${booking.pet.breed || 'Unknown'})`;
                petSelect.appendChild(option);
            }
            petSelect.value = booking.pet.id;
        }
    }, 500);
    
    // Services (multi-select)
    const serviceSelect = document.getElementById('booking-services');
    if (serviceSelect && booking.services) {
        // First ensure all service options exist
        booking.services.forEach(service => {
            let option = serviceSelect.querySelector(`option[value="${service.id}"]`);
            if (!option) {
                option = document.createElement('option');
                option.value = service.id;
                option.textContent = `${service.name} (${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)})`;
                serviceSelect.appendChild(option);
            }
        });
        
        // Then select them
        Array.from(serviceSelect.options).forEach(option => {
            option.selected = booking.services.some(service => service.id == option.value);
        });
    }
    
    // Date and time
    const dateInput = document.getElementById('booking-date');
    const timeInput = document.getElementById('booking-time');
    
    if (dateInput && booking.bookingDate) {
        dateInput.value = booking.bookingDate.substring(0, 10); // YYYY-MM-DD
    }
    
    if (timeInput && booking.startTime) {
        timeInput.value = booking.startTime.substring(0, 5); // HH:MM
    }
    
    // Status
    const statusSelect = document.getElementById('booking-status');
    if (statusSelect && booking.status) {
        statusSelect.value = booking.status;
    }
    
    // Notes
    const notesInput = document.getElementById('booking-notes');
    if (notesInput) {
        notesInput.value = booking.notes || '';
    }
}

// Save booking (create or update)
async function saveBooking() {
    console.log('Saving booking');
    
    // Validate form
    if (!validateBookingForm()) {
        return;
    }
    
    // Get form data
    const bookingId = document.getElementById('booking-id').value;
    const userId = document.getElementById('booking-user').value;
    const petId = document.getElementById('booking-pet').value;
    const statusValue = document.getElementById('booking-status').value;
    const dateValue = document.getElementById('booking-date').value;
    const timeValue = document.getElementById('booking-time').value;
    const notesValue = document.getElementById('booking-notes').value;
    
    // Get selected services
    const serviceSelect = document.getElementById('booking-services');
    const selectedServices = Array.from(serviceSelect.selectedOptions).map(option => ({
        id: option.value
    }));
    
    // Prepare booking data
    const bookingData = {
        user: { id: userId },
        pet: { id: petId },
        services: selectedServices,
        bookingDate: dateValue,
        startTime: timeValue + ':00', // Add seconds
        notes: notesValue,
        status: statusValue
    };
    
    if (bookingId) {
        bookingData.id = bookingId;
    }
    
    try {
        // Disable save button
        const saveBtn = document.getElementById('save-booking-btn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
        }
        
        if (!isApiAvailable) {
            // Simulate API call with a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Generate ID if needed
            if (!bookingId) {
                bookingData.id = 'mock-' + new Date().getTime();
            }
            
            // Update local data
            if (bookingId) {
                // Update existing booking
                adminBookings = adminBookings.map(b => 
                    b.id === bookingId ? {...b, ...bookingData} : b
                );
            } else {
                // Add new booking
                adminBookings.push({
                    ...bookingData,
                    user: getMockUsers().find(u => u.id === userId),
                    pet: getMockPets().find(p => p.id === petId),
                    services: getMockServices().filter(s => 
                        selectedServices.some(selected => selected.id === s.id)
                    )
                });
            }
            
            showSuccessToast(`Booking ${bookingId ? 'updated' : 'created'} successfully (Demo Mode)`);
            
            // Close modal and refresh table
            closeBookingFormModal();
            updateBookingsTable();
            return;
        }
        
        // Determine if this is a create or update operation
        const method = bookingId ? 'PUT' : 'POST';
        const url = bookingId 
            ? `${window.apiService.API_BASE_URL}/bookings/${bookingId}` 
            : `${window.apiService.API_BASE_URL}/bookings`;
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to ${bookingId ? 'update' : 'create'} booking: ${response.status} ${response.statusText}`);
        }
        
        // Show success message
        showSuccessToast(`Booking ${bookingId ? 'updated' : 'created'} successfully`);
        
        // Close modal
        closeBookingFormModal();
        
        // Reload bookings
        loadAllBookings();
        
    } catch (error) {
        console.error('Error saving booking:', error);
        
        // Show error message
        alert(`Failed to save booking: ${error.message}`);
        
    } finally {
        // Re-enable save button
        const saveBtn = document.getElementById('save-booking-btn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Appointment';
        }
    }
}

// Close booking form modal
function closeBookingFormModal() {
    const modalElement = document.getElementById('bookingModal');
    if (!modalElement) return;
    
    if (typeof bootstrap === 'undefined') {
        modalElement.style.display = 'none';
    } else {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }
}

// Validate booking form
function validateBookingForm() {
    const userSelect = document.getElementById('booking-user');
    const petSelect = document.getElementById('booking-pet');
    const serviceSelect = document.getElementById('booking-services');
    const dateInput = document.getElementById('booking-date');
    const timeInput = document.getElementById('booking-time');
    
    if (!userSelect.value) {
        alert('Please select a customer');
        userSelect.focus();
        return false;
    }
    
    if (!petSelect.value) {
        alert('Please select a pet');
        petSelect.focus();
        return false;
    }
    
    if (serviceSelect.selectedOptions.length === 0) {
        alert('Please select at least one service');
        serviceSelect.focus();
        return false;
    }
    
    if (!dateInput.value) {
        alert('Please select a date');
        dateInput.focus();
        return false;
    }
    
    if (!timeInput.value) {
        alert('Please select a time');
        timeInput.focus();
        return false;
    }
    
    return true;
}

// Show success toast notification
function showSuccessToast(message) {
    // Check if we have a toast service
    if (window.toastService && typeof window.toastService.showToast === 'function') {
        window.toastService.showToast(message, 'success');
        return;
    }
    
    // Create a simple toast if the service is not available
    const toast = document.createElement('div');
    toast.className = 'position-fixed top-0 end-0 p-3';
    toast.style.zIndex = 1070;
    toast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">Success</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Get mock data for offline/demo mode
function getMockBookings() {
    return [
        {
            id: 'booking-1',
            user: {
                id: 'user-1',
                username: 'John Smith',
                email: 'john@example.com',
                phoneNumber: '(555) 123-4567'
            },
            pet: {
                id: 'pet-1',
                name: 'Max',
                breed: 'Labrador',
                gender: 'Male'
            },
            services: [
                {
                    id: 'service-1',
                    name: 'Basic Grooming',
                    price: 350000
                }
            ],
            bookingDate: '2025-04-30',
            startTime: '10:00:00',
            notes: 'Please be gentle with him.',
            status: 'CONFIRMED'
        },
        {
            id: 'booking-2',
            user: {
                id: 'user-2',
                username: 'Sarah Johnson',
                email: 'sarah@example.com',
                phoneNumber: '(555) 234-5678'
            },
            pet: {
                id: 'pet-2',
                name: 'Luna',
                breed: 'Persian Cat',
                gender: 'Female'
            },
            services: [
                {
                    id: 'service-2',
                    name: 'Premium Bath',
                    price: 450000
                },
                {
                    id: 'service-3',
                    name: 'Nail Trimming',
                    price: 150000
                }
            ],
            bookingDate: '2025-05-01',
            startTime: '14:00:00',
            notes: 'Luna is nervous around other cats.',
            status: 'PENDING'
        },
        {
            id: 'booking-3',
            user: {
                id: 'user-3',
                username: 'Michael Davis',
                email: 'michael@example.com',
                phoneNumber: '(555) 345-6789'
            },
            pet: {
                id: 'pet-3',
                name: 'Rocky',
                breed: 'German Shepherd',
                gender: 'Male'
            },
            services: [
                {
                    id: 'service-1',
                    name: 'Basic Grooming',
                    price: 350000
                },
                {
                    id: 'service-4',
                    name: 'Flea Treatment',
                    price: 300000
                }
            ],
            bookingDate: '2025-05-02',
            startTime: '09:00:00',
            notes: '',
            status: 'COMPLETED'
        },
        {
            id: 'booking-4',
            user: {
                id: 'user-4',
                username: 'Emily Wilson',
                email: 'emily@example.com',
                phoneNumber: '(555) 456-7890'
            },
            pet: {
                id: 'pet-4',
                name: 'Coco',
                breed: 'Rabbit',
                gender: 'Female'
            },
            services: [
                {
                    id: 'service-5',
                    name: 'Nail Trimming - Small Pet',
                    price: 120000
                }
            ],
            bookingDate: '2025-05-02',
            startTime: '11:00:00',
            notes: 'Coco is very sensitive.',
            status: 'CANCELLED'
        }
    ];
}

function getMockUsers() {
    return [
        {
            id: 'user-1',
            username: 'John Smith',
            email: 'john@example.com',
            phoneNumber: '(555) 123-4567'
        },
        {
            id: 'user-2',
            username: 'Sarah Johnson',
            email: 'sarah@example.com',
            phoneNumber: '(555) 234-5678'
        },
        {
            id: 'user-3',
            username: 'Michael Davis',
            email: 'michael@example.com',
            phoneNumber: '(555) 345-6789'
        },
        {
            id: 'user-4',
            username: 'Emily Wilson',
            email: 'emily@example.com',
            phoneNumber: '(555) 456-7890'
        }
    ];
}

function getMockPets() {
    return [
        {
            id: 'pet-1',
            name: 'Max',
            breed: 'Labrador',
            gender: 'Male',
            owner: { id: 'user-1' }
        },
        {
            id: 'pet-2',
            name: 'Luna',
            breed: 'Persian Cat',
            gender: 'Female',
            owner: { id: 'user-2' }
        },
        {
            id: 'pet-3',
            name: 'Rocky',
            breed: 'German Shepherd',
            gender: 'Male',
            owner: { id: 'user-3' }
        },
        {
            id: 'pet-4',
            name: 'Coco',
            breed: 'Rabbit',
            gender: 'Female',
            owner: { id: 'user-4' }
        },
        {
            id: 'pet-5',
            name: 'Buddy',
            breed: 'Golden Retriever',
            gender: 'Male',
            owner: { id: 'user-1' }
        }
    ];
}

function getMockServices() {
    return [
        {
            id: 'service-1',
            name: 'Basic Grooming',
            price: 350000,
            description: 'Basic grooming service for dogs and cats',
            active: true
        },
        {
            id: 'service-2',
            name: 'Premium Bath',
            price: 450000,
            description: 'Premium bath with special shampoo and conditioner',
            active: true
        },
        {
            id: 'service-3',
            name: 'Nail Trimming',
            price: 150000,
            description: 'Nail trimming for dogs and cats',
            active: true
        },
        {
            id: 'service-4',
            name: 'Flea Treatment',
            price: 300000,
            description: 'Treatment for fleas and ticks',
            active: true
        },
        {
            id: 'service-5',
            name: 'Nail Trimming - Small Pet',
            price: 120000,
            description: 'Nail trimming for small pets like rabbits and guinea pigs',
            active: true
        }
    ];
}