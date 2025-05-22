// Login page script
document.addEventListener("DOMContentLoaded", async function () {
  // Generate captcha immediately when page loads
  generateCaptcha();
  generateCaptcha("register"); 
  generateCaptcha("forgotPassword");

  // Then wait for auth service
  while (!window.authService) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Check if auth service is loaded
  if (!window.authService) {
    console.error("Authentication service not loaded");
    return;
  }

  // Initialize other components
  setupFormListeners();

  // Check URL parameters for tab selection
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("register") === "true") {
    toggleForms("register");
  }
});

// Set up form event listeners
function setupFormListeners() {
  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  // Register form
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegisterSubmit);
  }

  // Forgot password form
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", handleForgotPasswordSubmit);
  }

  // Reset password form
  const resetPasswordForm = document.getElementById("resetPasswordForm");
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", handleResetPasswordSubmit);
  }
}

// Handle login form submission
async function handleLoginSubmit(e) {
  e.preventDefault(); // Prevent form submission
  hideAlert("login");

  const form = document.getElementById("loginForm");
  const username = form.querySelector('input[name="username"]').value;
  const password = form.querySelector('input[name="password"]').value;
  const captchaInput = form.querySelector('input[name="captcha"]').value;
  const rememberMe = form.querySelector("#rememberMe")?.checked || false;

  // Validate inputs
  if (!username || !password) {
    showAlert("login", "Vui lòng nhập đầy đủ thông tin", "danger");
    return;
  }

  if (!validateCaptcha(captchaInput, "captchaText")) {
    showAlert("login", "Mã xác thực không đúng", "danger");
    generateCaptcha();
    return;
  }

  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
  submitBtn.disabled = true;

  try {
    const result = await window.authService.login(username, password, rememberMe);

    if (result.success) {
      showAlert("login", "Đăng nhập thành công!", "success");
      
      // Redirect based on user role
      const user = window.authService.getCurrentUser();
      if (user && window.authService.hasRole("ADMIN")) {
        showAlert("login", "Tài khoản admin không được phép đăng nhập tại đây. Vui lòng sử dụng trang đăng nhập admin.", "danger");
        setTimeout(() => {
          window.location.href = "/login_admin.html";
        }, 2000);
      } else {
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 1000);
      }
    } else {
      showAlert("login", result.message || "Đăng nhập thất bại", "danger");
      generateCaptcha();
    }
  } catch (error) {
    console.error("Login error:", error);
    showAlert("login", "Đã xảy ra lỗi khi đăng nhập", "danger");
    generateCaptcha();
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// Handle register form submission
async function handleRegisterSubmit(e) {
  e.preventDefault();
  hideAlert("register");

  const form = document.getElementById("registerForm");
  const userName = form.querySelector('input[name="userName"]').value;
  const email = form.querySelector('input[name="email"]').value;
  const phoneNumber = form.querySelector('input[name="phoneNumber"]').value;
  const password = form.querySelector('input[name="password"]').value;
  const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
  const captchaInput = form.querySelector('input[name="captcha"]').value;

  // Validate inputs
  if (!userName || !email || !phoneNumber || !password || !confirmPassword) {
    showAlert("register", "Vui lòng nhập đầy đủ thông tin", "danger");
    return;
  }

  if (!validateEmail(email)) {
    showAlert("register", "Email không đúng định dạng", "danger");
    return;
  }

  if (!validatePhone(phoneNumber)) {
    showAlert("register", "Số điện thoại không đúng định dạng", "danger");
    return;
  }

  if (password !== confirmPassword) {
    showAlert("register", "Mật khẩu xác nhận không khớp", "danger");
    return;
  }

  if (!validateCaptcha(captchaInput, "registerCaptchaText")) {
    showAlert("register", "Mã xác thực không đúng", "danger");
    generateCaptcha("register");
    return;
  }

  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
  submitBtn.disabled = true;

  try {
    const result = await window.authService.register({
      username: userName,
      email,
      phoneNumber,
      password,
      confirmPassword
    });

    if (result.success) {
      showAlert("register", "Đăng ký thành công! Vui lòng đăng nhập.", "success");
      form.reset();

      setTimeout(() => {
        toggleForms("login");
      }, 2000);
    } else {
      showAlert("register", result.message || "Đăng ký thất bại", "danger");
      generateCaptcha("register");
    }
  } catch (error) {
    console.error("Registration error:", error);
    showAlert("register", "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.", "danger");
    generateCaptcha("register");
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// Handle forgot password form submission
async function handleForgotPasswordSubmit(e) {
  e.preventDefault();
  hideAlert("forgotPassword");

  const form = document.getElementById("forgotPasswordForm");
  const emailOrPhone = form.querySelector('input[name="emailOrPhone"]').value;
  const captchaInput = form.querySelector('input[name="captcha"]').value;

  if (!emailOrPhone) {
    showAlert("forgotPassword", "Vui lòng nhập email hoặc số điện thoại", "danger");
    return;
  }

  if (!validateCaptcha(captchaInput, "forgotPasswordCaptchaText")) {
    showAlert("forgotPassword", "Mã xác thực không đúng", "danger");
    generateCaptcha("forgotPassword");
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
  submitBtn.disabled = true;

  try {
    setTimeout(() => {
      showAlert("forgotPassword", "Link đặt lại mật khẩu đã được gửi đến email/số điện thoại của bạn", "success");
      setTimeout(() => {
        toggleForms("resetPassword");
      }, 2000);
    }, 1500);
  } catch (error) {
    console.error("Forgot password error:", error);
    showAlert("forgotPassword", "Đã xảy ra lỗi. Vui lòng thử lại sau.", "danger");
    generateCaptcha("forgotPassword");
  } finally {
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 1500);
  }
}

// Handle reset password form submission
async function handleResetPasswordSubmit(e) {
  e.preventDefault();
  hideAlert("resetPassword");

  const form = document.getElementById("resetPasswordForm");
  const newPassword = form.querySelector('input[name="newPassword"]').value;
  const confirmNewPassword = form.querySelector('input[name="confirmNewPassword"]').value;

  if (!newPassword || !confirmNewPassword) {
    showAlert("resetPassword", "Vui lòng nhập đầy đủ thông tin", "danger");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    showAlert("resetPassword", "Mật khẩu xác nhận không khớp", "danger");
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
  submitBtn.disabled = true;

  try {
    setTimeout(() => {
      showAlert("resetPassword", "Mật khẩu đã được cập nhật thành công!", "success");
      setTimeout(() => {
        toggleForms("login");
      }, 2000);
    }, 1500);
  } catch (error) {
    console.error("Reset password error:", error);
    showAlert("resetPassword", "Đã xảy ra lỗi. Vui lòng thử lại sau.", "danger");
  } finally {
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 1500);
  }
}

// Toggle between forms
function toggleForms(formType) {
  const forms = {
    login: document.getElementById("loginForm"),
    register: document.getElementById("registerForm"),
    forgotPassword: document.getElementById("forgotPasswordForm"),
    resetPassword: document.getElementById("resetPasswordForm"),
  };

  Object.values(forms).forEach((form) => {
    if (form) form.className = "hide";
  });

  if (forms[formType]) {
    forms[formType].className = "form-active";
    if (formType === "register") {
      generateCaptcha("register");
    } else if (formType === "forgotPassword") {
      generateCaptcha("forgotPassword");
    } else if (formType === "login") {
      generateCaptcha();
    }
  }

  Object.keys(forms).forEach((key) => {
    if (forms[key]) hideAlert(key);
  });

  const formsContainer = document.getElementById("formsContainer");
  if (formsContainer && forms[formType]) {
    formsContainer.style.height = forms[formType].offsetHeight + "px";
  }
}

// Show forgot password form
function showForgotPassword() {
  toggleForms("forgotPassword");
}

// Toggle password visibility
function togglePassword(icon) {
  const passwordInput = icon.previousElementSibling;
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// Generate CAPTCHA
function generateCaptcha(formPrefix = "") {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const captchaTextId = formPrefix ? formPrefix + "CaptchaText" : "captchaText";
  const captchaElement = document.getElementById(captchaTextId);
  if (captchaElement) {
    captchaElement.textContent = captcha;
  }

  return captcha;
}

// Validate CAPTCHA
function validateCaptcha(captchaInput, captchaTextId) {
  const captchaText = document.getElementById(captchaTextId)?.textContent;
  return captchaInput === captchaText;
}

// Check password strength
function checkPasswordStrength() {
  const password = document.getElementById("registerPassword").value;
  const meter = document.getElementById("passwordStrengthMeter");
  const text = document.getElementById("passwordStrengthText");

  meter.className = "";
  meter.style.width = "0";
  text.textContent = "";

  if (password.length === 0) return;

  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  if (strength <= 2) {
    meter.className = "weak";
    text.textContent = "Yếu";
    text.style.color = "#F44336";
  } else if (strength === 3) {
    meter.className = "medium";
    text.textContent = "Trung bình";
    text.style.color = "#FFC107";
  } else {
    meter.className = "strong";
    text.textContent = "Mạnh";
    text.style.color = "#4CAF50";
  }
}

function checkNewPasswordStrength() {
  const password = document.getElementById("newPassword").value;
  const meter = document.getElementById("newPasswordStrengthMeter");
  const text = document.getElementById("newPasswordStrengthText");

  meter.className = "";
  meter.style.width = "0";
  text.textContent = "";

  if (password.length === 0) return;

  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  if (strength <= 2) {
    meter.className = "weak";
    text.textContent = "Yếu";
    text.style.color = "#F44336";
  } else if (strength === 3) {
    meter.className = "medium";
    text.textContent = "Trung bình";
    text.style.color = "#FFC107";
  } else {
    meter.className = "strong";
    text.textContent = "Mạnh";
    text.style.color = "#4CAF50";
  }
}

// Validation helpers
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^(0|84|\+84)(\d{9,10})$/;
  return phoneRegex.test(phone);
}

// Alert helpers
function showAlert(formId, message, type) {
  const alertEl = document.getElementById(formId + "Alert");
  if (!alertEl) return;

  alertEl.innerHTML = message + '<span class="close-btn" onclick="closeAlert(\'' + formId + '\')"><i class="fas fa-times"></i></span>';
  alertEl.className = "alert alert-" + type;
}

function closeAlert(formId) {
  const alertEl = document.getElementById(formId + "Alert");
  if (alertEl) alertEl.className = "alert hide";
}

function hideAlert(formId) {
  closeAlert(formId);
}