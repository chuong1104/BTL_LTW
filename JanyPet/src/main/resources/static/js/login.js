/**
 * JanyPet Login, Registration, and Password Reset Script
 */
document.addEventListener("DOMContentLoaded", () => {
  // Make sure authService is loaded
  if (!window.authService) {
    console.error("Auth Service not loaded!");
    // Attempt to initialize if it was missed
    if (window.initAuth) window.initAuth();
    if (!window.authService) return;
  }

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
  // Add handler for forgot password form if needed
  // if (forgotPasswordForm) { ... }

  // Generate initial captchas for all forms
  generateCaptcha(); // For login form
  generateCaptcha('register');
  generateCaptcha('forgotPassword');
});

async function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  const username = form.querySelector('[name="username"]').value;
  const password = form.querySelector('[name="password"]').value;
  const rememberMe = form.querySelector('#rememberMe').checked;
  const captchaInput = form.querySelector('[name="captcha"]').value;
  const captchaText = document.getElementById('captchaText').textContent;

  if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
    showAlert('loginAlert', 'Mã xác thực không đúng.', 'danger');
    generateCaptcha();
    return;
  }

  try {
    const result = await window.authService.login(username, password, rememberMe);
    if (result.success) {
      showAlert('loginAlert', 'Đăng nhập thành công! Đang chuyển hướng...', 'success');
      setTimeout(() => {
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
        window.location.href = redirectUrl;
      }, 1000);
    } else {
      throw new Error(result.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  } catch (error) {
    showAlert('loginAlert', error.message, 'danger');
    generateCaptcha();
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const form = e.target;
  const userData = {
    userName: form.querySelector('[name="userName"]').value,
    email: form.querySelector('[name="email"]').value,
    phoneNumber: form.querySelector('[name="phoneNumber"]').value,
    password: form.querySelector('[name="password"]').value,
    confirmPassword: form.querySelector('[name="confirmPassword"]').value,
  };
  const captchaInput = form.querySelector('[name="captcha"]').value;
  const captchaText = document.getElementById('registerCaptchaText').textContent;

  if (userData.password !== userData.confirmPassword) {
    showAlert('registerAlert', 'Mật khẩu xác nhận không khớp.', 'danger');
    return;
  }
  if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
    showAlert('registerAlert', 'Mã xác thực không đúng.', 'danger');
    generateCaptcha('register');
    return;
  }

  try {
    const result = await window.authService.register(userData);
    if (result.success) {
      showAlert('registerAlert', 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.', 'success');
      setTimeout(() => toggleForms('login'), 2000);
    } else {
      throw new Error(result.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  } catch (error) {
    showAlert('registerAlert', error.message, 'danger');
    generateCaptcha('register');
  }
}

function showAlert(alertId, message, type = 'danger') {
  const alertElement = document.getElementById(alertId);
  if (!alertElement) return;

  alertElement.className = `alert alert-${type}`;
  alertElement.innerHTML = `${message} <span class="close-btn" onclick="this.parentElement.classList.add('hide')">&times;</span>`;
  alertElement.classList.remove('hide');

  setTimeout(() => {
    if (alertElement) alertElement.classList.add('hide');
  }, 5000);
}

function toggleForms(formToShow) {
  const formsContainer = document.getElementById('formsContainer');
  const forms = formsContainer.querySelectorAll('form');
  forms.forEach(form => {
    if (form.id === `${formToShow}Form`) {
      form.classList.add('form-active');
      form.classList.remove('hide');
    } else {
      form.classList.add('hide');
      form.classList.remove('form-active');
    }
  });
}

function showForgotPassword() {
  toggleForms('forgotPassword');
}

function togglePassword(iconElement) {
  const input = iconElement.previousElementSibling;
  if (input.type === 'password') {
    input.type = 'text';
    iconElement.classList.remove('fa-eye');
    iconElement.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    iconElement.classList.remove('fa-eye-slash');
    iconElement.classList.add('fa-eye');
  }
}

function generateCaptcha(formPrefix = 'login') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let captcha = '';
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const captchaId = formPrefix === 'login' ? 'captchaText' : `${formPrefix}CaptchaText`;
  const captchaTextElement = document.getElementById(captchaId);
  if (captchaTextElement) {
    captchaTextElement.textContent = captcha;
  }
}

function checkPasswordStrength() {
  const password = document.getElementById('registerPassword').value;
  const meter = document.getElementById('passwordStrengthMeter');
  const text = document.getElementById('passwordStrengthText');
  if (!meter || !text) return;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  meter.className = 'password-strength-meter';
  switch (score) {
    case 0:
    case 1:
    case 2:
      meter.classList.add('weak');
      text.textContent = 'Mật khẩu yếu';
      break;
    case 3:
    case 4:
      meter.classList.add('medium');
      text.textContent = 'Mật khẩu trung bình';
      break;
    case 5:
      meter.classList.add('strong');
      text.textContent = 'Mật khẩu mạnh';
      break;
    default:
      text.textContent = '';
  }
}

// Expose functions to global scope for HTML onclick handlers
window.toggleForms = toggleForms;
window.showForgotPassword = showForgotPassword;
window.togglePassword = togglePassword;
window.generateCaptcha = generateCaptcha;
window.checkPasswordStrength = checkPasswordStrength;
// Dummy function for the other password strength checker to avoid errors
window.checkNewPasswordStrength = () => {};