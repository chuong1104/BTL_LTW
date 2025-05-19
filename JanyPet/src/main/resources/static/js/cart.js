/**
 * JanyPet - Shopping Cart Management
 * This script handles cart functionality across the website
 */

// Cart variable to store all cart items, ensuring 'selected' property
let cart = (JSON.parse(localStorage.getItem('cart')) || []).map(item => ({
  ...item,
  selected: typeof item.selected === 'undefined' ? true : item.selected // Default to selected
}));

// Format price to VND currency format
function formatCurrency(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) amount = 0;
  return amount.toLocaleString('vi-VN') + '₫';
}

// Load cart from localStorage and ensure 'selected' property
function loadCart() {
  const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = storedCart.map(item => ({
    ...item,
    selected: typeof item.selected === 'undefined' ? true : item.selected
  }));
  updateCartUI();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Update all UI elements that display cart information
function updateCartUI() {
  updateCartCount();        // Updates header badge (all items)
  updateCartTable();        // Updates cart table with checkboxes
  updateCartSummary();      // Updates cart summary (selected items)
  updateOffcanvasCart();    // Updates offcanvas/mini-cart (all items)
  // NOTE: updateCheckoutSummary() was removed as checkout.js will handle its own UI
}

// Update the cart count in header (shows total quantity of all items)
function updateCartCount() {
  const cartCountElements = document.querySelectorAll('.badge.bg-primary');
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  cartCountElements.forEach(element => {
    element.textContent = itemCount;
  });
}

// Update cart table on cart.html page
function updateCartTable() {
  const cartTableBody = document.getElementById('cart-items'); // User's ID
  const selectAllCheckbox = document.getElementById('select-all-cart-items');

  if (!cartTableBody) return;
  cartTableBody.innerHTML = '';

  if (cart.length === 0) {
    cartTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-5"> <!-- Colspan updated to 6 -->
          <div class="cart-empty-message">
            <i class="fas fa-shopping-cart cart-icon mb-3"></i>
            <h4>Giỏ hàng của bạn đang trống</h4>
            <p class="text-muted">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <a href="shop.html" class="btn btn-primary">Tiếp tục mua sắm</a>
          </div>
        </td>
      </tr>
    `;
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.disabled = true;
    }
    return;
  }

  if (selectAllCheckbox) selectAllCheckbox.disabled = false;

  cart.forEach((item, index) => {
    const total = item.price * item.quantity;
    const tr = document.createElement('tr');
    tr.className = 'align-middle';
    tr.innerHTML = `
      <td class="text-center">
        <input type="checkbox" class="form-check-input cart-item-select" data-index="${index}" ${item.selected ? 'checked' : ''} aria-label="Chọn sản phẩm ${item.name}">
      </td>
      <td>
        <div class="d-flex align-items-center">
          <img src="${item.image || 'images/default-product.png'}" alt="${item.name}" class="cart-item-img rounded me-3" width="80">
          <div>
            <h6 class="mb-0">${item.name}</h6>
            <small class="text-muted">${item.variant || ''}</small>
          </div>
        </div>
      </td>
      <td class="text-center">${formatCurrency(item.price)}</td>
      <td class="text-center">
        <div class="quantity-control d-flex align-items-center justify-content-center">
          <button class="quantity-btn minus-btn" data-index="${index}" aria-label="Giảm số lượng">-</button>
          <input type="text" class="quantity-input mx-2 text-center" value="${item.quantity}" data-index="${index}" min="1" aria-label="Số lượng sản phẩm ${item.name}">
          <button class="quantity-btn plus-btn" data-index="${index}" aria-label="Tăng số lượng">+</button>
        </div>
      </td>
      <td class="text-center fw-bold">${formatCurrency(total)}</td>
      <td class="text-center">
        <button class="btn btn-sm text-danger mb-1 remove-item" data-index="${index}" aria-label="Xóa sản phẩm ${item.name}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    cartTableBody.appendChild(tr);
  });

  addCartTableEventListeners();
  updateSelectAllCheckboxState();
}

function updateSelectAllCheckboxState() {
    const selectAllCheckbox = document.getElementById('select-all-cart-items');
    if (!selectAllCheckbox || cart.length === 0) return;
    const allSelected = cart.every(item => item.selected);
    const someSelected = cart.some(item => item.selected);
    selectAllCheckbox.checked = allSelected;
    selectAllCheckbox.indeterminate = !allSelected && someSelected;
}

function addCartTableEventListeners() {
  document.querySelectorAll('.cart-item-select').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const index = parseInt(this.dataset.index);
      if (cart[index]) {
        cart[index].selected = this.checked;
        saveCart();
        updateCartSummary();
        updateSelectAllCheckboxState();
      }
    });
  });

  document.querySelectorAll('.minus-btn').forEach(button => {
    button.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      if (cart[index]) {
        updateItemQuantity(index, cart[index].quantity - 1);
      }
    });
  });
  
  document.querySelectorAll('.plus-btn').forEach(button => {
    button.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      if (cart[index]) {
        updateItemQuantity(index, cart[index].quantity + 1);
      }
    });
  });
  
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function() {
      const index = parseInt(this.dataset.index);
      if (cart[index]) {
        const newQuantity = parseInt(this.value);
        if (!isNaN(newQuantity)) {
          updateItemQuantity(index, newQuantity);
        } else {
          this.value = cart[index].quantity; // Reset if invalid
        }
      }
    });
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.blur();
        }
    });
  });
  
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      removeItem(index);
    });
  });
}

// Update cart summary on cart.html page (based on selected items)
function updateCartSummary() {
  const cartItemsCountElement = document.getElementById('cart-items-count');
  const cartSubtotalElement = document.getElementById('cart-subtotal');
  const cartTotalElement = document.getElementById('cart-total');
  const shippingFeeElement = document.getElementById('shipping-fee');
  const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn');

  const selectedItems = cart.filter(item => item.selected && item.quantity > 0);

  const itemCount = selectedItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  if (cartItemsCountElement) cartItemsCountElement.textContent = itemCount;
  if (cartSubtotalElement) cartSubtotalElement.textContent = formatCurrency(subtotal);
  
  let shippingFee = 0;
  // User's shipping fee logic (ensure elements exist if relying on them)
  const standardShipping = document.getElementById('standardShipping');
  const fastShipping = document.getElementById('fastShipping');
  const sameDay = document.getElementById('sameDay');

  if (fastShipping && fastShipping.checked) shippingFee = 30000;
  else if (sameDay && sameDay.checked) shippingFee = 50000;
  else if (standardShipping && standardShipping.checked) shippingFee = 0; 
  // Add default or handle no selection if necessary

  if (shippingFeeElement) {
    shippingFeeElement.textContent = shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee);
  }
  
  const total = subtotal + shippingFee - (parseFloat(localStorage.getItem('couponDiscount')) || 0);
  if (cartTotalElement) cartTotalElement.textContent = formatCurrency(total < 0 ? 0 : total);

  if (proceedToCheckoutBtn) {
    const canCheckout = selectedItems.length > 0;
    if (canCheckout) {
      proceedToCheckoutBtn.classList.remove('disabled');
      proceedToCheckoutBtn.removeAttribute('aria-disabled');
    } else {
      proceedToCheckoutBtn.classList.add('disabled');
      proceedToCheckoutBtn.setAttribute('aria-disabled', 'true');
    }
  }
}

// Update offcanvas cart (mini cart) - shows all items
function updateOffcanvasCart() {
  const offcanvasCartList = document.getElementById('offcanvas-cart-list');
  const offcanvasCartTotal = document.getElementById('offcanvas-cart-total');
  
  if (!offcanvasCartList || !offcanvasCartTotal) return;
  offcanvasCartList.innerHTML = '';
  
  if (cart.length === 0) {
    offcanvasCartList.innerHTML = '<li class="list-group-item">Giỏ hàng trống</li>';
    offcanvasCartTotal.textContent = formatCurrency(0);
    return;
  }
  
  let total = 0;
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between lh-sm';
    li.innerHTML = `
      <div class="d-flex">
        <img src="${item.image || 'images/default-product.png'}" alt="${item.name}" class="img-fluid me-2" style="width: 50px; height: 50px; object-fit: cover;">
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

// Add to cart function
function addToCart(id, name, price, image, quantityInput, variant = '') {
  const quantity = parseInt(quantityInput);
  if (isNaN(quantity) || quantity < 1) {
    if (window.toastService) window.toastService.showToast('Lỗi', 'Số lượng không hợp lệ.', 'danger');
    return;
  }

  const existingItemIndex = cart.findIndex(item => item.id === id && (item.variant || '') === (variant || ''));
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
    cart[existingItemIndex].selected = true;
  } else {
    cart.push({
      id, name, price: parseFloat(price), image, quantity, variant,
      selected: true 
    });
  }
  saveCart();
  updateCartUI();
  
  if (window.toastService) {
    window.toastService.showToast('Thành công', `Đã ${existingItemIndex > -1 ? 'cập nhật' : 'thêm'} "${name}" vào giỏ hàng.`, 'success');
  } else {
    alert(`Đã ${existingItemIndex > -1 ? 'cập nhật' : 'thêm'} "${name}" vào giỏ hàng.`);
  }
}

// Update item quantity
function updateItemQuantity(index, newQuantityInput) {
  if (!cart[index]) return;
  let newQuantity = parseInt(newQuantityInput);

  if (isNaN(newQuantity) || newQuantity < 1) {
    // User's original logic: remove if quantity < 1
    removeItem(index);
    return;
  }
  
  cart[index].quantity = newQuantity;
  saveCart();
  updateCartUI();
}

// Remove item from cart
function removeItem(index) {
  if (!cart[index]) return;
  const removedItemName = cart[index].name;
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
  if (window.toastService) {
    window.toastService.showToast('Thông báo', `Đã xóa "${removedItemName}" khỏi giỏ hàng.`, 'info');
  }
}

// Clear entire cart
function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  if (window.toastService) {
    window.toastService.showToast('Thành công', 'Đã xóa tất cả sản phẩm khỏi giỏ hàng.', 'success');
  }
}

// Prepare selected items for checkout and navigate
function prepareAndProceedToCheckout() {
  const selectedItems = cart.filter(item => item.selected && item.quantity > 0);
  if (selectedItems.length === 0) {
    if (window.toastService) {
      window.toastService.showToast('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm để thanh toán.', 'warning');
    } else {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
    }
    return;
  }
  sessionStorage.setItem('itemsForCheckout', JSON.stringify(selectedItems));
  window.location.href = 'checkout.html';
}

// Add event listeners specific to the cart page
function addCartPageEventListeners() {
  const clearCartBtn = document.getElementById('clear-cart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
        clearCart();
      }
    });
  }

  const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn');
  if (proceedToCheckoutBtn) {
    proceedToCheckoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      if (!proceedToCheckoutBtn.classList.contains('disabled')) {
        prepareAndProceedToCheckout();
      }
    });
  }
  
  const selectAllCheckbox = document.getElementById('select-all-cart-items');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
      cart.forEach(item => item.selected = this.checked);
      saveCart();
      updateCartUI();
    });
  }

  const shippingMethods = document.querySelectorAll('input[name="shippingMethod"]');
  shippingMethods.forEach(method => {
    method.addEventListener('change', () => {
        // localStorage.setItem('shippingMethod', method.id); // If needed by checkout
        updateCartSummary();
    });
  });
  
  const applyBtn = document.getElementById('apply-coupon');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const couponCodeInput = document.getElementById('coupon-code');
      if (couponCodeInput) {
        const couponCode = couponCodeInput.value.trim();
        if (couponCode) applyCoupon(couponCode);
        else if(window.toastService) window.toastService.showToast('Thông báo', 'Vui lòng nhập mã giảm giá.', 'warning');
        else alert('Vui lòng nhập mã giảm giá.');
      }
    });
  }
}

// Apply coupon code
function applyCoupon(code) {
  const selectedItemsSubtotal = cart.filter(item => item.selected && item.quantity > 0)
                                  .reduce((total, item) => total + (item.price * item.quantity), 0);
  let discountApplied = false;

  // Example coupon logic, adapt to your needs
  if (code === 'WELCOME') {
    const discountAmount = Math.floor(selectedItemsSubtotal * 0.1);
    localStorage.setItem('couponDiscount', discountAmount);
    localStorage.setItem('couponCode', code);
    if (window.toastService) window.toastService.showToast('Thành công', `Đã áp dụng mã WELCOME (giảm ${formatCurrency(discountAmount)}).`, 'success');
    discountApplied = true;
  } else if (code === 'FREESHIP') {
    localStorage.setItem('couponDiscount', 0); // Ensure other discounts are cleared or handled
    localStorage.setItem('freeShipping', 'true'); // This flag needs to be used in shipping calculation
    localStorage.setItem('couponCode', code);
    if (window.toastService) window.toastService.showToast('Thành công', 'Đã áp dụng mã FREESHIP.', 'success');
    discountApplied = true;
  } else {
    // No valid coupon, clear previous coupon if any
    localStorage.removeItem('couponDiscount');
    localStorage.removeItem('couponCode');
    localStorage.removeItem('freeShipping');
    if (window.toastService) window.toastService.showToast('Lỗi', 'Mã giảm giá không hợp lệ hoặc đã hết hạn.', 'danger');
  }
  
  if(discountApplied) updateCartSummary(); // Update summary only if a valid coupon action occurred
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  loadCart(); // This calls updateCartUI()
  
  if (document.getElementById('cart-items')) { // Check if on cart page
    addCartPageEventListeners();
    
    // Restore shipping selection if on cart page and it exists
    const shippingMethod = localStorage.getItem('shippingMethod');
    if (shippingMethod) {
        const methodElement = document.getElementById(shippingMethod);
        if (methodElement && methodElement.type === 'radio') methodElement.checked = true;
    }
    // Initial call to update summary after potential shipping restoration
    updateCartSummary(); 
  }
  
  // User's existing logic for estimated delivery date
  if (typeof updateEstimatedDeliveryDate === 'function' && document.getElementById('estimated-delivery-date')) {
    updateEstimatedDeliveryDate();
  }
});

// User's updateEstimatedDeliveryDate function (ensure it's defined or remove if not used)
function updateEstimatedDeliveryDate() {
  const estimatedElement = document.getElementById('estimated-delivery-date');
  if (!estimatedElement) return;
  
  const today = new Date();
  let deliveryDays = 3; 
  
  const fastShipping = document.getElementById('fastShipping');
  const sameDay = document.getElementById('sameDay');
  
  if (fastShipping && fastShipping.checked) deliveryDays = 1;
  else if (sameDay && sameDay.checked) deliveryDays = 0;
  
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + deliveryDays);
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + deliveryDays + 2);
  const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
  
  if (deliveryDays === 0) {
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
// ... any other functions that need to be global ...