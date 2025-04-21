/**
 * Admin Login Script
 * Handles admin login functionality
 */
let formSubmitHandler = null

document.addEventListener("DOMContentLoaded", async () => {


  while (!window.authServiceAdmin) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  // Đảm bảo auth service đã load
  if (!window.authServiceAdmin) {
    console.error("Auth service not loaded")
    return
  }

 // Prevent redirect loop by setting a flag in session storage
  const visitedLoginPage = sessionStorage.getItem("visitedLoginPage")
  if (!visitedLoginPage) {
    sessionStorage.setItem("visitedLoginPage", "true")
  }

  // Ki��m tra token hợp lệ - but only if we haven't just been redirected here
  if (visitedLoginPage && window.authServiceAdmin.isAuthenticated()) {
    const currentUser = window.authServiceAdmin.getCurrentUser()
    if (currentUser && window.authServiceAdmin.hasRole("ADMIN")) {
      // Delay redirect to prevent loop
      setTimeout(() => {
        window.location.replace("admin.html")
      }, 300)
      return
    }
  }

  // Set up form submission handler
  const adminLoginForm = document.getElementById("adminLoginForm")
  if (adminLoginForm) {
    formSubmitHandler = handleAdminLogin.bind(adminLoginForm)
    adminLoginForm.addEventListener("submit", formSubmitHandler)
  }

  // Add login instructions to the page
  const formContent = document.querySelector(".form-content")
  if (formContent) {
    const loginInstructions = document.createElement("div")
    loginInstructions.className = "login-instructions"
    loginInstructions.innerHTML = `
      <p style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px; font-size: 13px; color: #666;">
        <strong>Tài khoản mẫu:</strong> admin / admin123
      </p>
    `
    formContent.appendChild(loginInstructions)
  }
});

// Cleanup khi unload
window.addEventListener("unload", () => {
  const adminLoginForm = document.getElementById("adminLoginForm")
  if (adminLoginForm && formSubmitHandler) {
    adminLoginForm.removeEventListener("submit", formSubmitHandler)
  }
  // Clear the visited flag when leaving the page
  sessionStorage.removeItem("visitedLoginPage")
})

/**
 * Handle admin login form submission
 * @param {Event} e - Form submission event
 */
async function handleAdminLogin(e) {
  e.preventDefault();

  if (!window.authServiceAdmin) {
    showAlert("Dịch vụ xác thực chưa được khởi tạo");
    return;
  }

  const loginButton = document.getElementById("loginButton");
  const buttonText = document.getElementById("buttonText");
  const buttonLoader = document.getElementById("buttonLoader");

  if (loginButton && buttonText && buttonLoader) {
    loginButton.disabled = true;
    buttonText.classList.add("hide");
    buttonLoader.classList.remove("hide");
  }

  try {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe")?.checked || false;

    // Sử dụng hàm login từ authServiceAdmin thay vì gọi fetch trực tiếp
    const result = await window.authServiceAdmin.login(username, password, rememberMe);

    if (result.success) {
      const currentUser = window.authServiceAdmin.getCurrentUser();
      if (currentUser && window.authServiceAdmin.hasRole("ADMIN")) {
        showAlert("Đăng nhập thành công! Đang chuyển hướng...", "success");
        setTimeout(() => {
          window.location.replace("/admin.html");
        }, 1000);
      } else {
        showAlert("Tài khoản không có quyền quản trị", "danger");
      }
    } else {
      throw new Error(result.message || "Đăng nhập thất bại");
    }
  } catch (error) {
    console.error("Login error:", error);
    showAlert(error.message || "Có lỗi xảy ra khi đăng nhập");
  } finally {
    if (loginButton && buttonText && buttonLoader) {
      loginButton.disabled = false;
      buttonText.classList.remove("hide");
      buttonLoader.classList.add("hide");
    }
  }
}

/**
 * Show alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (e.g., 'danger', 'success')
 */
function showAlert(message, type = "danger") {
  const alertElement = document.getElementById("loginAlert")
  const alertMessage = document.getElementById("alertMessage")

  if (alertElement && alertMessage) {
    alertElement.className = `alert alert-${type}`
    alertMessage.textContent = message
    alertElement.classList.remove("hide")

    // Auto hide after 5 seconds
    setTimeout(() => {
      alertElement.classList.add("hide")
    }, 5000)
  }
}

/**
 * Close alert
 */
function closeAlert() {
  const alertElement = document.getElementById("loginAlert")
  if (alertElement) {
    alertElement.classList.add("hide")
  }
}

/**
 * Toggle password visibility
 */
function togglePassword() {
  const passwordInput = document.getElementById("password")
  const toggleIcon = document.querySelector(".password-toggle")

  if (passwordInput && toggleIcon) {
    if (passwordInput.type === "password") {
      passwordInput.type = "text"
      toggleIcon.classList.remove("fa-eye")
      toggleIcon.classList.add("fa-eye-slash")
    } else {
      passwordInput.type = "password"
      toggleIcon.classList.remove("fa-eye-slash")
      toggleIcon.classList.add("fa-eye")
    }
  }
}

// Expose functions to window for HTML onclick handlers
window.closeAlert = closeAlert
window.togglePassword = togglePassword
