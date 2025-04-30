/**
 * Toast notification manager
 * Đảm bảo chỉ hiển thị một thông báo tại một thời điểm
 */
class ToastManager {
  constructor() {
    this.toastContainer = document.getElementById('toast-container');
    if (!this.toastContainer) {
      this.createToastContainer();
    }
    this.activeToasts = {};
    this.queue = [];
    this.isShowing = false;
  }

  createToastContainer() {
    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'toast-container';
    this.toastContainer.className = 'toast-container';
    document.body.appendChild(this.toastContainer);
  }

  /**
   * Hiển thị thông báo
   * @param {string} message - Nội dung thông báo
   * @param {string} type - Loại thông báo (success, error, info, warning)
   * @param {number} duration - Thời gian hiển thị (ms)
   */
  show(message, type = 'info', duration = 3000) {
    // Nếu đã có thông báo cùng loại, không hiển thị nữa
    if (this.activeToasts[type]) {
      return;
    }

    // Tạo ID duy nhất cho toast
    const toastId = `toast-${Date.now()}`;
    
    // Tạo element toast
    const toast = this.createToastElement(message, type, toastId);
    
    // Thêm vào container
    this.toastContainer.appendChild(toast);
    
    // Hiển thị toast
    setTimeout(() => {
      toast.classList.add('show');
      
      // Khởi tạo progress bar
      const progressBar = toast.querySelector('.toast-progress-bar');
      if (progressBar) {
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '0%';
      }
      
      // Lưu thông báo đang hiển thị
      this.activeToasts[type] = toastId;
      
      // Tự động ẩn sau duration
      setTimeout(() => {
        this.hideToast(toastId, type);
      }, duration);
    }, 10);
    
    // Xử lý sự kiện đóng toast
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideToast(toastId, type);
      });
    }
  }

  /**
   * Tạo element toast
   */
  createToastElement(message, type, id) {
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Icon cho mỗi loại toast
    let icon;
    switch (type) {
      case 'success':
        icon = '<i class="fas fa-check"></i>';
        break;
      case 'error':
        icon = '<i class="fas fa-times"></i>';
        break;
      case 'warning':
        icon = '<i class="fas fa-exclamation"></i>';
        break;
      case 'info':
      default:
        icon = '<i class="fas fa-info"></i>';
        break;
    }
    
    // Tiêu đề cho mỗi loại toast
    let title;
    switch (type) {
      case 'success':
        title = 'Thành công!';
        break;
      case 'error':
        title = 'Lỗi!';
        break;
      case 'warning':
        title = 'Cảnh báo!';
        break;
      case 'info':
      default:
        title = 'Thông báo';
        break;
    }
    
    toast.innerHTML = `
      <div class="toast-header">
        <div class="toast-icon">${icon}</div>
        <strong class="me-auto">${title}</strong>
        <small>vừa xong</small>
        <button type="button" class="btn-close toast-close" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
      <div class="toast-progress">
        <div class="toast-progress-bar" style="width: 100%"></div>
      </div>
    `;
    
    return toast;
  }

  /**
   * Ẩn thông báo
   */
  hideToast(toastId, type) {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        // Xóa khỏi danh sách đang hiển thị
        delete this.activeToasts[type];
      }, 300);
    }
  }
}

// Khởi tạo Toast Manager
const toastManager = new ToastManager();

/**
 * Show toast dùng cho toàn bộ ứng dụng
 */
function showToast(message, type = 'info', duration = 3000) {
  toastManager.show(message, type, duration);
}

// Khởi tạo các sự kiện cho nút có thuộc tính data-toast
document.addEventListener('DOMContentLoaded', function() {
  // Xử lý các phần tử có thuộc tính data-toast
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
  
  // Thêm điều kiện để bỏ qua các nút điều hướng trực tiếp
  document.querySelectorAll('a[href="shop.html"], a[href="booking.html"]').forEach(button => {
    button.addEventListener('click', function(event) {
      // Loại bỏ tất cả sự kiện ngăn chặn điều hướng
      event.stopPropagation();
    });
  });
  
  // Xử lý nút thêm vào giỏ hàng
  document.querySelectorAll('.btn-cart').forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      showToast('Sản phẩm đã được thêm vào giỏ hàng!', 'success');
    });
  });
  
  // Xử lý nút yêu thích
  document.querySelectorAll('.btn-wishlist').forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      showToast('Sản phẩm đã được thêm vào danh sách yêu thích!', 'info');
    });
  });
  
  // Xử lý nút thêm giỏ hàng trong modal quick view
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      showToast('Sản phẩm đã được thêm vào giỏ hàng!', 'success');
    });
  });
});