// toast-service.js
// Make this a global service without using modules

// Toast notification service
class ToastService {
  constructor() {
    this.toast = document.getElementById("toast");
    this.toastMessage = document.querySelector(".toast-message");
    this.toastIcon = document.querySelector(".toast-content i");
    this.toastProgress = document.querySelector(".toast-progress");
  }

  show(message, type = "success", duration = 3000) {
    if (!this.toast || !this.toastMessage) return;

    // Set message
    this.toastMessage.textContent = message;

    // Set icon and color based on type
    if (type === "success") {
      this.toastIcon.className = "fas fa-check-circle";
      this.toastIcon.style.color = "var(--success-color)";
      this.toastProgress.style.backgroundColor = "var(--success-color)";
    } else if (type === "error") {
      this.toastIcon.className = "fas fa-exclamation-circle";
      this.toastIcon.style.color = "var(--danger-color)";
      this.toastProgress.style.backgroundColor = "var(--danger-color)";
    } else if (type === "warning") {
      this.toastIcon.className = "fas fa-exclamation-triangle";
      this.toastIcon.style.color = "var(--warning-color)";
      this.toastProgress.style.backgroundColor = "var(--warning-color)";
    } else if (type === "info") {
      this.toastIcon.className = "fas fa-info-circle";
      this.toastIcon.style.color = "var(--info-color)";
      this.toastProgress.style.backgroundColor = "var(--info-color)";
    }

    // Show toast
    this.toast.style.display = "block";

    // Auto-hide after specified duration
    setTimeout(() => {
      this.toast.style.display = "none";
    }, duration);
  }
}

// Initialize toast service and make it globally available
window.toastService = new ToastService();

// Function to show toast (for backward compatibility)
function showToast(message, type = "success", duration = 3000) {
  window.toastService.show(message, type, duration);
}

// Make showToast globally available
window.showToast = showToast;