const StaffService = {
    // Get all staff members
    getAllStaff: async function() {
        try {
            const response = await fetch('/api/staffs');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching staff:', error);
            throw error;
        }
    },
    
    // Get staff by ID
    getStaffById: async function(id) {
        try {
            const response = await fetch(`/api/staffs/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching staff with id ${id}:`, error);
            throw error;
        }
    },
    
    // Create new staff
    createStaff: async function(staffData) {
        try {
            const response = await fetch('/api/staffs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(staffData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating staff:', error);
            throw error;
        }
    },
    
    // Update staff
    updateStaff: async function(id, staffData) {
        try {
            const response = await fetch(`/api/staffs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(staffData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error updating staff with id ${id}:`, error);
            throw error;
        }
    },
    
    // Delete staff
    deleteStaff: async function(id) {
        try {
            const response = await fetch(`/api/staffs/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return true;
        } catch (error) {
            console.error(`Error deleting staff with id ${id}:`, error);
            throw error;
        }
    },
    
    // Get staff by branch
    getStaffByBranch: async function(branchId) {
        try {
            const response = await fetch(`/api/staffs/branch/${branchId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching staff by branch ${branchId}:`, error);
            throw error;
        }
    }
};

const StaffHandlers = {
    // Initialization
    initializeStaffEvents: function() {
        // Add staff button
        const addStaffBtn = document.getElementById('add-staff-btn');
        if (addStaffBtn) {
            addStaffBtn.addEventListener('click', this.showAddStaffModal.bind(this));
        }
        
        // Staff form submission
        const staffForm = document.getElementById('staff-form');
        if (staffForm) {
            staffForm.addEventListener('submit', this.handleStaffFormSubmit.bind(this));
        }
        
        // Cancel button
        const cancelStaffBtn = document.getElementById('cancel-staff-btn');
        if (cancelStaffBtn) {
            cancelStaffBtn.addEventListener('click', this.hideStaffModal.bind(this));
        }
        
        // Save button
        const saveStaffBtn = document.getElementById('save-staff-btn');
        if (saveStaffBtn) {
            saveStaffBtn.addEventListener('click', this.handleStaffSave.bind(this));
        }
        
        // Close modal X button
        const closeButtons = document.querySelectorAll('#staff-modal .close');
        closeButtons.forEach(button => {
            button.addEventListener('click', this.hideStaffModal.bind(this));
        });
        
        // Department filter
        const deptFilter = document.getElementById('filter-department');
        if (deptFilter) {
            deptFilter.addEventListener('change', this.handleDepartmentFilter.bind(this));
        }
        
        // Position filter
        const posFilter = document.getElementById('filter-position');
        if (posFilter) {
            posFilter.addEventListener('change', this.handlePositionFilter.bind(this));
        }
        
        // Branch filter
        const branchFilter = document.getElementById('filter-staff-branch');
        if (branchFilter) {
            branchFilter.addEventListener('change', this.handleBranchFilter.bind(this));
        }
        
        // Search input
        const searchInput = document.getElementById('staff-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
        
        // Load staff data when on staff section
        if (document.querySelector('#staff-section.active')) {
            this.loadStaffData();
        }
        
        // Load branches for filters and form
        this.loadBranchesForFilter();
        this.loadBranchesForForm();
    },
    
    // Load branches for filter dropdown
    loadBranchesForFilter: async function() {
        try {
            const response = await fetch('/api/branches');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const branches = await response.json();
            this.populateBranchFilter(branches);
        } catch (error) {
            console.error('Failed to load branches for filter:', error);
        }
    },
    
    // Populate branch filter dropdown
    populateBranchFilter: function(branches) {
        const branchFilter = document.getElementById('filter-staff-branch');
        if (!branchFilter) return;
        
        // Clear existing options except the first one
        branchFilter.innerHTML = '<option value="">Tất cả cửa hàng</option>';
        
        // Add branch options
        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch.name; // Use name for filtering
            option.textContent = branch.name;
            branchFilter.appendChild(option);
        });
    },
    
    // Load branches for add/edit staff modal
    loadBranchesForForm: async function() {
        try {
            const response = await fetch('/api/branches');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const branches = await response.json();
            this.populateBranchForm(branches);
        } catch (error) {
            console.error('Failed to load branches for form:', error);
        }
    },
    
    // Populate branch select in form
    populateBranchForm: function(branches) {
        const branchSelect = document.getElementById('staff-branch');
        if (!branchSelect) return;
        
        // Clear existing options except placeholder
        branchSelect.innerHTML = '<option value="">Chọn cửa hàng</option>';
        
        // Add branch options
        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch.id; // Use ID for form submission
            option.textContent = branch.name;
            branchSelect.appendChild(option);
        });
    },
    
    // Load all staff data
    loadStaffData: async function() {
        try {
            const staffList = await StaffService.getAllStaff();
            this.renderStaffTable(staffList);
        } catch (error) {
            console.error('Failed to load staff data:', error);
            window.toastService?.showError('Failed to load staff data');
        }
    },
    
    // Render staff table
    renderStaffTable: function(staffList) {
        const tableBody = document.querySelector('#staff-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        staffList.forEach(staff => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td><input type="checkbox" class="select-item" /></td>
                <td>${staff.id}</td>
                <td>${staff.fullName}</td>
                <td>${staff.email}</td>
                <td>${staff.phoneNumber || ''}</td>
                <td>${staff.department}</td>
                <td>${staff.jobTitle}</td>
                <td>${staff.branchName}</td>
                <td><span class="status ${staff.active ? 'active' : 'inactive'}">${staff.active ? 'Hoạt động' : 'Nghỉ việc'}</span></td>
                <td class="actions">
                    <button class="icon-btn edit-btn" data-id="${staff.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete-btn" data-id="${staff.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners for edit and delete buttons
        this.addStaffRowEventListeners();
    },
    
    // Add event listeners to staff table rows
    addStaffRowEventListeners: function() {
        // Edit buttons
        const editButtons = document.querySelectorAll('#staff-table .edit-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const staffId = e.currentTarget.dataset.id;
                this.editStaff(staffId);
            });
        });
        
        // Delete buttons
        const deleteButtons = document.querySelectorAll('#staff-table .delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const staffId = e.currentTarget.dataset.id;
                this.confirmDeleteStaff(staffId);
            });
        });
    },
    
    // Show add staff modal
    showAddStaffModal: function() {
        this.loadBranchesForForm(); // Load branches when opening modal
        const modal = document.getElementById('staff-modal');
        const modalTitle = document.getElementById('staff-modal-title');
        const form = document.getElementById('staff-form');
        
        if (modalTitle) modalTitle.textContent = 'Thêm nhân viên mới';
        if (form) form.reset();
        if (modal) modal.style.display = 'block';
    },
    
    // Hide staff modal
    hideStaffModal: function() {
        const modal = document.getElementById('staff-modal');
        if (modal) modal.style.display = 'none';
    },
    
    // Handle staff form submission
    handleStaffFormSubmit: function(event) {
        event.preventDefault();
        this.handleStaffSave();
    },
    
    // Handle staff save
    handleStaffSave: async function() {
        const form = document.getElementById('staff-form');
        if (!form) return;
        
        const formData = new FormData(form);
        const staffData = {
            fullName: formData.get('staff-name'),
            email: formData.get('staff-email'),
            phoneNumber: formData.get('staff-phone'),
            department: formData.get('staff-department'),
            jobTitle: formData.get('staff-position'),
            branchId: formData.get('staff-branch'),
            active: formData.get('staff-status') === 'active'
        };
        
        try {
            const staffId = formData.get('staff-id');
            if (staffId) {
                await StaffService.updateStaff(staffId, staffData);
                window.toastService?.showSuccess('Cập nhật nhân viên thành công');
            } else {
                await StaffService.createStaff(staffData);
                window.toastService?.showSuccess('Thêm nhân viên thành công');
            }
            
            this.hideStaffModal();
            this.loadStaffData();
        } catch (error) {
            console.error('Error saving staff:', error);
            window.toastService?.showError('Lỗi khi lưu thông tin nhân viên');
        }
    },
    
    // Edit staff
    editStaff: async function(staffId) {
        try {
            const staff = await StaffService.getStaffById(staffId);
            this.populateStaffForm(staff);
            this.showEditStaffModal();
        } catch (error) {
            console.error('Error loading staff for edit:', error);
            window.toastService?.showError('Lỗi khi tải thông tin nhân viên');
        }
    },
    
    // Show edit staff modal
    showEditStaffModal: function() {
        this.loadBranchesForForm(); // Load branches when opening modal
        const modal = document.getElementById('staff-modal');
        const modalTitle = document.getElementById('staff-modal-title');
        
        if (modalTitle) modalTitle.textContent = 'Chỉnh sửa nhân viên';
        if (modal) modal.style.display = 'block';
    },
    
    // Populate staff form with data
    populateStaffForm: function(staff) {
        const form = document.getElementById('staff-form');
        if (!form) return;
        
        form.querySelector('#staff-id').value = staff.id || '';
        form.querySelector('#staff-name').value = staff.fullName || '';
        form.querySelector('#staff-email').value = staff.email || '';
        form.querySelector('#staff-phone').value = staff.phoneNumber || '';
        form.querySelector('#staff-department').value = staff.department || '';
        form.querySelector('#staff-position').value = staff.jobTitle || '';
        form.querySelector('#staff-branch').value = staff.branchId || '';
        form.querySelector('#staff-status').value = staff.active ? 'active' : 'inactive';
    },
    
    // Confirm delete staff
    confirmDeleteStaff: function(staffId) {
        if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
            this.deleteStaff(staffId);
        }
    },
    
    // Delete staff
    deleteStaff: async function(staffId) {
        try {
            await StaffService.deleteStaff(staffId);
            window.toastService?.showSuccess('Xóa nhân viên thành công');
            this.loadStaffData();
        } catch (error) {
            console.error('Error deleting staff:', error);
            window.toastService?.showError('Lỗi khi xóa nhân viên');
        }
    },
    
    // Handle department filter
    handleDepartmentFilter: function(event) {
        // Implement department filtering if needed
    },
    
    // Handle position filter
    handlePositionFilter: function(event) {
        // Implement position filtering if needed
    },
    
    // Handle branch filter
    handleBranchFilter: async function(event) {
        const branchName = event.target.value;
        
        try {
            let staffList;
            if (branchName) {
                // Filter by branch name (since we're using branch name as value)
                const allStaff = await StaffService.getAllStaff();
                staffList = allStaff.filter(staff => staff.branchName === branchName);
            } else {
                staffList = await StaffService.getAllStaff();
            }
            
            this.renderStaffTable(staffList);
        } catch (error) {
            console.error('Error filtering staff by branch:', error);
            window.toastService?.showError('Lỗi khi lọc nhân viên theo chi nhánh');
        }
    },
    
    // Handle search
    handleSearch: function(event) {
        const searchTerm = event.target.value.toLowerCase();
        const tableRows = document.querySelectorAll('#staff-table tbody tr');
        
        tableRows.forEach(row => {
            const name = row.cells[2]?.textContent?.toLowerCase() || '';
            const email = row.cells[3]?.textContent?.toLowerCase() || '';
            const phone = row.cells[4]?.textContent?.toLowerCase() || '';
            
            if (name.includes(searchTerm) || 
                email.includes(searchTerm) || 
                phone.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    StaffHandlers.initializeStaffEvents();
});

// Export for use in other scripts
window.StaffService = StaffService;
window.StaffHandlers = StaffHandlers;
