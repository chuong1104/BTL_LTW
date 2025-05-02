/**
 * Toast Manager for JanyPet
 * Handles displaying toast notifications
 */
class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      // Create or get toast container
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '1050';
        document.body.appendChild(container);
      }
      this.container = container;
    });
  }

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - The type of toast (success, error, warning, info)
   * @param {number} duration - Duration in milliseconds
   */
  showToast(message, type = 'info', duration = 3000) {
    if (!message) return;
    
    if (!this.container && document.readyState !== 'loading') {
      this.init();
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.className = `toast show align-items-center text-white bg-${this.getColorClass(type)} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Create toast content
    const toastContent = `
      <div class="d-flex">
        <div class="toast-body">
          ${this.getIcon(type)} ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    toast.innerHTML = toastContent;
    
    // Add toast to container
    if (this.container) {
      this.container.appendChild(toast);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this.container.appendChild(toast);
      });
    }
    
    // Remove toast after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (document.getElementById(toastId)) {
          document.getElementById(toastId).remove();
        }
      }, 300);
    }, duration);
    
    // Add click listener to close button
    const closeBtn = toast.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
          if (document.getElementById(toastId)) {
            document.getElementById(toastId).remove();
          }
        }, 300);
      });
    }
  }
  
  /**
   * Get bootstrap color class based on toast type
   */
  getColorClass(type) {
    switch (type.toLowerCase()) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'primary';
    }
  }
  
  /**
   * Get icon based on toast type
   */
  getIcon(type) {
    switch (type.toLowerCase()) {
      case 'success': return '<i class="fas fa-check-circle me-2"></i>';
      case 'error': return '<i class="fas fa-exclamation-circle me-2"></i>';
      case 'warning': return '<i class="fas fa-exclamation-triangle me-2"></i>';
      case 'info': return '<i class="fas fa-info-circle me-2"></i>';
      default: return '<i class="fas fa-bell me-2"></i>';
    }
  }
}

// Initialize toast manager
const toastManager = new ToastManager();
window.toastManager = toastManager;

/**
 * Show toast used across the application
 */
function showToast(message, type = 'info', duration = 3000) {
  window.toastManager.showToast(message, type, duration);
}

// Initialize event listeners for buttons with data-toast attribute
document.addEventListener('DOMContentLoaded', function() {
  // Handle elements with data-toast attribute
  document.addEventListener('click', function(event) {
    const target = event.target.closest('[data-toast]');
    if (target) {
      event.preventDefault();
      
      const message = target.getAttribute('data-toast-message') || 'Thao tác thành công!';
      const type = target.getAttribute('data-toast-type') || 'success';
      const duration = parseInt(target.getAttribute('data-toast-duration') || 3000);
      
      showToast(message, type, duration);
    }
  });
  
  // Add condition to skip direct navigation buttons
  document.querySelectorAll('a[href="shop.html"], a[href="booking.html"]').forEach(button => {
    button.addEventListener('click', function(event) {
      // Remove all event prevention for navigation
      event.stopPropagation();
    });
  });
  
  // Handle add to cart button
  document.querySelectorAll('.btn-cart').forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      showToast('Sản phẩm đã được thêm vào giỏ hàng!', 'success');
    });
  });
  
  // Handle wishlist button
  document.querySelectorAll('.btn-wishlist').forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      showToast('Sản phẩm đã được thêm vào danh sách yêu thích!', 'info');
    });
  });
  
  // Handle add to cart button in quick view modal
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      showToast('Sản phẩm đã được thêm vào giỏ hàng!', 'success');
    });
  });
});