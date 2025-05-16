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
        const localUserStr = localStorage.getItem('currentUser');
        let localUser = null;
        const accountLoadingElement = document.getElementById('account-loading');

        if (localUserStr) {
            try {
                localUser = JSON.parse(localUserStr);
                // Tentatively update UI with local data for faster perceived load
                this.userData = localUser; 
                this.updateProfileUI(this.userData);
            } catch (e) {
                console.error('Error parsing stored user data:', e);
                localUser = null; // Invalidate if parsing failed
            }
        }
        
        if (accountLoadingElement) {
            accountLoadingElement.style.display = 'block';
        }
        
        // Always fetch fresh data from the API
        apiService.get('/users/profile')
            .then(apiData => {
                this.userData = apiData; // Use definitive data from API
                localStorage.setItem('currentUser', JSON.stringify(apiData)); // Update localStorage
                
                this.updateProfileUI(apiData); // Update UI with fresh data
                this.updateProfileCounts();    // Update counts with fresh data

                // Explicitly trigger pet manager to check auth and load pets
                if (window.petManager && typeof window.petManager.checkAuthAndLoadData === 'function') {
                    console.log('User profile loaded from API, triggering petManager.checkAuthAndLoadData');
                    window.petManager.checkAuthAndLoadData();
                }
                
                if (accountLoadingElement) {
                    accountLoadingElement.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching user data from API:', error);
                // If API fails, but we had valid localUser, use that as a fallback.
                if (localUser) {
                    console.warn('API fetch failed. Using user data from localStorage as fallback.');
                    this.userData = localUser; // Ensure this.userData is the local one
                    // updateProfileUI was already called with localUser, ensure counts are also called
                    this.updateProfileCounts(); 

                    // Trigger petManager with whatever user context it can find (e.g. from localStorage)
                    if (window.petManager && typeof window.petManager.checkAuthAndLoadData === 'function') {
                        console.log('API failed, triggering petManager to re-check with localStorage user data');
                        window.petManager.checkAuthAndLoadData();
                    }
                } else {
                    // Only show toast if there's no fallback data
                    if (window.toastManager) {
                        toastManager.showToast('Không thể tải thông tin người dùng. Vui lòng thử lại sau.', 'error');
                    }
                }
                if (accountLoadingElement) {
                    accountLoadingElement.style.display = 'none';
                }
            });
    },
    
    updateProfileUI: function(userData) {
        // Log the received userData to help debug
        console.log('Updating profile UI with data:', userData);

        // For "Họ và tên", prioritize userData.fullName.
        // If userData.username is consistently the email, do not use it as a fallback for the full name.
        document.getElementById('profile-fullName').textContent =  userData.fullName || 'Chưa cập nhật';
        
        // Assuming userData.email correctly holds the email address
        document.getElementById('profile-email').textContent = userData.email || 'Chưa cập nhật';
        document.getElementById('profile-phone').textContent = userData.phoneNumber || 'Chưa cập nhật';
        document.getElementById('profile-address').textContent = userData.address || 'Chưa cập nhật';
        
        // Also update edit form fields
        // For the "Họ và tên" edit field, also prioritize userData.fullName
        document.getElementById('edit-fullName').value = userData.fullName || '';
        
        document.getElementById('edit-email').value = userData.email || ''; // Email is typically not editable here or handled differently
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
        
        // Ensure this.userData and this.userData.id are available
        if (!this.userData || !this.userData.id) {
            toastManager.showToast('Lỗi: Không tìm thấy thông tin người dùng để cập nhật.', 'error');
            return;
        }

        const updatedData = {
            // Make sure to get the value from the 'edit-fullName' input field
            fullName: document.getElementById('edit-fullName').value.trim(),
            phoneNumber: document.getElementById('edit-phone').value.trim(),
            address: document.getElementById('edit-address').value.trim()
            // Add other fields like gender if they are editable and part of your UserUpdateRequest DTO
            // e.g., gender: document.getElementById('edit-gender') ? document.getElementById('edit-gender').value : this.userData.gender
        };

        // Basic validation: ensure fullName is not empty if it's a required field for update
        if (!updatedData.fullName) {
            toastManager.showToast('Họ và tên không được để trống.', 'warning');
            // Optionally focus the field: document.getElementById('edit-fullName').focus();
            return;
        }

        const saveButton = document.getElementById('save-profile-changes-btn');
        const originalButtonText = saveButton.innerHTML;
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang lưu...';
        
        // Update user data via API
        apiService.put(`/users/${this.userData.id}`, updatedData)
            .then(response => {
                // The response should be the updated user object
                this.userData = response; // Update local cache of user data
                localStorage.setItem('currentUser', JSON.stringify(response)); // Also update localStorage
                
                this.updateProfileUI(response); // Refresh the UI with the new data
                this.hideEditProfileForm();
                toastManager.showToast('Thông tin cá nhân đã được cập nhật thành công!', 'success');

                // If the name is displayed in other parts of the page (e.g., header),
                // you might need to trigger an update there as well.
                // For example, if accountManager handles header updates:
                if (window.accountManager && typeof window.accountManager.updateUserUI === 'function') {
                    window.accountManager.updateUserUI(response);
                }

            })
            .catch(error => {
                console.error('Error updating profile:', error);
                let errorMessage = 'Không thể cập nhật thông tin. Vui lòng thử lại sau.';
                if (error && error.message) {
                    errorMessage = error.message; // Use error message from API if available
                } else if (error && error.data && error.data.message) {
                    errorMessage = error.data.message;
                }
                toastManager.showToast(errorMessage, 'error');
            })
            .finally(() => {
                saveButton.disabled = false;
                saveButton.innerHTML = originalButtonText;
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