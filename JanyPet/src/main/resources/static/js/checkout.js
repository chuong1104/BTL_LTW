/**
 * JanyPet - Checkout Management
 * This script handles checkout UI functionality, data collection, and summary updates.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize checkout UI elements and listeners
  initCheckout(); 
  loadCheckoutItems(); 
  calculateOrderSummary(); 

  // Initialize event listeners for various parts of the form
  initShippingMethodListeners();
  initPaymentMethodListeners(); 
  initAddressDropdowns(); 
  initCouponCode(); 
  initBankTransferFunctionality(); 

  console.log("Checkout.js: All initializers called.");
});

const vietnameseAddressData = {
    "Hà Nội": {
        "Ba Đình": ["Phúc Xá", "Trúc Bạch", "Vĩnh Phúc", "Cống Vị", "Liễu Giai", "Nguyễn Trung Trực", "Quán Thánh", "Ngọc Hà", "Điện Biên", "Đội Cấn", "Ngọc Khánh", "Kim Mã", "Giảng Võ", "Thành Công"],
        "Hoàn Kiếm": ["Chương Dương", "Cửa Đông", "Cửa Nam", "Đồng Xuân", "Hàng Bạc", "Hàng Bài", "Hàng Bồ", "Hàng Bông", "Hàng Buồm", "Hàng Đào", "Hàng Gai", "Hàng Mã", "Hàng Trống", "Lý Thái Tổ", "Phan Chu Trinh", "Phúc Tân", "Trần Hưng Đạo", "Tràng Tiền"],
        "Hai Bà Trưng": ["Bạch Đằng", "Bách Khoa", "Bạch Mai", "Cầu Dền", "Đống Mác", "Đồng Nhân", "Đồng Tâm", "Lê Đại Hành", "Minh Khai", "Nguyễn Du", "Phạm Đình Hổ", "Phố Huế", "Quỳnh Lôi", "Quỳnh Mai", "Thanh Lương", "Thanh Nhàn", "Trương Định", "Vĩnh Tuy"],
        "Đống Đa": ["Cát Linh", "Hàng Bột", "Khâm Thiên", "Khương Thượng", "Kim Liên", "Láng Hạ", "Láng Thượng", "Nam Đồng", "Ngã Tư Sở", "Ô Chợ Dừa", "Phương Liên", "Phương Mai", "Quang Trung", "Quốc Tử Giám", "Thịnh Quang", "Thổ Quan", "Trung Liệt", "Trung Phụng", "Trung Tự", "Văn Chương", "Văn Miếu"],
        "Tây Hồ": ["Bưởi", "Nhật Tân", "Phú Thượng", "Quảng An", "Thụy Khuê", "Tứ Liên", "Xuân La", "Yên Phụ"]
    },
    "TP. Hồ Chí Minh": {
        "Quận 1": ["Bến Nghé", "Bến Thành", "Cầu Kho", "Cầu Ông Lãnh", "Cô Giang", "Đa Kao", "Nguyễn Cư Trinh", "Nguyễn Thái Bình", "Phạm Ngũ Lão", "Tân Định"],
        "Quận 3": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Võ Thị Sáu", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
        "Quận Bình Thạnh": ["Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 6", "Phường 7", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22", "Phường 24", "Phường 25", "Phường 26", "Phường 27", "Phường 28"]
    },
    "Đà Nẵng": {
        "Hải Châu": ["Bình Hiên", "Bình Thuận", "Hải Châu I", "Hải Châu II", "Hòa Cường Bắc", "Hòa Cường Nam", "Hòa Thuận Đông", "Hòa Thuận Tây", "Nam Dương", "Phước Ninh", "Thạch Thang", "Thanh Bình", "Thuận Phước"],
        "Sơn Trà": ["An Hải Bắc", "An Hải Đông", "An Hải Tây", "Mân Thái", "Nại Hiên Đông", "Phước Mỹ", "Thọ Quang"],
        "Ngũ Hành Sơn": ["Hòa Hải", "Hòa Quý", "Khuê Mỹ", "Mỹ An"]
    }
};

function initCheckout() {
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
  
  const savedPaymentMethod = localStorage.getItem('paymentMethod');
  if (savedPaymentMethod) {
    const paymentMethodElement = document.getElementById(savedPaymentMethod);
    if (paymentMethodElement) {
      paymentMethodElement.checked = true;
      
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
  
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  paymentMethods.forEach(method => {
    if (method.checked) {
      method.closest('.payment-method-card').classList.add('selected');
    }
  });
  
  const savedCouponCode = localStorage.getItem('couponCode');
  const couponInput = document.querySelector('.coupon-form .input-group input');
  if (savedCouponCode && couponInput) {
    couponInput.value = savedCouponCode;
    updateCouponDisplay(savedCouponCode, parseInt(localStorage.getItem('couponDiscount') || '0'));
  }
  
  updateEstimatedDeliveryDate();
}

// Helper function (ensure it's defined, or use the one from cart.js if made global)
if (typeof formatCurrency !== 'function') {
  function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) amount = 0;
    return (amount || 0).toLocaleString('vi-VN') + '₫';
  }
}

function loadCheckoutItems() {
  const checkoutItemsList = document.getElementById('checkout-items-list');
  const placeOrderBtn = document.getElementById('place-order-btn'); // Assuming this ID exists

  if (!checkoutItemsList) return;

  const itemsForCheckoutString = sessionStorage.getItem('itemsForCheckout');
  let currentCheckoutCart = [];

  if (!itemsForCheckoutString) {
    checkoutItemsList.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-exclamation-circle fa-3x text-warning mb-3"></i>
        <p>Không có sản phẩm nào được chọn để thanh toán.</p>
        <a href="cart.html" class="btn btn-primary btn-sm">Quay lại giỏ hàng</a>
      </div>`;
    if (placeOrderBtn) placeOrderBtn.disabled = true;
    // Optionally disable the form or parts of it
    document.getElementById('checkout-form')?.classList.add('form-disabled-due-to-empty-cart');
    return; // Exit early
  }

  currentCheckoutCart = JSON.parse(itemsForCheckoutString);
  checkoutItemsList.innerHTML = ''; 

  if (!currentCheckoutCart || currentCheckoutCart.length === 0) {
    checkoutItemsList.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
        <p>Không có sản phẩm nào trong đơn hàng này.</p>
        <a href="cart.html" class="btn btn-primary btn-sm">Quay lại giỏ hàng</a>
      </div>`;
    if (placeOrderBtn) placeOrderBtn.disabled = true;
    document.getElementById('checkout-form')?.classList.add('form-disabled-due-to-empty-cart');
    return;
  }
  
  // Enable form/button if items are present
  if (placeOrderBtn) placeOrderBtn.disabled = false;
  document.getElementById('checkout-form')?.classList.remove('form-disabled-due-to-empty-cart');

  currentCheckoutCart.forEach(item => {
    const listItem = document.createElement('div');
    listItem.className = 'list-group-item d-flex gap-3 py-3'; // User's existing class
    // Adjust HTML to match user's checkout item display if different
    listItem.innerHTML = `
      <div class="text-center">
        <img src="${item.image || 'images/default-product.png'}" alt="${item.name}" class="product-image rounded" style="width: 60px; height: 60px; object-fit: cover;">
        <div class="text-muted mt-1">x${item.quantity}</div>
      </div>
      <div class="flex-grow-1">
        <h6 class="mb-1">${item.name}</h6>
        ${item.variant ? `<small class="text-muted d-block">${item.variant}</small>` : ''}
        <p class="mb-0 text-primary fw-bold mt-1">${formatCurrency(item.price)}</p>
      </div>
      <div class="text-end fw-medium">
        ${formatCurrency(item.price * item.quantity)}
      </div>
    `;
    checkoutItemsList.appendChild(listItem);
  });
}

function calculateOrderSummary() {
  const checkoutItemsCount = document.getElementById('checkout-items-count');
  const checkoutSubtotalEl = document.getElementById('checkout-subtotal');
  const checkoutShippingEl = document.getElementById('checkout-shipping');
  const discountAmountEl = document.getElementById('discount-amount'); // User's ID
  const checkoutTotalEl = document.getElementById('checkout-total');

  const itemsForCheckoutString = sessionStorage.getItem('itemsForCheckout');
  const cartForSummary = itemsForCheckoutString ? JSON.parse(itemsForCheckoutString) : [];

  const totalItems = cartForSummary.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartForSummary.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let shippingCost = getShippingCost(); // User's existing function
  const discount = parseFloat(localStorage.getItem('couponDiscount')) || 0; // From localStorage
  
  const total = subtotal + shippingCost - discount;
  
  if (checkoutItemsCount) checkoutItemsCount.textContent = totalItems;
  if (checkoutSubtotalEl) checkoutSubtotalEl.textContent = formatCurrency(subtotal);
  if (checkoutShippingEl) checkoutShippingEl.textContent = shippingCost > 0 ? formatCurrency(shippingCost) : 'Miễn phí';
  if (discountAmountEl) discountAmountEl.textContent = discount > 0 ? `-${formatCurrency(discount)}` : '0₫';
  if (checkoutTotalEl) checkoutTotalEl.textContent = formatCurrency(total < 0 ? 0 : total);
  
  sessionStorage.setItem('checkoutTotal', total < 0 ? 0 : total); // Store calculated total for VNPAY or other uses
  
  if (typeof updateTransferMessage === 'function') updateTransferMessage(); // If this function depends on total
}

function getShippingCost() {
  let shippingCost = 0;
  const shippingMethodElement = document.querySelector('input[name="shippingMethod"]:checked');
  
  if (shippingMethodElement) {
    if (shippingMethodElement.id === 'fastShipping') {
      shippingCost = 30000;
    } else if (shippingMethodElement.id === 'sameDay') {
      shippingCost = 50000;
    }
    
    if (shippingMethodElement.id === 'standardShipping') {
      localStorage.setItem('shippingMethod', 'standard');
    } else if (shippingMethodElement.id === 'fastShipping') {
      localStorage.setItem('shippingMethod', 'fast');
    } else if (shippingMethodElement.id === 'sameDay') {
      localStorage.setItem('shippingMethod', 'sameDay');
    }
  } else {
    const savedMethod = localStorage.getItem('shippingMethod');
    if (savedMethod === 'fast') {
      shippingCost = 30000;
    } else if (savedMethod === 'sameDay') {
      shippingCost = 50000;
    }
  }
  
  return shippingCost;
}

function initShippingMethodListeners() {
  const shippingMethods = document.querySelectorAll('input[name="shippingMethod"]');
  const estimatedDeliveryDateEl = document.getElementById('estimated-delivery-date');

  shippingMethods.forEach(method => {
    method.addEventListener('change', function() {
      calculateOrderSummary();
      
      if (estimatedDeliveryDateEl) {
        if (this.id === 'standardShipping') {
          estimatedDeliveryDateEl.textContent = 'Dự kiến giao hàng trong 2-3 ngày';
        } else if (this.id === 'fastShipping') {
          estimatedDeliveryDateEl.textContent = 'Dự kiến giao hàng vào ngày mai';
        } else if (this.id === 'sameDay') {
          estimatedDeliveryDateEl.textContent = 'Dự kiến giao hàng trong 2-6 giờ (nội thành)';
        }
      }
    });
  });
  
  const defaultShipping = document.querySelector('input[name="shippingMethod"]:checked');
  if (defaultShipping) {
    defaultShipping.dispatchEvent(new Event('change'));
  }
}

function initPaymentMethodListeners() {
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  const cardPaymentForm = document.getElementById('card-payment-form');
  const bankTransferInfo = document.getElementById('bank-transfer-info');
  
  paymentMethods.forEach(method => {
    method.addEventListener('change', function() {
      document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('selected');
      });
      
      this.closest('.payment-method-card').classList.add('selected');
      
      const paymentMethodId = this.id || this.value;

      if (paymentMethodId === 'credit' && cardPaymentForm) {
        cardPaymentForm.style.display = 'block';
        if (bankTransferInfo) bankTransferInfo.classList.add('d-none');
      } else if (paymentMethodId === 'bank' && bankTransferInfo) {
        bankTransferInfo.classList.remove('d-none');
        if (cardPaymentForm) cardPaymentForm.style.display = 'none';
        updateTransferMessage();
      } else {
        if (cardPaymentForm) cardPaymentForm.style.display = 'none';
        if (bankTransferInfo) bankTransferInfo.classList.add('d-none');
      }
      localStorage.setItem('paymentMethod', paymentMethodId);
    });
  });

  const checkedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
  if (checkedPaymentMethod) {
    checkedPaymentMethod.dispatchEvent(new Event('change'));
  }
}

function initBankTransferFunctionality() {
  const copyBtns = document.querySelectorAll('.copy-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const inputEl = document.getElementById(targetId);
      
      if (inputEl) {
        inputEl.select();
        inputEl.setSelectionRange(0, 99999);
        
        navigator.clipboard.writeText(inputEl.value)
          .then(() => {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Đã sao chép';
            this.classList.remove('btn-outline-secondary');
            this.classList.add('btn-success');
            
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

function updateTransferMessage() {
  const transferMessageEl = document.getElementById('transferMessage');
  if (!transferMessageEl) return;
  
  const firstName = document.getElementById('firstName')?.value || '';
  const lastName = document.getElementById('lastName')?.value || '';
  const phone = document.getElementById('phone')?.value || '';
  
  const orderId = 'JP-' + Date.now().toString().slice(-6);
  
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
  
  transferMessageEl.value = message;
}

function initCouponCode() {
  const couponForm = document.querySelector('.coupon-form .input-group');
  const couponInput = couponForm ? couponForm.querySelector('input') : null;
  const couponBtn = couponForm ? couponForm.querySelector('button') : null;
  
  const savedCoupon = localStorage.getItem('couponCode');
  const savedDiscount = parseInt(localStorage.getItem('couponDiscount')) || 0;
  if (savedCoupon && savedDiscount > 0 && couponInput) {
    couponInput.value = savedCoupon;
    updateCouponDisplay(savedCoupon, savedDiscount);
  }
  
  if (couponBtn && couponInput) {
    couponBtn.addEventListener('click', function() {
      const code = couponInput.value.trim();
      
      if (couponBtn.innerHTML.includes('Hủy')) {
        removeCoupon();
        return;
      }
      
      if (!code) {
        showToast('warning', 'Thông báo', 'Vui lòng nhập mã giảm giá');
        return;
      }
      
      const coupons = {
        'WELCOME10': 10000,
        'SALE20': 20000,
        'JANY50': 50000
      };
      
      if (coupons[code]) {
        localStorage.setItem('couponDiscount', coupons[code]);
        localStorage.setItem('couponCode', code);
        
        updateCouponDisplay(code, coupons[code]);
        
        showToast('success', 'Thành công', `Mã giảm giá ${code} đã được áp dụng. Bạn được giảm ${formatCurrency(coupons[code])}`);
        
        calculateOrderSummary();
      } else {
        showToast('danger', 'Thất bại', 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      }
    });
  }
}

function updateCouponDisplay(code, discountAmount) {
  const couponForm = document.querySelector('.coupon-form');
  const couponInput = couponForm.querySelector('input');
  const couponBtn = couponForm.querySelector('button');
  
  if (couponForm && couponInput && couponBtn) {
    couponInput.value = code;
    couponInput.setAttribute('readonly', true);
    couponInput.classList.add('bg-light');
    
    couponBtn.innerHTML = '<i class="fas fa-times"></i> Hủy';
    couponBtn.classList.remove('btn-outline-primary');
    couponBtn.classList.add('btn-outline-danger');
    
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

function removeCoupon() {
  const couponForm = document.querySelector('.coupon-form');
  const couponInput = couponForm.querySelector('input');
  const couponBtn = couponForm.querySelector('button');
  const couponBadge = document.getElementById('coupon-badge');
  
  if (couponForm && couponInput && couponBtn) {
    couponInput.value = '';
    couponInput.removeAttribute('readonly');
    couponInput.classList.remove('bg-light');
    
    couponBtn.innerHTML = 'Áp dụng';
    couponBtn.classList.remove('btn-outline-danger');
    couponBtn.classList.add('btn-outline-primary');
    
    if (couponBadge) {
      couponBadge.remove();
    }
    
    localStorage.removeItem('couponDiscount');
    localStorage.removeItem('couponCode');
    
    calculateOrderSummary();
    
    showToast('info', 'Thông báo', 'Đã hủy mã giảm giá');
  }
}

function collectOrderData() {
  const shippingInfo = { // Giữ lại để dễ đọc, nhưng sẽ trải phẳng khi gửi
    firstName: document.getElementById('firstName')?.value || '',
    lastName: document.getElementById('lastName')?.value || '',
    email: document.getElementById('email')?.value || '',
    phone: document.getElementById('phone')?.value || '',
    address: document.getElementById('address')?.value || '',
    city: document.getElementById('city')?.value || '',
    district: document.getElementById('district')?.value || '',
    ward: document.getElementById('ward')?.value || ''
  };
  
  const paymentMethodChecked = document.querySelector('input[name="paymentMethod"]:checked');
  const paymentMethodValue = paymentMethodChecked ? paymentMethodChecked.value : '';
  
  const shippingMethodChecked = document.querySelector('input[name="shippingMethod"]:checked');
  let shippingMethodValue = '';
  if (shippingMethodChecked) {
    // Adapt to user's specific values if different
    if (shippingMethodChecked.id === 'standardShipping') shippingMethodValue = 'STANDARD';
    else if (shippingMethodChecked.id === 'fastShipping') shippingMethodValue = 'FAST';
    else if (shippingMethodChecked.id === 'sameDay') shippingMethodValue = 'SAME_DAY';
    else shippingMethodValue = shippingMethodChecked.id; 
  }

  const itemsForCheckoutString = sessionStorage.getItem('itemsForCheckout');
  const cartForOrder = itemsForCheckoutString ? JSON.parse(itemsForCheckoutString) : [];
  
  if (cartForOrder.length === 0) {
    console.error("Cannot collect order data: No items selected for checkout.");
    if(window.ToastService) window.ToastService.error("Không có sản phẩm để đặt hàng.");
    else alert("Không có sản phẩm để đặt hàng.");
    return null; 
  }

  const notesValue = document.getElementById('order-notes')?.value || '';
  const couponCode = localStorage.getItem('couponCode') || '';
  // The total amount for the order should be calculated on the backend based on items, prices, and coupon.
  // Frontend total is for display and VNPAY amount suggestion.
  
  return {
    customerFirstName: shippingInfo.firstName,
    customerLastName: shippingInfo.lastName,
    customerEmail: shippingInfo.email,
    customerPhone: shippingInfo.phone,
    shippingAddress: shippingInfo.address,
    shippingCity: shippingInfo.city,
    shippingDistrict: shippingInfo.district,
    shippingWard: shippingInfo.ward,
    paymentMethod: paymentMethodValue,
    shippingMethod: shippingMethodValue,
    // Backend DTO might expect 'items' or 'orderDetails' instead of 'cart'
    cart: cartForOrder.map(item => ({ 
        id: item.id, 
        name: item.name, 
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        variant: item.variant || null 
    })), 
    orderNotes: notesValue,
    couponCode: couponCode,
    // The final totalAmount will be determined by the backend
  };
}

function saveOrderToHistory(orderId, orderData) {
  const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
  
  orderHistory.push({
    id: orderId,
    ...orderData
  });
  
  localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
}

function updateEstimatedDeliveryDate() {
  const estimatedElement = document.getElementById('estimated-delivery-date');
  if (!estimatedElement) return;
  
  const today = new Date();
  let deliveryDays = 3;
  
  const shippingMethodElement = document.querySelector('input[name="shippingMethod"]:checked');
  
  if (shippingMethodElement) {
    if (shippingMethodElement.id === 'fastShipping') {
      deliveryDays = 1;
    } else if (shippingMethodElement.id === 'sameDay') {
      deliveryDays = 0;
    }
  } else {
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
    const hours = today.getHours();
    const deliveryTime = hours < 12 ? 'chiều nay' : 'tối nay';
    estimatedElement.textContent = `Dự kiến giao hàng vào ${deliveryTime} (${deliveryDate.toLocaleDateString('vi-VN', options)})`;
  } else {
    estimatedElement.textContent = `Dự kiến giao hàng vào ngày ${deliveryDate.toLocaleDateString('vi-VN', options)} - ${nextDay.toLocaleDateString('vi-VN', options)}`;
  }
}

function updateCartBadgeCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const badges = document.querySelectorAll('.fa-shopping-cart + .badge');
  badges.forEach(badge => {
    badge.textContent = itemCount;
  });
}

function showToast(type, title, message) {
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
  
  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 3000
  });
  
  bsToast.show();
  
  toast.addEventListener('hidden.bs.toast', function() {
    toast.remove();
  });
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'position-fixed bottom-0 end-0 p-3';
  container.style.zIndex = '1050';
  document.body.appendChild(container);
  return container;
}

function initAddressDropdowns() {
  const citySelect = document.getElementById('city');
  const districtSelect = document.getElementById('district');
  const wardSelect = document.getElementById('ward');

  if (!citySelect || !districtSelect || !wardSelect) {
    console.warn("Address select elements not found.");
    return;
  }

  citySelect.addEventListener('change', function() {
    const selectedCity = this.value;
    populateDropdown(districtSelect, selectedCity ? Object.keys(vietnameseAddressData[selectedCity] || {}) : []);
    populateDropdown(wardSelect, []); 
    districtSelect.dispatchEvent(new Event('change'));
  });

  districtSelect.addEventListener('change', function() {
    const selectedCity = citySelect.value;
    const selectedDistrict = this.value;
    if (selectedCity && selectedDistrict && vietnameseAddressData[selectedCity] && vietnameseAddressData[selectedCity][selectedDistrict]) {
      populateDropdown(wardSelect, vietnameseAddressData[selectedCity][selectedDistrict]);
    } else {
      populateDropdown(wardSelect, []);
    }
  });
}

function populateDropdown(selectElement, optionsArray) {
  selectElement.innerHTML = '<option value="">Chọn...</option>';
  if (optionsArray && optionsArray.length > 0) {
    optionsArray.forEach(optionValue => {
      const option = new Option(optionValue, optionValue);
      selectElement.add(option);
    });
  }
  if (optionsArray.length === 0) {
    selectElement.value = ""; 
  }
}