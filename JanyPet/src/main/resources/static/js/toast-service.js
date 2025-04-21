/**
 * Toast Service - Handles toast notifications
 */
const ToastService = {
  // Toast types
  types: {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
  },

  // Show toast
  show: function (type, message, duration = 3000) {
    const toast = document.getElementById("toast")
    if (!toast) return

    const toastIcon = toast.querySelector("i")
    const toastMessage = toast.querySelector(".toast-message")
    const toastProgress = toast.querySelector(".toast-progress")

    // Set toast type
    toast.className = "toast"
    toast.classList.add(type)

    // Set icon
    toastIcon.className = ""
    switch (type) {
      case this.types.SUCCESS:
        toastIcon.className = "fas fa-check-circle"
        break
      case this.types.ERROR:
        toastIcon.className = "fas fa-exclamation-circle"
        break
      case this.types.WARNING:
        toastIcon.className = "fas fa-exclamation-triangle"
        break
      case this.types.INFO:
      default:
        toastIcon.className = "fas fa-info-circle"
        break
    }

    // Set message
    toastMessage.textContent = message

    // Reset animation
    if (toastProgress) {
      toastProgress.style.animation = "none"
      toastProgress.offsetHeight // Trigger reflow
      toastProgress.style.animation = `progress ${duration / 1000}s linear`
    }

    // Show toast
    toast.classList.add("show")

    // Auto hide after specified duration
    clearTimeout(this.toastTimeout)
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove("show")
    }, duration)
  },

  // Show success toast
  success: function (message, duration) {
    this.show(this.types.SUCCESS, message, duration)
  },

  // Show error toast
  error: function (message, duration) {
    this.show(this.types.ERROR, message, duration)
  },

  // Show warning toast
  warning: function (message, duration) {
    this.show(this.types.WARNING, message, duration)
  },

  // Show info toast
  info: function (message, duration) {
    this.show(this.types.INFO, message, duration)
  },
}

// Initialize toast events
document.addEventListener("DOMContentLoaded", () => {
  const toast = document.getElementById("toast")
  if (toast) {
    // Add click event to close toast
    toast.addEventListener("click", function () {
      this.classList.remove("show")
    })
  }
})

// Set global variable for use in other files
window.ToastService = ToastService
