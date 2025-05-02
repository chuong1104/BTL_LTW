/**
 * JanyPet - Checkout Management
 * This script handles checkout functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize checkout
  initCheckout();
  
  // Display cart items in the checkout page
  loadCheckoutItems();
  
  // Calculate and update order summary
  calculateOrderSummary();
  
  // Add event listeners for shipping method changes
  initShippingMethodListeners();
  
  // Add event listeners for payment method changes
  initPaymentMethodListeners();
  
  // Add event listener for checkout form submission
  initCheckoutForm();
  
  // Add event listener for coupon code
  initCouponCode();
  
  // Add event listeners for bank transfer specific functionality
  initBankTransferFunctionality();
});

// Initialize checkout page
function initCheckout() {
  // Apply saved shipping method if exists
  const shippingMethod = localStorage.getItem('shippingMethod') || 'standard';
  console.log("Loading saved shipping method:", shippingMethod);
  
  const methodElement = document.getElementById(
    shippingMethod === 'standard' ? 'standardShipping' :
    shippingMethod === 'fast' ? 'fastShipping' :
    shippingMethod === 'sameDay' ? 'sameDay' : 'standardShipping'
  );
  
  if (methodElement) {
    methodElement.checked = true;
    console.log("Applied shipping method:", methodElement.id);
  }
  
  // Load saved payment method if exists
  const savedPaymentMethod = localStorage.getItem('paymentMethod');
  if (savedPaymentMethod) {
    const paymentMethodElement = document.getElementById(savedPaymentMethod);
    if (paymentMethodElement) {
      paymentMethodElement.checked = true;
      
      // Show/hide specific payment forms based on saved method
      const cardPaymentForm = document.getElementById('card-payment-form');
      const bankTransferInfo = document.getElementById('bank-transfer-info');
      
      if (savedPaymentMethod === 'credit' && cardPaymentForm) {
        cardPaymentForm.style.display = 'block';
        if (bankTransferInfo) bankTransferInfo.classList.add('d-none');
      } else if (savedPaymentMethod === 'bank' && bankTransferInfo) {
        bankTransferInfo.classList.remove('d-none');
        if (cardPaymentForm) cardPaymentForm.style.display = 'none';
      } else {
        if (cardPaymentForm) cardPaymentForm.style.display = 'none';
        if (bankTransferInfo) bankTransferInfo.classList.add('d-none');
      }
    }
  }
  
  // Update payment method selection visual
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  paymentMethods.forEach(method => {
    if (method.checked) {
      method.closest('.payment-method-card').classList.add('selected');
    }
  });
  
  // Apply saved coupon if exists
  const savedCouponCode = localStorage.getItem('couponCode');
  const couponInput = document.querySelector('.coupon-form .input-group input');
  if (savedCouponCode && couponInput) {
    couponInput.value = savedCouponCode;
    updateCouponDisplay(savedCouponCode, parseInt(localStorage.getItem('couponDiscount') || '0'));
  }
  
  // Update estimated delivery date based on shipping method
  updateEstimatedDeliveryDate();
}

// Load items from cart into checkout page
function loadCheckoutItems() {
  const checkoutItemsList = document.getElementById('checkout-items-list');
  if (!checkoutItemsList) return;
  
  // Get cart data
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Clear existing items
  checkoutItemsList.innerHTML = '';
  
  // If cart is empty, display message
  if (cart.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'text-center py-4';
    emptyMessage.innerHTML = `
      <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
      <p>Giỏ hàng của bạn đang trống</p>
      <a href="shop.html" class="btn btn-primary btn-sm">Tiếp tục mua sắm</a>
    `;
    checkoutItemsList.appendChild(emptyMessage);
    return;
  }
  
  // Add each item to the list
  cart.forEach(item => {
    const listItem = document.createElement('div');
    listItem.className = 'list-group-item d-flex gap-3 py-3';
    listItem.innerHTML = `
      <div class="text-center">
        <img src="${item.image}" alt="${item.name}" class="product-image rounded">
        <div class="text-muted mt-1">x${item.quantity}</div>
      </div>
      <div class="flex-grow-1">
        <h6 class="mb-1">${item.name}</h6>
        ${(item.size !== 'Default' || item.color !== 'Default') ? 
          `<p class="mb-0 small text-muted">
            ${item.size !== 'Default' ? 'Size: ' + item.size : ''}
            ${item.size !== 'Default' && item.color !== 'Default' ? ', ' : ''}
            ${item.color !== 'Default' ? 'Màu: ' + item.color : ''}
          </p>` : ''}
        <p class="mb-0 text-primary fw-bold mt-1">${formatCurrency(item.price)}</p>
      </div>
    `;
    checkoutItemsList.appendChild(listItem);
  });
}

// Calculate and update order summary
function calculateOrderSummary() {
  const checkoutItemsCount = document.getElementById('checkout-items-count');
  const checkoutSubtotal = document.getElementById('checkout-subtotal');
  const checkoutShipping = document.getElementById('checkout-shipping');
  const discountAmount = document.getElementById('discount-amount');
  const checkoutTotal = document.getElementById('checkout-total');
  
  if (!checkoutItemsCount || !checkoutSubtotal || !checkoutTotal) return;
  
  // Get cart data
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Calculate totals
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Get shipping cost based on method
  let shippingCost = getShippingCost();
  
  // Get discount amount if any
  const discount = parseInt(localStorage.getItem('couponDiscount')) || 0;
  
  // Calculate final total
  const total = subtotal + shippingCost - discount;
  
  // Update UI elements
  checkoutItemsCount.textContent = totalItems;
  checkoutSubtotal.textContent = formatCurrency(subtotal);
  
  if (checkoutShipping) {
    checkoutShipping.textContent = shippingCost > 0 ? formatCurrency(shippingCost) : 'Miễn phí';
  }
  
  if (discountAmount) {
    discountAmount.textContent = discount > 0 ? formatCurrency(discount) : '0₫';
  }
  
  checkoutTotal.textContent = formatCurrency(total);
  
  // Save current total in session for later use
  sessionStorage.setItem('checkoutTotal', total);
  
  // Update the transfer message for bank transfers
  updateTransferMessage();
}

// Get shipping cost based on selected method
function getShippingCost() {
  let shippingCost = 0;
  const shippingMethodElement = document.querySelector('input[name="shippingMethod"]:checked');
  
  if (shippingMethodElement) {
    if (shippingMethodElement.id === 'fastShipping') {
      shippingCost = 30000;
    } else if (shippingMethodElement.id === 'sameDay') {
      shippingCost = 50000;
    }
    
    // Save the selected shipping method to localStorage
    if (shippingMethodElement.id === 'standardShipping') {
      localStorage.setItem('shippingMethod', 'standard');
    } else if (shippingMethodElement.id === 'fastShipping') {
      localStorage.setItem('shippingMethod', 'fast');
    } else if (shippingMethodElement.id === 'sameDay') {
      localStorage.setItem('shippingMethod', 'sameDay');
    }
  } else {
    // If no shipping method is selected, try to get from localStorage
    const savedMethod = localStorage.getItem('shippingMethod');
    if (savedMethod === 'fast') {
      shippingCost = 30000;
    } else if (savedMethod === 'sameDay') {
      shippingCost = 50000;
    }
  }
  
  return shippingCost;
}

// Initialize shipping method change listeners
function initShippingMethodListeners() {
  const shippingMethods = document.querySelectorAll('input[name="shippingMethod"]');
  
  shippingMethods.forEach(method => {
    method.addEventListener('change', function() {
      // Save selected shipping method
      if (this.id === 'standardShipping') {
        localStorage.setItem('shippingMethod', 'standard');
      } else if (this.id === 'fastShipping') {
        localStorage.setItem('shippingMethod', 'fast');
      } else if (this.id === 'sameDay') {
        localStorage.setItem('shippingMethod', 'sameDay');
      }
      
      console.log("Shipping method changed to:", this.id);
      console.log("Saved in localStorage as:", localStorage.getItem('shippingMethod'));
      
      // Update delivery date estimate
      updateEstimatedDeliveryDate();
      
      // Recalculate order summary with new shipping fee
      calculateOrderSummary();
    });
  });
}

// Initialize payment method change listeners
function initPaymentMethodListeners() {
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  const cardPaymentForm = document.getElementById('card-payment-form');
  const bankTransferInfo = document.getElementById('bank-transfer-info');
  
  paymentMethods.forEach(method => {
    method.addEventListener('change', function() {
      // Remove selected class from all payment cards
      document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('selected');
      });
      
      // Add selected class to chosen payment card
      this.closest('.payment-method-card').classList.add('selected');
      
      // Show/hide payment specific elements
      if (this.id === 'credit' && cardPaymentForm) {
        cardPaymentForm.style.display = 'block';
        if (bankTransferInfo) bankTransferInfo.classList.add('d-none');
      } else if (this.id === 'bank' && bankTransferInfo) {
        bankTransferInfo.classList.remove('d-none');
        if (cardPaymentForm) cardPaymentForm.style.display = 'none';
        
        // Update transfer message
        updateTransferMessage();
      } else {
        if (cardPaymentForm) cardPaymentForm.style.display = 'none';
        if (bankTransferInfo) bankTransferInfo.classList.add('d-none');
      }
      
      // Save selected payment method
      localStorage.setItem('paymentMethod', this.id);
    });
  });
}

// Initialize bank transfer specific functionality
function initBankTransferFunctionality() {
  // Add event listeners for copy buttons
  const copyBtns = document.querySelectorAll('.copy-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Get the target input element ID
      const targetId = this.getAttribute('data-target');
      const inputEl = document.getElementById(targetId);
      
      if (inputEl) {
        // Select the text
        inputEl.select();
        inputEl.setSelectionRange(0, 99999); // For mobile devices
        
        // Copy to clipboard
        navigator.clipboard.writeText(inputEl.value)
          .then(() => {
            // Change button text temporarily
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Đã sao chép';
            this.classList.remove('btn-outline-secondary');
            this.classList.add('btn-success');
            
            // Restore original button text after 2 seconds
            setTimeout(() => {
              this.innerHTML = originalText;
              this.classList.remove('btn-success');
              this.classList.add('btn-outline-secondary');
            }, 2000);
          })
          .catch(err => {
            console.error('Không thể sao chép: ', err);
          });
      }
    });
  });
  
  // Add listeners to update transfer message when relevant fields change
  const formFields = [
    'firstName', 'lastName', 'phone', 'email'
  ];
  
  formFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', updateTransferMessage);
    }
  });
}

// Update the transfer message based on customer info
function updateTransferMessage() {
  const transferMessageEl = document.getElementById('transferMessage');
  if (!transferMessageEl) return;
  
  // Get customer information
  const firstName = document.getElementById('firstName')?.value || '';
  const lastName = document.getElementById('lastName')?.value || '';
  const phone = document.getElementById('phone')?.value || '';
  
  // Generate order ID (using timestamp for demo purposes)
  const orderId = 'JP-' + Date.now().toString().slice(-6);
  
  // Format message: FullName-Phone-OrderID
  const fullName = (firstName + ' ' + lastName).trim();
  let message = '';
  
  if (fullName && phone) {
    message = `${fullName}-${phone}-${orderId}`;
  } else if (fullName) {
    message = `${fullName}-${orderId}`;
  } else if (phone) {
    message = `${phone}-${orderId}`;
  } else {
    message = orderId;
  }
  
  // Update message field
  transferMessageEl.value = message;
}

// Initialize coupon code functionality
function initCouponCode() {
  const couponForm = document.querySelector('.coupon-form .input-group');
  const couponInput = couponForm ? couponForm.querySelector('input') : null;
  const couponBtn = couponForm ? couponForm.querySelector('button') : null;
  
  // Update coupon display on page load if a coupon exists
  const savedCoupon = localStorage.getItem('couponCode');
  const savedDiscount = parseInt(localStorage.getItem('couponDiscount')) || 0;
  if (savedCoupon && savedDiscount > 0 && couponInput) {
    couponInput.value = savedCoupon;
    updateCouponDisplay(savedCoupon, savedDiscount);
  }
  
  if (couponBtn && couponInput) {
    couponBtn.addEventListener('click', function() {
      const code = couponInput.value.trim();
      
      // If the button says "Hủy", remove the coupon
      if (couponBtn.innerHTML.includes('Hủy')) {
        removeCoupon();
        return;
      }
      
      if (!code) {
        showToast('warning', 'Thông báo', 'Vui lòng nhập mã giảm giá');
        return;
      }
      
      // Sample coupon codes (in production, these would be validated server-side)
      const coupons = {
        'WELCOME10': 10000,
        'SALE20': 20000,
        'JANY50': 50000
      };
      
      if (coupons[code]) {
        // Apply discount
        localStorage.setItem('couponDiscount', coupons[code]);
        localStorage.setItem('couponCode', code);
        
        // Update UI to show coupon is applied
        updateCouponDisplay(code, coupons[code]);
        
        // Show success message
        showToast('success', 'Thành công', `Mã giảm giá ${code} đã được áp dụng. Bạn được giảm ${formatCurrency(coupons[code])}`);
        
        // Recalculate order summary
        calculateOrderSummary();
      } else {
        showToast('danger', 'Thất bại', 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      }
    });
  }
}

// Update UI to show coupon is applied
function updateCouponDisplay(code, discountAmount) {
  const couponForm = document.querySelector('.coupon-form');
  const couponInput = couponForm.querySelector('input');
  const couponBtn = couponForm.querySelector('button');
  
  if (couponForm && couponInput && couponBtn) {
    // Disable input and update button text
    couponInput.value = code;
    couponInput.setAttribute('readonly', true);
    couponInput.classList.add('bg-light');
    
    // Change button text to "Cancel"
    couponBtn.innerHTML = '<i class="fas fa-times"></i> Hủy';
    couponBtn.classList.remove('btn-outline-primary');
    couponBtn.classList.add('btn-outline-danger');
    
    // Add coupon badge if not exists
    if (!document.getElementById('coupon-badge')) {
      const couponBadge = document.createElement('div');
      couponBadge.id = 'coupon-badge';
      couponBadge.className = 'alert alert-success mt-2 mb-0 py-2 d-flex justify-content-between align-items-center';
      couponBadge.innerHTML = `
        <div>
          <i class="fas fa-tag me-2"></i>
          <strong>${code}</strong>: Giảm ${formatCurrency(discountAmount)}
        </div>
      `;
      couponForm.appendChild(couponBadge);
    } else {
      const couponBadge = document.getElementById('coupon-badge');
      couponBadge.innerHTML = `
        <div>
          <i class="fas fa-tag me-2"></i>
          <strong>${code}</strong>: Giảm ${formatCurrency(discountAmount)}
        </div>
      `;
    }
  }
}

// Remove coupon and reset UI
function removeCoupon() {
  const couponForm = document.querySelector('.coupon-form');
  const couponInput = couponForm.querySelector('input');
  const couponBtn = couponForm.querySelector('button');
  const couponBadge = document.getElementById('coupon-badge');
  
  if (couponForm && couponInput && couponBtn) {
    // Reset input
    couponInput.value = '';
    couponInput.removeAttribute('readonly');
    couponInput.classList.remove('bg-light');
    
    // Reset button
    couponBtn.innerHTML = 'Áp dụng';
    couponBtn.classList.remove('btn-outline-danger');
    couponBtn.classList.add('btn-outline-primary');
    
    // Remove badge if exists
    if (couponBadge) {
      couponBadge.remove();
    }
    
    // Remove from localStorage
    localStorage.removeItem('couponDiscount');
    localStorage.removeItem('couponCode');
    
    // Recalculate summary
    calculateOrderSummary();
    
    // Show message
    showToast('info', 'Thông báo', 'Đã hủy mã giảm giá');
  }
}

// Initialize checkout form submission
function initCheckoutForm() {
  const checkoutForm = document.getElementById('checkout-form');
  const orderBtn = document.getElementById('place-order-btn');
  
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(event) {
      if (!checkoutForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        checkoutForm.classList.add('was-validated');
      } else {
        event.preventDefault();
        
        // Loading effect for the order button
        orderBtn.disabled = true;
        orderBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
        
        // Check if bank transfer method is selected
        const isBankTransfer = document.getElementById('bank')?.checked;
        
        // Collect order data
        const orderData = collectOrderData();
        
        // Save transfer message if bank transfer was selected
        if (isBankTransfer) {
          orderData.transferMessage = document.getElementById('transferMessage')?.value;
        }
        
        // Simulate order processing
        setTimeout(function() {
          // Generate random order ID
          const orderId = 'JP-' + Date.now().toString().slice(-6);
          document.getElementById('order-id').textContent = orderId;
          
          // Show success modal with appropriate message
          const successModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
          
          // If bank transfer, update modal content to include payment instructions
          if (isBankTransfer) {
            const successModalBody = document.querySelector('#orderSuccessModal .modal-body');
            if (successModalBody) {
              const bankTransferNote = document.createElement('div');
              bankTransferNote.className = 'alert alert-info mt-3';
              bankTransferNote.innerHTML = `
                <h5 class="alert-heading"><i class="fas fa-info-circle me-2"></i>Hướng dẫn thanh toán</h5>
                <p>Vui lòng chuyển khoản với nội dung: <strong>${orderData.transferMessage}</strong></p>
                <p class="mb-0">Sau khi chuyển khoản, hãy gửi biên lai cho chúng tôi qua Facebook để đơn hàng được xử lý nhanh chóng.</p>
              `;
              successModalBody.appendChild(bankTransferNote);
              
              // Add Facebook link to modal footer
              const modalFooter = document.querySelector('#orderSuccessModal .modal-footer');
              if (modalFooter) {
                const fbLink = document.createElement('a');
                fbLink.href = 'https://www.facebook.com/JanyPet';
                fbLink.target = '_blank';
                fbLink.className = 'btn btn-primary';
                fbLink.innerHTML = '<i class="fab fa-facebook-messenger me-1"></i> Gửi biên lai';
                modalFooter.insertBefore(fbLink, modalFooter.firstChild);
              }
            }
          }
          
          successModal.show();
          
          // Reset button state
          orderBtn.disabled = false;
          orderBtn.innerHTML = '<i class="fas fa-shopping-bag me-2"></i>Đặt hàng';
          
          // Clear cart and related data
          localStorage.removeItem('cart');
          localStorage.removeItem('couponDiscount');
          localStorage.removeItem('couponCode');
          // Keep shipping method for future use
          
          // Save order to order history
          saveOrderToHistory(orderId, orderData);
          
          // Update cart badge count
          updateCartBadgeCount();
        }, 1500);
      }
    });
  }
}

// Collect order data from form
function collectOrderData() {
  const shippingInfo = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    district: document.getElementById('district').value,
    ward: document.getElementById('ward').value
  };
  
  // Get selected payment method
  let paymentMethod = '';
  document.querySelectorAll('input[name="paymentMethod"]').forEach(method => {
    if (method.checked) {
      paymentMethod = method.id;
    }
  });
  
  // Get selected shipping method
  let shippingMethod = '';
  document.querySelectorAll('input[name="shippingMethod"]').forEach(method => {
    if (method.checked) {
      shippingMethod = method.id;
    }
  });
  
  // Get cart items from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Get order notes
  const notes = document.getElementById('order-notes') ? document.getElementById('order-notes').value : '';
  
  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  let shippingFee = getShippingCost();
  
  // Get coupon discount if any
  const couponDiscount = parseInt(localStorage.getItem('couponDiscount')) || 0;
  const couponCode = localStorage.getItem('couponCode') || '';
  
  // Calculate total
  const totalAmount = subtotal + shippingFee - couponDiscount;
  
  return {
    shippingInfo,
    paymentMethod,
    shippingMethod,
    cart,
    notes,
    subtotal,
    shippingFee,
    couponDiscount,
    couponCode,
    totalAmount,
    orderDate: new Date().toISOString(),
    status: 'pending'
  };
}

// Save order to order history in localStorage
function saveOrderToHistory(orderId, orderData) {
  // Get existing order history
  const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
  
  // Add new order
  orderHistory.push({
    id: orderId,
    ...orderData
  });
  
  // Save back to localStorage
  localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
}

// Update estimated delivery date based on selected shipping method
function updateEstimatedDeliveryDate() {
  const estimatedElement = document.getElementById('estimated-delivery-date');
  if (!estimatedElement) return;
  
  const today = new Date();
  let deliveryDays = 3; // Default for standard shipping
  
  // First check for selected shipping method
  const shippingMethodElement = document.querySelector('input[name="shippingMethod"]:checked');
  
  if (shippingMethodElement) {
    if (shippingMethodElement.id === 'fastShipping') {
      deliveryDays = 1;
    } else if (shippingMethodElement.id === 'sameDay') {
      deliveryDays = 0;
    }
  } else {
    // If no shipping method is selected yet, check localStorage
    const savedMethod = localStorage.getItem('shippingMethod');
    if (savedMethod === 'fast') {
      deliveryDays = 1;
    } else if (savedMethod === 'sameDay') {
      deliveryDays = 0;
    }
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

// Update cart badges count in header
function updateCartBadgeCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const badges = document.querySelectorAll('.fa-shopping-cart + .badge');
  badges.forEach(badge => {
    badge.textContent = itemCount;
  });
}

// Display toast notification
function showToast(type, title, message) {
  // Create toast element
  const toastContainer = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast bg-${type} text-white` + (type === 'warning' ? ' text-dark' : '');
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
    <div class="toast-header bg-${type}" ${type === 'warning' ? 'style="color: #000"' : 'text-white'}>
      <strong class="me-auto">${title}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;
  toastContainer.appendChild(toast);
  
  // Initialize and show toast
  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 3000
  });
  
  bsToast.show();
  
  // Remove toast after it's hidden
  toast.addEventListener('hidden.bs.toast', function() {
    toast.remove();
  });
}

// Create toast container if it doesn't exist
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'position-fixed bottom-0 end-0 p-3';
  container.style.zIndex = '1050';
  document.body.appendChild(container);
  return container;
}

// Format currency for display
function formatCurrency(amount) {
  return amount.toLocaleString('vi-VN') + '₫';
}