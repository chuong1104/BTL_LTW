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
            const userData = localStorage.getItem('userData');
            
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
            localStorage.setItem('userData', JSON.stringify(userData));
            
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
        localStorage.removeItem('userData');
        localStorage.removeItem('tokenExpiry');
    },
    
    redirectToLogin: function() {
        window.location.href = 'login.html?redirect=account.html';
    }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    accountManager.init();
});