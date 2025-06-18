/**
 * Order Handlers - Manages all order-related operations
 */
const OrderHandlers = {
    state: {
        currentPage: 0,
        pageSize: 10,
        totalPages: 0,
        sortBy: "orderDate",
        sortDir: "desc",
        filterBranch: "",
        filterChannel: "",
        filterStatus: "",
        filterStartDate: "",
        filterEndDate: "",
        searchQuery: ""
    },
    
    // Initialize all order-related event handlers
    initializeOrderEvents() {
        console.log("Initializing order event handlers");
        this.loadBranches();
        this.initFilters();
        this.initModalHandlers();
        this.loadOrders();
    },
    
    // Load branch options for filter dropdown
    async loadBranches() {
        try {
            const branchSelect = document.getElementById('filter-branch');
            if (!branchSelect) return;
            
            const response = await fetch('/api/branches');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const branches = await response.json();
            
            // Clear existing options except for the first one (All branches)
            const firstOption = branchSelect.options[0];
            branchSelect.innerHTML = '';
            branchSelect.appendChild(firstOption);
            
            // Add branch options
            branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.id;
                option.textContent = branch.name;
                branchSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error loading branches:", error);
            this.showToast("Không thể tải danh sách chi nhánh", "error");
        }
    },
    
    // Initialize filter handlers
    initFilters() {
        // Branch filter
        const branchFilter = document.getElementById('filter-branch');
        if (branchFilter) {
            branchFilter.addEventListener('change', () => {
                this.state.filterBranch = branchFilter.value;
            });
        }
        
        // Channel filter
        const channelFilter = document.getElementById('filter-channel');
        if (channelFilter) {
            channelFilter.addEventListener('change', () => {
                this.state.filterChannel = channelFilter.value;
            });
        }
        
        // Status filter
        const statusFilter = document.getElementById('filter-status');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.state.filterStatus = statusFilter.value;
            });
        }
        
        // Date filters
        const startDateFilter = document.getElementById('filter-start-date');
        const endDateFilter = document.getElementById('filter-end-date');
        
        if (startDateFilter) {
            startDateFilter.addEventListener('change', () => {
                this.state.filterStartDate = startDateFilter.value;
            });
        }
        
        if (endDateFilter) {
            endDateFilter.addEventListener('change', () => {
                this.state.filterEndDate = endDateFilter.value;
            });
        }
        
        // Search button
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.state.currentPage = 0;
                this.loadOrders();
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('export-orders');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportOrdersToExcel();
            });        }
    },
    
    // Initialize modal action handlers
    initModalHandlers() {
        // Add order button - Open create modal
        const addOrderBtn = document.getElementById('add-order-btn');
        if (addOrderBtn) {
            addOrderBtn.addEventListener('click', () => {
                this.openCreateOrderModal();
            });
        }

        // Close modal when clicking close button or X
        document.querySelectorAll('#order-detail-modal .close, #modal-close-btn').forEach(elem => {
            elem.addEventListener('click', () => {
                this.closeOrderModal();
            });
        });

        // Close create order modal
        document.querySelectorAll('#create-order-modal .close, #cancel-order-btn').forEach(elem => {
            elem.addEventListener('click', () => {
                this.closeCreateOrderModal();
            });
        });

        // Save order form
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveOrder();
            });
        }        // Product category change
        const productCategory = document.getElementById('order-product-category');
        if (productCategory) {
            productCategory.addEventListener('change', () => {
                this.loadProductsByCategory();
            });
        }        // Add product to order
        const addProductBtn = document.getElementById('add-product-to-order-btn');
        if (addProductBtn) {
            console.log('Found add-product-to-order-btn, attaching event listener');
            addProductBtn.addEventListener('click', () => {
                console.log('Add product button clicked!');
                this.addProductToOrder();
            });
        } else {
            console.error('add-product-to-order-btn not found!');
        }

        // Search customer
        const searchCustomerBtn = document.getElementById('search-customer-btn');
        if (searchCustomerBtn) {
            searchCustomerBtn.addEventListener('click', () => {
                this.searchCustomer();
            });
        }

        // Discount change
        const discountPercent = document.getElementById('discount-percent');
        if (discountPercent) {
            discountPercent.addEventListener('input', () => {
                this.calculateTotal();
            });
        }
        
        // Print order button
        const printBtn = document.getElementById('print-order-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printOrder();
            });
        }
        
        // Update status button
        const updateStatusBtn = document.getElementById('update-status-btn');
        if (updateStatusBtn) {
            updateStatusBtn.addEventListener('click', () => {
                const orderId = document.getElementById('modal-order-id').textContent;
                this.openUpdateStatusModal(orderId);
            });
        }
    },
    
    // Load orders with current filters and pagination
    async loadOrders(page = 0) {
        try {
            const ordersTableBody = document.getElementById('orders-table-body');
            if (!ordersTableBody) return;
            
            // Show loading state
            ordersTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Đang tải dữ liệu...</td></tr>';
            
            // Build URL with query params
            let url = `/api/orders?page=${page}&size=${this.state.pageSize}&sort=${this.state.sortBy}&direction=${this.state.sortDir}`;
            
            // Add filters if defined
            if (this.state.filterBranch) {
                url += `&branchId=${this.state.filterBranch}`;
            }
            
            if (this.state.filterChannel) {
                url += `&salesChannel=${this.state.filterChannel}`;
            }
            
            if (this.state.filterStatus) {
                url += `&status=${this.state.filterStatus}`;
            }
            
            if (this.state.filterStartDate) {
                url += `&startDate=${this.state.filterStartDate}`;
            }
            
            if (this.state.filterEndDate) {
                url += `&endDate=${this.state.filterEndDate}`;
            }
            
            if (this.state.searchQuery) {
                url += `&search=${encodeURIComponent(this.state.searchQuery)}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 500) {
                    console.error("Server error when loading orders");
                    // Thêm code để lấy thông tin chi tiết về lỗi
                    try {
                        const errorResponse = await response.json();
                        console.error("Server error details:", errorResponse);
                        ordersTableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Lỗi server: ${errorResponse.message || 'Không có chi tiết'}. Vui lòng thử lại sau.</td></tr>`;
                    } catch (e) {
                        // Nếu không thể parse response json
                        const errorText = await response.text();
                        console.error("Server error raw response:", errorText);
                        ordersTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Lỗi server khi tải dữ liệu. Vui lòng thử lại sau.</td></tr>';
                    }
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const orders = data.content || [];
            
            if (orders.length === 0) {
                ordersTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Không có đơn hàng nào phù hợp với điều kiện tìm kiếm</td></tr>';
                return;
            }
            
            // Update state
            this.state.currentPage = data.number || 0;
            this.state.totalPages = data.totalPages || 1;
            
            // Render orders
            let tableHTML = '';
            
            orders.forEach(order => {
                const statusClass = this.getStatusClass(order.status);
                const channelClass = order.salesChannel === 'ONLINE' ? 'channel-online' : 'channel-offline';
                const channelIcon = order.salesChannel === 'ONLINE' ? 'fa-globe' : 'fa-shop';
                
                tableHTML += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.branchName || 'N/A'}</td>
                    <td>
                        <span class="channel-badge ${channelClass}">
                            <i class="fas ${channelIcon}"></i> ${order.salesChannel}
                        </span>
                    </td>
                    <td>${order.employeeName || 'N/A'}</td>
                    <td>${order.customerName || 'Khách vãng lai'}</td>
                    <td>${this.formatDate(order.orderDate)}</td>
                    <td>${this.formatCurrency(order.totalAmount)}</td>
                    <td><span class="order-status status-${order.status.toLowerCase()}">${this.translateStatus(order.status)}</span></td>
                    <td class="actions">
                        <button class="action-btn view-btn" data-id="${order.id}" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
                `;
            });
            
            ordersTableBody.innerHTML = tableHTML;
            
            // Add event listeners to view buttons
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const orderId = e.currentTarget.getAttribute('data-id');
                    this.viewOrderDetail(orderId);
                });
            });
            
            // Render pagination
            this.renderPagination();
            
        } catch (error) {
            console.error("Error loading orders:", error);
            const ordersTableBody = document.getElementById('orders-table-body');
            if (ordersTableBody) {
                ordersTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Lỗi khi tải dữ liệu: ' + error.message + '</td></tr>';
            }
            this.showToast("Không thể tải danh sách đơn hàng", "error");
        }
    },
    
    // Render pagination controls
    renderPagination() {
        const pagination = document.getElementById('order-pagination');
        if (!pagination) return;
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="pagination-btn prev-btn ${this.state.currentPage === 0 ? 'disabled' : ''}" 
                ${this.state.currentPage === 0 ? 'disabled' : ''}>
                &laquo; Trước
            </button>
        `;
        
        // Page numbers
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
        
        // First page button if not in first set
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
        
        // Last page button if not in last set
        if (endPage < totalPages - 1) {
            paginationHTML += `
                ${endPage < totalPages - 2 ? '<span class="pagination-ellipsis">...</span>' : ''}
                <button class="pagination-btn" data-page="${totalPages - 1}">${totalPages}</button>
            `;
        }
        
        // Next button
        paginationHTML += `
            <button class="pagination-btn next-btn ${this.state.currentPage >= totalPages - 1 ? 'disabled' : ''}"
                ${this.state.currentPage >= totalPages - 1 ? 'disabled' : ''}>
                Sau &raquo;
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
        
        // Add event listeners to pagination buttons
        document.querySelectorAll('#order-pagination .pagination-btn:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.currentTarget.classList.contains('prev-btn')) {
                    this.state.currentPage = Math.max(0, this.state.currentPage - 1);
                } else if (e.currentTarget.classList.contains('next-btn')) {
                    this.state.currentPage = Math.min(this.state.totalPages - 1, this.state.currentPage + 1);
                } else {
                    this.state.currentPage = parseInt(e.currentTarget.getAttribute('data-page'), 10);
                }
                this.loadOrders(this.state.currentPage);
            });
        });
    },
    
    // View order detail
    async viewOrderDetail(orderId) {
        if (!orderId) return;
        
        try {
            const response = await fetch(`/api/orders/${orderId}/detail`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const order = await response.json();
            this.populateOrderModal(order);
            this.openOrderModal();
            
        } catch (error) {
            console.error("Error loading order details:", error);
            this.showToast("Không thể tải chi tiết đơn hàng", "error");
        }
    },
    
    // Populate order detail modal with data
    populateOrderModal(order) {
        // Order ID in title
        document.getElementById('modal-order-id').textContent = order.id;
        
        // Basic order info
        document.getElementById('modal-order-status').innerHTML = 
            `<span class="order-status status-${order.status.toLowerCase()}">${this.translateStatus(order.status)}</span>`;
        
        const channelClass = order.salesChannel === 'ONLINE' ? 'channel-online' : 'channel-offline';
        const channelIcon = order.salesChannel === 'ONLINE' ? 'fa-globe' : 'fa-shop';
        
        document.getElementById('modal-order-channel').innerHTML = 
            `<span class="channel-badge ${channelClass}"><i class="fas ${channelIcon}"></i> ${order.salesChannel}</span>`;
        
        document.getElementById('modal-order-date').textContent = this.formatDateTime(order.orderDate);
        document.getElementById('modal-branch-name').textContent = order.branchName || 'N/A';
        document.getElementById('modal-employee-name').textContent = order.employeeName || 'N/A';
        
        // Customer info
        document.getElementById('modal-customer-name').textContent = order.customerName || 'Khách vãng lai';
        document.getElementById('modal-customer-email').textContent = order.customerEmail || 'N/A';
        document.getElementById('modal-customer-phone').textContent = order.customerPhone || 'N/A';
        document.getElementById('modal-customer-address').textContent = order.shippingAddress || 'N/A';
        
        // Order items
        const itemsBody = document.getElementById('order-items-body');
        itemsBody.innerHTML = '';
        
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${item.productName}</td>
                    <td>${this.formatCurrency(item.unitPrice)}</td>
                    <td>${item.quantity}</td>
                    <td class="text-right">${this.formatCurrency(item.totalPrice)}</td>
                `;
                
                itemsBody.appendChild(row);
            });
        } else {
            itemsBody.innerHTML = '<tr><td colspan="4" class="text-center">Không có sản phẩm nào</td></tr>';
        }
        
        // Order summary
        document.getElementById('modal-subtotal').textContent = this.formatCurrency(order.totalAmount);
        document.getElementById('modal-profit').textContent = this.formatCurrency(order.totalProfit);
        document.getElementById('modal-total').textContent = this.formatCurrency(order.totalAmount);
    },
    
    // Open order detail modal
    openOrderModal() {
        const modal = document.getElementById('order-detail-modal');
        if (modal) {
            modal.classList.add('show');
            document.body.classList.add('modal-open');
        }
    },
    
    // Close order detail modal
    closeOrderModal() {
        const modal = document.getElementById('order-detail-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    },
    
    // Print order
    printOrder() {
        const orderId = document.getElementById('modal-order-id').textContent;
        window.open(`/api/orders/${orderId}/print`, '_blank');
    },
    
    // Open update status modal
    openUpdateStatusModal(orderId) {
      const statusOptions = [
          { value: 'PENDING', label: 'Chờ xử lý' },
          { value: 'PAID', label: 'Đã thanh toán' },
          { value: 'PROCESSING', label: 'Đang xử lý' },
          { value: 'COMPLETED', label: 'Hoàn thành' },
          { value: 'CANCELLED', label: 'Đã hủy' },
          { value: 'FAILED', label: 'Thất bại' }
      ];
      
      // Create modal HTML
      const modalHTML = `
      <div class="modal" id="update-status-modal">
          <div class="modal-content">
              <div class="modal-header">
                  <h2>Cập nhật trạng thái đơn hàng #${orderId}</h2>
                  <span class="close">&times;</span>
              </div>
              <div class="modal-body">
                  <form id="status-update-form">
                      <div class="form-group">
                          <label for="order-status">Trạng thái mới</label>
                          <select id="order-status" class="form-control">
                              ${statusOptions.map(option => 
                                  `<option value="${option.value}">${option.label}</option>`
                              ).join('')}
                          </select>
                      </div>
                  </form>
              </div>
              <div class="modal-footer">
                  <button class="btn-secondary" id="cancel-status-update">Hủy</button>
                  <button class="btn-primary" id="confirm-status-update">Cập nhật</button>
              </div>
          </div>
      </div>
      `;
      
      // Add modal to DOM
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHTML;
      document.body.appendChild(modalContainer.firstChild);
      
      // Show modal
      const modal = document.getElementById('update-status-modal');
      modal.classList.add('show');
      
      // Add event listeners
      document.querySelector('#update-status-modal .close').addEventListener('click', () => {
          this.closeStatusModal();
      });
      
      document.getElementById('cancel-status-update').addEventListener('click', () => {
          this.closeStatusModal();
      });
      
      document.getElementById('confirm-status-update').addEventListener('click', () => {
          const newStatus = document.getElementById('order-status').value;
          this.updateOrderStatus(orderId, newStatus);
      });
    },

    closeStatusModal() {
      const modal = document.getElementById('update-status-modal');
      if (modal) {
          modal.remove();
      }
    },
  
    // Update order status
    async updateOrderStatus(orderId, newStatus) {
      try {
          const response = await fetch(`/api/orders/${orderId}/status?status=${newStatus}`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          // Close modal
          this.closeStatusModal();
          
          // Refresh order details
          this.viewOrderDetail(orderId);
          
          // Also refresh the orders table
          this.loadOrders(this.state.currentPage);
          
          // Show success message
          this.showToast(`Đơn hàng #${orderId} đã được cập nhật sang trạng thái: ${this.translateStatus(newStatus)}`, 'success');
          
      } catch (error) {
          console.error(`Error updating order status:`, error);
          this.showToast(`Lỗi khi cập nhật trạng thái đơn hàng: ${error.message}`, 'error');
      }
    },
    
    // Export orders to Excel
    exportOrdersToExcel() {
        // Build URL with current filters
        let url = '/api/orders/export';
        
        const queryParams = [];
        
        if (this.state.filterBranch) queryParams.push(`branchId=${this.state.filterBranch}`);
        if (this.state.filterChannel) queryParams.push(`salesChannel=${this.state.filterChannel}`);
        if (this.state.filterStatus) queryParams.push(`status=${this.state.filterStatus}`);
        if (this.state.filterStartDate) queryParams.push(`startDate=${this.state.filterStartDate}`);
        if (this.state.filterEndDate) queryParams.push(`endDate=${this.state.filterEndDate}`);
        if (this.state.searchQuery) queryParams.push(`search=${encodeURIComponent(this.state.searchQuery)}`);
        
        if (queryParams.length > 0) {
            url += '?' + queryParams.join('&');
        }
        
        window.open(url, '_blank');
    },
    
    // Open create order modal
    openCreateOrderModal() {
        const modal = document.getElementById('create-order-modal');
        if (!modal) {
            console.error('Create order modal not found');
            return;
        }
          // Reset form
        this.resetOrderForm();
        
        // Load required data
        this.loadOrderBranches();
        this.loadEmployees();
        this.loadProductCategories();
        
        // Show modal
        modal.style.display = 'block';
    },
    
    // Close create order modal
    closeCreateOrderModal() {
        const modal = document.getElementById('create-order-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.resetOrderForm();
    },
    
    // Reset order form
    resetOrderForm() {
        const form = document.getElementById('order-form');
        if (form) {
            form.reset();
        }
        
        // Clear order items
        const orderItemsList = document.getElementById('order-items-list');
        if (orderItemsList) {
            orderItemsList.innerHTML = '<tr><td colspan="5" class="text-center">Chưa có sản phẩm nào</td></tr>';
        }
        
        // Reset totals
        this.updateOrderSummary(0, 0, 0);
          // Reset product dropdowns
        const productSelect = document.getElementById('order-product-select');
        if (productSelect) {
            productSelect.innerHTML = '<option value="">Chọn sản phẩm</option>';
            productSelect.disabled = true;
        }
    },
    
    // Load branches for order form
    async loadOrderBranches() {
        try {
            const branchSelect = document.getElementById('order-branch');
            if (!branchSelect) return;
            
            const response = await fetch('/api/branches');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const branches = await response.json();
            
            // Clear existing options except for the first one
            branchSelect.innerHTML = '<option value="">Chọn chi nhánh</option>';
            
            // Add branch options
            branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.id;
                option.textContent = branch.name;
                branchSelect.appendChild(option);
            });
              } catch (error) {
            console.error('Error loading branches:', error);
        }
    },    // Load employees for order form
    async loadEmployees() {
        try {
            const employeeSelect = document.getElementById('order-employee');
            if (!employeeSelect) return;
            
            const response = await fetch('/api/users/employees');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const users = await response.json();
            
            // Clear existing options except for the first one
            employeeSelect.innerHTML = '<option value="">Chọn nhân viên</option>';
            
            // Add employee options (already filtered on backend)
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.fullName;
                employeeSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    },
      // Load product categories
    async loadProductCategories() {
        try {
            const categorySelect = document.getElementById('order-product-category');
            if (!categorySelect) return;
            
            const response = await fetch('/api/categories');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const categories = await response.json();
            
            // Clear existing options
            categorySelect.innerHTML = '<option value="">Chọn danh mục</option>';
            
            // Add category options
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    },
      // Load products by category
    async loadProductsByCategory() {
        const categorySelect = document.getElementById('order-product-category');
        const productSelect = document.getElementById('order-product-select');
        
        if (!categorySelect || !productSelect) return;
        
        const selectedCategory = categorySelect.value;
        
        if (!selectedCategory) {
            productSelect.innerHTML = '<option value="">Chọn sản phẩm</option>';
            productSelect.disabled = true;
            return;
        }
        
        try {
            const response = await fetch(`/api/products/category/${selectedCategory}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const products = await response.json();
            
            // Clear existing options
            productSelect.innerHTML = '<option value="">Chọn sản phẩm</option>';
            
            // Add product options
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} - ${product.price}₫`;
                option.dataset.price = product.price;
                option.dataset.name = product.name;
                productSelect.appendChild(option);
            });
            
            productSelect.disabled = false;
            
        } catch (error) {
            console.error('Error loading products:', error);
            alert('Lỗi khi tải danh sách sản phẩm');
        }
    },      // Add product to order
    addProductToOrder() {
        console.log('addProductToOrder called');
        const productSelect = document.getElementById('order-product-select');
        const quantityInput = document.getElementById('product-quantity');
        
        console.log('productSelect:', productSelect);
        console.log('quantityInput:', quantityInput);
        
        if (!productSelect || !quantityInput) {
            console.error('Missing elements - productSelect:', !!productSelect, 'quantityInput:', !!quantityInput);
            return;
        }
        
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const quantity = parseInt(quantityInput.value);
        
        console.log('selectedOption:', selectedOption);
        console.log('quantity:', quantity);
        console.log('selectedOption.value:', selectedOption?.value);
        
        if (!selectedOption.value || quantity <= 0) {
            alert('Vui lòng chọn sản phẩm và nhập số lượng hợp lệ');
            return;
        }
        
        const productId = selectedOption.value;
        const productName = selectedOption.dataset.name;
        const productPrice = parseFloat(selectedOption.dataset.price);
        const totalPrice = productPrice * quantity;
        
        // Add to order items table
        const orderItemsList = document.getElementById('order-items-list');
        if (orderItemsList) {
            // Remove "no products" row if exists
            const noProductsRow = orderItemsList.querySelector('td[colspan="5"]');
            if (noProductsRow) {
                orderItemsList.innerHTML = '';
            }
            
            // Check if product already exists
            const existingRow = orderItemsList.querySelector(`tr[data-product-id="${productId}"]`);
            if (existingRow) {
                // Update quantity
                const qtyCell = existingRow.querySelector('.quantity-input');
                const newQty = parseInt(qtyCell.value) + quantity;
                qtyCell.value = newQty;
                
                // Update total
                const totalCell = existingRow.querySelector('.item-total');
                totalCell.textContent = (productPrice * newQty).toLocaleString() + ' ₫';
            } else {
                // Add new row
                const row = document.createElement('tr');
                row.dataset.productId = productId;
                row.innerHTML = `
                    <td>${productName}</td>
                    <td>${productPrice.toLocaleString()} ₫</td>
                    <td>
                        <input type="number" class="quantity-input" value="${quantity}" min="1" 
                               style="width: 80px;" onchange="OrderHandlers.updateItemQuantity('${productId}', this.value)">
                    </td>
                    <td class="item-total">${totalPrice.toLocaleString()} ₫</td>
                    <td>
                        <button type="button" class="btn btn-danger btn-sm" onclick="OrderHandlers.removeOrderItem('${productId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                orderItemsList.appendChild(row);
            }
        }
        
        // Reset product selection
        productSelect.selectedIndex = 0;
        quantityInput.value = 1;
        
        // Recalculate total
        this.calculateTotal();
    },
    
    // Update item quantity
    updateItemQuantity(productId, newQuantity) {
        const row = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (!row) return;
        
        const quantity = parseInt(newQuantity);
        if (quantity <= 0) {
            this.removeOrderItem(productId);
            return;
        }
        
        // Get product price from the row
        const priceText = row.cells[1].textContent.replace(/[₫,]/g, '');
        const price = parseFloat(priceText);
        const total = price * quantity;
        
        // Update total cell
        const totalCell = row.querySelector('.item-total');
        totalCell.textContent = total.toLocaleString() + ' ₫';
        
        // Recalculate order total
        this.calculateTotal();
    },
    
    // Remove order item
    removeOrderItem(productId) {
        const row = document.querySelector(`tr[data-product-id="${productId}"]`);
        if (row) {
            row.remove();
            
            // Check if no items left
            const orderItemsList = document.getElementById('order-items-list');
            if (orderItemsList && orderItemsList.children.length === 0) {
                orderItemsList.innerHTML = '<tr><td colspan="5" class="text-center">Chưa có sản phẩm nào</td></tr>';
            }
            
            // Recalculate total
            this.calculateTotal();
        }
    },
    
    // Calculate order total
    calculateTotal() {
        const orderItemsList = document.getElementById('order-items-list');
        if (!orderItemsList) return;
        
        let subtotal = 0;
        const rows = orderItemsList.querySelectorAll('tr[data-product-id]');
        
        rows.forEach(row => {
            const totalText = row.querySelector('.item-total').textContent.replace(/[₫,]/g, '');
            subtotal += parseFloat(totalText);
        });
        
        const discountPercent = parseFloat(document.getElementById('discount-percent').value) || 0;
        const discountAmount = (subtotal * discountPercent) / 100;
        const total = subtotal - discountAmount;
        
        this.updateOrderSummary(subtotal, discountAmount, total);
    },
    
    // Update order summary display
    updateOrderSummary(subtotal, discountAmount, total) {
        const subtotalElement = document.getElementById('subtotal');
        const discountElement = document.getElementById('discount-amount');
        const totalElement = document.getElementById('total-amount');
        
        if (subtotalElement) subtotalElement.textContent = subtotal.toLocaleString() + ' ₫';
        if (discountElement) discountElement.textContent = discountAmount.toLocaleString() + ' ₫';
        if (totalElement) totalElement.textContent = total.toLocaleString() + ' ₫';
    },
      // Search customer by phone
    async searchCustomer() {
        const phoneInput = document.getElementById('order-customer-phone');
        const nameInput = document.getElementById('customer-name');
        
        if (!phoneInput || !nameInput) return;
        
        const phone = phoneInput.value.trim();
        if (!phone) {
            alert('Vui lòng nhập số điện thoại');
            return;
        }
        
        try {
            const response = await fetch(`/api/customers/phone/${phone}`);
            if (response.ok) {
                const customer = await response.json();
                nameInput.value = customer.name || '';
            } else if (response.status === 404) {
                nameInput.value = '';
                alert('Không tìm thấy khách hàng. Vui lòng nhập tên khách hàng mới.');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error searching customer:', error);
            alert('Lỗi khi tìm kiếm khách hàng');
        }
    },
    
    // Save order
    async saveOrder() {
        try {
            const orderData = this.collectOrderData();
            
            if (!this.validateOrderData(orderData)) {
                return;
            }
            
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            alert('Tạo hóa đơn thành công!');
            this.closeCreateOrderModal();
            this.loadOrders(); // Refresh order list
            
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Lỗi khi lưu hóa đơn: ' + error.message);
        }
    },
      // Collect order data from form
    collectOrderData() {
        const orderItemsList = document.getElementById('order-items-list');
        const items = [];
        
        if (orderItemsList) {
            const rows = orderItemsList.querySelectorAll('tr[data-product-id]');
            rows.forEach(row => {
                const productId = row.dataset.productId;
                const quantity = parseInt(row.querySelector('.quantity-input').value);
                
                items.push({
                    productId: productId,
                    quantity: quantity
                });
            });
        }
        
        // Map channel to enum value
        const channelValue = document.getElementById('order-channel').value;
        const salesChannel = channelValue === 'online' ? 'ONLINE' : 'OFFLINE';          return {
            customerId: null, // For guest customers
            branchId: document.getElementById('order-branch').value,
            employeeId: document.getElementById('order-employee').value || null, // Allow null for no employee selected
            employeeName: null, // Can be added later if needed
            employeeCode: null, // Can be added later if needed
            salesChannel: salesChannel,
            items: items
        };
    },      // Validate order data
    validateOrderData(orderData) {
        if (!orderData.salesChannel) {
            alert('Vui lòng chọn kênh bán');
            return false;
        }
        
        if (!orderData.branchId) {
            alert('Vui lòng chọn chi nhánh');
            return false;
        }
        
        // Note: Employee is now optional
        
        if (orderData.items.length === 0) {
            alert('Vui lòng thêm ít nhất một sản phẩm');
            return false;
        }
        
        return true;
    },

    // Helper: Get status class for styling
    getStatusClass(status) {
        switch (status) {
            case 'PENDING': return 'pending';
            case 'PROCESSING': return 'processing';
            case 'COMPLETED': return 'completed';
            case 'CANCELLED': return 'cancelled';
            case 'FAILED': return 'cancelled';
            default: return '';
        }
    },
    
    // Helper: Translate status to Vietnamese
    translateStatus(status) {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'PAID': return 'Đã thanh toán';
            case 'PROCESSING': return 'Đang xử lý';
            case 'COMPLETED': return 'Hoàn thành';
            case 'CANCELLED': return 'Đã hủy';
            case 'FAILED': return 'Thất bại';
            default: return status;
        }
    },
    
    // Helper: Format currency
    formatCurrency(amount) {
        if (amount == null) return '0₫';
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND',
            maximumFractionDigits: 0 
        }).format(amount);
    },
    
    // Helper: Format date
    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    },
    
    // Helper: Format date and time
    formatDateTime(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },
    
    // Helper: Show toast message
    showToast(message, type = 'info') {
        // Use ToastService if available
        if (window.ToastService) {
            window.ToastService[type](message);
            return;
        }
        
        // Fallback to alert
        alert(message);
    }
};

// Add to window object for global access
window.OrderHandlers = OrderHandlers;