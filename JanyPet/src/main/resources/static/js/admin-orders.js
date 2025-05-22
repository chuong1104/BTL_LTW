/**
 * JanyPet - Admin Orders Management
 * This script handles order management in the admin panel
 */

const AdminOrdersManager = (() => {
  // State variables
  let currentOrders = [];
  let filterStatus = "";
  let filterPaymentStatus = "";
  let filterDateFrom = "";
  let filterDateTo = "";

  /**
   * Initialize orders management
   */
  const initialize = () => {
    // Check if we're on the orders section
    const ordersSection = document.getElementById("orders-section");
    if (!ordersSection) {
      return;
    }
    console.log("Initializing Admin Orders Management...");
    // Initialize event listeners
    initEventListeners();

    // Load initial orders
    loadOrders();
  };

  /**
   * Initialize event listeners
   */
  const initEventListeners = () => {
    // Filter event listeners
    const statusFilter = document.getElementById("filter-order-status");
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        filterStatus = e.target.value;
        loadOrders();
      });
    }

    const paymentStatusFilter = document.getElementById("filter-payment-status");
    if (paymentStatusFilter) {
      paymentStatusFilter.addEventListener("change", (e) => {
        filterPaymentStatus = e.target.value;
      });
    }

    const dateFromFilter = document.getElementById("order-date-from");
    if (dateFromFilter) {
      dateFromFilter.addEventListener("change", (e) => {
        filterDateFrom = e.target.value;
        if (filterDateTo) loadOrders();
      });
    }

    const dateToFilter = document.getElementById("order-date-to");
    if (dateToFilter) {
      dateToFilter.addEventListener("change", (e) => {
        filterDateTo = e.target.value;
        if (filterDateFrom) loadOrders();
      });
    }

    // Export orders button
    const exportOrdersBtn = document.getElementById("export-orders-btn");
    if (exportOrdersBtn) {
      exportOrdersBtn.addEventListener("click", exportOrders);
    }
  };

  /**
   * Load orders with current filters and pagination
   */
  const loadOrders = async () => {
    const loadingIndicator = document.getElementById("orders-loading-indicator");
    if (loadingIndicator) loadingIndicator.style.display = "block";

    try {
      let ordersData;
      if (filterStatus) {
        ordersData = await window.OrderService.getOrdersByStatus(filterStatus);
      } else if (filterDateFrom && filterDateTo) {
        const startDate = new Date(filterDateFrom).toISOString();
        const endDate = new Date(filterDateTo).toISOString();
        ordersData = await window.OrderService.getOrdersByDateRange(startDate, endDate);
      } else {
        ordersData = await window.OrderService.getAllOrders();
      }
      
      currentOrders = ordersData || []; 
      renderOrders(currentOrders);
      const paginationContainer = document.querySelector("#orders-section .pagination");
      if (paginationContainer) paginationContainer.innerHTML = "";

    } catch (error) {
      console.error("Failed to load orders:", error);
      const ordersTableBody = document.querySelector("#orders-section table tbody");
      if (ordersTableBody) {
        ordersTableBody.innerHTML =
          '<tr><td colspan="7" class="text-center text-danger">Không thể tải danh sách đơn hàng. Vui lòng thử lại.</td></tr>';
      }
      window.ToastService?.error("Không thể tải đơn hàng.");
    } finally {
      if (loadingIndicator) loadingIndicator.style.display = "none";
    }
  };

  /**
   * Render orders in the table
   * @param {Array} orders - Orders to render
   */
  const renderOrders = (orders) => {
    const ordersTableBody = document.querySelector("#orders-section table tbody");
    if (!ordersTableBody) {
      console.error("Orders table body not found for rendering.");
      return;
    }

    ordersTableBody.innerHTML = "";

    if (!orders || orders.length === 0) {
      ordersTableBody.innerHTML =
        '<tr><td colspan="8" class="text-center">Không có đơn hàng nào.</td></tr>';
      return;
    }

    orders.forEach((order) => {
      const row = ordersTableBody.insertRow();
      
      // Use the itemCount directly from the API response
      const itemCount = order.itemCount !== undefined ? order.itemCount : 0;

      const customerName = order.customerName || 
                         (order.customerInfo ? `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim() : null) || 
                         "N/A";
      
      const paymentStatusDisplay = order.paymentStatus || "UNKNOWN";
      const displayOrderCode = (order.orderCode && String(order.orderCode).trim() !== "") ? order.orderCode : "N/A";

      row.innerHTML = `
        <td>${displayOrderCode}</td>
        <td>${customerName}</td>
        <td>${order.orderDate ? new Date(order.orderDate).toLocaleDateString("vi-VN") : "N/A"}</td>
        <td>${itemCount}</td>
        <td>${formatCurrency(order.totalAmount || 0)}</td>
        <td><span class="status-badge ${getPaymentStatusClass(paymentStatusDisplay)}">${paymentStatusDisplay}</span></td>
        <td><span class="status-badge ${getStatusClass(order.status || "UNKNOWN")}">${order.status || "UNKNOWN"}</span></td>
        <td>
          <button class="btn btn-sm btn-info view-btn" data-id="${order.id}" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
          <button class="btn btn-sm btn-warning edit-btn" data-id="${order.id}" title="Sửa trạng thái"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${order.id}" title="Xóa đơn hàng"><i class="fas fa-trash"></i></button>
        </td>
      `;
    });

    addActionButtonListeners();
  };

  /**
   * Add event listeners to action buttons
   */
  const addActionButtonListeners = () => {
    document.querySelectorAll("#orders-section .view-btn").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const orderId = event.currentTarget.dataset.id;
        viewOrderDetails(orderId);
      });
    });
    document.querySelectorAll("#orders-section .edit-btn").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const orderId = event.currentTarget.dataset.id;
        editOrder(orderId);
      });
    });
    document.querySelectorAll("#orders-section .delete-btn").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const orderId = event.currentTarget.dataset.id;
        confirmDeleteOrder(orderId);
      });
    });
  };

  /**
   * View order details
   * @param {string} orderId - Order ID
   */
  const viewOrderDetails = async (orderId) => {
    try {
      const order = await window.OrderService.getOrderById(orderId);
      if (!order) {
        window.ToastService?.error("Không tìm thấy chi tiết đơn hàng.");
        return;
      }
      const modalElement = createOrderDetailsModal(order);
      document.body.appendChild(modalElement);
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      modalElement.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modalElement);
      });
    } catch (error) {
      console.error(`Failed to view order details for ${orderId}:`, error);
      window.ToastService?.error("Lỗi khi tải chi tiết đơn hàng.");
    }
  };

  /**
   * Create order details modal
   * @param {Object} order - Order object (detailed view)
   * @returns {HTMLElement} Modal element
   */
  const createOrderDetailsModal = (order) => {
    const modal = document.createElement("div");
    // Add a unique ID to the modal for proper targeting by Bootstrap
    modal.id = `orderDetailsModal-${order.id || new Date().getTime()}`; // Fallback ID if order.id is missing
    modal.className = "modal fade"; // Bootstrap classes for modal
    modal.tabIndex = -1;
    modal.setAttribute("aria-labelledby", `orderDetailsModalLabel-${order.id}`);
    modal.setAttribute("aria-hidden", "true");


    const statusClass = getStatusClass(order.status || "UNKNOWN");
    const paymentStatusDisplay = order.paymentStatus || "UNKNOWN"; 
    const paymentClass = getPaymentStatusClass(paymentStatusDisplay);

    let itemsHtml = "";
    if (order.orderDetails && Array.isArray(order.orderDetails) && order.orderDetails.length > 0) {
      itemsHtml = order.orderDetails
        .map(
          (item) => `
        <tr>
          <td>
            ${item.productImage ? `<img src="/uploads/${item.productImage}" alt="${item.productName || 'Sản phẩm'}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">` : ''}
            ${item.productName || "N/A"}
            ${item.productColor && item.productColor !== "Default" ? `<br><small>Màu: ${item.productColor}</small>` : ""}
            ${item.productSize && item.productSize !== "Default" ? `<br><small>Kích thước: ${item.productSize}</small>` : ""}
          </td>
          <td class="text-center">${item.quantity || 0}</td>
          <td class="text-end">${formatCurrency(item.unitPrice || 0)}</td>
          <td class="text-end">${formatCurrency(item.subtotal || 0)}</td>
        </tr>
      `
        )
        .join("");
    } else {
        itemsHtml = '<tr><td colspan="4" class="text-center">Không có sản phẩm chi tiết.</td></tr>';
    }

    const customerFullName = `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim() || "N/A";
    const displayIdentifier = (order.orderCode && String(order.orderCode).trim() !== "") ? order.orderCode : (order.id || "N/A");

    modal.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="orderDetailsModalLabel-${order.id}">Chi tiết đơn hàng: ${displayIdentifier}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Khách hàng:</strong> ${customerFullName}<br>
                <strong>Email:</strong> ${order.customerEmail || "N/A"}<br>
                <strong>Điện thoại:</strong> ${order.customerPhone || "N/A"}
              </div>
              <div class="col-md-6">
                <strong>Ngày đặt:</strong> ${order.orderDate ? new Date(order.orderDate).toLocaleDateString("vi-VN") : "N/A"}<br>
                <strong>Trạng thái đơn hàng:</strong> <span class="status-badge ${statusClass}">${order.status || "UNKNOWN"}</span><br>
                <strong>Phương thức thanh toán:</strong> ${order.paymentMethod || "N/A"}<br>
                <strong>Trạng thái thanh toán:</strong> <span class="status-badge ${paymentClass}">${paymentStatusDisplay}</span>
              </div>
            </div>
            <div class="mb-3">
              <strong>Địa chỉ giao hàng:</strong><br>
              ${order.shippingAddress || "N/A"}<br>
              ${order.shippingWard || ""}, ${order.shippingDistrict || ""}, ${order.shippingCity || ""}
            </div>
            <div class="mb-3">
              <strong>Phương thức vận chuyển:</strong> ${order.shippingMethod || "N/A"}<br>
              <strong>Ngày giao dự kiến:</strong> ${order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString("vi-VN") : "N/A"}
            </div>
            
            <h5>Sản phẩm</h5>
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th class="text-center">Số lượng</th>
                  <th class="text-end">Đơn giá</th>
                  <th class="text-end">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <hr>
            <div class="row text-end">
                <div class="col-md-9"><strong>Tổng phụ (Subtotal):</strong></div>
                <div class="col-md-3">${formatCurrency(order.subtotalAmount || 0)}</div>
                <div class="col-md-9"><strong>Phí vận chuyển:</strong></div>
                <div class="col-md-3">${formatCurrency(order.shippingFee || 0)}</div>
                <div class="col-md-9"><strong>Giảm giá (Coupon ${order.couponCode || ''}):</strong></div>
                <div class="col-md-3">-${formatCurrency(order.discountAmount || 0)}</div>
                <div class="col-md-9"><strong>Tổng cộng:</strong></div>
                <div class="col-md-3"><strong>${formatCurrency(order.totalAmount || 0)}</strong></div>
            </div>
            ${order.orderNotes ? `<div class="mt-3"><strong>Ghi chú đơn hàng:</strong><p>${order.orderNotes}</p></div>` : ""}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    `;
    return modal;
  };

  /**
   * Edit order - This function fetches the order and shows the edit modal
   * @param {string} orderId - Order ID
   */
  const editOrder = async (orderId) => {
    try {
      const order = await window.OrderService.getOrderById(orderId); // Ensure OrderService is loaded and has this method
      if (!order) {
        window.ToastService?.error("Không tìm thấy đơn hàng để chỉnh sửa.");
        return;
      }
      const modalElement = createOrderEditModal(order);
      document.body.appendChild(modalElement);
      const modal = new bootstrap.Modal(modalElement); // Ensure Bootstrap JS is loaded
      modal.show();
      modalElement.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modalElement);
      });
    } catch (error) {
      console.error(`Failed to edit order ${orderId}:`, error);
      window.ToastService?.error("Lỗi khi mở form chỉnh sửa đơn hàng.");
    }
  };

  /**
   * Create order edit modal
   * @param {Object} order - Order object
   * @returns {HTMLElement} Modal element
   */
  const createOrderEditModal = (order) => {
    const modalElement = document.createElement("div");
    modalElement.className = "modal fade";
    modalElement.id = `edit-order-modal-${order.id}`;
    modalElement.tabIndex = -1;
    // Define your available order statuses
    const availableStatuses = ["PENDING", "PROCESSING", "CONFIRMED", "SHIPPING", "DELIVERED", "COMPLETED", "CANCELLED", "REFUNDED", "FAILED"];
    let statusOptions = availableStatuses.map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`).join('');

    modalElement.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Cập nhật đơn hàng: ${order.id}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="edit-order-form-${order.id}">
              <div class="mb-3">
                <label for="order-status-select-${order.id}" class="form-label">Trạng thái đơn hàng</label>
                <select class="form-select" id="order-status-select-${order.id}">
                  ${statusOptions}
                </select>
              </div>
              <!-- You can add other editable fields here if needed -->
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" id="save-order-changes-${order.id}">Lưu thay đổi</button>
          </div>
        </div>
      </div>
    `;

    const saveBtn = modalElement.querySelector(`#save-order-changes-${order.id}`);
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const newStatus = modalElement.querySelector(`#order-status-select-${order.id}`).value;
        try {
          // Ensure OrderService.updateOrderStatus(orderId, newStatus) exists and works
          // The backend might expect an object like { status: newStatus } or just the status string.
          // Adjust the payload as per your backend API requirements.
          const response = await window.OrderService.updateOrderStatus(order.id, newStatus); // or { status: newStatus }

          // Check response based on your API's success indicators
          if (response && (response.success || response.id || response.status === 200 || (response.data && response.data.id))) {
            window.ToastService?.success(`Đã cập nhật trạng thái đơn hàng ${order.id}.`);
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
              modalInstance.hide();
            }
            loadOrders(); // Crucial: Reload orders to reflect the change in the UI
          } else {
            const errorMsg = response?.message || response?.data?.message || "Không thể cập nhật trạng thái.";
            window.ToastService?.error(errorMsg);
          }
        } catch (error) {
          console.error(`Failed to update status for order ${order.id}:`, error);
          let errorMsg = "Lỗi khi cập nhật trạng thái đơn hàng.";
          if (error.response && error.response.data && error.response.data.message) {
              errorMsg = error.response.data.message;
          } else if (error.message) {
              errorMsg = error.message;
          }
          window.ToastService?.error(errorMsg);
        }
      });
    }
    return modalElement;
  };

  /**
   * Confirm delete order
   * @param {string} orderId - Order ID
   */
  const confirmDeleteOrder = (orderId) => {
    // You can use a more sophisticated confirmation modal (e.g., Bootstrap modal)
    // For simplicity, using a basic confirm dialog here.
    if (confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${orderId}? Thao tác này không thể hoàn tác.`)) {
      deleteOrder(orderId);
    }
  };

  /**
   * Delete order
   * @param {string} orderId - Order ID
   */
  async function deleteOrder(orderId) {
    try {
        // Call the API to delete the order
        await apiService.deleteOrder(orderId);
        
        // Immediately remove the order from the UI
        const orderElement = document.getElementById(`order-${orderId}`);
        if (orderElement) {
            // Add a fade-out animation
            orderElement.classList.add('fade-out');
            
            // Remove the element after animation completes
            setTimeout(() => {
                orderElement.remove();
                
                // If you have a counter showing total orders, update it
                const orderCountElement = document.getElementById('order-count');
                if (orderCountElement) {
                    const currentCount = parseInt(orderCountElement.textContent);
                    orderCountElement.textContent = currentCount - 1;
                }
                
                // Show a success message
                showNotification('Order deleted successfully', 'success');
            }, 300); // Match this with your CSS animation time
        } else {
            // If we can't find the specific element, refresh the orders list
            loadOrders(); // Assuming you have a function to reload the orders list
        }
    } catch (error) {
        console.error(`Failed to delete order ${orderId}:`, error);
        showNotification('Failed to delete order: ' + error.message, 'error');
    }
  }

  /**
   * Export orders
   */
  const exportOrders = () => {
    if (currentOrders.length === 0) {
      window.ToastService?.warning("Không có đơn hàng nào để xuất.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Khach Hang,Ngay Dat,Tong Tien,Trang Thai,Thanh Toan\n";
    currentOrders.forEach(order => {
      const row = [
        order.id,
        `"${order.customerName || (order.customerInfo ? `${order.customerInfo.firstName} ${order.customerInfo.lastName}` : "N/A")}"`,
        new Date(order.orderDate).toLocaleDateString("vi-VN"),
        order.totalAmount,
        order.status,
        order.paymentStatus
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.ToastService?.success("Đã xuất danh sách đơn hàng.");
  };

  /**
   * Get status class for CSS styling
   * @param {string} status - Order status
   * @returns {string} CSS class
   */
  const getStatusClass = (status) => {
    if (!status) return "status-unknown";
    switch (status.toUpperCase()) {
      case "PENDING": return "status-pending";
      case "PROCESSING": return "status-processing";
      case "SHIPPED": return "status-shipped";
      case "DELIVERED": return "status-delivered";
      case "COMPLETED": return "status-completed";
      case "CANCELLED": return "status-cancelled";
      case "REFUNDED": return "status-refunded";
      default: return "status-unknown";
    }
  };

  /**
   * Get payment status class for CSS styling
   * @param {string} status - Payment status
   * @returns {string} CSS class
   */
  const getPaymentStatusClass = (status) => {
    if (!status) return "payment-unknown";
    switch (status.toUpperCase()) {
      case "PENDING": return "payment-pending";
      case "PAID": return "payment-paid";
      case "FAILED": return "payment-failed";
      case "REFUNDED": return "payment-refunded";
      default: return "payment-unknown";
    }
  };

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') amount = 0;
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  // Public API
  return {
    initialize,
    loadOrders,
  };
})();

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  AdminOrdersManager.initialize();
});

// Add to window object for access from admin-script.js
window.OrderHandlers = {
  loadOrders: () => AdminOrdersManager.loadOrders(),
};
