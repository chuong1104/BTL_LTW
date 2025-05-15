// filepath: d:\BTL_LTW\JanyPet\src\main\resources\static\js\pet-management.js
/**
 * Pet Management
 * Handles CRUD operations for user's pets
 */

const petManager = {
    pets: [],
    currentUser: null,
    viewMode: 'table', // 'table' or 'grid'
    
    init: function() {
        console.log('Initializing Pet Manager');
        this.bindEvents();
        this.loadCurrentUser()
            .then(() => this.loadPets());
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
        
        // Reset form when modal is opened for a new pet
        const addPetBtn = document.getElementById('add-pet-btn');
        if (addPetBtn) {
            addPetBtn.addEventListener('click', this.resetPetForm.bind(this));
        }
        
        // Listen for tab activation to refresh data
        const petTab = document.querySelector('a[href="#pet-management"]');
        if (petTab) {
            petTab.addEventListener('shown.bs.tab', () => {
                this.loadPets();
            });
        }
    },
    
    loadCurrentUser: function() {
        return new Promise((resolve, reject) => {
            apiService.get('/users/profile')
                .then(user => {
                    this.currentUser = user;
                    resolve(user);
                })
                .catch(error => {
                    console.error('Error fetching current user:', error);
                    toastManager.showToast('Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.', 'error');
                    reject(error);
                });
        });
    },
    
    loadPets: function() {
        if (!this.currentUser || !this.currentUser.id) {
            console.error('Cannot load pets: Current user is not available');
            return;
        }
        
        // Show loading state
        document.getElementById('pets-grid-container').innerHTML = '<div class="col-12 text-center my-5"><div class="spinner-border text-primary"></div></div>';
        document.getElementById('pet-list-tbody').innerHTML = '<tr><td colspan="5" class="text-center"><div class="spinner-border text-primary mx-auto"></div></td></tr>';
        
        apiService.get(`/pets/owner/${this.currentUser.id}`)
            .then(pets => {
                this.pets = pets;
                this.renderPets();
                
                // Toggle empty state
                const hasNoPets = pets.length === 0;
                document.getElementById('no-pets-alert').style.display = hasNoPets ? 'block' : 'none';
                document.getElementById('pets-table-container').style.display = hasNoPets ? 'none' : 'block';
                document.getElementById('pets-grid-container').style.display = 'none';
                
                // Update view based on preference
                this.toggleView(this.viewMode, false);
            })
            .catch(error => {
                console.error('Error fetching pets:', error);
                document.getElementById('pet-list-tbody').innerHTML = '<tr><td colspan="5" class="text-center text-danger">Không thể tải dữ liệu thú cưng</td></tr>';
                document.getElementById('pets-grid-container').innerHTML = '<div class="col-12 text-center text-danger">Không thể tải dữ liệu thú cưng</div>';
                toastManager.showToast('Không thể tải danh sách thú cưng. Vui lòng thử lại sau.', 'error');
            });
    },
    
    renderPets: function() {
        // Render table view
        const tbody = document.getElementById('pet-list-tbody');
        tbody.innerHTML = '';
        
        this.pets.forEach(pet => {
            const row = document.createElement('tr');
            
            // Calculate age from birthDate if available
            let age = 'Không rõ';
            if (pet.birthDate) {
                const birthDate = new Date(pet.birthDate);
                const today = new Date();
                const ageInYears = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
                
                if (ageInYears < 1) {
                    const ageInMonths = Math.floor((today - birthDate) / (30.44 * 24 * 60 * 60 * 1000));
                    age = `${ageInMonths} tháng`;
                } else {
                    age = `${ageInYears} tuổi`;
                }
            }
            
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="pet-icon me-2">
                            <i class="fas fa-${this.getPetIcon(pet.species)}"></i>
                        </div>
                        <div>
                            <strong>${pet.name}</strong>
                            ${pet.vaccinated ? '<span class="badge bg-success ms-2">Đã tiêm phòng</span>' : ''}
                        </div>
                    </div>
                </td>
                <td>${this.getSpeciesName(pet.species)}</td>
                <td>${pet.breed || 'Không rõ'}</td>
                <td>${age}</td>
                <td>
                    <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-outline-primary edit-pet-btn" data-pet-id="${pet.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger delete-pet-btn" data-pet-id="${pet.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Add event listeners to the newly created buttons
        document.querySelectorAll('.edit-pet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEditPet(e.currentTarget.dataset.petId));
        });
        
        document.querySelectorAll('.delete-pet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDeletePet(e.currentTarget.dataset.petId));
        });
        
        // Render grid view
        const gridContainer = document.getElementById('pets-grid-container');
        gridContainer.innerHTML = '';
        
        this.pets.forEach(pet => {
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4 mb-4';
            
            let healthInfo = '';
            if (pet.vaccinated) {
                healthInfo += '<span class="badge bg-success me-1">Đã tiêm phòng</span>';
            }
            if (pet.healthNotes) {
                healthInfo += `<div class="mt-2 small"><i class="fas fa-notes-medical me-1 text-danger"></i> ${pet.healthNotes}</div>`;
            }
            
            card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-header bg-light">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">${pet.name}</h5>
                            <span class="pet-icon-large">
                                <i class="fas fa-${this.getPetIcon(pet.species)} fa-2x"></i>
                            </span>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="card-text mb-1"><strong>Loài:</strong> ${this.getSpeciesName(pet.species)}</p>
                        <p class="card-text mb-1"><strong>Giống:</strong> ${pet.breed || 'Không rõ'}</p>
                        <p class="card-text mb-1"><strong>Giới tính:</strong> ${this.getGenderName(pet.gender)}</p>
                        <p class="card-text mb-1"><strong>Ngày sinh:</strong> ${pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('vi-VN') : 'Không rõ'}</p>
                        <p class="card-text mb-1"><strong>Cân nặng:</strong> ${pet.weight ? pet.weight + ' kg' : 'Không rõ'}</p>
                        <div class="mt-2">
                            ${healthInfo}
                        </div>
                    </div>
                    <div class="card-footer bg-white border-0">
                        <div class="d-flex justify-content-between">
                            <button type="button" class="btn btn-sm btn-outline-primary edit-pet-grid-btn" data-pet-id="${pet.id}" data-bs-toggle="modal" data-bs-target="#petModal">
                                <i class="fas fa-edit me-1"></i> Chỉnh sửa
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-danger delete-pet-grid-btn" data-pet-id="${pet.id}">
                                <i class="fas fa-trash me-1"></i> Xóa
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            gridContainer.appendChild(card);
        });
        
        // Add event listeners for grid view buttons
        document.querySelectorAll('.edit-pet-grid-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEditPet(e.currentTarget.dataset.petId));
        });
        
        document.querySelectorAll('.delete-pet-grid-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDeletePet(e.currentTarget.dataset.petId));
        });
    },
    
    toggleView: function(mode, updateButtons = true) {
        this.viewMode = mode;
        
        const gridContainer = document.getElementById('pets-grid-container');
        const tableContainer = document.getElementById('pets-table-container');
        
        if (mode === 'grid') {
            gridContainer.style.display = 'flex';
            tableContainer.style.display = 'none';
            
            if (updateButtons) {
                document.getElementById('grid-view-btn').classList.add('active');
                document.getElementById('table-view-btn').classList.remove('active');
            }
        } else {
            gridContainer.style.display = 'none';
            tableContainer.style.display = 'block';
            
            if (updateButtons) {
                document.getElementById('grid-view-btn').classList.remove('active');
                document.getElementById('table-view-btn').classList.add('active');
            }
        }
    },
    
    handleEditPet: function(petId) {
        const pet = this.pets.find(p => p.id === petId);
        if (!pet) return;
        
        // Show modal
        const petModal = new bootstrap.Modal(document.getElementById('petModal'));
        petModal.show();
        
        // Populate form
        document.getElementById('petModalLabel').innerText = 'Chỉnh sửa thông tin thú cưng';
        document.getElementById('pet-id').value = pet.id;
        document.getElementById('pet-name').value = pet.name || '';
        document.getElementById('pet-species').value = pet.species || '';
        document.getElementById('pet-breed').value = pet.breed || '';
        
        // Convert ISO date to YYYY-MM-DD format for input
        if (pet.birthDate) {
            const birthDate = new Date(pet.birthDate);
            const formattedDate = birthDate.toISOString().split('T')[0];
            document.getElementById('pet-birthDate').value = formattedDate;
        } else {
            document.getElementById('pet-birthDate').value = '';
        }
        
        document.getElementById('pet-gender').value = pet.gender || '';
        document.getElementById('pet-weight').value = pet.weight || '';
        document.getElementById('pet-vaccinated').checked = pet.vaccinated || false;
        document.getElementById('pet-healthNotes').value = pet.healthNotes || '';
    },
    
    handleDeletePet: function(petId) {
        if (confirm('Bạn có chắc chắn muốn xóa thú cưng này không?')) {
            apiService.delete(`/pets/${petId}`)
                .then(() => {
                    // Remove from local array
                    this.pets = this.pets.filter(pet => pet.id !== petId);
                    this.renderPets();
                    
                    // Toggle empty state if no pets left
                    const hasNoPets = this.pets.length === 0;
                    document.getElementById('no-pets-alert').style.display = hasNoPets ? 'block' : 'none';
                    document.getElementById('pets-table-container').style.display = hasNoPets ? 'none' : 'block';
                    
                    toastManager.showToast('Đã xóa thú cưng thành công!', 'success');
                })
                .catch(error => {
                    console.error('Error deleting pet:', error);
                    toastManager.showToast('Không thể xóa thú cưng. Vui lòng thử lại sau.', 'error');
                });
        }
    },
    
    resetPetForm: function() {
        document.getElementById('petModalLabel').innerText = 'Thêm thú cưng mới';
        document.getElementById('pet-form').reset();
        document.getElementById('pet-id').value = '';
    },
    
    handleSavePet: function() {
        // Get form data
        const petId = document.getElementById('pet-id').value;
        const petData = {
            name: document.getElementById('pet-name').value,
            species: document.getElementById('pet-species').value,
            breed: document.getElementById('pet-breed').value,
            birthDate: document.getElementById('pet-birthDate').value || null,
            gender: document.getElementById('pet-gender').value || null,
            weight: document.getElementById('pet-weight').value || null,
            vaccinated: document.getElementById('pet-vaccinated').checked,
            healthNotes: document.getElementById('pet-healthNotes').value || null
        };
        
        // Form validation
        if (!petData.name || !petData.species) {
            toastManager.showToast('Vui lòng điền đầy đủ thông tin bắt buộc.', 'warning');
            return;
        }
        
        // Create new pet or update existing one
        const isNewPet = !petId;
        
        if (isNewPet) {
            apiService.post(`/pets/owner/${this.currentUser.id}`, petData)
                .then(response => {
                    // Hide modal
                    bootstrap.Modal.getInstance(document.getElementById('petModal')).hide();
                    
                    // Add to array and re-render
                    this.pets.push(response);
                    this.renderPets();
                    
                    // Show success message
                    toastManager.showToast('Đã thêm thú cưng thành công!', 'success');
                    
                    // Update empty state
                    document.getElementById('no-pets-alert').style.display = 'none';
                    document.getElementById('pets-table-container').style.display = 'block';
                })
                .catch(error => {
                    console.error('Error creating pet:', error);
                    toastManager.showToast('Không thể tạo mới thú cưng. Vui lòng thử lại sau.', 'error');
                });
        } else {
            apiService.put(`/pets/${petId}`, petData)
                .then(response => {
                    // Hide modal
                    bootstrap.Modal.getInstance(document.getElementById('petModal')).hide();
                    
                    // Update in array and re-render
                    const index = this.pets.findIndex(p => p.id === petId);
                    if (index !== -1) {
                        this.pets[index] = response;
                    }
                    this.renderPets();
                    
                    // Show success message
                    toastManager.showToast('Đã cập nhật thông tin thú cưng thành công!', 'success');
                })
                .catch(error => {
                    console.error('Error updating pet:', error);
                    toastManager.showToast('Không thể cập nhật thú cưng. Vui lòng thử lại sau.', 'error');
                });
        }
    },
    
    // Helper methods
    getPetIcon: function(species) {
        switch (species) {
            case 'DOG': return 'dog';
            case 'CAT': return 'cat';
            case 'BIRD': return 'dove';
            case 'FISH': return 'fish';
            case 'SMALL_ANIMAL': return 'rabbit';
            default: return 'paw';
        }
    },
    
    getSpeciesName: function(species) {
        switch (species) {
            case 'DOG': return 'Chó';
            case 'CAT': return 'Mèo';
            case 'BIRD': return 'Chim';
            case 'FISH': return 'Cá';
            case 'SMALL_ANIMAL': return 'Động vật nhỏ';
            default: return 'Khác';
        }
    },
    
    getGenderName: function(gender) {
        switch (gender) {
            case 'MALE': return 'Đực';
            case 'FEMALE': return 'Cái';
            default: return 'Không rõ';
        }
    }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    petManager.init();
});