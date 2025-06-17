// Branch management functionality
window.BranchManager = {
  branches: [],
  currentBranchId: null,
  isInitialized: false,
  // Initialize branch management
  init() {
    if (this.isInitialized) {
      return;
    }
    
    this.bindEvents();
    this.isInitialized = true;
    console.log('BranchManager initialized');
    
    // Load branches if we're currently on the branches section
    const branchesSection = document.getElementById('branches-section');
    if (branchesSection && branchesSection.classList.contains('active')) {
      this.loadBranches();
    }
  },
  // Bind event listeners
  bindEvents() {
    // Add branch button
    const addBtn = document.getElementById('add-branch-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.showBranchModal();
      });
    }

    // Form submit
    const form = document.getElementById('branch-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveBranch();
      });
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancel-branch-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hideBranchModal();
      });
    }

    // Close modal when clicking X
    const modal = document.getElementById('branch-modal');
    if (modal) {
      const closeBtn = modal.querySelector('.close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.hideBranchModal();
        });
      }

      // Close modal when clicking outside
      window.addEventListener('click', (event) => {
        if (event.target === modal) {
          this.hideBranchModal();
        }
      });
    }

    // Search functionality
    const searchInput = document.getElementById('branch-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.filterBranches();
      });
    }

    // Status filter
    const statusFilter = document.getElementById('branch-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        this.filterBranches();
      });
    }
  },  // Load all branches from API
  async loadBranches() {
    console.log('BranchManager.loadBranches() called');
    try {
      console.log('Loading branches...');
      const response = await fetch('/api/branches');
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to load branches: ' + response.statusText);
      }
      
      this.branches = await response.json();
      console.log('Loaded branches:', this.branches);
      this.renderBranchesTable();
    } catch (error) {
      console.error('Error loading branches:', error);
      this.showAlert('Lỗi khi tải danh sách chi nhánh: ' + error.message, 'error');
    }
  },
  // Render branches table
  renderBranchesTable() {
    const tbody = document.getElementById('branches-table-body');
    if (!tbody) {
      console.error('Table body not found');
      return;
    }
    
    tbody.innerHTML = '';    if (!this.branches || this.branches.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 20px; color: #666;">
            Chưa có chi nhánh nào. Hãy thêm chi nhánh đầu tiên!
          </td>
        </tr>
      `;
      return;
    }    this.branches.forEach(branch => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${branch.id || 'N/A'}</td>
        <td>${branch.name || 'N/A'}</td>
        <td>${branch.address || 'N/A'}</td>
        <td>${branch.district || 'N/A'}</td>
        <td>${branch.city || 'N/A'}</td>
        <td>${branch.phone || 'N/A'}</td>
        <td>${branch.email || 'N/A'}</td>
        <td>
          <span class="status ${(branch.status || 'active') === 'active' ? 'active' : 'inactive'}">
            ${(branch.status || 'active') === 'active' ? 'Hoạt động' : 'Tạm dừng'}
          </span>
        </td>
        <td class="actions">
          <button class="icon-btn edit-btn" onclick="window.BranchManager.editBranch('${branch.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="icon-btn delete-btn" onclick="window.BranchManager.deleteBranch('${branch.id}')">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  },

  // Show branch modal
  showBranchModal(branch = null) {
    const modal = document.getElementById('branch-modal');
    const title = document.getElementById('branch-modal-title');
    const form = document.getElementById('branch-form');

    if (branch) {
      // Edit mode
      title.textContent = 'Chỉnh sửa chi nhánh';
      this.currentBranchId = branch.id;
      this.populateForm(branch);
    } else {
      // Add mode
      title.textContent = 'Thêm chi nhánh mới';
      this.currentBranchId = null;
      form.reset();
    }

    modal.style.display = 'block';
  },

  // Hide branch modal
  hideBranchModal() {
    const modal = document.getElementById('branch-modal');
    modal.style.display = 'none';
    this.currentBranchId = null;
    document.getElementById('branch-form').reset();
  },  // Populate form with branch data
  populateForm(branch) {
    document.getElementById('branch-name').value = branch.name || '';
    document.getElementById('branch-address').value = branch.address || '';
    document.getElementById('branch-district').value = branch.district || '';
    document.getElementById('branch-city').value = branch.city || '';
    document.getElementById('branch-phone').value = branch.phone || '';
    document.getElementById('branch-email').value = branch.email || '';
    document.getElementById('branch-status').value = branch.status || 'active';
  },

  // Save branch (create or update)
  async saveBranch() {
    try {
      const formData = this.getFormData();
      
      // Validate required fields
      if (!this.validateForm(formData)) {
        return;
      }

      const url = this.currentBranchId 
        ? `/api/branches/${this.currentBranchId}`
        : '/api/branches';
      
      const method = this.currentBranchId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save branch');
      }

      const message = this.currentBranchId 
        ? 'Chi nhánh đã được cập nhật thành công'
        : 'Chi nhánh đã được thêm thành công';
      
      this.showAlert(message, 'success');
      this.hideBranchModal();
      this.loadBranches(); // Reload table
    } catch (error) {
      console.error('Error saving branch:', error);
      this.showAlert('Lỗi khi lưu chi nhánh', 'error');
    }
  },  // Get form data
  getFormData() {
    return {
      name: document.getElementById('branch-name').value.trim(),
      address: document.getElementById('branch-address').value.trim(),
      district: document.getElementById('branch-district').value.trim(),
      city: document.getElementById('branch-city').value.trim(),
      phone: document.getElementById('branch-phone').value.trim(),
      email: document.getElementById('branch-email').value.trim(),
      status: document.getElementById('branch-status').value
    };
  },

  // Validate form data
  validateForm(data) {
    if (!data.name) {
      this.showAlert('Vui lòng nhập tên chi nhánh', 'error');
      return false;
    }
    if (!data.address) {
      this.showAlert('Vui lòng nhập địa chỉ', 'error');
      return false;
    }
    if (!data.district) {
      this.showAlert('Vui lòng nhập quận/huyện', 'error');
      return false;
    }
    if (!data.city) {
      this.showAlert('Vui lòng nhập thành phố', 'error');
      return false;
    }
    return true;
  },

  // Edit branch
  editBranch(branchId) {
    const branch = this.branches.find(b => b.id === branchId);
    if (branch) {
      this.showBranchModal(branch);
    }
  },

  // Delete branch
  async deleteBranch(branchId) {
    if (!confirm('Bạn có chắc chắn muốn xóa chi nhánh này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete branch');
      }

      this.showAlert('Chi nhánh đã được xóa thành công', 'success');
      this.loadBranches(); // Reload table
    } catch (error) {
      console.error('Error deleting branch:', error);
      this.showAlert('Lỗi khi xóa chi nhánh', 'error');
    }  },
  // Filter branches based on search and status
  filterBranches() {
    const searchTerm = document.getElementById('branch-search').value.toLowerCase();
    const statusFilter = document.getElementById('branch-status-filter').value;
    
    let filteredBranches = this.branches;
    
    // Apply search filter
    if (searchTerm) {
      filteredBranches = filteredBranches.filter(branch =>
        (branch.name || '').toLowerCase().includes(searchTerm) ||
        (branch.address || '').toLowerCase().includes(searchTerm) ||
        (branch.district || '').toLowerCase().includes(searchTerm) ||
        (branch.city || '').toLowerCase().includes(searchTerm) ||
        (branch.phone || '').toLowerCase().includes(searchTerm) ||
        (branch.email || '').toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filteredBranches = filteredBranches.filter(branch =>
        (branch.status || 'active') === statusFilter
      );
    }
    
    // Temporarily store original branches and render filtered ones
    const originalBranches = this.branches;
    this.branches = filteredBranches;
    this.renderBranchesTable();
    this.branches = originalBranches;
  },

  // Show alert message
  showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      max-width: 400px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;

    // Set background color based on type
    switch (type) {
      case 'success':
        alert.style.backgroundColor = '#28a745';
        break;
      case 'error':
        alert.style.backgroundColor = '#dc3545';
        break;
      case 'warning':
        alert.style.backgroundColor = '#ffc107';
        alert.style.color = '#212529';
        break;
      default:
        alert.style.backgroundColor = '#17a2b8';
    }

    alert.textContent = message;
    document.body.appendChild(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 5000);
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize BranchManager
  if (window.BranchManager) {
    window.BranchManager.init();
  }
});

// Add global method to force load branches
window.loadBranchesNow = function() {
  console.log('Force loading branches...');
  if (window.BranchManager) {
    window.BranchManager.loadBranches();
  } else {
    console.error('BranchManager not available');
  }
};

// BranchHandlers for integration with admin system
window.BranchHandlers = {
  initializeBranchEvents() {
    console.log('Initializing branch events...');
    
    // Initialize BranchManager if not already done
    if (window.BranchManager && !window.BranchManager.isInitialized) {
      window.BranchManager.init();
    }
    
    // Auto-load branches if currently on branches section
    const branchesSection = document.getElementById('branches-section');
    if (branchesSection && branchesSection.classList.contains('active')) {
      console.log('Branches section is active, loading branches...');
      if (window.BranchManager) {
        window.BranchManager.loadBranches();
      }
    }
    
    // Add click listener to branches menu item
    const branchMenuItem = document.querySelector('[data-section="branches-section"]');
    if (branchMenuItem) {
      branchMenuItem.addEventListener('click', function() {
        console.log('Branches menu clicked, will load branches...');
        setTimeout(() => {
          if (window.BranchManager) {
            console.log('Loading branches after menu click...');
            window.BranchManager.loadBranches();
          }
        }, 100);
      });
    }
  }
};
