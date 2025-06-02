/**
 * Dashboard handler for admin panel
 * Displays real-time stats and recent activities from orders and bookings
 */
const DashboardHandler = {
    // Store references to DOM elements
    elements: {
        statsCards: {},
        recentAppointments: null,
        recentOrders: null,
    },
    
    /**
     * Initialize dashboard elements and load data
     */
    initialize: async function() {
        console.log('Initializing dashboard...');
        
        // Initialize stats card references
        this.elements.statsCards = {
            products: document.querySelector('.stat-card:nth-child(1) .stat-number'),
            appointments: document.querySelector('.stat-card:nth-child(2) .stat-number'),
            orders: document.querySelector('.stat-card:nth-child(3) .stat-number'),
            revenue: document.querySelector('.stat-card:nth-child(4) .stat-number')
        };
        
        // Initialize table references
        this.elements.recentAppointments = document.querySelector('.recent-appointments tbody');
        this.elements.recentOrders = document.querySelector('.recent-orders tbody');
        
        // Load dashboard data
        await this.loadDashboardData();
        
        // Set up refresh interval (every 5 minutes)
        setInterval(() => this.loadDashboardData(), 300000);
    },
    
    /**
     * Load all dashboard data
     */
    loadDashboardData: async function() {
        try {
            // Show loading indicators
            this.showLoadingState();
            
            // Load data in parallel
            await Promise.all([
                this.loadStatistics(),
                this.loadRecentAppointments(),
                this.loadRecentOrders()
            ]);
            
            console.log('Dashboard data loaded successfully');
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            window.ToastService?.error('Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.');
        }
    },
    
    /**
     * Show loading state for all dashboard elements
     */
    showLoadingState: function() {
        // Update stats cards with loading indicators
        Object.values(this.elements.statsCards).forEach(element => {
            if (element) element.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        });
        
        // Update tables with loading indicators
        if (this.elements.recentAppointments) {
            this.elements.recentAppointments.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <i class="fas fa-spinner fa-spin me-2"></i> Đang tải lịch hẹn...
                    </td>
                </tr>
            `;
        }
        
        if (this.elements.recentOrders) {
            this.elements.recentOrders.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <i class="fas fa-spinner fa-spin me-2"></i> Đang tải đơn hàng...
                    </td>
                </tr>
            `;
        }
    },
    
    /**
     * Load statistics for dashboard cards
     */
    loadStatistics: async function() {
        try {
            // Load product count
            if (window.apiService) {
                const products = await window.apiService.getAllProductsIncludingInactive();
                if (this.elements.statsCards.products && products) {
                    const activeProducts = products.filter(p => p.isActive).length;
                    this.elements.statsCards.products.textContent = activeProducts;
                }
            }
            
            // Load bookings count
            if (window.BookingAPI) {
                const bookings = await window.BookingAPI.getAllBookings();
                if (this.elements.statsCards.appointments && bookings) {
                    const pendingBookings = bookings.filter(b => 
                        b.status === 'PENDING' || b.status === 'CONFIRMED'
                    ).length;
                    this.elements.statsCards.appointments.textContent = pendingBookings;
                }
            }
            
            // Load orders stats
            if (window.OrderService) {
                const orders = await window.OrderService.getAllOrders();
                
                // Update orders count
                if (this.elements.statsCards.orders && orders) {
                    const pendingOrders = orders.filter(o => 
                        o.status !== 'DELIVERED' && 
                        o.status !== 'COMPLETED' && 
                        o.status !== 'CANCELLED'
                    ).length;
                    this.elements.statsCards.orders.textContent = pendingOrders;
                }
                
                // Calculate total revenue
                if (this.elements.statsCards.revenue && orders) {
                    const completedOrders = orders.filter(o => 
                        o.status === 'DELIVERED' || o.status === 'COMPLETED'
                    );
                    
                    const totalRevenue = completedOrders.reduce((sum, order) => 
                        sum + (order.totalAmount || 0), 0
                    );
                    
                    // Format as currency
                    this.elements.statsCards.revenue.textContent = this.formatCurrency(totalRevenue);
                }
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
            throw error;
        }
    },
    
    /**
     * Load recent appointments for dashboard
     */
    loadRecentAppointments: async function() {
        try {
            if (!window.BookingAPI || !this.elements.recentAppointments) return;
            
            const bookings = await window.BookingAPI.getAllBookings();
            if (!bookings || !bookings.length) {
                this.elements.recentAppointments.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">Chưa có lịch hẹn nào</td>
                    </tr>
                `;
                return;
            }
            
            // Sort by date (newest first) and take 5
            const recentBookings = [...bookings]
                .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
                .slice(0, 5);
                
            // Clear loading state
            this.elements.recentAppointments.innerHTML = '';
            
            // Add each booking row
            recentBookings.forEach(booking => {
                const row = document.createElement('tr');
                
                // Format appointment date and time
                const appointmentDate = new Date(booking.appointmentDate);
                const dateFormatted = appointmentDate.toLocaleDateString('vi-VN');
                const timeFormatted = appointmentDate.toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                
                // Format services
                const serviceNames = booking.services 
                    ? booking.services.map(s => s.name).join(', ')
                    : 'Không xác định';
                
                // Get status class
                const statusClass = this.getBookingStatusClass(booking.status);
                
                row.innerHTML = `
                    <td>${booking.customerName || 'Không xác định'}</td>
                    <td>${booking.petName || 'Không xác định'}</td>
                    <td>${serviceNames}</td>
                    <td>${dateFormatted}, ${timeFormatted}</td>
                    <td><span class="status-${statusClass}">${this.getBookingStatusText(booking.status)}</span></td>
                `;
                
                this.elements.recentAppointments.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading recent appointments:', error);
            this.elements.recentAppointments.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Không thể tải dữ liệu lịch hẹn
                    </td>
                </tr>
            `;
            throw error;
        }
    },
    
    /**
     * Load recent orders for dashboard
     */
    loadRecentOrders: async function() {
        try {
            if (!window.OrderService || !this.elements.recentOrders) return;
            
            const orders = await window.OrderService.getAllOrders();
            if (!orders || !orders.length) {
                this.elements.recentOrders.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">Chưa có đơn hàng nào</td>
                    </tr>
                `;
                return;
            }
            
            // Sort by date (newest first) and take 5
            const recentOrders = [...orders]
                .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                .slice(0, 5);
                
            // Clear loading state
            this.elements.recentOrders.innerHTML = '';
            
            // Add each order row
            recentOrders.forEach(order => {
                const row = document.createElement('tr');
                
                // Get item count
                const itemCount = order.orderDetails 
                    ? order.orderDetails.reduce((sum, item) => sum + item.quantity, 0)
                    : (order.items ? order.items.length : 0);
                
                // Format order ID/code
                const orderCode = order.orderCode || `#ORD-${order.id.substring(0, 4)}`;
                
                // Get customer name
                const customerName = order.customerName || 
                    `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim() || 
                    'Không xác định';
                
                // Get status class
                const statusClass = this.getOrderStatusClass(order.status);
                
                row.innerHTML = `
                    <td>${orderCode}</td>
                    <td>${customerName}</td>
                    <td>${itemCount} sản phẩm</td>
                    <td>${this.formatCurrency(order.totalAmount || 0)}</td>
                    <td><span class="status-${statusClass}">${this.getOrderStatusText(order.status)}</span></td>
                `;
                
                this.elements.recentOrders.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading recent orders:', error);
            this.elements.recentOrders.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Không thể tải dữ liệu đơn hàng
                    </td>
                </tr>
            `;
            throw error;
        }
    },
    
    /**
     * Get CSS class for booking status
     */
    getBookingStatusClass: function(status) {
        switch(status) {
            case 'PENDING': return 'pending';
            case 'CONFIRMED': return 'confirmed';
            case 'COMPLETED': return 'completed';
            case 'CANCELLED': return 'cancelled';
            default: return 'pending';
        }
    },
    
    /**
     * Get display text for booking status
     */
    getBookingStatusText: function(status) {
        switch(status) {
            case 'PENDING': return 'Đang chờ';
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'COMPLETED': return 'Hoàn thành';
            case 'CANCELLED': return 'Đã hủy';
            default: return status || 'Không xác định';
        }
    },
    
    /**
     * Get CSS class for order status
     */
    getOrderStatusClass: function(status) {
        switch(status) {
            case 'PENDING': return 'pending';
            case 'PROCESSING': return 'processing';
            case 'SHIPPING': return 'shipping';
            case 'DELIVERED': case 'COMPLETED': return 'completed';
            case 'CANCELLED': return 'cancelled';
            default: return 'processing';
        }
    },
    
    /**
     * Get display text for order status
     */
    getOrderStatusText: function(status) {
        switch(status) {
            case 'PENDING': return 'Đang chờ';
            case 'PROCESSING': return 'Đang xử lý';
            case 'SHIPPING': return 'Đang giao';
            case 'DELIVERED': return 'Đã giao';
            case 'COMPLETED': return 'Hoàn thành';
            case 'CANCELLED': return 'Đã hủy';
            default: return status || 'Không xác định';
        }
    },
    
    /**
     * Format currency
     */
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    }
};

// Make it globally accessible
window.DashboardHandler = DashboardHandler;