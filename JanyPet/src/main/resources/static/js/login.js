/**
 * Login handler for JanyPet
 * Handles login form submission and authentication
 */
document.addEventListener('DOMContentLoaded', function() {
  // Login form handling
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('remember-me')?.checked || false;
      
      // Basic validation
      if (!username || !password) {
        window.toastManager.showToast('Vui lòng nhập tên đăng nhập và mật khẩu', 'error');
        return;
      }
      
      // Simulate login API call
      simulateLogin(username, password, rememberMe);
    });
  }
  
  // Register form handling
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const fullname = document.getElementById('fullname').value;
      const email = document.getElementById('email').value;
      const username = document.getElementById('reg-username').value;
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Basic validation
      if (!fullname || !email || !username || !password) {
        window.toastManager.showToast('Vui lòng điền đầy đủ thông tin', 'error');
        return;
      }
      
      if (password !== confirmPassword) {
        window.toastManager.showToast('Mật khẩu không khớp', 'error');
        return;
      }
      
      // Simulate register API call
      simulateRegister(fullname, email, username, password);
    });
  }
  
  /**
   * Simulate login API call
   * In a real application, this would be an API call to your backend
   */
  function simulateLogin(username, password, rememberMe) {
    // Show loading state
    const loginBtn = document.querySelector('#loginForm button[type="submit"]');
    if (loginBtn) {
      loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang đăng nhập...';
      loginBtn.disabled = true;
    }
    
    // Simulate API delay
    setTimeout(() => {
      // For demo, we'll accept any username/password, but you would check against your backend
      const user = {
        id: 1,
        username: username,
        name: username,
        email: `${username}@example.com`,
        isAdmin: username.toLowerCase() === 'admin' // Make 'admin' an admin user
      };
      
      // Login through auth service
      if (window.authService) {
        window.authService.login(user);
        
        // Show success message
        if (window.toastManager) {
          window.toastManager.showToast('Đăng nhập thành công!', 'success');
        }
        
        // Redirect to home page
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        console.error('Auth service not available');
        alert('Đăng nhập thành công!');
        window.location.href = 'index.html';
      }
    }, 1500);
  }
  
  /**
   * Simulate register API call
   * In a real application, this would be an API call to your backend
   */
  function simulateRegister(fullname, email, username, password) {
    // Show loading state
    const registerBtn = document.querySelector('#registerForm button[type="submit"]');
    if (registerBtn) {
      registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang đăng ký...';
      registerBtn.disabled = true;
    }
    
    // Simulate API delay
    setTimeout(() => {
      // Create user object
      const user = {
        id: Date.now(),
        username: username,
        name: fullname,
        email: email,
        isAdmin: false
      };
      
      // Login through auth service
      if (window.authService) {
        window.authService.login(user);
        
        // Show success message
        if (window.toastManager) {
          window.toastManager.showToast('Đăng ký thành công!', 'success');
        }
        
        // Redirect to home page
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        console.error('Auth service not available');
        alert('Đăng ký thành công!');
        window.location.href = 'index.html';
      }
    }, 1500);
  }
});