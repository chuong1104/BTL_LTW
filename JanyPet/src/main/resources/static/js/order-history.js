/**
 * JanyPet - Order History
 * This script handles the user's order history page
 */

document.addEventListener("DOMContentLoaded", () => {
  const orderHistoryContainer = document.getElementById("order-history-container");
  if (!orderHistoryContainer) {
    // console.log("Not on order history page or container not found.");
    return;
  }
  console.log("Initializing Order History...");
  initOrderHistory();
});

/**
 * Initialize order history
 */
async function initOrderHistory() {
  const orderHistoryContainer = document.getElementById("order-history-container");
  const loadingIndicator = document.getElementById("order-history-loading"); // Assuming you have one

  if (loadingIndicator) loadingIndicator.style.display = "block";

  try {
    const currentUser = getCurrentUser(); // Implement this to get the logged-in user's ID
    if (!currentUser || !currentUser.id) {
      orderHistoryContainer.innerHTML = '<p class="text-center">Vui lòng đăng nhập để xem lịch sử đơn hàng.</p>';
      // Potentially redirect to login or show login prompt
      return;
    }

    const orders = await fetchOrderHistory(currentUser.id);
    renderOrderHistory(orders);
  } catch (error) {
    console.error("Error initializing order history:", error);
    orderHistoryContainer.innerHTML =
      '<p class="text-center text-danger">Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.</p>';
    window.ToastService?.error("Lỗi tải lịch sử đơn hàng.");
  } finally {
    if (loadingIndicator) loadingIndicator.style.display = "none";
  }
}

/**
 * Get current logged in user
 * @returns {Object|null} Current user or null if not logged in
 */
function getCurrentUser() {
  // This is a placeholder - replace with your actual authentication logic
  // For example, if user info is stored after login:
  const userJson = localStorage.getItem("currentUser"); // Or however you store user session
  if (userJson) {
    const user = JSON.parse(userJson);
    // Ensure the user object has an 'id' property that matches your backend's userId
    return user; // e.g., { id: "user123", username: "testuser", ... }
  }
  return null;
}

/**
 * Fetch order history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Promise with user's orders
 */
async function fetchOrderHistory(userId) {
  try {
    // Call the updated OrderService method which doesn't take pagination params
    const orders = await window.OrderService.getOrdersByUserId(userId);
    return orders || []; // Ensure it returns an array
  } catch (error) {
    console.error(`Failed to fetch order history for user ${userId}:`, error);
    throw error; // Re-throw to be caught by initOrderHistory
  }
}

/**
 * Render order history
 * @param {Array} orders - Orders to render
 */
function renderOrderHistory(orders) {
  const orderHistoryContainer = document.getElementById("order-history-container");

  if (!orders || orders.length === 0) {
    orderHistoryContainer.innerHTML = '<p class="text-center">Bạn chưa có đơn hàng nào.</p>';
    return;
  }

  // Sort orders by date (newest first)
  orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

  let html = `
    <h2 class="mb-4">Lịch sử đơn hàng của bạn</h2>
    <div class="order-history-list accordion" id="orderHistoryAccordion">
  `;

  orders.forEach((order, index) => {
    const orderDate = new Date(order.orderDate);
    const formattedDate = orderDate.toLocaleDateString("vi-VN", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    const statusClass = getOrderStatusClass(order.status);
    const progress = getOrderProgressPercentage(order.status);

    html += `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading-${order.orderCode}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${order.id}" aria-expanded="false" aria-controls="collapse-${order.id}">
            <div class="w-100 d-flex justify-content-between align-items-center">
              <span>Đơn hàng #${order.orderCode} - ${formattedDate}</span>
              <span class="status-badge ${statusClass} ms-2">${order.status}</span>
            </div>
          </button>
        </h2>
        <div id="collapse-${order.id}" class="accordion-collapse collapse" aria-labelledby="heading-${order.id}" data-bs-parent="#orderHistoryAccordion">
          <div class="accordion-body">
            <p><strong>Tổng tiền:</strong> ${formatCurrency(order.totalAmount)}</p>
            <p><strong>Số lượng sản phẩm:</strong> ${order.itemCount || (order.orderDetails ? order.orderDetails.length : (order.orderItems ? order.orderItems.length : 0))}</p>
            <div class="progress mb-2" style="height: 5px;">
              <div class="progress-bar ${statusClass}" role="progressbar" style="width: ${progress}%;" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <button class="btn btn-sm btn-primary view-order-details" data-order-id="${order.id}">Xem chi tiết</button>
            <!-- Add review button if applicable -->
            ${(order.status === 'COMPLETED' || order.status === 'DELIVERED') ? `<button class="btn btn-sm btn-outline-success ms-2 review-order-btn" data-order-id="${order.id}">Đánh giá</button>` : ''}
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  orderHistoryContainer.innerHTML = html;

  document.querySelectorAll(".view-order-details").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const orderId = e.currentTarget.dataset.orderId;
      // Find the full order details from the initially fetched list or fetch again if only summary was fetched
      const orderDetail = orders.find(o => o.id === orderId); // Assuming 'orders' contains enough detail or use getOrderById
      if (orderDetail) {
        viewOrderDetails(orderDetail); // Pass the full order object
      } else {
         window.OrderService.getOrderById(orderId).then(fullOrder => {
            if(fullOrder) viewOrderDetails(fullOrder);
            else window.ToastService?.error("Không tìm thấy chi tiết đơn hàng.");
         }).catch(() => window.ToastService?.error("Lỗi tải chi tiết đơn hàng."));
      }
    });
  });

  document.querySelectorAll(".review-order-btn").forEach(btn => {
    btn.addEventListener("click", e => {
        const orderId = e.currentTarget.dataset.orderId;
        const orderToReview = orders.find(o => o.id === orderId);
        if(orderToReview) showReviewModal(orderToReview);
    });
  });
}

/**
 * View order details
 * @param {Object} order - The full order object
 */
function viewOrderDetails(order) {
  if (!order) {
    window.ToastService?.error("Không có thông tin chi tiết cho đơn hàng này.");
    return;
  }

  const modalId = "orderDetailsModal";
  let modalElement = document.getElementById(modalId);
  if (modalElement) modalElement.remove(); // Remove existing modal

  const orderDate = new Date(order.orderDate);
  const formattedDate = orderDate.toLocaleDateString("vi-VN", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const statusClass = getOrderStatusClass(order.status);
  const paymentClass = getOrderStatusClass(order.paymentStatus || "UNKNOWN"); // Assuming paymentStatus exists

  let itemsHtml = "";
  const itemsToDisplay = order.orderDetails || order.orderItems || []; // Handle both structures
  if (itemsToDisplay.length > 0) {
    itemsHtml = itemsToDisplay.map(item => `
      <tr>
        <td>${item.productName || item.name}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.unitPrice || item.price)}</td>
        <td>${formatCurrency((item.unitPrice || item.price) * item.quantity)}</td>
      </tr>
    `).join("");
  } else {
    itemsHtml = '<tr><td colspan="4" class="text-center">Không có sản phẩm trong đơn hàng.</td></tr>';
  }

  modalElement = document.createElement("div");
  modalElement.className = "modal fade";
  modalElement.id = modalId;
  modalElement.tabIndex = -1;
  modalElement.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Chi tiết đơn hàng #${order.orderCode}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p><strong>Ngày đặt:</strong> ${formattedDate}</p>
          <p><strong>Trạng thái:</strong> <span class="status-badge ${statusClass}">${order.status}</span></p>
          <p><strong>Thanh toán:</strong> <span class="status-badge ${paymentClass}">${order.paymentMethod} - ${order.paymentStatus || "N/A"}</span></p>
          <p><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress || order.customerInfo?.address || "N/A"}</p>
          <h6>Sản phẩm đã đặt:</h6>
          <table class="table table-sm">
            <thead><tr><th>Tên sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <hr>
            <div class="row text-end">
                <div class="col-md-9"><strong>Tổng phụ:</strong></div>
                <div class="col-md-3">${formatCurrency(order.subtotalAmount || order.subtotal || 0)}</div>
                <div class="col-md-9"><strong>Phí vận chuyển:</strong></div>
                <div class="col-md-3">${formatCurrency(order.shippingFee || 0)}</div>
                <div class="col-md-9"><strong>Giảm giá:</strong></div>
                <div class="col-md-3">-${formatCurrency(order.discountAmount || order.discount || 0)}</div>
                <div class="col-md-9"><strong>Tổng cộng:</strong></div>
                <div class="col-md-3"><strong>${formatCurrency(order.totalAmount || 0)}</strong></div>
            </div>
            ${order.orderNotes || order.notes ? `<div class="mt-3"><strong>Ghi chú:</strong> ${order.orderNotes || order.notes}</div>` : ""}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalElement);
  const modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
  modalElement.addEventListener('hidden.bs.modal', () => {
    document.body.removeChild(modalElement);
  });
}

/**
 * Show review modal
 * @param {Object} order - Order object
 */
function showReviewModal(order) {
    const modalId = "reviewModal";
    let modalElement = document.getElementById(modalId);
    if (modalElement) modalElement.remove();

    // Assuming order.orderDetails or order.orderItems exists and contains product info
    const itemsForReview = order.orderDetails || order.orderItems || [];
    let productReviewHtml = itemsForReview.map(item => `
        <div class="mb-3 border p-2 rounded product-review-item" data-product-id="${item.productId || item.id}">
            <h6>${item.productName || item.name}</h6>
            <label for="rating-${item.productId || item.id}" class="form-label">Đánh giá (1-5 sao):</label>
            <input type="number" class="form-control rating-input" id="rating-${item.productId || item.id}" min="1" max="5" required>
            <label for="comment-${item.productId || item.id}" class="form-label mt-2">Bình luận:</label>
            <textarea class="form-control comment-input" id="comment-${item.productId || item.id}" rows="2"></textarea>
        </div>
    `).join('');

    if (itemsForReview.length === 0) {
        productReviewHtml = "<p>Không có sản phẩm nào để đánh giá trong đơn hàng này.</p>";
    }

    modalElement = document.createElement("div");
    modalElement.className = "modal fade";
    modalElement.id = modalId;
    modalElement.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Đánh giá đơn hàng #${order.id}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="review-form">
                        ${productReviewHtml}
                        ${itemsForReview.length > 0 ? '<button type="submit" class="btn btn-primary mt-3">Gửi đánh giá</button>' : ''}
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalElement);
    const reviewModal = new bootstrap.Modal(modalElement);
    reviewModal.show();

    const reviewForm = modalElement.querySelector("#review-form");
    if (reviewForm && itemsForReview.length > 0) {
        reviewForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const reviews = [];
            modalElement.querySelectorAll('.product-review-item').forEach(itemEl => {
                const productId = itemEl.dataset.productId;
                const rating = itemEl.querySelector('.rating-input').value;
                const comment = itemEl.querySelector('.comment-input').value;
                if (rating) { // Only add if rating is provided
                    reviews.push({ productId, rating: parseInt(rating), comment });
                }
            });

            if (reviews.length > 0) {
                await submitReview(order.id, reviews); // Pass array of reviews
                reviewModal.hide();
            } else {
                window.ToastService?.warning("Vui lòng cung cấp ít nhất một đánh giá.");
            }
        });
    }
     modalElement.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modalElement);
      });
}

/**
 * Submit review
 * @param {string} orderId - Order ID
 * @param {Array} reviewsData - Array of review data objects { productId, rating, comment }
 */
async function submitReview(orderId, reviewsData) {
  try {
    // This is a placeholder. You'll need an API endpoint for submitting reviews.
    // Example: await fetch(`/api/orders/${orderId}/reviews`, { method: 'POST', body: JSON.stringify(reviewsData) ... });
    console.log(`Submitting reviews for order ${orderId}:`, reviewsData);
    window.ToastService?.success("Cảm ơn bạn đã đánh giá!");
    // Optionally, update UI or re-fetch order history if reviews change display
  } catch (error) {
    console.error("Failed to submit review:", error);
    window.ToastService?.error("Lỗi khi gửi đánh giá.");
  }
}

/**
 * Get order status class for CSS styling
 * @param {string} status - Order status
 * @returns {string} CSS class
 */
function getOrderStatusClass(status) {
  if (!status) return "status-unknown";
  switch (status.toUpperCase()) {
    case "PENDING": return "bg-warning text-dark";
    case "PROCESSING": return "bg-info text-dark";
    case "SHIPPED": return "bg-primary";
    case "DELIVERED": return "bg-success";
    case "COMPLETED": return "bg-success";
    case "CANCELLED": return "bg-danger";
    case "REFUNDED": return "bg-secondary";
    default: return "bg-light text-dark";
  }
}

/**
 * Get order progress percentage for progress bar
 * @param {string} status - Order status
 * @returns {number} Progress percentage
 */
function getOrderProgressPercentage(status) {
  if (!status) return 0;
  switch (status.toUpperCase()) {
    case "PENDING": return 10;
    case "PROCESSING": return 40;
    case "SHIPPED": return 70;
    case "DELIVERED": return 100;
    case "COMPLETED": return 100;
    case "CANCELLED": return 0; // Or 100 with a different color
    case "REFUNDED": return 0;
    default: return 0;
  }
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number') amount = 0;
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

/**
 * Show toast notification (ensure ToastService is available)
 * @param {string} type - Toast type (success, danger, warning, info)
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 */
function showToast(type, title, message) {
  if (window.ToastService) {
    window.ToastService[type.toLowerCase()](message, title);
  } else {
    console.warn("ToastService not available. Message:", title, message);
    alert(`${title}: ${message}`);
  }
}
