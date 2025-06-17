/**
 * Customer Handlers - Manages all customer-related operations
 */
const CustomerHandlers = {
  state: {
    currentPage: 0,
    pageSize: 10,
    totalPages: 0,
    sortBy: "fullName",
    sortDir: "asc",
    filterType: "",
    filterStatus: "",
    searchQuery: ""
  },
  
  // Initialize all customer-related event handlers
  initializeCustomerEvents() {
    console.log("Initializing customer event handlers");
    this.initCustomerActionButtons();
    this.initFilters();
    this.loadCustomers();
  },
  
  // Initialize button handlers for the customer section
  initCustomerActionButtons() {
    // Add customer button
    const addCustomerBtn = document.getElementById("add-customer-btn");
    if (addCustomerBtn) {
      addCustomerBtn.addEventListener("click", () => {
        this.openCustomerModal("add");
      });
    }
    
    // Save customer button
    const saveCustomerBtn = document.getElementById("save-customer-btn");
    if (saveCustomerBtn) {
      saveCustomerBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await this.saveCustomer();
      });
    }
    
    // Cancel buttons
    document.querySelectorAll("#cancel-customer-btn, #customer-modal .close").forEach(btn => {
      btn.addEventListener("click", () => {
        this.closeCustomerModal();
      });
    });
    
    // Close detail buttons
    document.querySelectorAll("#close-detail-btn, #customer-detail-modal .close").forEach(btn => {
      btn.addEventListener("click", () => {
        this.closeCustomerDetailModal();
      });
    });
    
    // Edit from detail view
    const editCustomerBtn = document.getElementById("edit-customer-btn");
    if (editCustomerBtn) {
      editCustomerBtn.addEventListener("click", () => {
        const customerId = document.getElementById("detail-customer-id")?.value;
        if (customerId) {
          this.closeCustomerDetailModal();
          this.openCustomerModal("edit", customerId);
        }
      });
    }
    
    // Delete confirmation actions
    const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener("click", () => {
        this.closeDeleteModal();
      });
    }
    
    document.querySelectorAll("#confirm-delete-modal .close").forEach(btn => {
      btn.addEventListener("click", () => {
        this.closeDeleteModal();
      });
    });
    
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", async () => {
        const customerId = confirmDeleteBtn.getAttribute("data-id");
        if (customerId) {
          await this.deleteCustomer(customerId);
        }
      });
    }
  },
  
  // Initialize filter handlers
  initFilters() {
    // Customer type filter
    const typeFilter = document.getElementById("filter-customer-type");
    if (typeFilter) {
      typeFilter.addEventListener("change", () => {
        this.state.filterType = typeFilter.value;
        this.state.currentPage = 0;
        this.loadCustomers();
      });
    }
    
    // Status filter
    const statusFilter = document.getElementById("filter-customer-status");
    if (statusFilter) {
      statusFilter.addEventListener("change", () => {
        this.state.filterStatus = statusFilter.value;
        this.state.currentPage = 0;
        this.loadCustomers();
      });
    }
    
    // Search
    const searchBtn = document.getElementById("search-customer-btn");
    const searchInput = document.getElementById("customer-search");
    
    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", () => {
        this.state.searchQuery = searchInput.value;
        this.state.currentPage = 0;
        this.loadCustomers();
      });
      
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.state.searchQuery = searchInput.value;
          this.state.currentPage = 0;
          this.loadCustomers();
        }
      });
    }
  },
  
  // Load customers with current filters and pagination
  async loadCustomers(page = 0, size = 10) {
    try {
      const customerTableBody = document.getElementById("customers-table-body") || document.getElementById("customers-table");
      
      if (!customerTableBody) {
        console.error("Không tìm thấy bảng khách hàng");
        return;
      }
      
      // Hiển thị trạng thái đang tải
      customerTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải danh sách khách hàng...</td></tr>';
      
      // Lấy các tham số lọc (nếu có)
      const customerType = document.getElementById("filter-customer-type")?.value;
      const isActive = document.getElementById("filter-customer-status")?.value;
      const searchQuery = document.getElementById("customer-search")?.value;
      
      // Xây dựng URL với query params
      let url = `/api/customers?page=${page}&size=${size}`;
      
      // Nếu có các bộ lọc, thêm vào URL
      if (customerType) {
        url += `&customerType=${encodeURIComponent(customerType)}`;
      }
      
      if (isActive !== undefined && isActive !== "") {
        url += `&isActive=${isActive}`;
      }
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 500) {
          console.error("Server error when loading customers");
          customerTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Lỗi server khi tải khách hàng. Vui lòng thử lại sau.</td></tr>';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const customers = data.content || data;
      
      if (customers.length === 0) {
        customerTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Không có khách hàng nào</td></tr>';
        return;
      }
      
      // Render customers
      this.renderCustomers(customers);
      
      // Update pagination if data contains pagination info
      if (data.totalPages) {
        this.updatePagination(data.totalPages, data.number + 1);
      }
      
    } catch (error) {
      console.error("Error loading customers:", error);
      const customerTableBody = document.getElementById("customers-table-body") || document.getElementById("customers-table");
      if (customerTableBody) {
        customerTableBody.innerHTML = 
          '<tr><td colspan="6" class="text-center text-danger">Lỗi khi tải khách hàng: ' + 
          error.message + '</td></tr>';
      }
      
      // Thông báo lỗi (nếu có ToastService)
      if (window.ToastService) {
        window.ToastService.error("Không thể tải danh sách khách hàng");
      } else if (window.toastService) {
        window.toastService.showError("Không thể tải danh sách khách hàng");
      } else {
        alert("Lỗi: Không thể tải danh sách khách hàng");
      }
    }
  },
  
  // Render customers in the table
  renderCustomers(customers) {
    const customersTableBody = document.getElementById("customers-table-body");
    if (!customersTableBody) return;
    
    if (!Array.isArray(customers) || customers.length === 0) {
      customersTableBody.innerHTML = '<tr><td colspan="12" class="text-center">No customers found</td></tr>';
      return;
    }
    
    let tableBodyHTML = '';
    
    customers.forEach(customer => {
      const status = customer.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động';
      const statusClass = customer.isActive ? 'active' : 'inactive';
      
      tableBodyHTML += `
        <tr>
          <td><input type="checkbox" class="select-item"></td>
          <td>${customer.fullName || ''}</td>
          <td>${this.formatGender(customer.gender) || ''}</td>
          <td>${customer.age || ''}</td>
          <td>${customer.email || ''}</td>
          <td>${customer.phoneNumber || ''}</td>
          <td>${this.formatAddress(customer) || ''}</td>
          <td>${customer.orderCount || 0}</td>
          <td>${this.formatCurrency(customer.totalSpent)}</td>
          <td>${this.formatCustomerType(customer.customerType) || ''}</td>
          <td><span class="status ${statusClass}">${status}</span></td>
          <td class="actions">
            <button class="icon-btn view-btn" data-id="${customer.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="icon-btn edit-btn" data-id="${customer.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="icon-btn delete-btn" data-id="${customer.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
    });
    
    customersTableBody.innerHTML = tableBodyHTML;
    
    // Add event listeners to action buttons
    document.querySelectorAll("#customers-table-body .view-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const customerId = e.currentTarget.getAttribute("data-id");
        this.viewCustomerDetails(customerId);
      });
    });
    
    document.querySelectorAll("#customers-table-body .edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const customerId = e.currentTarget.getAttribute("data-id");
        this.openCustomerModal("edit", customerId);
      });
    });
    
    document.querySelectorAll("#customers-table-body .delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const customerId = e.currentTarget.getAttribute("data-id");
        this.openDeleteModal(customerId);
      });
    });
  },

  // Update pagination state and re-render
  updatePagination(totalPages, currentPage) {
    this.state.totalPages = totalPages;
    this.state.currentPage = currentPage - 1; // Convert from 1-based to 0-based
    this.renderPagination();
  },
  
  // Render pagination controls
  renderPagination() {
    const pagination = document.getElementById("customer-pagination");
    if (!pagination) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
      <button class="pagination-btn prev-btn ${this.state.currentPage === 0 ? 'disabled' : ''}" 
      ${this.state.currentPage === 0 ? 'disabled' : ''}>
        &laquo; Prev
      </button>
    `;
    
    // Page buttons
    const totalPages = this.state.totalPages;
    let startPage = Math.max(0, this.state.currentPage - 2);
    let endPage = Math.min(totalPages - 1, this.state.currentPage + 2);
    
    // Ensure we always have up to 5 page buttons if possible
    if (endPage - startPage < 4 && totalPages > 5) {
      if (startPage === 0) {
        endPage = Math.min(startPage + 4, totalPages - 1);
      } else if (endPage === totalPages - 1) {
        startPage = Math.max(endPage - 4, 0);
      }
    }
    
    // First page button if not in first set of pages
    if (startPage > 0) {
      paginationHTML += `
        <button class="pagination-btn" data-page="0">1</button>
        ${startPage > 1 ? '<span class="pagination-ellipsis">...</span>' : ''}
      `;
    }
    
    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button class="pagination-btn ${this.state.currentPage === i ? 'active' : ''}" 
        data-page="${i}">${i + 1}</button>
      `;
    }
    
    // Last page button if not in last set of pages
    if (endPage < totalPages - 1) {
      paginationHTML += `
        ${endPage < totalPages - 2 ? '<span class="pagination-ellipsis">...</span>' : ''}
        <button class="pagination-btn" data-page="${totalPages - 1}">${totalPages}</button>
      `;
    }
    
    // Next button
    paginationHTML += `
      <button class="pagination-btn next-btn ${this.state.currentPage === totalPages - 1 ? 'disabled' : ''}"
      ${this.state.currentPage === totalPages - 1 ? 'disabled' : ''}>
        Next &raquo;
      </button>
    `;
    
    pagination.innerHTML = paginationHTML;
    
    // Add event listeners to pagination buttons
    document.querySelectorAll("#customer-pagination .pagination-btn:not(.disabled)").forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (e.currentTarget.classList.contains('prev-btn')) {
          this.state.currentPage = Math.max(0, this.state.currentPage - 1);
        } else if (e.currentTarget.classList.contains('next-btn')) {
          this.state.currentPage = Math.min(this.state.totalPages - 1, this.state.currentPage + 1);
        } else {
          this.state.currentPage = parseInt(e.currentTarget.getAttribute("data-page"), 10);
        }
        this.loadCustomers();
      });
    });
  },
  
  // Open customer modal for add or edit
  async openCustomerModal(mode, customerId = null) {
    const modal = document.getElementById("customer-modal");
    const modalTitle = document.getElementById("customer-modal-title");
    const form = document.getElementById("customer-form");
    const editOnlyFields = document.getElementById("edit-only-fields");
    
    if (!modal || !modalTitle || !form) return;
    
    form.reset();
    document.getElementById("customer-id").value = '';
    
    if (mode === "add") {
      modalTitle.textContent = "Thêm khách hàng mới";
      if (editOnlyFields) editOnlyFields.style.display = "none";
    } else if (mode === "edit") {
      modalTitle.textContent = "Chỉnh sửa khách hàng";
      if (editOnlyFields) editOnlyFields.style.display = "block";
      
      if (customerId) {
        try {
          const response = await fetch(`/api/customers/${customerId}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          
          const customer = await response.json();
          this.populateCustomerForm(customer);
        } catch (error) {
          console.error("Error loading customer data:", error);
          if (window.ToastService) {
            window.ToastService.error(`Error loading customer data: ${error.message}`);
          }
        }
      }
    }
    
    modal.style.display = "block";
    document.body.classList.add("modal-open");
  },
  
  // Close customer modal
  closeCustomerModal() {
    const modal = document.getElementById("customer-modal");
    if (!modal) return;
    
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
  },
  
  // Open customer detail modal
  async viewCustomerDetails(customerId) {
    if (!customerId) return;
    
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const customer = await response.json();
      this.displayCustomerDetails(customer);
      
      const modal = document.getElementById("customer-detail-modal");
      if (modal) {
        modal.style.display = "block";
        document.body.classList.add("modal-open");
      }
    } catch (error) {
      console.error("Error loading customer details:", error);
      if (window.ToastService) {
        window.ToastService.error(`Error loading customer details: ${error.message}`);
      }
    }
  },
  
  // Close customer detail modal
  closeCustomerDetailModal() {
    const modal = document.getElementById("customer-detail-modal");
    if (!modal) return;
    
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
  },
  
  // Open delete confirmation modal
  async openDeleteModal(customerId) {
    if (!customerId) return;
    
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const customer = await response.json();
      
      const nameSpan = document.getElementById("delete-customer-name");
      const confirmBtn = document.getElementById("confirm-delete-btn");
      
      if (nameSpan) nameSpan.textContent = customer.fullName;
      if (confirmBtn) confirmBtn.setAttribute("data-id", customerId);
      
      const modal = document.getElementById("confirm-delete-modal");
      if (modal) {
        modal.style.display = "block";
        document.body.classList.add("modal-open");
      }
    } catch (error) {
      console.error("Error loading customer for delete:", error);
      if (window.ToastService) {
        window.ToastService.error(`Error loading customer: ${error.message}`);
      }
    }
  },
  
  // Close delete confirmation modal
  closeDeleteModal() {
    const modal = document.getElementById("confirm-delete-modal");
    if (!modal) return;
    
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
  },
  
  // Populate the form with customer data for editing
  populateCustomerForm(customer) {
    document.getElementById("customer-id").value = customer.id;
    document.getElementById("customer-fullname").value = customer.fullName || '';
    document.getElementById("customer-gender").value = customer.gender || '';
    document.getElementById("customer-age").value = customer.age || '';
    document.getElementById("customer-email").value = customer.email || '';
    document.getElementById("customer-phone").value = customer.phoneNumber || '';
    document.getElementById("customer-address").value = customer.address || '';
    document.getElementById("customer-city").value = customer.city || '';
    document.getElementById("customer-postal-code").value = customer.postalCode || '';
    document.getElementById("customer-type").value = customer.customerType || 'NEW';
    
    if (customer.birthDate) {
      document.getElementById("customer-birthdate").value = customer.birthDate.split('T')[0];
    } else {
      document.getElementById("customer-birthdate").value = '';
    }
    
    document.getElementById("customer-status").value = customer.isActive ? "true" : "false";
  },
  
  // Display customer details in the detail view
  displayCustomerDetails(customer) {
    // Hidden ID for edit button
    const hiddenId = document.createElement("input");
    hiddenId.type = "hidden";
    hiddenId.id = "detail-customer-id";
    hiddenId.value = customer.id;
    document.getElementById("customer-detail-modal").appendChild(hiddenId);
    
    // Basic details
    document.getElementById("detail-fullname").textContent = customer.fullName || 'N/A';
    document.getElementById("detail-gender").textContent = this.formatGender(customer.gender) || 'N/A';
    document.getElementById("detail-age").textContent = customer.age || 'N/A';
    document.getElementById("detail-birthdate").textContent = customer.birthDate ? new Date(customer.birthDate).toLocaleDateString() : 'N/A';
    document.getElementById("detail-email").textContent = customer.email || 'N/A';
    document.getElementById("detail-phone").textContent = customer.phoneNumber || 'N/A';
    document.getElementById("detail-address").textContent = customer.address || 'N/A';
    document.getElementById("detail-city").textContent = customer.city || 'N/A';
    document.getElementById("detail-postal-code").textContent = customer.postalCode || 'N/A';
    document.getElementById("detail-customer-type").textContent = this.formatCustomerType(customer.customerType) || 'N/A';
    document.getElementById("detail-status").textContent = customer.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động';
    document.getElementById("detail-created-at").textContent = customer.createdAt ? new Date(customer.createdAt).toLocaleString() : 'N/A';
    
    // Stats
    document.getElementById("detail-order-count").textContent = customer.orderCount || 0;
    document.getElementById("detail-booking-count").textContent = customer.bookingCount || 0;
    document.getElementById("detail-total-spent").textContent = this.formatCurrency(customer.totalSpent);
  },
  // Save customer (create or update)
  async saveCustomer() {
    try {
      // Get form elements first
      const fullNameEl = document.getElementById("customer-fullname");
      const emailEl = document.getElementById("customer-email");
      const phoneEl = document.getElementById("customer-phone");
      
      // Check if elements exist
      if (!fullNameEl || !emailEl || !phoneEl) {
        console.error('Missing form elements:');
        console.error('fullNameEl:', !!fullNameEl);
        console.error('emailEl:', !!emailEl);
        console.error('phoneEl:', !!phoneEl);
        
        if (window.ToastService) {
          window.ToastService.error("Form elements not found");
        }
        return;
      }
      
      // Get form data
      const customerId = document.getElementById("customer-id")?.value || '';
      const fullName = fullNameEl.value.trim();
      const gender = document.getElementById("customer-gender")?.value || '';
      const age = document.getElementById("customer-age")?.value || '';
      const birthDate = document.getElementById("customer-birthdate")?.value || '';
      const email = emailEl.value.trim();
      const phoneNumber = phoneEl.value.trim();
      const address = document.getElementById("customer-address")?.value || '';
      const city = document.getElementById("customer-city")?.value || '';
      const postalCode = document.getElementById("customer-postal-code")?.value || '';
      const customerType = document.getElementById("customer-type")?.value || 'NEW';
      
      // Debug logging
      console.log('Form values (after trim):');
      console.log('fullName:', `"${fullName}"`);
      console.log('email:', `"${email}"`);
      console.log('phoneNumber:', `"${phoneNumber}"`);
        // Validation
      if (!fullName || !email || !phoneNumber) {
        console.error('Validation failed:');
        console.error('fullName:', !!fullName, `"${fullName}"`);
        console.error('email:', !!email, `"${email}"`);
        console.error('phoneNumber:', !!phoneNumber, `"${phoneNumber}"`);
        
        if (window.ToastService) {
          window.ToastService.error("Vui lòng điền đầy đủ các trường bắt buộc (Họ tên, Email, Số điện thoại)");
        }
        return;
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (window.ToastService) {
          window.ToastService.error("Vui lòng nhập email đúng định dạng");
        }
        return;
      }
      
      // Create customer data object
      const customerData = {
        fullName,
        gender: gender || null,
        age: age ? parseInt(age, 10) : null,
        birthDate: birthDate || null,
        email,
        phoneNumber,
        address: address || null,
        city: city || null,
        postalCode: postalCode || null,
        customerType: customerType || 'NEW'
      };
      
      // Add isActive for edit mode
      if (customerId) {
        const status = document.getElementById("customer-status").value;
        customerData.isActive = status === "true";
      }
      
      // Determine if this is a create or update
      const isUpdate = !!customerId;
      const url = isUpdate ? `/api/customers/${customerId}` : '/api/customers';
      const method = isUpdate ? 'PUT' : 'POST';
      
      // Make API request
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Show success message
      if (window.ToastService) {
        window.ToastService.success(isUpdate ? "Customer updated successfully" : "Customer added successfully");
      }
      
      // Close modal and reload customers
      this.closeCustomerModal();
      this.loadCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      if (window.ToastService) {
        window.ToastService.error(`Error saving customer: ${error.message}`);
      }
    }
  },
  
  // Delete customer
  async deleteCustomer(customerId) {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Show success message
      if (window.ToastService) {
        window.ToastService.success("Customer deleted successfully");
      }
      
      // Close modal and reload customers
      this.closeDeleteModal();
      this.loadCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      if (window.ToastService) {
        window.ToastService.error(`Error deleting customer: ${error.message}`);
      }
    }
  },
  
  // Format currency values
  formatCurrency(amount) {
    if (amount == null) return "0đ";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },
  
  // Format customer type display
  formatCustomerType(type) {
    if (!type) return '';
    
    const types = {
      'REGULAR': 'Thường xuyên',
      'VIP': 'VIP',
      'NEW': 'Mới'
    };
    
    return types[type] || type;
  },
  
  // Format gender display
  formatGender(gender) {
    if (!gender) return '';
    
    const genders = {
      'MALE': 'Nam',
      'FEMALE': 'Nữ',
      'OTHER': 'Khác'
    };
    
    return genders[gender] || gender;
  },
  
  // Format address display
  formatAddress(customer) {
    let address = customer.address || '';
    
    if (customer.city) {
      address += address ? `, ${customer.city}` : customer.city;
    }
    
    if (customer.postalCode) {
      address += address ? ` (${customer.postalCode})` : customer.postalCode;
    }
    
    return address;
  }
};

// Add to window object for global access
window.CustomerHandlers = CustomerHandlers;