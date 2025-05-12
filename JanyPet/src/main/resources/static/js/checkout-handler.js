/**
 * JanyPet - Checkout Handler
 * This script connects the checkout process with the order service
 */

document.addEventListener("DOMContentLoaded", () => {
  // Ensure apiService is initialized before checkout handler attempts to use OrderService
  if (window.apiService && typeof window.apiService.init === 'function') {
    window.apiService.init().then(() => {
      initCheckoutHandler();
    }).catch(error => {
      console.error("API Service failed to initialize for checkout:", error);
      // Fallback or error message if API service is critical and fails
      // For now, we can still try to init checkout handler which might use mock data
      initCheckoutHandler();
    });
  } else {
    console.warn("apiService not found or init function missing. Checkout might rely on mock data.");
    initCheckoutHandler(); // Proceed, OrderService might use mock data
  }
});

function initCheckoutHandler() {
  const checkoutForm = document.getElementById("checkout-form");
  const placeOrderBtn = document.getElementById("place-order-btn");

  if (checkoutForm && placeOrderBtn) {
    checkoutForm.addEventListener("submit", async function (event) {
      event.preventDefault(); // Always prevent default first

      if (!checkoutForm.checkValidity()) {
        event.stopPropagation();
        checkoutForm.classList.add("was-validated");
        window.ToastService?.error("Vui lòng điền đầy đủ thông tin hợp lệ.");
        return;
      }
      checkoutForm.classList.add("was-validated");

      // Disable button and show loading state
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang xử lý...';

      try {
        const orderData = collectOrderData();
        if (!orderData) {
          window.ToastService?.error("Không thể thu thập dữ liệu đơn hàng. Vui lòng thử lại.");
          resetPlaceOrderButton(placeOrderBtn);
          return;
        }

        // Call OrderService to create the order
        const createdOrder = await window.OrderService.createOrder(orderData);

        if (createdOrder && createdOrder.id) {
          // Update the modal with the actual order ID
          const orderIdElement = document.getElementById("order-id");
          if (orderIdElement) {
            orderIdElement.textContent = createdOrder.id;
          }

          // Show success modal
          const successModalElement = document.getElementById("orderSuccessModal");
          if (successModalElement) {
            const successModal = bootstrap.Modal.getInstance(successModalElement) || new bootstrap.Modal(successModalElement);
            successModal.show();
            console.log("Showing modal", successModalElement); // For debugging
          } else {
            console.error("Success modal element not found!");
            window.ToastService?.success(`Đặt hàng thành công! Mã đơn hàng: ${createdOrder.id}. Không thể hiển thị popup.`);
          }
          
          // Clear cart from localStorage (ensure key matches cart.js)
          localStorage.removeItem('cart'); // Assuming cart.js uses 'cart'
          if (window.updateCartBadgeCount) window.updateCartBadgeCount(); // If this function is global
          if (window.loadCart) window.loadCart(); // To update cart display if on cart page or header

          // Optionally, redirect or update UI further
          // window.location.href = 'order-confirmation.html?orderId=' + createdOrder.id;

        } else {
          window.ToastService?.error("Đặt hàng không thành công. Vui lòng thử lại.");
          console.error("Order creation failed or returned invalid data:", createdOrder);
        }
      } catch (error) {
        console.error("Error placing order:", error);
        window.ToastService?.error(`Đã xảy ra lỗi khi đặt hàng: ${error.message || 'Vui lòng thử lại.'}`);
      } finally {
        // Re-enable button
        resetPlaceOrderButton(placeOrderBtn);
      }
    });
  } else {
    console.warn("Checkout form or place order button not found.");
  }

  // Initialize other handlers like payment method selection, address population etc.
  // This part can be moved from the inline script in checkout.html to here or checkout.js
  initializePaymentMethodHandler();
  initializeAddressHandlers(); // If you have city/district/ward logic
  initializeCouponHandler();
}

function resetPlaceOrderButton(buttonElement) {
  if (buttonElement) {
    buttonElement.disabled = false;
    buttonElement.innerHTML = '<i class="fas fa-shopping-bag me-2"></i>Đặt hàng';
  }
}

/**
 * Collect order data from form
 * @returns {Object|null} Order data or null if required fields are missing
 */
function collectOrderData() {
  const currentUser = getCurrentUser(); // From checkout.js or a shared utility

  const items = JSON.parse(localStorage.getItem('cart')) || [];
  if (items.length === 0) {
    window.ToastService?.error("Giỏ hàng của bạn đang trống.");
    return null;
  }

  // Map cart items to the format expected by OrderCreateRequest
  const orderItems = items.map(item => ({
    productId: item.id, // Assuming item.id is the productId
    quantity: item.quantity,
    color: item.color || "Default", // Provide defaults if not present
    size: item.size || "Default",   // Provide defaults if not present
    unitPrice: item.price
  }));

  const selectedShippingMethodElement = document.querySelector('input[name="shippingMethod"]:checked');
  const selectedPaymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');


  const orderData = {
    userId: currentUser ? currentUser.id : null, // Handle guest checkout if applicable
    customerFirstName: document.getElementById("firstName")?.value,
    customerLastName: document.getElementById("lastName")?.value,
    customerEmail: document.getElementById("email")?.value,
    customerPhone: document.getElementById("phone")?.value,
    shippingAddress: document.getElementById("address")?.value,
    shippingCity: document.getElementById("city")?.value,
    shippingDistrict: document.getElementById("district")?.value,
    shippingWard: document.getElementById("ward")?.value,
    shippingMethod: selectedShippingMethodElement ? selectedShippingMethodElement.id.toUpperCase().replace("SHIPPING", "") : "STANDARD", // e.g., STANDARD, FAST
    paymentMethod: selectedPaymentMethodElement ? selectedPaymentMethodElement.id.toUpperCase() : "COD", // e.g., COD, CREDIT, VNPAY
    couponCode: document.querySelector('.coupon-form input[type="text"]')?.value || null,
    orderNotes: document.getElementById("order-notes")?.value,
    items: orderItems,
    // subtotalAmount, totalAmount, shippingFee, discountAmount will be calculated backend
  };

  // Basic validation for critical fields before sending
  if (!orderData.customerFirstName || !orderData.customerLastName || !orderData.customerEmail || !orderData.customerPhone || !orderData.shippingAddress) {
      window.ToastService?.error("Vui lòng điền đầy đủ thông tin giao hàng.");
      return null;
  }

  return orderData;
}


// Placeholder for getCurrentUser - ensure this is consistent with your auth logic
function getCurrentUser() {
  const userJson = localStorage.getItem("currentUser");
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error("Error parsing currentUser from localStorage", e);
      return null;
    }
  }
  return null; // Or a guest user object
}


function initializePaymentMethodHandler() {
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  const bankTransferInfo = document.getElementById('bank-transfer-info');
  // const cardPaymentForm = document.getElementById('card-payment-form'); // If you have a specific form for card details

  paymentMethods.forEach(method => {
    method.addEventListener('change', function() {
      document.querySelectorAll('.payment-method-card.selected').forEach(card => {
        card.classList.remove('selected');
      });
      this.closest('.payment-method-card').classList.add('selected');

      if (this.id === 'bank') {
        bankTransferInfo?.classList.remove('d-none');
        // cardPaymentForm?.style.display = 'none';
        // Auto-generate transfer message
        const transferMessageInput = document.getElementById('transferMessage');
        if (transferMessageInput) {
            const phone = document.getElementById('phone')?.value || 'SDT';
            const name = document.getElementById('lastName')?.value || 'TEN';
            transferMessageInput.value = `TT JANYPET ${phone.slice(-4)} ${name.toUpperCase()}`;
        }

      } else {
        bankTransferInfo?.classList.add('d-none');
        // if (this.id === 'credit') {
        //   cardPaymentForm?.style.display = 'block';
        // } else {
        //   cardPaymentForm?.style.display = 'none';
        // }
      }
    });
  });

  // Copy button for bank transfer
  const copyButton = document.querySelector('.copy-btn[data-target="transferMessage"]');
  if(copyButton) {
    copyButton.addEventListener('click', function() {
        const targetInput = document.getElementById(this.dataset.target);
        if(targetInput) {
            targetInput.select();
            targetInput.setSelectionRange(0, 99999); // For mobile devices
            try {
                document.execCommand('copy');
                window.ToastService?.success("Đã sao chép nội dung chuyển khoản!");
            } catch (err) {
                window.ToastService?.error("Không thể sao chép tự động.");
                console.error('Fallback: Oops, unable to copy', err);
            }
        }
    });
  }
}

function initializeAddressHandlers() {
  // This function should contain the city/district/ward dropdown logic
  // from your checkout.html inline script if you want to move it here.
  // For brevity, I'm assuming it remains in checkout.js or the inline script for now.
  // If you move it, ensure it's called within initCheckoutHandler.
}

function initializeCouponHandler() {
    const couponApplyBtn = document.querySelector('.coupon-form button');
    const couponInput = document.querySelector('.coupon-form input[type="text"]');

    if (couponApplyBtn && couponInput) {
        couponApplyBtn.addEventListener('click', async () => {
            const couponCode = couponInput.value.trim();
            if (!couponCode) {
                window.ToastService?.warning("Vui lòng nhập mã giảm giá.");
                return;
            }
            // Placeholder for applying coupon - you'll need an API for this
            console.log("Applying coupon:", couponCode);
            try {
                // const discountResult = await window.CouponService.applyCoupon(couponCode, currentSubtotal);
                // if (discountResult.success) {
                //     document.getElementById('discount-amount').textContent = formatCurrency(discountResult.discountAmount);
                //     calculateOrderSummary(); // Recalculate total
                //     window.ToastService?.success("Áp dụng mã giảm giá thành công!");
                // } else {
                //     window.ToastService?.error(discountResult.message || "Mã giảm giá không hợp lệ.");
                // }
                window.ToastService?.info("Chức năng mã giảm giá đang được phát triển.");
            } catch (error) {
                window.ToastService?.error("Lỗi khi áp dụng mã giảm giá.");
                console.error("Coupon error:", error);
            }
        });
    }
}

// Ensure this file is loaded after checkout.js if it relies on functions from there,
// or move shared functions to a utility file.
