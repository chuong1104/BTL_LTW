/**
 * Quản lý danh sách yêu thích (Wishlist)
 */

// Khởi tạo wishlist từ localStorage hoặc tạo mảng rỗng
function getWishlist() {
  const wishlistJSON = localStorage.getItem('wishlist');
  return wishlistJSON ? JSON.parse(wishlistJSON) : [];
}

// Lưu wishlist vào localStorage
function saveWishlist(wishlist) {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
}

// Thêm sản phẩm vào wishlist
function addToWishlist(id, name, price, image) {
  const wishlist = getWishlist();
  
  // Kiểm tra xem sản phẩm đã có trong wishlist chưa
  const existingItemIndex = wishlist.findIndex(item => item.id === id);
  
  if (existingItemIndex === -1) {
    // Nếu sản phẩm chưa có trong wishlist, thêm vào
    wishlist.push({
      id: id,
      name: name,
      price: price,
      image: image
    });
    
    saveWishlist(wishlist);
    showToast(`Đã thêm "${name}" vào danh sách yêu thích!`, 'success');
  } else {
    // Nếu sản phẩm đã có trong wishlist, thông báo
    showToast(`Sản phẩm "${name}" đã có trong danh sách yêu thích!`, 'info');
  }
}

// Xóa sản phẩm khỏi wishlist
function removeFromWishlist(id) {
  const wishlist = getWishlist();
  const itemToRemove = wishlist.find(item => item.id === id);
  
  if (itemToRemove) {
    const newWishlist = wishlist.filter(item => item.id !== id);
    saveWishlist(newWishlist);
    
    showToast(`Đã xóa "${itemToRemove.name}" khỏi danh sách yêu thích!`, 'info');
    loadWishlist(); // Tải lại danh sách
  }
}

// Xóa tất cả sản phẩm khỏi wishlist
function clearWishlist() {
  if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?')) {
    localStorage.removeItem('wishlist');
    updateWishlistCount();
    loadWishlist(); // Tải lại danh sách
    showToast('Đã xóa tất cả sản phẩm khỏi danh sách yêu thích!', 'info');
  }
}

// Chuyển sản phẩm từ wishlist sang giỏ hàng
function moveToCart(id) {
  const wishlist = getWishlist();
  const itemToMove = wishlist.find(item => item.id === id);
  
  if (itemToMove) {
    // Thêm vào giỏ hàng
    addToCart(itemToMove.id, itemToMove.name, itemToMove.price, itemToMove.image, 1);
    
    // Hiển thị thông báo
    showToast(`Đã thêm "${itemToMove.name}" vào giỏ hàng!`, 'success');
  }
}

// Cập nhật số lượng sản phẩm trong wishlist hiển thị trên biểu tượng
function updateWishlistCount() {
  const wishlist = getWishlist();
  const countElements = document.querySelectorAll('.wishlist-count');
  
  countElements.forEach(element => {
    element.textContent = wishlist.length;
    
    // Thêm hiệu ứng nếu số lượng > 0
    if (wishlist.length > 0) {
      element.classList.add('badge-pulse');
      setTimeout(() => {
        element.classList.remove('badge-pulse');
      }, 500);
    }
  });
}

// Hiển thị danh sách wishlist
function loadWishlist() {
  const wishlist = getWishlist();
  const wishlistContainer = document.getElementById('wishlist-items');
  const emptyWishlist = document.getElementById('empty-wishlist');
  const wishlistContent = document.getElementById('wishlist-content');
  
  // Cập nhật số lượng trên biểu tượng
  updateWishlistCount();
  
  // Kiểm tra xem wishlist có rỗng không
  if (wishlist.length === 0) {
    if (emptyWishlist) emptyWishlist.style.display = 'block';
    if (wishlistContent) wishlistContent.style.display = 'none';
    return;
  }
  
  // Hiển thị nội dung wishlist nếu có sản phẩm
  if (emptyWishlist) emptyWishlist.style.display = 'none';
  if (wishlistContent) wishlistContent.style.display = 'block';
  
  // Nếu wishlistContainer không tồn tại, không tiếp tục
  if (!wishlistContainer) return;
  
  // Xóa nội dung cũ
  wishlistContainer.innerHTML = '';
  
  // Thêm từng sản phẩm vào danh sách
  wishlist.forEach(item => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td class="py-4">
        <div class="d-flex align-items-center">
          <img src="${item.image}" alt="${item.name}" class="img-fluid rounded-3" style="max-width: 80px;">
          <div class="ms-3">
            <h5 class="mb-0">
              <a href="single-product.html?id=${item.id}" class="text-decoration-none text-dark">${item.name}</a>
            </h5>
          </div>
        </div>
      </td>
      <td class="py-4 align-middle">
        <span class="secondary-font fw-medium">${formatCurrency(item.price)}</span>
      </td>
      <td class="py-4 align-middle">
        <span class="badge bg-success py-2 px-3">Còn hàng</span>
      </td>
      <td class="py-4 align-middle text-end">
        <div class="d-flex justify-content-end align-items-center">
          <button class="btn btn-primary rounded-pill me-2" onclick="moveToCart('${item.id}')">
            <i class="fas fa-cart-plus me-1"></i> Thêm vào giỏ
          </button>
          <button class="btn btn-outline-danger rounded-circle" onclick="removeFromWishlist('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    
    wishlistContainer.appendChild(row);
  });
}

// Hiển thị toast thông báo
function showToast(message, type) {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
  
  // Xóa toast sau khi đóng
  toast.addEventListener('hidden.bs.toast', function() {
    toast.remove();
  });
}

// Định dạng tiền tệ
function formatCurrency(amount) {
  return amount.toLocaleString('vi-VN') + '₫';
}

// Cập nhật số lượng khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
  updateWishlistCount();
});