/**
 * JanyPet - Shopping Cart Management
 * This script handles cart functionality across the website
 */

// Cart variable to store all cart items
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Format price to VND currency format
function formatCurrency(amount) {
  return amount.toLocaleString('vi-VN') + '₫';
}

// Load cart from localStorage
function loadCart() {
  cart = JSON.parse(localStorage.getItem('cart')) || [];
  updateCartUI();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Update all UI elements that display cart information
function updateCartUI() {
  updateCartCount();
  updateCartTable();
  updateCartSummary();
  updateOffcanvasCart();
  updateCheckoutSummary();
}

// Update the cart count in header
function updateCartCount() {
  const cartCountElements = document.querySelectorAll('.badge.bg-primary');
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  cartCountElements.forEach(element => {
    element.textContent = itemCount;
  });
}

// Update cart table on cart.html page
function updateCartTable() {
  const cartTableBody = document.getElementById('cart-items');
  if (!cartTableBody) return;

  cartTableBody.innerHTML = '';

  if (cart.length === 0) {
    cartTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-5">
          <div class="cart-empty-message">
            <i class="fas fa-shopping-cart cart-icon mb-3"></i>
            <h4>Giỏ hàng của bạn đang trống</h4>
            <p class="text-muted">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <a href="shop.html" class="btn btn-primary">Tiếp tục mua sắm</a>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  cart.forEach((item, index) => {
    const total = item.price * item.quantity;
    
    const tr = document.createElement('tr');
    tr.className = 'align-middle';
    tr.innerHTML = `
      <td>
        <div class="d-flex align-items-center">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img rounded me-3" width="80">
          <div>
            <h6 class="mb-0">${item.name}</h6>
            <small class="text-muted">${item.variant || ''}</small>
          </div>
        </div>
      </td>
      <td class="text-center">${formatCurrency(item.price)}</td>
      <td class="text-center">
        <div class="quantity-control d-flex align-items-center justify-content-center">
          <button class="quantity-btn minus-btn" data-index="${index}">-</button>
          <input type="text" class="quantity-input mx-2 text-center" value="${item.quantity}" data-index="${index}">
          <button class="quantity-btn plus-btn" data-index="${index}">+</button>
        </div>
      </td>
      <td class="text-center fw-bold">${formatCurrency(total)}</td>
      <td class="text-center">
        <div class="d-flex flex-column align-items-center">
          <button class="btn btn-sm text-danger mb-1 remove-item" data-index="${index}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </td>
    `;
    
    cartTableBody.appendChild(tr);
  });

  // Add event listeners for quantity buttons and remove buttons
  addCartEventListeners();
}

// Update cart summary on cart.html page
function updateCartSummary() {
  const cartItemsCountElement = document.getElementById('cart-items-count');
  const cartSubtotalElement = document.getElementById('cart-subtotal');
  const cartTotalElement = document.getElementById('cart-total');
  const shippingFeeElement = document.getElementById('shipping-fee');
  
  if (!cartItemsCountElement || !cartSubtotalElement || !cartTotalElement) return;

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  cartItemsCountElement.textContent = itemCount;
  cartSubtotalElement.textContent = formatCurrency(subtotal);
  
  // Get shipping fee based on selected shipping method
  let shippingFee = 0;
  const fastShipping = document.getElementById('fastShipping');
  const sameDay = document.getElementById('sameDay');
  
  if (fastShipping && fastShipping.checked) {
    shippingFee = 30000;
  } else if (sameDay && sameDay.checked) {
    shippingFee = 50000;
  }
  
  if (shippingFeeElement) {
    shippingFeeElement.textContent = shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee);
  }
  
  const total = subtotal + shippingFee;
  cartTotalElement.textContent = formatCurrency(total);
}

// Update offcanvas cart (mini cart)
function updateOffcanvasCart() {
  const offcanvasCartList = document.getElementById('offcanvas-cart-list');
  const offcanvasCartTotal = document.getElementById('offcanvas-cart-total');
  
  if (!offcanvasCartList || !offcanvasCartTotal) return;

  offcanvasCartList.innerHTML = '';
  
  if (cart.length === 0) {
    offcanvasCartList.innerHTML = '<li class="list-group-item">Giỏ hàng trống</li>';
    offcanvasCartTotal.textContent = '0₫';
    return;
  }
  
  let total = 0;
  
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between lh-sm';
    li.innerHTML = `
      <div class="d-flex">
        <img src="${item.image}" alt="${item.name}" class="img-fluid me-2" style="width: 50px; height: 50px; object-fit: cover;">
        <div>
          <h6 class="my-0">${item.name}</h6>
          <small class="text-muted">${formatCurrency(item.price)} x ${item.quantity}</small>
        </div>
      </div>
      <span class="text-muted">${formatCurrency(itemTotal)}</span>
    `;
    
    offcanvasCartList.appendChild(li);
  });
  
  offcanvasCartTotal.textContent = formatCurrency(total);
}

// Update checkout summary on checkout.html page
function updateCheckoutSummary() {
  const checkoutItemsList = document.getElementById('checkout-items-list');
  const checkoutSubtotal = document.getElementById('checkout-subtotal');
  const checkoutShipping = document.getElementById('checkout-shipping');
  const checkoutTotal = document.getElementById('checkout-total');
  
  if (!checkoutItemsList || !checkoutSubtotal || !checkoutShipping || !checkoutTotal) return;

  checkoutItemsList.innerHTML = '';
  
  let subtotal = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between lh-sm';
    li.innerHTML = `
      <div>
        <h6 class="my-0">${item.name}</h6>
        <small class="text-muted">${formatCurrency(item.price)} x ${item.quantity}</small>
      </div>
      <span class="text-muted">${formatCurrency(itemTotal)}</span>
    `;
    
    checkoutItemsList.appendChild(li);
  });
  
  // Get shipping fee from localStorage or default to standard shipping
  const shippingMethod = localStorage.getItem('shippingMethod') || 'standard';
  let shippingFee = 0;
  
  if (shippingMethod === 'fast') {
    shippingFee = 30000;
    checkoutShipping.textContent = formatCurrency(shippingFee);
  } else if (shippingMethod === 'sameDay') {
    shippingFee = 50000;
    checkoutShipping.textContent = formatCurrency(shippingFee);
  } else {
    checkoutShipping.textContent = 'Miễn phí';
  }
  
  checkoutSubtotal.textContent = formatCurrency(subtotal);
  checkoutTotal.textContent = formatCurrency(subtotal + shippingFee);
}

// Add to cart function
function addToCart(id, name, price, image, quantity, variant = '') {
  // Check if product already exists in cart
  const existingItemIndex = cart.findIndex(item => item.id === id && item.variant === variant);
  
  if (existingItemIndex > -1) {
    // Update quantity if product already exists
    cart[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    cart.push({
      id,
      name,
      price,
      image,
      quantity,
      variant
    });
  }
  
  // Save and update UI
  saveCart();
  updateCartUI();
  
  // Show success message
  if (window.toastService) {
    window.toastService.showToast('Thành công', 'Đã thêm sản phẩm vào giỏ hàng', 'success');
  } else {
    alert('Đã thêm sản phẩm vào giỏ hàng');
  }
}

// Update item quantity
function updateItemQuantity(index, newQuantity) {
  if (newQuantity < 1) {
    // Remove item if quantity is less than 1
    removeItem(index);
    return;
  }
  
  cart[index].quantity = newQuantity;
  saveCart();
  updateCartUI();
}

// Remove item from cart
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
  
  // Show success message
  if (window.toastService) {
    window.toastService.showToast('Thành công', 'Đã xóa sản phẩm khỏi giỏ hàng', 'success');
  }
}

// Clear entire cart
function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  
  // Show success message
  if (window.toastService) {
    window.toastService.showToast('Thành công', 'Đã xóa tất cả sản phẩm khỏi giỏ hàng', 'success');
  }
}

// Apply coupon code
function applyCoupon(code) {
  // This is a placeholder for actual coupon logic
  // In a real application, this would validate the coupon with the server
  if (code === 'WELCOME') {
    const discountAmount = Math.floor(getSubtotal() * 0.1);
    localStorage.setItem('couponDiscount', discountAmount);
    localStorage.setItem('couponCode', code);
    
    if (window.toastService) {
      window.toastService.showToast('Thành công', 'Đã áp dụng mã giảm giá WELCOME', 'success');
    } else {
      alert('Đã áp dụng mã giảm giá WELCOME');
    }
  } else if (code === 'FREESHIP') {
    localStorage.setItem('freeShipping', 'true');
    localStorage.setItem('couponCode', code);
    
    if (window.toastService) {
      window.toastService.showToast('Thành công', 'Đã áp dụng mã FREESHIP', 'success');
    } else {
      alert('Đã áp dụng mã FREESHIP');
    }
  }
  
  updateCartSummary();
  updateCheckoutSummary();
}

// Calculate subtotal
function getSubtotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Add event listeners for cart page
function addCartEventListeners() {
  // Quantity minus buttons
  document.querySelectorAll('.minus-btn').forEach(button => {
    button.addEventListener('click', function() {
      const index = this.getAttribute('data-index');
      const currentQuantity = cart[index].quantity;
      updateItemQuantity(index, currentQuantity - 1);
    });
  });
  
  // Quantity plus buttons
  document.querySelectorAll('.plus-btn').forEach(button => {
    button.addEventListener('click', function() {
      const index = this.getAttribute('data-index');
      const currentQuantity = cart[index].quantity;
      updateItemQuantity(index, currentQuantity + 1);
    });
  });
  
  // Quantity input fields
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function() {
      const index = this.getAttribute('data-index');
      const newQuantity = parseInt(this.value);
      if (!isNaN(newQuantity)) {
        updateItemQuantity(index, newQuantity);
      }
    });
  });
  
  // Remove buttons
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', function() {
      const index = this.getAttribute('data-index');
      removeItem(index);
    });
  });
  
  // Clear cart button
  const clearCartBtn = document.getElementById('clear-cart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', function() {
      if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
        clearCart();
      }
    });
  }
  
  // Shipping method radio buttons
  const shippingMethods = document.querySelectorAll('input[name="shippingMethod"]');
  shippingMethods.forEach(method => {
    method.addEventListener('change', function() {
      if (this.id === 'standardShipping') {
        localStorage.setItem('shippingMethod', 'standard');
      } else if (this.id === 'fastShipping') {
        localStorage.setItem('shippingMethod', 'fast');
      } else if (this.id === 'sameDay') {
        localStorage.setItem('shippingMethod', 'sameDay');
      }
      updateCartSummary();
    });
  });
  
  // Apply coupon button
  const applyBtn = document.getElementById('apply-coupon');
  if (applyBtn) {
    applyBtn.addEventListener('click', function() {
      const couponCode = document.getElementById('coupon-code').value;
      if (couponCode) {
        applyCoupon(couponCode);
      } else {
        alert('Vui lòng nhập mã giảm giá');
      }
    });
  }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadCart();
  
  // Apply saved shipping method if exists
  const shippingMethod = localStorage.getItem('shippingMethod');
  if (shippingMethod) {
    const methodElement = document.getElementById(
      shippingMethod === 'standard' ? 'standardShipping' :
      shippingMethod === 'fast' ? 'fastShipping' :
      shippingMethod === 'sameDay' ? 'sameDay' : 'standardShipping'
    );
    if (methodElement) {
      methodElement.checked = true;
    }
  }
  
  // Update estimated delivery date based on shipping method
  updateEstimatedDeliveryDate();
});

// Update estimated delivery date
function updateEstimatedDeliveryDate() {
  const estimatedElement = document.getElementById('estimated-delivery-date');
  if (!estimatedElement) return;
  
  const today = new Date();
  let deliveryDays = 3; // Default for standard shipping
  
  const fastShipping = document.getElementById('fastShipping');
  const sameDay = document.getElementById('sameDay');
  
  if (fastShipping && fastShipping.checked) {
    deliveryDays = 1;
  } else if (sameDay && sameDay.checked) {
    deliveryDays = 0;
  }
  
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + deliveryDays);
  
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + deliveryDays + 2);
  
  const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
  
  if (deliveryDays === 0) {
    // Same day delivery
    const hours = today.getHours();
    const deliveryTime = hours < 12 ? 'chiều nay' : 'tối nay';
    estimatedElement.textContent = `Dự kiến giao hàng vào ${deliveryTime} (${deliveryDate.toLocaleDateString('vi-VN', options)})`;
  } else {
    estimatedElement.textContent = `Dự kiến giao hàng vào ngày ${deliveryDate.toLocaleDateString('vi-VN', options)} - ${nextDay.toLocaleDateString('vi-VN', options)}`;
  }
}

// Export functions for global use
window.addToCart = addToCart;
window.applyCoupon = applyCoupon;