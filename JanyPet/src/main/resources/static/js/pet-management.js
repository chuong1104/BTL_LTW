// filepath: d:\BTL_LTW\JanyPet\src\main\resources\static\js\pet-management.js
/**
 * Pet Management
 * Handles CRUD operations for user's pets
 */

const petManager = {
    pets: [],
    currentUser: null,
    viewMode: 'table', // Default view mode
    isLoading: false,

    init: function() {
        console.log('PetManager: Initializing...');
        // Attempt to load persisted view mode
        const savedViewMode = localStorage.getItem('petViewMode');
        if (savedViewMode) {
            this.viewMode = savedViewMode;
        }
        // Set initial active state for view toggle buttons
        this.updateViewToggleButtons();

        this.bindEvents();
        // If the pet management tab is already active on page load (e.g. direct link with hash)
        const petTabPane = document.getElementById('pet-management');
        if (petTabPane && petTabPane.classList.contains('active')) {
            this.checkAuthAndLoadData();
        }
        // Note: user-profile.js also calls checkAuthAndLoadData, which is good.
    },

    updateViewToggleButtons: function() {
        const gridBtn = document.getElementById('grid-view-btn');
        const tableBtn = document.getElementById('table-view-btn');
        if (gridBtn) gridBtn.classList.toggle('active', this.viewMode === 'grid');
        if (tableBtn) tableBtn.classList.toggle('active', this.viewMode === 'table');
    },

    checkAuthAndLoadData: function() {
        console.log('PetManager: checkAuthAndLoadData called.');
        this.currentUser = null; // Reset to ensure fresh check

        // 1. Try authService.getCurrentUser()
        if (window.authService && typeof window.authService.getCurrentUser === 'function') {
            const authUser = window.authService.getCurrentUser();
            if (authUser && (authUser.id || authUser.sub)) {
                console.log('PetManager: User found via authService.getCurrentUser()', authUser);
                this.currentUser = authUser;
                this.loadPets();
                return;
            }
        }

        // 2. Try localStorage.getItem('currentUser')
        const storedUserStr = localStorage.getItem('currentUser');
        if (storedUserStr) {
            try {
                const storedUser = JSON.parse(storedUserStr);
                if (storedUser && (storedUser.id || storedUser.sub)) {
                    console.log('PetManager: User found in localStorage', storedUser);
                    this.currentUser = storedUser;
                    this.loadPets();
                    return;
                }
            } catch (e) {
                console.error('PetManager: Error parsing user from localStorage', e);
                localStorage.removeItem('currentUser'); // Clear invalid entry
            }
        }

        // 3. Fallback to API call if token exists
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            console.log('PetManager: User not found in cache/localStorage, attempting API fetch.');
            this.loadCurrentUserFromAPI()
                .then(userFromApi => {
                    // loadCurrentUserFromAPI already sets this.currentUser and localStorage
                    if (this.currentUser && (this.currentUser.id || this.currentUser.sub)) {
                        console.log('PetManager: User successfully fetched from API.', this.currentUser);
                        this.loadPets();
                    } else {
                        console.error('PetManager: API fetch processed but currentUser is still invalid.');
                        this.handleUnauthenticatedState();
                    }
                })
                .catch(error => {
                    console.error('PetManager: Error fetching user from API via loadCurrentUserFromAPI.', error);
                    this.handleUnauthenticatedState();
                });
        } else {
            console.log('PetManager: No token found, user is not authenticated.');
            this.handleUnauthenticatedState();
        }
    },

    loadCurrentUserFromAPI: function() {
        return new Promise((resolve, reject) => {
            console.log('PetManager: loadCurrentUserFromAPI (API fetch) initiated...');

            apiService.get('/users/profile')
                .then(user => {
                    if (user && (user.id || user.sub)) { // Ensure 'sub' from JWT or 'id' from full profile
                        console.log('PetManager: Successfully loaded user from API:', user);
                        this.currentUser = user;
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        resolve(user);
                    } else {
                        console.error('PetManager: API returned invalid user data.', user);
                        this.currentUser = null;
                        localStorage.removeItem('currentUser');
                        reject(new Error('Invalid user data from API'));
                    }
                })
                .catch(error => {
                    console.error('PetManager: Error fetching current user from API:', error);
                    this.currentUser = null;
                    localStorage.removeItem('currentUser');
                    // Optionally clear token if it's an auth error
                    if (error && (error.status === 401 || error.status === 403)) {
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('token');
                    }
                    reject(error);
                });
        });
    },

    bindEvents: function() {
        // Save pet button
        const savePetBtn = document.getElementById('save-pet-btn');
        if (savePetBtn) {
            savePetBtn.addEventListener('click', this.handleSavePet.bind(this));
        }

        // View toggle buttons
        const gridViewBtn = document.getElementById('grid-view-btn');
        const tableViewBtn = document.getElementById('table-view-btn');

        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => this.toggleView('grid'));
        }
        if (tableViewBtn) {
            tableViewBtn.addEventListener('click', () => this.toggleView('table'));
        }

        // Reset form when modal is opened for a new pet (triggered by 'Add Pet' button)
        const addPetModalTrigger = document.querySelector('[data-bs-target="#petModal"]'); // Or specific ID if 'add-pet-btn' is for modal trigger
        if (addPetModalTrigger) {
             addPetModalTrigger.addEventListener('click', this.resetPetForm.bind(this));
        }
        // If you have a separate "Add Pet" button that doesn't directly open the modal but should reset form:
        const addPetBtn = document.getElementById('add-pet-btn');
        if (addPetBtn && !addPetBtn.hasAttribute('data-bs-target')) { // Ensure it's not the modal trigger itself
            addPetBtn.addEventListener('click', this.resetPetForm.bind(this));
        }


        // Listen for tab activation to refresh data
        const petTabLink = document.querySelector('a[data-bs-toggle="tab"][href="#pet-management"], a[data-bs-toggle="tab"][data-bs-target="#pet-management"]');
        if (petTabLink) {
            petTabLink.addEventListener('shown.bs.tab', () => {
                console.log('PetManager: Pet management tab shown.');
                this.checkAuthAndLoadData(); // Reload data when tab becomes active
            });
        }
    },

    handleUnauthenticatedState: function() {
        console.log('PetManager: User is not authenticated or user data is invalid.');
        this.pets = []; // Clear any existing pets
        
        const petManagementContainer = document.getElementById('pet-management-container');
        if (petManagementContainer) {
            petManagementContainer.innerHTML = `
                <div class="alert alert-warning text-center">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Vui lòng đăng nhập để xem và quản lý thú cưng của bạn.
                </div>
            `;
        }
        // Ensure other specific pet elements are hidden if they exist outside the main container logic
        const addPetBtn = document.getElementById('add-pet-btn');
        if (addPetBtn) addPetBtn.style.display = 'none';
        
        const petsLoadingSpinner = document.getElementById('pets-loading-spinner');
        if (petsLoadingSpinner) petsLoadingSpinner.style.display = 'none';
        
        const noPetsAlert = document.getElementById('no-pets-alert');
        if (noPetsAlert) noPetsAlert.style.display = 'none';

        const petsGridContainer = document.getElementById('pets-grid-container');
        if (petsGridContainer) petsGridContainer.style.display = 'none';

        const petsTableContainer = document.getElementById('pets-table-container');
        if (petsTableContainer) petsTableContainer.style.display = 'none';

        const petViewToggleButtons = document.getElementById('pet-view-toggle-buttons');
        if(petViewToggleButtons) petViewToggleButtons.style.display = 'none';
    },

    loadPets: function() {
        if (!this.currentUser || !(this.currentUser.id || this.currentUser.sub)) {
            console.error('PetManager: loadPets called but currentUser is invalid or missing ID/SUB.', this.currentUser);
            this.handleUnauthenticatedState();
            return;
        }

        const userId = this.currentUser.id || this.currentUser.sub;
        console.log('PetManager: Loading pets for user ID:', userId);

        this.isLoading = true;
        const petsLoadingSpinner = document.getElementById('pets-loading-spinner');
        if (petsLoadingSpinner) petsLoadingSpinner.style.display = 'block';

        // Hide content areas while loading
        const petsGridContainer = document.getElementById('pets-grid-container');
        if (petsGridContainer) petsGridContainer.style.display = 'none';
        const petsTableContainer = document.getElementById('pets-table-container');
        if (petsTableContainer) petsTableContainer.style.display = 'none';
        const noPetsAlert = document.getElementById('no-pets-alert');
        if (noPetsAlert) noPetsAlert.style.display = 'none';
        const petViewToggleButtons = document.getElementById('pet-view-toggle-buttons');
        if(petViewToggleButtons) petViewToggleButtons.style.display = 'none';


        // Ensure the main "add pet" button is visible if authenticated
        const addPetBtn = document.getElementById('add-pet-btn');
        if (addPetBtn) {
            addPetBtn.style.display = 'block'; // Or 'inline-block' or ''
        }
        
        // Clear previous "unauthenticated" message if present in the main container
        const mainPetManagementContainer = document.getElementById('pet-management-container');
        if(mainPetManagementContainer) {
            const unauthAlert = mainPetManagementContainer.querySelector('.alert-warning');
            if(unauthAlert && unauthAlert.textContent.includes('Vui lòng đăng nhập')) {
                // Instead of clearing all innerHTML, just remove the alert
                // This assumes the structure from the HTML snippet is present
                unauthAlert.remove();
            }
        }

        apiService.get(`/pets/owner/${userId}`)
            .then(pets => {
                console.log('PetManager: Pets loaded successfully:', pets);
                this.pets = pets || [];
                this.renderPets(); // This will handle displaying pets or "no pets" message
            })
            .catch(error => {
                console.error('PetManager: Error loading pets:', error);
                if (window.toastManager) {
                    toastManager.showToast('Không thể tải dữ liệu thú cưng. Vui lòng thử lại sau.', 'error');
                }
                // Display error within the pet management area
                if(mainPetManagementContainer) {
                    mainPetManagementContainer.innerHTML = '<div class="alert alert-danger text-center">Lỗi tải danh sách thú cưng. Vui lòng thử lại.</div>';
                }
            })
            .finally(() => {
                this.isLoading = false;
                if (petsLoadingSpinner) petsLoadingSpinner.style.display = 'none';
            });
    },

    renderPets: function() {
        const petsGridContainer = document.getElementById('pets-grid-container');
        const petsTableContainer = document.getElementById('pets-table-container');
        const noPetsAlert = document.getElementById('no-pets-alert');
        const petViewToggleButtons = document.getElementById('pet-view-toggle-buttons');

        if (!petsGridContainer || !petsTableContainer || !noPetsAlert || !petViewToggleButtons) {
            console.error('PetManager: One or more pet display containers not found.');
            return;
        }

        // Clear previous content
        petsGridContainer.innerHTML = '';
        petsTableContainer.innerHTML = '';

        if (this.pets.length === 0) {
            noPetsAlert.style.display = 'block';
            petsGridContainer.style.display = 'none';
            petsTableContainer.style.display = 'none';
            petViewToggleButtons.style.display = 'none';
        } else {
            noPetsAlert.style.display = 'none';
            petViewToggleButtons.style.display = 'flex'; // Show toggle buttons

            if (this.viewMode === 'table') {
                this.renderTableView(petsTableContainer);
                petsTableContainer.style.display = 'block';
                petsGridContainer.style.display = 'none';
            } else { // 'grid'
                this.renderGridView(petsGridContainer);
                petsGridContainer.style.display = 'flex'; // Assuming grid uses flex for row
                petsTableContainer.style.display = 'none';
            }
            this.addPetEventListeners();
        }
        this.updateViewToggleButtons(); // Ensure buttons reflect current view
    },

    renderTableView: function(container) {
        const table = document.createElement('table');
        table.className = 'table table-hover align-middle'; // Added align-middle for better vertical alignment
        table.innerHTML = `
            <thead class="table-light">
                <tr>
                    <th>Tên thú cưng</th>
                    <th>Loài</th>
                    <th>Giống</th>
                    <th>Ngày sinh/Tuổi</th>
                    <th>Giới tính</th>
                    <th>Cân nặng</th>
                    <th>Đã tiêm phòng</th>
                    <th>Ghi chú sức khỏe</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;
        const tbody = table.querySelector('tbody');

        this.pets.forEach(pet => {
            const row = tbody.insertRow();
            const ageDisplay = pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('vi-VN') : (pet.age ? `${pet.age} tuổi` : 'Không rõ');
            row.innerHTML = `
                <td>${pet.name || 'Không rõ'}</td>
                <td>${pet.species || 'Không rõ'}</td>
                <td>${pet.breed || 'Không rõ'}</td>
                <td>${ageDisplay}</td>
                <td>${this.getGenderText(pet.gender)}</td>
                <td>${pet.weight ? pet.weight + ' kg' : 'Không rõ'}</td>
                <td>${pet.vaccinated ? '<span class="badge bg-success">Đã tiêm</span>' : '<span class="badge bg-secondary">Chưa tiêm</span>'}</td>
                <td>${pet.healthNotes || 'Không có'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-pet-btn" data-pet-id="${pet.id}" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-pet-btn" data-pet-id="${pet.id}" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });
        container.appendChild(table);
    },

    renderGridView: function(container) {
        const row = document.createElement('div');
        row.className = 'row g-4';

        this.pets.forEach(pet => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            const ageDisplay = pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('vi-VN') : (pet.age ? `${pet.age} tuổi` : 'Không rõ');
            col.innerHTML = `
                <div class="card h-100 shadow-sm pet-card">
                    <div class="card-body">
                        <h5 class="card-title text-primary">${pet.name || 'Không rõ'}</h5>
                        <p class="card-text mb-1"><strong>Loài:</strong> ${pet.species || 'Không rõ'}</p>
                        <p class="card-text mb-1"><strong>Giống:</strong> ${pet.breed || 'Không rõ'}</p>
                        <p class="card-text mb-1"><strong>Ngày sinh/Tuổi:</strong> ${ageDisplay}</p>
                        <p class="card-text mb-1"><strong>Giới tính:</strong> ${this.getGenderText(pet.gender)}</p>
                        <p class="card-text mb-1"><strong>Cân nặng:</strong> ${pet.weight ? pet.weight + ' kg' : 'Không rõ'}</p>
                        <p class="card-text mb-1"><strong>Tiêm phòng:</strong> ${pet.vaccinated ? '<span class="badge bg-success">Đã tiêm</span>' : '<span class="badge bg-secondary">Chưa tiêm</span>'}</p>
                        <p class="card-text mb-1"><strong>Sức khỏe:</strong> ${pet.healthNotes || 'Không có ghi chú'}</p>
                    </div>
                    <div class="card-footer bg-light border-top-0 text-end">
                        <button class="btn btn-sm btn-outline-primary edit-pet-btn me-2" data-pet-id="${pet.id}" title="Sửa">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-pet-btn" data-pet-id="${pet.id}" title="Xóa">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </div>
            `;
            row.appendChild(col);
        });
        container.appendChild(row);
    },

    addPetEventListeners: function() {
        document.querySelectorAll('.edit-pet-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const petId = event.currentTarget.getAttribute('data-pet-id');
                this.editPet(petId);
            });
        });

        document.querySelectorAll('.delete-pet-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const petId = event.currentTarget.getAttribute('data-pet-id');
                this.deletePet(petId);
            });
        });
    },

    toggleView: function(viewMode) {
        this.viewMode = viewMode;
        localStorage.setItem('petViewMode', viewMode);
        this.renderPets(); // This will re-render and show/hide correct containers
        // updateViewToggleButtons is called at the end of renderPets
    },

    resetPetForm: function() {
        const petForm = document.getElementById('pet-form');
        if (petForm) petForm.reset();

        document.getElementById('pet-id').value = ''; // Clear hidden ID field
        // Set default values for your form fields if any, e.g.,
        // document.getElementById('pet-species').value = 'DOG';
        // document.getElementById('pet-gender').value = 'MALE';
        const modalLabel = document.getElementById('petModalLabel');
        if (modalLabel) modalLabel.textContent = 'Thêm thú cưng mới';
    },

    editPet: function(petId) {
        const pet = this.pets.find(p => p.id === petId);
        if (!pet) {
            console.error('Pet not found for editing:', petId);
            if(window.toastManager) toastManager.showToast('Không tìm thấy thú cưng để sửa.', 'error');
            return;
        }
        this.resetPetForm(); // Reset form first

        document.getElementById('pet-id').value = pet.id;
        document.getElementById('pet-name').value = pet.name || '';
        // Assuming your form IDs match these, adjust as necessary:
        if(document.getElementById('pet-species')) document.getElementById('pet-species').value = pet.species || '';
        if(document.getElementById('pet-breed')) document.getElementById('pet-breed').value = pet.breed || '';
        if(document.getElementById('pet-birthDate')) document.getElementById('pet-birthDate').value = pet.birthDate || ''; // Ensure date format matches input type="date"
        if(document.getElementById('pet-gender')) document.getElementById('pet-gender').value = pet.gender || '';
        if(document.getElementById('pet-weight')) document.getElementById('pet-weight').value = pet.weight || '';
        if(document.getElementById('pet-vaccinated')) document.getElementById('pet-vaccinated').checked = pet.vaccinated || false;
        if(document.getElementById('pet-healthNotes')) document.getElementById('pet-healthNotes').value = pet.healthNotes || '';
        
        const modalLabel = document.getElementById('petModalLabel');
        if (modalLabel) modalLabel.textContent = 'Chỉnh sửa thông tin thú cưng';
        
        const petModal = new bootstrap.Modal(document.getElementById('petModal'));
        petModal.show();
    },

    deletePet: function(petId) {
        if (!confirm('Bạn có chắc chắn muốn xóa thú cưng này không? Hành động này không thể hoàn tác.')) {
            return;
        }
        apiService.delete(`/pets/${petId}`)
            .then(() => {
                this.pets = this.pets.filter(pet => pet.id !== petId);
                this.renderPets(); // Re-render the list
                if(window.toastManager) toastManager.showToast('Đã xóa thú cưng thành công.', 'success');
                if (this.pets.length === 0) {
                     const noPetsMsg = document.getElementById('no-pets-message');
                     if (noPetsMsg) noPetsMsg.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error deleting pet:', error);
                if(window.toastManager) toastManager.showToast('Lỗi xóa thú cưng. Vui lòng thử lại.', 'error');
            });
    },

    handleSavePet: function(event) {
        event.preventDefault();
        if (!this.currentUser || !(this.currentUser.id || this.currentUser.sub)) {
            if(window.toastManager) toastManager.showToast('Phiên làm việc hết hạn hoặc lỗi xác thực. Vui lòng đăng nhập lại.', 'error');
            return;
        }

        const petId = document.getElementById('pet-id').value;
        // Adapt to your actual form field IDs
        const petData = {
            name: document.getElementById('pet-name').value,
            species: document.getElementById('pet-species') ? document.getElementById('pet-species').value : null,
            breed: document.getElementById('pet-breed') ? document.getElementById('pet-breed').value : null,
            birthDate: document.getElementById('pet-birthDate') ? document.getElementById('pet-birthDate').value : null, // Ensure this is in YYYY-MM-DD format if sending to backend expecting LocalDate
            gender: document.getElementById('pet-gender') ? document.getElementById('pet-gender').value : null,
            weight: document.getElementById('pet-weight') ? parseFloat(document.getElementById('pet-weight').value) : null,
            vaccinated: document.getElementById('pet-vaccinated') ? document.getElementById('pet-vaccinated').checked : false,
            healthNotes: document.getElementById('pet-healthNotes') ? document.getElementById('pet-healthNotes').value : null,
            ownerId: this.currentUser.id || this.currentUser.sub // Important: associate with current user
        };

        if (!petData.name || !petData.species) {
            if(window.toastManager) toastManager.showToast('Tên thú cưng và loài là bắt buộc.', 'warning');
            return;
        }
        if (petData.birthDate === "") petData.birthDate = null;


        const saveButton = document.getElementById('save-pet-btn');
        const originalButtonText = saveButton.innerHTML;
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang lưu...';

        const apiCall = petId 
            ? apiService.put(`/pets/${petId}`, petData) 
            : apiService.post(`/pets/owner/${petData.ownerId}`, petData); // Use correct endpoint for creation

        apiCall.then(savedPet => {
            if (petId) { // Update
                const index = this.pets.findIndex(p => p.id === petId);
                if (index !== -1) this.pets[index] = savedPet;
                if(window.toastManager) toastManager.showToast('Cập nhật thông tin thú cưng thành công!', 'success');
            } else { // Create
                this.pets.push(savedPet);
                if(window.toastManager) toastManager.showToast('Thêm thú cưng mới thành công!', 'success');
            }
            this.renderPets();
            const petModal = bootstrap.Modal.getInstance(document.getElementById('petModal'));
            if (petModal) petModal.hide();
        })
        .catch(error => {
            console.error('Error saving pet:', error);
            if(window.toastManager) toastManager.showToast(`Lỗi lưu thông tin thú cưng: ${error.message || 'Vui lòng thử lại.'}`, 'error');
        })
        .finally(() => {
            saveButton.disabled = false;
            saveButton.innerHTML = originalButtonText;
        });
    },
    
    getGenderText: function(gender) {
        // Assuming gender might be 'MALE', 'FEMALE', 'UNKNOWN' or your enum values
        if (!gender) return 'Không rõ';
        switch (gender.toUpperCase()) {
            case 'MALE': return 'Đực';
            case 'FEMALE': return 'Cái';
            case 'UNKNOWN': return 'Không xác định';
            default: return gender; // Display as is if not recognized
        }
    },

    // calculateAge is not strictly needed if birthDate is primary and age is derived for display
    // but if your PetResponse has an 'age' field, you might use it.
    // For now, rendering birthDate directly or formatting it.
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const savedViewMode = localStorage.getItem('petViewMode');
    if (savedViewMode) {
        petManager.viewMode = savedViewMode;
    }
    // petManager.init() will be called, which now also calls updateViewToggleButtons.
    petManager.init();
});
