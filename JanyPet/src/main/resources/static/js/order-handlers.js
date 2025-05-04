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
            });
        }
    },
    
    // Initialize modal action handlers
    initModalHandlers() {
        // Close modal when clicking close button or X
        document.querySelectorAll('#order-detail-modal .close, #modal-close-btn').forEach(elem => {
            elem.addEventListener('click', () => {
                this.closeOrderModal();
            });
        });
        
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
            let url = `/api/orders?page=${page}&size=${this.state.pageSize}&sort=${this.state.sortBy},${this.state.sortDir}`;
            
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
                    ordersTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Lỗi server khi tải dữ liệu. Vui lòng thử lại sau.</td></tr>';
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