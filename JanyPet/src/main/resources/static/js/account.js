/**
 * Account Management
 * Main controller for the account page
 */

const accountManager = {
    init: function() {
        console.log('Initializing Account Manager');
        
        // Đầu tiên kiểm tra xem người dùng đã đăng nhập hay chưa
        this.checkAuthStatus(false); // Thêm false để không tự động redirect
    },
    
    bindGeneralEvents: function() {
        // Handle logout button clicks
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', this.handleLogout.bind(this));
        });
        
        // Handle tab switching and history
        const tabLinks = document.querySelectorAll('.account-sidebar .list-group-item');
        if (tabLinks && tabLinks.length > 0) {
            tabLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    if (e.currentTarget.classList.contains('logout-btn')) return;
                    
                    // Add active class to clicked tab
                    tabLinks.forEach(l => l.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    
                    // Update URL hash
                    const tabId = e.currentTarget.getAttribute('href').substring(1);
                    window.location.hash = tabId;
                });
            });
            
            // Check if URL has a hash and activate the corresponding tab
            if (window.location.hash) {
                const tabId = window.location.hash.substring(1);
                const tab = document.querySelector(`.account-sidebar .list-group-item[href="#${tabId}"]`);
                
                if (tab) {
                    // Remove active class from all tabs
                    tabLinks.forEach(l => l.classList.remove('active'));
                    
                    // Add active class to the tab matching the hash
                    tab.classList.add('active');
                    
                    // Activate the tab content
                    const tabTrigger = new bootstrap.Tab(tab);
                    tabTrigger.show();
                }
            } else if (tabLinks[0]) {
                // Mặc định kích hoạt tab đầu tiên nếu không có hash
                const firstTabTrigger = new bootstrap.Tab(tabLinks[0]);
                firstTabTrigger.show();
            }
        }
    },
    
    checkAuthStatus: function(shouldRedirect = true) {
        return new Promise((resolve) => {
            // Hiển thị loading spinner
            const loadingElement = document.getElementById('account-loading');
            if (loadingElement) {
                loadingElement.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Đang tải...</span></div>';
                loadingElement.style.display = 'block';
            }
            
            // Kiểm tra token trong localStorage
            const token = localStorage.getItem('token');
            const tokenExpiry = localStorage.getItem('tokenExpiry');
            const userData = localStorage.getItem('currentUser'); // Changed 'userData' to 'currentUser'
            
            if (!token) {
                console.log('No authentication token found');
                if (shouldRedirect) this.redirectToLogin();
                resolve(false);
                return;
            }
            
            // Kiểm tra token hết hạn
            if (tokenExpiry && new Date().getTime() > parseInt(tokenExpiry)) {
                console.log('Token has expired');
                if (window.toastManager) {
                    toastManager.showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'warning');
                }
                this.clearAuthData();
                if (shouldRedirect) this.redirectToLogin();
                resolve(false);
                return;
            }
            
            // Tạm thời sử dụng userData đã lưu trước đó
            if (userData) {
                try {
                    const parsedUserData = JSON.parse(userData);
                    this.updateUserUI(parsedUserData);
                    
                    // Ẩn loading spinner
                    if (loadingElement) loadingElement.style.display = 'none';
                    
                    // Khởi tạo giao diện
                    this.bindGeneralEvents();
                    
                    resolve(true);
                    
                    // Vẫn gửi request để kiểm tra token, nhưng không block giao diện
                    this.validateToken(token);
                    return;
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
            
            // Ẩn loading spinner trong trường hợp có lỗi
            if (loadingElement) loadingElement.style.display = 'none';
            
            // Khởi tạo giao diện với dữ liệu dự phòng
            this.bindGeneralEvents();
            resolve(true);
            
            // Tiếp tục kiểm tra token
            this.validateToken(token);
        });
    },
    
    validateToken: function(token) {
        // Xác thực token với API
        fetch('/api/users/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return response.json();
        })
        .then(userData => {
            console.log('User authenticated successfully');
            
            // Cập nhật dữ liệu người dùng trong localStorage
            localStorage.setItem('currentUser', JSON.stringify(userData)); // Changed 'userData' to 'currentUser'
            
            // Cập nhật UI
            this.updateUserUI(userData);
        })
        .catch(error => {
            console.error('Authentication failed:', error);
            
            // Hiển thị thông báo lỗi nhưng KHÔNG chuyển hướng
            if (window.toastManager) {
                toastManager.showToast('Phiên đăng nhập có vấn đề. Xin vui lòng đảm bảo bạn đã đăng nhập.', 'warning');
            }
        });
    },
    
    loadAccountData: function() {
        // Đây là nơi để tải dữ liệu tài khoản bổ sung sau khi xác thực
        console.log('Loading account data');
    },
    
    updateUserUI: function(userData) {
        // Cập nhật thông tin người dùng trong UI
        const userGreeting = document.getElementById('user-greeting');
        if (userGreeting) {
            const displayName = userData.fullName || userData.username || 'Người dùng';
            userGreeting.textContent = `Chào, ${displayName}!`;
        }
        
        // Ẩn nút đăng nhập và hiển thị thông tin người dùng
        const authButtons = document.querySelector('.auth-buttons');
        const userInfo = document.querySelector('.user-info');
        
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
    },
    
    handleLogout: function(event) {
        event.preventDefault();
        
        // Hiển thị thông báo
        if (window.toastManager) {
            toastManager.showToast('Đang đăng xuất...', 'info');
        }
        
        // Xóa dữ liệu xác thực
        this.clearAuthData();
        
        // Chuyển hướng về trang chủ sau 1 giây
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    },
    
    clearAuthData: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser'); //
        localStorage.removeItem('tokenExpiry');
    },
    
    redirectToLogin: function() {
        window.location.href = 'login.html?redirect=account.html';
    }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    accountManager.init();
    
    const bookingHistoryTab = document.querySelector('a[href="#booking-history"]');
    if (bookingHistoryTab) {
        bookingHistoryTab.addEventListener('shown.bs.tab', function () {
            // Ensure services are available before trying to load
            if (typeof window.authService !== 'undefined' && typeof window.BookingAPI !== 'undefined') {
                loadAndDisplayUserBookings();
            } else {
                const container = document.getElementById('booking-history-container');
                if (container) {
                    let errorMsg = "Lỗi: ";
                    if (typeof window.authService === 'undefined') errorMsg += "Dịch vụ xác thực không tải được. ";
                    if (typeof window.BookingAPI === 'undefined') errorMsg += "API đặt lịch không tải được.";
                    container.innerHTML = `<p class="text-danger text-center">${errorMsg} Vui lòng kiểm tra console để biết thêm chi tiết.</p>`;
                    console.error("Account.js: Cannot load bookings because authService or BookingAPI is not defined at tab show.");
                }
            }
        });
    }

    // Initial load if the booking history tab is active by default (e.g. through URL hash)
    if (window.location.hash === '#booking-history' || document.getElementById('booking-history')?.classList.contains('active')) {
        // Defer this slightly to give other scripts a chance to fully initialize
        setTimeout(() => {
            if (typeof window.authService !== 'undefined' && typeof window.BookingAPI !== 'undefined') {
                loadAndDisplayUserBookings();
            } else {
                const container = document.getElementById('booking-history-container');
                 if (container) {
                    let errorMsg = "Lỗi: ";
                    if (typeof window.authService === 'undefined') errorMsg += "Dịch vụ xác thực không tải được khi khởi tạo. ";
                    if (typeof window.BookingAPI === 'undefined') errorMsg += "API đặt lịch không tải được khi khởi tạo.";
                    container.innerHTML = `<p class="text-danger text-center">${errorMsg} Vui lòng kiểm tra console để biết thêm chi tiết.</p>`;
                    console.error("Account.js: Cannot load bookings on initial hash match because authService or BookingAPI is not defined.");
                }
            }
        }, 100); // Small delay
    }
});

async function loadAndDisplayUserBookings() {
    const container = document.getElementById('booking-history-container');
    if (!container) {
        console.error('Booking history container not found.');
        return;
    }

    // Explicitly check for service availability again, with detailed logging
    let authServiceAvailable = typeof window.authService !== 'undefined' && window.authService !== null;
    let bookingAPIAvailable = typeof window.BookingAPI !== 'undefined' && window.BookingAPI !== null;

    if (!authServiceAvailable) {
        console.error('Account.js loadAndDisplayUserBookings: window.authService is NOT available.');
    }
    if (!bookingAPIAvailable) {
        console.error('Account.js loadAndDisplayUserBookings: window.BookingAPI is NOT available.');
    }

    if (!authServiceAvailable || !bookingAPIAvailable) {
        let errorMessage = 'Lỗi: ';
        if (!authServiceAvailable && !bookingAPIAvailable) {
            errorMessage += 'Dịch vụ xác thực và API đặt lịch không khả dụng.';
        } else if (!authServiceAvailable) {
            errorMessage += 'Dịch vụ xác thực không khả dụng.';
        } else {
            errorMessage += 'API đặt lịch không khả dụng.';
        }
        container.innerHTML = `<p class="text-danger text-center">${errorMessage}</p>`;
        return;
    }

    const currentUser = window.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
        container.innerHTML = '<p class="text-center">Vui lòng đăng nhập để xem lịch hẹn.</p>';
        // Optionally, redirect to login or show login prompt
        return;
    }

    container.innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải lịch hẹn...</span>
            </div>
            <p class="mt-2">Đang tải lịch hẹn của bạn...</p>
        </div>`;

    try {
        // This is the core call to fetch bookings for the user
        const bookings = await window.BookingAPI.getBookingsByUserId(currentUser.id);
        renderUserBookings(bookings, container);
    } catch (error) {
        console.error('Error loading user bookings via BookingAPI:', error);
        container.innerHTML = `<p class="text-danger text-center">Không thể tải lịch hẹn: ${error.message}</p>`;
        if (window.ToastService) { // Assuming ToastService is globally available like in booking-service.js
            window.ToastService.error(`Lỗi tải lịch hẹn: ${error.message}`);
        } else if (window.toastManager) { // Fallback to toastManager if available
            window.toastManager.showToast(`Lỗi tải lịch hẹn: ${error.message}`, 'error');
        }
    }
}

function renderUserBookings(bookings, container) {
    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state text-center p-5">
                <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                <h4>Bạn chưa có lịch hẹn nào</h4>
                <p>Hãy <a href="BookingService.html">đặt lịch</a> ngay để trải nghiệm dịch vụ của chúng tôi!</p>
            </div>`;
        return;
    }

    let bookingsHTML = '<div class="list-group">';
    bookings.forEach(booking => {
        // Ensure booking.services is an array before mapping
        const servicesStr = Array.isArray(booking.services) && booking.services.length > 0 
            ? booking.services.map(s => s.name || 'Dịch vụ không tên').join(', ') 
            : 'N/A';
        const petName = booking.pet && booking.pet.name ? booking.pet.name : 'N/A';
        
        let bookingDateDisplay = 'N/A';
        if (booking.bookingDate) {
            try {
                // Assuming booking.bookingDate is a string like "YYYY-MM-DD"
                const dateObj = new Date(booking.bookingDate + 'T00:00:00'); // Ensure correct parsing as local date
                bookingDateDisplay = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            } catch (e) {
                console.warn("Could not parse bookingDate:", booking.bookingDate, e);
                bookingDateDisplay = booking.bookingDate; // fallback to raw string
            }
        }
        
        const startTime = booking.startTime || 'N/A';
        
        let statusBadgeClass = 'bg-secondary';
        let statusText = booking.status || 'Không xác định';
        switch (String(booking.status).toUpperCase()) {
            case 'PENDING': statusBadgeClass = 'bg-warning text-dark'; statusText = 'Chờ xác nhận'; break;
            case 'CONFIRMED': statusBadgeClass = 'bg-success'; statusText = 'Đã xác nhận'; break;
            case 'COMPLETED': statusBadgeClass = 'bg-info text-dark'; statusText = 'Đã hoàn thành'; break;
            case 'CANCELLED': statusBadgeClass = 'bg-danger'; statusText = 'Đã hủy'; break;
        }

        bookingsHTML += `
            <div class="list-group-item list-group-item-action flex-column align-items-start mb-3 shadow-sm rounded border">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Lịch hẹn cho: ${petName}</h5>
                    <small class="text-muted">Ngày: ${bookingDateDisplay} - ${startTime}</small>
                </div>
                <p class="mb-1"><strong>Dịch vụ:</strong> ${servicesStr}</p>
                <div class="d-flex w-100 justify-content-between align-items-center mt-2">
                    <span class="badge ${statusBadgeClass}">${statusText}</span>
                    <small class="text-muted">ID: ${booking.id || 'N/A'}</small>
                </div>
            </div>
        `;
    });
    bookingsHTML += '</div>';
    container.innerHTML = bookingsHTML;
}

// ... (rest of your account.js: user-profile.js, pet-management.js content if all in one file) ...