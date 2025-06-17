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
            return await response.json();
        } catch (error) {
            console.error(`Error deleting staff with id ${id}:`, error);
            throw error;
        }
    },
    
    // Get staff by department
    getStaffByDepartment: async function(department) {
        try {
            const response = await fetch(`/api/staffs/department/${encodeURIComponent(department)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching staff by department ${department}:`, error);
            throw error;
        }
    },
    
    // Get staff by job title
    getStaffByJobTitle: async function(jobTitle) {
        try {
            const response = await fetch(`/api/staffs/job-title/${encodeURIComponent(jobTitle)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching staff by job title ${jobTitle}:`, error);
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
        
        // Clear existing options except the first one (Tất cả chi nhánh)
        const firstOption = branchFilter.firstElementChild;
        branchFilter.innerHTML = '';
        if (firstOption) {
            branchFilter.appendChild(firstOption);
        } else {
            branchFilter.innerHTML = '<option value="">Tất cả chi nhánh</option>';
        }
        
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
        branchSelect.innerHTML = '<option value="">Chọn chi nhánh</option>';
        
        // Add branch options
        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch.id; // Use ID for form submission
            option.textContent = branch.name;
            branchSelect.appendChild(option);
        });
    },
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
            searchInput.addEventListener('input', this.handleSearch.bind(this));        }
        
        // Load staff data when on staff section
        if (document.querySelector('#staff-section.active')) {
            this.loadStaffData();
        }
        
        // Load branches for filters and form
        this.loadBranchesForFilter();
        this.loadBranchesForForm();
        
        // Add event listener to menu item for staff section
        const staffMenuItem = document.querySelector('.menu-item[data-section="staff-section"]');
        if (staffMenuItem) {
            staffMenuItem.addEventListener('click', this.loadStaffData.bind(this));
        }
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
        const modal = document.getElementById('staff-modal');
        const modalTitle = document.getElementById('staff-modal-title');
        const staffForm = document.getElementById('staff-form');
        
        // Clear form
        staffForm.reset();
        document.getElementById('staff-id').value = '';
        
        // Set modal title
        modalTitle.textContent = 'Thêm nhân viên mới';
        
        // Show modal
        modal.style.display = 'block';
    },
    
    // Hide staff modal
    hideStaffModal: function() {
        const modal = document.getElementById('staff-modal');
        modal.style.display = 'none';
    },
    
    // Handle staff form submission
    handleStaffFormSubmit: function(event) {
        event.preventDefault();
        this.handleStaffSave();
    },
    
    // Handle save staff
    handleStaffSave: async function() {
        // Get form data
        const staffId = document.getElementById('staff-id').value;
        const fullName = document.getElementById('staff-name').value;
        const email = document.getElementById('staff-email').value;
        const phoneNumber = document.getElementById('staff-phone').value;
        const department = document.getElementById('staff-department').value;
        const jobTitle = document.getElementById('staff-job-title').value;
        const branchSelect = document.getElementById('staff-branch');
        const branchId = branchSelect.value;
        const branchName = branchSelect.options[branchSelect.selectedIndex].text;
        const status = document.getElementById('staff-status').value;
        
        // Validate required fields
        if (!fullName || !email || !department || !jobTitle || !branchId) {
            window.toastService?.showError('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        
        try {
            const staffData = {
                fullName,
                email,
                phoneNumber,
                department,
                jobTitle,
                branchId,
                branchName,
                active: status === 'active'
            };
            
            if (staffId) {
                // Update existing staff
                await StaffService.updateStaff(staffId, staffData);
                window.toastService?.showSuccess('Cập nhật nhân viên thành công');
            } else {
                // Create new staff
                await StaffService.createStaff(staffData);
                window.toastService?.showSuccess('Thêm nhân viên thành công');
            }
            
            // Hide modal and reload data
            this.hideStaffModal();
            this.loadStaffData();
        } catch (error) {
            console.error('Error saving staff:', error);
            window.toastService?.showError(error.message || 'Lỗi khi lưu thông tin nhân viên');
        }
    },
    
    // Edit staff
    editStaff: async function(staffId) {
        try {
            const staff = await StaffService.getStaffById(staffId);
            
            // Fill form with staff data
            document.getElementById('staff-id').value = staff.id;
            document.getElementById('staff-name').value = staff.fullName;
            document.getElementById('staff-email').value = staff.email;
            document.getElementById('staff-phone').value = staff.phoneNumber || '';
            document.getElementById('staff-department').value = staff.department;
            document.getElementById('staff-job-title').value = staff.jobTitle;
            document.getElementById('staff-branch').value = staff.branchId;
            document.getElementById('staff-status').value = staff.active ? 'active' : 'inactive';
            
            // Update modal title
            document.getElementById('staff-modal-title').textContent = 'Chỉnh sửa nhân viên';
            
            // Show modal
            document.getElementById('staff-modal').style.display = 'block';
        } catch (error) {
            console.error('Error fetching staff for edit:', error);
            window.toastService?.showError('Lỗi khi lấy thông tin nhân viên');
        }
    },
    
    // Confirm delete staff
    confirmDeleteStaff: function(staffId) {
        if (confirm('Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác.')) {
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
            window.toastService?.showError(error.message || 'Lỗi khi xóa nhân viên');
        }
    },
    
    // Handle department filter
    handleDepartmentFilter: async function(event) {
        const department = event.target.value;
        
        try {
            let staffList;
            if (department) {
                staffList = await StaffService.getStaffByDepartment(department);
            } else {
                staffList = await StaffService.getAllStaff();
            }
            
            this.renderStaffTable(staffList);
        } catch (error) {
            console.error('Error filtering staff by department:', error);
            window.toastService?.showError('Lỗi khi lọc nhân viên theo bộ phận');
        }
    },
    
    // Handle position filter
    handlePositionFilter: async function(event) {
        const jobTitle = event.target.value;
        
        try {
            let staffList;
            if (jobTitle) {
                staffList = await StaffService.getStaffByJobTitle(jobTitle);
            } else {
                staffList = await StaffService.getAllStaff();
            }
            
            this.renderStaffTable(staffList);
        } catch (error) {
            console.error('Error filtering staff by job title:', error);
            window.toastService?.showError('Lỗi khi lọc nhân viên theo vị trí');
        }
    },
    
    // Handle branch filter
    handleBranchFilter: async function(event) {
        const branchId = event.target.value;
        
        try {
            let staffList;
            if (branchId) {
                staffList = await StaffService.getStaffByBranch(branchId);
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
            const fullName = row.cells[2].textContent.toLowerCase();
            const email = row.cells[3].textContent.toLowerCase();
            const phone = row.cells[4].textContent.toLowerCase();
            
            if (fullName.includes(searchTerm) || 
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