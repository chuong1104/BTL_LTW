/**
 * User Profile Management
 * Handles displaying and updating user information
 */

const userProfileManager = {
    userData: null,
    
    init: function() {
        console.log('Initializing User Profile Manager');
        this.bindEvents();
        this.loadUserData();
    },
    
    bindEvents: function() {
        // Edit profile button
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', this.showEditProfileForm.bind(this));
        }
        
        // Cancel edit button
        const cancelEditBtn = document.getElementById('cancel-edit-profile-btn');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', this.hideEditProfileForm.bind(this));
        }
        
        // Edit profile form submission
        const profileEditForm = document.getElementById('profile-edit-form');
        if (profileEditForm) {
            profileEditForm.addEventListener('submit', this.handleProfileUpdate.bind(this));
        }
        
        // Password change form
        const passwordForm = document.getElementById('change-password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', this.handlePasswordChange.bind(this));
        }
    },
    
    loadUserData: function() {
        // Kiểm tra đã có userData trong localStorage chưa
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                this.userData = JSON.parse(userData);
                this.updateProfileUI(this.userData);
                this.updateProfileCounts();
            } catch (e) {
                console.error('Error parsing stored user data:', e);
            }
        }
        
        // Show loading spinner
        document.getElementById('account-loading').style.display = 'block';
        
        // Fetch current user data
        apiService.get('/users/profile')
            .then(data => {
                this.userData = data;
                this.updateProfileUI(data);
                document.getElementById('account-loading').style.display = 'none';
                
                // Update counts in profile summary
                this.updateProfileCounts();
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                toastManager.showToast('Không thể tải thông tin người dùng. Vui lòng thử lại sau.', 'error');
                document.getElementById('account-loading').style.display = 'none';
            });
    },
    
    updateProfileUI: function(userData) {
        // Update view mode fields
        document.getElementById('profile-fullName').textContent = userData.fullName || userData.username || 'Chưa cập nhật';
        document.getElementById('profile-email').textContent = userData.email || 'Chưa cập nhật';
        document.getElementById('profile-phone').textContent = userData.phoneNumber || 'Chưa cập nhật';
        document.getElementById('profile-address').textContent = userData.address || 'Chưa cập nhật';
        
        // Also update edit form fields
        document.getElementById('edit-fullName').value = userData.fullName || userData.username || '';
        document.getElementById('edit-email').value = userData.email || '';
        document.getElementById('edit-phone').value = userData.phoneNumber || '';
        document.getElementById('edit-address').value = userData.address || '';
    },
    
    updateProfileCounts: function() {
        const userId = this.userData.id;
        if (!userId) return;
        
        // Fetch pet count
        apiService.get(`/pets/owner/${userId}`)
            .then(pets => {
                document.getElementById('profile-pets-count').textContent = 
                    `${pets.length} thú cưng`;
            })
            .catch(error => console.error('Error fetching pet count:', error));
            
        // Fetch order count
        apiService.get(`/orders/user/${userId}`)
            .then(orders => {
                document.getElementById('profile-orders-count').textContent = 
                    `${orders.length} đơn hàng`;
            })
            .catch(error => console.error('Error fetching order count:', error));
    },
    
    showEditProfileForm: function() {
        document.getElementById('profile-view-mode').classList.add('d-none');
        document.getElementById('profile-edit-form').classList.remove('d-none');
    },
    
    hideEditProfileForm: function() {
        document.getElementById('profile-edit-form').classList.add('d-none');
        document.getElementById('profile-view-mode').classList.remove('d-none');
    },
    
    handleProfileUpdate: function(event) {
        event.preventDefault();
        
        const updatedData = {
            fullName: document.getElementById('edit-fullName').value,
            phoneNumber: document.getElementById('edit-phone').value,
            address: document.getElementById('edit-address').value
        };
        
        // Update user data via API
        apiService.put(`/users/${this.userData.id}`, updatedData)
            .then(response => {
                this.userData = response;
                this.updateProfileUI(response);
                this.hideEditProfileForm();
                toastManager.showToast('Thông tin cá nhân đã được cập nhật thành công!', 'success');
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                toastManager.showToast('Không thể cập nhật thông tin. Vui lòng thử lại sau.', 'error');
            });
    },
    
    handlePasswordChange: function(event) {
        event.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        
        // Validate password match
        if (newPassword !== confirmPassword) {
            toastManager.showToast('Mật khẩu mới không khớp.', 'error');
            return;
        }
        
        // Send password change request
        apiService.post('/auth/change-password', {
            currentPassword: currentPassword,
            newPassword: newPassword
        })
        .then(() => {
            toastManager.showToast('Mật khẩu đã được thay đổi thành công!', 'success');
            
            // Reset form
            document.getElementById('change-password-form').reset();
        })
        .catch(error => {
            console.error('Error changing password:', error);
            toastManager.showToast('Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.', 'error');
        });
    }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    userProfileManager.init();
});