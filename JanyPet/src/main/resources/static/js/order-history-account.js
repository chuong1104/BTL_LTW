/**
 * Order History Manager
 * Handles fetching and displaying user's order history
 */

const orderHistoryManager = {
    orders: [],
    currentUser: null,
    
    init: function() {
        console.log('Initializing Order History Manager');
        this.bindEvents();
        this.loadCurrentUser()
            .then(() => this.loadOrders());
    },
    
    bindEvents: function() {
        // Listen for tab activation to refresh data
        const orderTab = document.querySelector('a[href="#order-history"]');
        if (orderTab) {
            orderTab.addEventListener('shown.bs.tab', () => {
                this.loadOrders();
            });
        }
        
        // Delegate event for view order details button
        document.getElementById('order-list-container').addEventListener('click', (event) => {
            const viewOrderBtn = event.target.closest('.view-order-btn');
            if (viewOrderBtn) {
                const orderId = viewOrderBtn.dataset.orderId;
                this.showOrderDetails(orderId);
            }
            
            const reviewOrderBtn = event.target.closest('.review-order-btn');
            if (reviewOrderBtn) {
                const orderId = reviewOrderBtn.dataset.orderId;
                this.showReviewForm(orderId);
            }
        });
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
    
    loadOrders: function() {
        if (!this.currentUser || !this.currentUser.id) {
            console.error('Cannot load orders: Current user is not available');
            return;
        }
        
        // Show loading state
        document.getElementById('order-history-loading').style.display = 'block';
        document.getElementById('order-list-container').innerHTML = '';
        
        apiService.get(`/orders/user/${this.currentUser.id}`)
            .then(orders => {
                this.orders = orders;
                this.renderOrders();
                
                // Toggle empty state
                const hasNoOrders = orders.length === 0;
                document.getElementById('no-orders-alert').style.display = hasNoOrders ? 'block' : 'none';
                document.getElementById('order-list-container').style.display = hasNoOrders ? 'none' : 'block';
                
                // Hide loading
                document.getElementById('order-history-loading').style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                document.getElementById('order-list-container').innerHTML = '<div class="alert alert-danger">Không thể tải dữ liệu đơn hàng</div>';
                document.getElementById('order-history-loading').style.display = 'none';
                toastManager.showToast('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.', 'error');
            });
    },
    
    renderOrders: function() {
        const container = document.getElementById('order-list-container');
        container.innerHTML = '';
        
        if (this.orders.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Chưa có đơn hàng nào.</div>';
            return;
        }
        
        // Sort orders by date, newest first
        const sortedOrders = [...this.orders].sort((a, b) => {
            return new Date(b.orderDate) - new Date(a.orderDate);
        });
        
        sortedOrders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card mb-4';
            
            // Format the order date
            const orderDate = new Date(order.orderDate).toLocaleDateString('vi-VN');
            
            // Format items summary (limited to first 2 items)
            let itemsSummary = '';
            if (order.items && order.items.length > 0) {
                const itemsToShow = order.items.slice(0, 2);
                itemsSummary = itemsToShow.map(item => `${item.productName || 'Sản phẩm'} x${item.quantity}`).join(', ');
                
                if (order.items.length > 2) {
                    itemsSummary += ` và ${order.items.length - 2} sản phẩm khác`;
                }
            } else {
                itemsSummary = 'Không có thông tin sản phẩm';
            }
            
            // Format price
            const totalPrice = this.formatCurrency(order.totalAmount);
            
            // Define status styling
            const statusClass = this.getStatusClass(order.status);
            const statusLabel = this.getStatusLabel(order.status);
            
            orderCard.innerHTML = `
                <div class="order-header d-flex justify-content-between align-items-center">
                    <div>
                        <span class="fw-bold">Đơn hàng #${order.id}</span>
                        <span class="ms-3 text-muted">${orderDate}</span>
                    </div>
                    <span class="order-status ${statusClass}">${statusLabel}</span>
                </div>
                <div class="order-body">
                    <div class="row">
                        <div class="col-md-8">
                            <p class="mb-1"><strong>Sản phẩm:</strong> ${itemsSummary}</p>
                            <p class="mb-1"><strong>Địa chỉ:</strong> ${order.shippingAddress || 'Không có thông tin'}</p>
                        </div>
                        <div class="col-md-4 text-md-end">
                            <p class="fw-bold fs-5 text-primary mb-0">${totalPrice}</p>
                            <p class="small text-muted">${this.getPaymentMethodText(order.paymentMethod)}</p>
                        </div>
                    </div>
                </div>
                <div class="order-footer d-flex justify-content-between align-items-center">
                    <button class="btn btn-sm btn-outline-primary rounded-pill view-order-btn" data-order-id="${order.id}">
                        <i class="fas fa-eye me-1"></i> Xem chi tiết
                    </button>
                    ${this.canBeReviewed(order) ? `
                        <button class="btn btn-sm btn-outline-success rounded-pill review-order-btn" data-order-id="${order.id}">
                            <i class="fas fa-star me-1"></i> Đánh giá
                        </button>
                    ` : ''}
                </div>
            `;
            
            container.appendChild(orderCard);
        });
    },
    
    showOrderDetails: function(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        // Update modal title
        document.getElementById('orderDetailModalLabel').innerText = `Chi tiết đơn hàng #${orderId}`;
        
        // Format order date
        const orderDate = new Date(order.orderDate).toLocaleDateString('vi-VN', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Format items
        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
            itemsHtml = `
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th class="text-center">Số lượng</th>
                            <th class="text-end">Đơn giá</th>
                            <th class="text-end">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            order.items.forEach(item => {
                const price = this.formatCurrency(item.price);
                const subtotal = this.formatCurrency(item.price * item.quantity);
                
                itemsHtml += `
                    <tr>
                        <td>${item.productName || 'Sản phẩm không xác định'}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-end">${price}</td>
                        <td class="text-end">${subtotal}</td>
                    </tr>
                `;
            });
            
            itemsHtml += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-end fw-bold">Tổng cộng:</td>
                            <td class="text-end fw-bold">${this.formatCurrency(order.totalAmount)}</td>
                        </tr>
                    </tfoot>
                </table>
            `;
        } else {
            itemsHtml = '<div class="alert alert-warning">Không có thông tin chi tiết sản phẩm</div>';
        }
        
        // Populate modal content
        document.getElementById('order-detail-content').innerHTML = `
            <div class="order-detail-summary mb-4">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Ngày đặt hàng:</strong> ${orderDate}</p>
                        <p><strong>Trạng thái:</strong> <span class="badge ${this.getStatusClass(order.status)}">${this.getStatusLabel(order.status)}</span></p>
                        <p><strong>Phương thức thanh toán:</strong> ${this.getPaymentMethodText(order.paymentMethod)}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Người nhận:</strong> ${order.recipientName || this.currentUser.fullName || 'Không có thông tin'}</p>
                        <p><strong>Số điện thoại:</strong> ${order.recipientPhone || this.currentUser.phoneNumber || 'Không có thông tin'}</p>
                        <p><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress || 'Không có thông tin'}</p>
                    </div>
                </div>
                ${order.notes ? `<p><strong>Ghi chú:</strong> ${order.notes}</p>` : ''}
            </div>
            
            <h5>Chi tiết sản phẩm</h5>
            ${itemsHtml}
        `;
        
        // Show modal
        const orderDetailModal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
        orderDetailModal.show();
    },
    
    showReviewForm: function(orderId) {
        // This could be implemented to show a review form or redirect to a review page
        toastManager.showToast('Chức năng đánh giá đang được phát triển.', 'info');
    },
    
    // Helper methods
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    },
    
    getStatusClass: function(status) {
        switch (status) {
            case 'PENDING': return 'status-pending';
            case 'CONFIRMED': return 'status-confirmed';
            case 'SHIPPING': return 'status-shipping';
            case 'DELIVERED': return 'status-delivered';
            case 'COMPLETED': return 'status-completed';
            case 'CANCELLED': return 'status-cancelled';
            case 'REFUNDED': return 'status-refunded';
            default: return '';
        }
    },
    
    getStatusLabel: function(status) {
        switch (status) {
            case 'PENDING': return 'Chờ xác nhận';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'SHIPPING': return 'Đang giao hàng';
            case 'DELIVERED': return 'Đã giao hàng';
            case 'COMPLETED': return 'Hoàn thành';
            case 'CANCELLED': return 'Đã hủy';
            case 'REFUNDED': return 'Đã hoàn tiền';
            default: return 'Không xác định';
        }
    },
    
    getPaymentMethodText: function(method) {
        switch (method) {
            case 'COD': return 'Thanh toán khi nhận hàng';
            case 'BANK_TRANSFER': return 'Chuyển khoản ngân hàng';
            case 'CREDIT_CARD': return 'Thẻ tín dụng';
            case 'E_WALLET': return 'Ví điện tử';
            default: return 'Phương thức không xác định';
        }
    },
    
    canBeReviewed: function(order) {
        // Only delivered/completed orders can be reviewed
        return ['DELIVERED', 'COMPLETED'].includes(order.status);
    }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    orderHistoryManager.init();
});