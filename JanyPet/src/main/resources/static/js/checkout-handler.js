/**
 * JanyPet - Checkout Handler
 * This script connects the checkout process with the order service and VNPAY
 */

document.addEventListener("DOMContentLoaded", () => {
  if (window.apiService && typeof window.apiService.init === 'function') {
    window.apiService.init().then(() => {
      console.log("Checkout-handler: API Service initialized successfully.");
      initCheckoutHandler();
    }).catch(error => {
      console.error("Checkout-handler: API Service failed to initialize:", error);
      initCheckoutHandler(); 
    });
  } else {
    console.warn("Checkout-handler: apiService not found or init function missing.");
    initCheckoutHandler();
  }
});

function initCheckoutHandler() {
  const checkoutForm = document.getElementById("checkout-form");
  const placeOrderBtn = document.getElementById("place-order-btn");

  if (checkoutForm && placeOrderBtn) {
    checkoutForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      let orderData; 

      if (!checkoutForm.checkValidity()) {
        event.stopPropagation();
        checkoutForm.classList.add("was-validated");
        window.ToastService?.error("Vui lòng điền đầy đủ thông tin hợp lệ.");
        return;
      }
      checkoutForm.classList.add("was-validated");

      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang xử lý...';

      try {
        if (typeof collectOrderData !== 'function') {
            throw new Error("collectOrderData function is not defined.");
        }
        orderData = collectOrderData(); 

        if (!orderData) {
          window.ToastService?.error("Không thể thu thập dữ liệu đơn hàng. Vui lòng thử lại.");
          if (typeof resetPlaceOrderButton === 'function') resetPlaceOrderButton(placeOrderBtn);
          return;
        }

        console.log("Sending order data to backend:", orderData);

        let createdOrder;
        if (window.apiService && typeof window.apiService.createOrder === 'function') {
            createdOrder = await window.apiService.createOrder(orderData);
        } else if (window.OrderService && typeof window.OrderService.createOrder === 'function') {
            createdOrder = await window.OrderService.createOrder(orderData);
        } else {
            throw new Error("Order creation service is not available.");
        }
        
        console.log("Created order response:", createdOrder);

        if (createdOrder && (createdOrder.id || createdOrder.orderCode)) {
          const orderCodeForPayment = createdOrder.orderCode || createdOrder.id;
          const totalAmountForPayment = createdOrder.totalAmount; // Lấy totalAmount từ đơn hàng đã tạo

          if (orderData.paymentMethod === "VNPAY") {
            console.log(`Payment method is VNPAY. Proceeding to VNPAY for order: ${orderCodeForPayment}`);
            
            const amountForVnpay = Math.round(parseFloat(totalAmountForPayment)); // Sử dụng totalAmount từ createdOrder

            const vnpayRequestData = {
              orderCode: orderCodeForPayment,
              amount: amountForVnpay,
              bankCode: "", 
              language: "vn",
              orderInfo: `Thanh toan cho don hang ${orderCodeForPayment}`
            };

            console.log("Requesting VNPAY payment URL with data:", vnpayRequestData);

            try {
              const vnpayApiResponse = await fetch('/api/vnpay/create_payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vnpayRequestData)
              });

              if (!vnpayApiResponse.ok) {
                const errorText = await vnpayApiResponse.text();
                let errorJson = {};
                try { errorJson = JSON.parse(errorText); } catch (e) { /* ignore */ }
                throw new Error(`Lỗi tạo thanh toán VNPAY: ${vnpayApiResponse.status} - ${errorJson.message || errorText || 'Không thể lấy URL thanh toán'}`);
              }

              const vnpayResponse = await vnpayApiResponse.json();
              console.log("VNPAY create_payment response:", vnpayResponse);

              if (vnpayResponse.status === "OK" && vnpayResponse.paymentUrl) {
                window.ToastService?.success("Đang chuyển hướng đến VNPAY...");
                window.location.href = vnpayResponse.paymentUrl;
                return; 
              } else {
                throw new Error(vnpayResponse.message || "Không thể lấy URL thanh toán VNPAY.");
              }
            } catch (vnpayError) {
              console.error("Error calling VNPAY create_payment:", vnpayError);
              window.ToastService?.error(`Lỗi VNPAY: ${vnpayError.message}`);
              // Nút sẽ được reset trong khối finally
            }

          } else if (orderData.paymentMethod === "BANK_TRANSFER") { // Đảm bảo giá trị này khớp với value trong HTML
            if (typeof handleOrderSuccess === 'function') handleOrderSuccess(orderCodeForPayment, orderData);
            window.ToastService?.success("Đơn hàng đã được tạo thành công! Vui lòng kiểm tra email và làm theo hướng dẫn thanh toán.");
            if (typeof clearCartAndResetForm === 'function') clearCartAndResetForm(checkoutForm);
          } else { // COD hoặc các phương thức khác
            if (typeof handleOrderSuccess === 'function') handleOrderSuccess(orderCodeForPayment);
            window.ToastService?.success("Đơn hàng đã được tạo thành công! Chúng tôi sẽ liên hệ với bạn sớm.");
            if (typeof clearCartAndResetForm === 'function') clearCartAndResetForm(checkoutForm);
          }
        } else {
          const errorMessage = createdOrder?.message || "Không thể tạo đơn hàng. Vui lòng thử lại.";
          console.error("Order creation failed:", errorMessage);
          window.ToastService?.error(errorMessage);
        }
      } catch (error) {
        console.error("Error placing order:", error);
        let displayErrorMessage = "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.";
        // Cố gắng lấy message chi tiết hơn từ lỗi API nếu có
        if (error.response && error.response.data && error.response.data.message) {
            displayErrorMessage = error.response.data.message;
        } else if (error.message) {
            displayErrorMessage = error.message;
        }
        window.ToastService?.error(displayErrorMessage);
      } finally {
        // Chỉ reset nút nếu không có chuyển hướng hoặc có lỗi XẢY RA TRƯỚC KHI CHUYỂN HƯỚNG
        // Kiểm tra xem có đang ở trang VNPAY không
        if (window.location.href.indexOf('vnpayment') === -1) {
            if (typeof resetPlaceOrderButton === 'function') resetPlaceOrderButton(placeOrderBtn);
        }
      }
    });
  } else {
    console.warn("Checkout form or place order button not found.");
  }

  // Các hàm này thường được định nghĩa và gọi trong checkout.js để thiết lập UI ban đầu.
  // Nếu chúng chỉ là các trình xử lý sự kiện, việc gọi chúng ở đây có thể không cần thiết
  // hoặc cần đảm bảo chúng được thiết kế để có thể gọi lại mà không gây lỗi.
  // Ví dụ:
  // if (typeof initializePaymentMethodHandler === 'function') initializePaymentMethodHandler();
  // if (typeof initializeAddressHandlers === 'function') initializeAddressHandlers();
  // if (typeof initializeCouponHandler === 'function') initializeCouponHandler();
  console.log("Checkout-handler.js: initCheckoutHandler completed.");
}

function clearCartAndResetForm(checkoutFormElement) {
    const orderedItemsString = sessionStorage.getItem('itemsForCheckout');
    
    if (orderedItemsString) {
        const orderedItems = JSON.parse(orderedItemsString);
        let mainCart = JSON.parse(localStorage.getItem('cart')) || [];

        // Create a way to uniquely identify items (e.g., id + variant)
        const orderedItemSignatures = orderedItems.map(item => `${item.id}-${item.variant || ''}`);
        
        // Filter out the ordered items from the main localStorage cart
        mainCart = mainCart.filter(cartItem => {
            const cartItemSignature = `${cartItem.id}-${cartItem.variant || ''}`;
            return !orderedItemSignatures.includes(cartItemSignature);
        });

        localStorage.setItem('cart', JSON.stringify(mainCart));
    } else {
        // Fallback or if itemsForCheckout was already cleared, clear the whole cart
        localStorage.removeItem('cart'); 
        console.warn("clearCartAndResetForm: 'itemsForCheckout' not found in sessionStorage. Cleared entire cart as a fallback.");
    }

    // Clear checkout-specific storage
    sessionStorage.removeItem('itemsForCheckout');
    sessionStorage.removeItem('checkoutTotal'); 

    // Clear coupon info related to this checkout
    localStorage.removeItem('couponDiscount'); 
    localStorage.removeItem('couponCode');
    localStorage.removeItem('freeShipping'); 

    // Clear selected shipping and payment methods from localStorage
    localStorage.removeItem('shippingMethod');
    localStorage.removeItem('paymentMethod');

    if (checkoutFormElement) {
        checkoutFormElement.reset();
        checkoutFormElement.classList.remove('was-validated');
    }

    // Update cart badge in the header
    if (typeof updateCartCount === 'function') { 
        updateCartCount();
    } else if (window.cartService && typeof window.cartService.updateCartUI === 'function') {
        window.cartService.updateCartUI(); 
    } else {
        const cartCountElements = document.querySelectorAll('.badge.bg-primary'); 
        const remainingCart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemCount = remainingCart.reduce((total, item) => total + item.quantity, 0);
        cartCountElements.forEach(element => { element.textContent = itemCount; });
    }
    
    // Reload items on checkout page (will show empty or redirect)
    // Ensure these functions are available or their absence is handled gracefully
    if (typeof loadCheckoutItems === 'function') loadCheckoutItems(); 
    if (typeof calculateOrderSummary === 'function') calculateOrderSummary();

    console.log("Selected items removed from cart, checkout form reset, and related localStorage cleared.");
}

function handleOrderSuccess(orderCode, orderDataForBankTransfer) {
  document.getElementById('order-id').textContent = orderCode; 
  
  const successModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
  
  if (orderDataForBankTransfer && orderDataForBankTransfer.paymentMethod === "BANK_TRANSFER") {
    displayBankTransferInfo({ orderCode: orderCode }, orderDataForBankTransfer); 
  } else {
    const successModalBody = document.querySelector('#orderSuccessModal .modal-body');
    const existingBankNote = successModalBody.querySelector('.alert.alert-info');
    if (existingBankNote) existingBankNote.remove();

    const modalFooter = document.querySelector('#orderSuccessModal .modal-footer');
    const existingFbLink = modalFooter.querySelector('a[href*="facebook.com"]');
    if (existingFbLink && modalFooter.firstChild.isSameNode(existingFbLink)) {
      existingFbLink.remove();
    }
  }
  
  successModal.show();
}
