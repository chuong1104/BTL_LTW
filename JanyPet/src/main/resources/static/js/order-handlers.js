const OrderHandlers = {
  initializeOrderEvents() {
    // Filter handlers
    this.initializeFilters()
    
    // Export handler
    const exportBtn = document.getElementById("export-orders-btn")
    if (exportBtn) {
      exportBtn.addEventListener("click", this.handleExportOrders)
    }

    // Add order handler 
    const addOrderBtn = document.getElementById("add-order-btn")
    if (addOrderBtn) {
      addOrderBtn.addEventListener("click", this.handleAddOrder)
    }

    // Status change handler
    document.querySelectorAll(".order-status-select").forEach(select => {
      select.addEventListener("change", (e) => this.handleStatusChange(e))
    })
  },

  initializeFilters() {
    const statusFilter = document.getElementById("filter-order-status")
    const paymentFilter = document.getElementById("filter-payment-status")
    const dateFrom = document.getElementById("order-date-from")
    const dateTo = document.getElementById("order-date-to") 

    if (statusFilter) {
      statusFilter.addEventListener("change", () => this.loadOrders())
    }
    if (paymentFilter) {
      paymentFilter.addEventListener("change", () => this.loadOrders()) 
    }
    if (dateFrom) {
      dateFrom.addEventListener("change", () => this.loadOrders())
    }
    if (dateTo) {
      dateTo.addEventListener("change", () => this.loadOrders())
    }
  },

  async loadOrders(page = 1) {
    try {
      const params = {
        page: page - 1, // Spring Data JPA uses 0-based indexing for pages
        size: 10, // Page size for pagination
        status: document.getElementById("filter-order-status")?.value || null,
        paymentStatus: document.getElementById("filter-payment-status")?.value || null,
        dateFrom: document.getElementById("order-date-from")?.value || null,
        dateTo: document.getElementById("order-date-to")?.value || null
      };

      // Filter out null or empty params
      const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== null && value !== "" && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      console.log("Fetching orders with params:", filteredParams);
      const response = await window.apiService.get("/orders", filteredParams); 
      console.log("Order data received:", response);
      
      if (response && response.content) { // Spring Data pagination format
        this.renderOrders(response.content);
        if (typeof updatePagination === "function") {
          updatePagination(response.totalPages, page, (p) => this.loadOrders(p));
        } else if (typeof this.updatePagination === "function") {
          this.updatePagination(response.totalPages, page, (p) => this.loadOrders(p));
        }
      } else if (Array.isArray(response)) { // Backend returns just an array
        this.renderOrders(response);
        if (typeof updatePagination === "function") {
          updatePagination(1, page, (p) => this.loadOrders(p));
        } else if (typeof this.updatePagination === "function") {
          this.updatePagination(1, page, (p) => this.loadOrders(p));
        }
      } else {
        this.renderOrders([]);
        if (typeof updatePagination === "function") {
          updatePagination(0, 1, (p) => this.loadOrders(p));
        } else if (typeof this.updatePagination === "function") {
          this.updatePagination(0, 1, (p) => this.loadOrders(p));
        }
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      window.ToastService?.error("Error loading orders. Please check console for details.");
      const tableBody = document.getElementById("orders-table-body");
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Failed to load orders.</td></tr>`;
      }
    }
  },

  renderOrders(orders) {
    const tableBody = document.getElementById("orders-table-body");
    if (!tableBody) {
      console.error("Orders table body (#orders-table-body) not found.");
      return;
    }
    console.log("RenderOrders received data:", JSON.parse(JSON.stringify(orders)));

    const formatCurrency = (amount) => {
      if (typeof amount !== 'number' || isNaN(amount)) amount = 0;
      return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    if (!orders || orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No orders found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = orders.map((order) => {
      const orderDate = new Date(order.orderDate);
      const formattedDate = `${String(orderDate.getDate()).padStart(2, '0')}/${String(orderDate.getMonth() + 1).padStart(2, '0')}/${orderDate.getFullYear()}`;
      
      const paymentStatusDisplay = order.paymentStatus || "UNKNOWN";
      const orderStatusDisplay = order.status || "UNKNOWN";
      
      let orderIdentifier;
      if (order.orderCode && typeof order.orderCode === 'string' && order.orderCode.trim() !== "") {
        orderIdentifier = order.orderCode;
      } else {
        orderIdentifier = 'N/A'; 
      }
      
      return `
      <tr>
        <td>${orderIdentifier}</td>
        <td>${order.customerName || 'N/A'}</td>
        <td>${formattedDate}</td>
        <td>${order.itemCount || 0}</td>
        <td>${formatCurrency(order.totalAmount)}</td>
        <td><span class="status status-${paymentStatusDisplay.toLowerCase()}">${paymentStatusDisplay}</span></td>
        <td><span class="status status-${orderStatusDisplay.toLowerCase()}">${orderStatusDisplay}</span></td>
        <td class="actions">
          <button class="icon-btn view-btn" data-id="${order.id}" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
          <button class="icon-btn edit-btn" data-id="${order.id}" title="Edit Order">
            <i class="fas fa-edit"></i>
          </button>
          <button class="icon-btn delete-btn" data-id="${order.id}" title="Delete Order">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `}).join("");

    this.initializeOrderActions();
    this.initializeViewOrderActions(orders);
  },

  initializeOrderActions() {
    document.querySelectorAll("#orders-table-body .edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const orderId = e.currentTarget.dataset.id;
        console.log("Edit order:", orderId);
        // Placeholder: this.openOrderModal("edit", orderId);
        if (window.AdminOrderModals && typeof window.AdminOrderModals.openEditOrderModal === 'function') {
            window.AdminOrderModals.openEditOrderModal(orderId);
        } else {
            window.ToastService?.info("Edit order modal not implemented.");
        }
      });
    });

    document.querySelectorAll("#orders-table-body .delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const orderId = e.currentTarget.dataset.id;
        console.log("Delete order:", orderId);
        // Placeholder: this.openDeleteModal(orderId);
         if (window.AdminOrderModals && typeof window.AdminOrderModals.openDeleteConfirmModal === 'function') {
            window.AdminOrderModals.openDeleteConfirmModal(orderId, () => this.loadOrders());
        } else {
            window.ToastService?.info("Delete order confirmation not implemented.");
        }
      });
    });
  },

  initializeViewOrderActions(orders) {
    document.querySelectorAll("#orders-table-body .view-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const orderId = e.currentTarget.dataset.id;
            // Ensure comparison is consistent, e.g., if order.id is number and orderId from dataset is string
            const orderDetail = orders.find(o => String(o.id) === String(orderId)); 
            if (orderDetail) {
                console.log("View order details:", orderDetail);
                if (window.AdminOrderModals && typeof window.AdminOrderModals.openViewOrderModal === 'function') {
                    window.AdminOrderModals.openViewOrderModal(orderDetail);
                } else {
                    // Fallback display
                    const formatCurrency = (amount) => {
                      if (typeof amount !== 'number' || isNaN(amount)) amount = 0;
                      return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
                    };
                    alert(`Order Code: ${orderDetail.orderCode || orderDetail.id}\nCustomer: ${orderDetail.customerName}\nTotal: ${formatCurrency(orderDetail.totalAmount)}`);
                }
            } else {
                console.error("Could not find order details to view for ID:", orderId);
                window.ToastService?.error("Could not find order details to view.");
            }
        });
    });
  },

  async handleStatusChange(e) {
    const orderId = e.target.dataset.orderId;
    const newStatus = e.target.value;
    const selectElement = e.target;
    // Store previous status in case of error, to revert
    const previousStatus = selectElement.dataset.previousStatus || selectElement.options[0].value; // Fallback to first option if not set
    selectElement.dataset.previousStatus = newStatus; // Update for next change attempt

    try {
      // Using window.apiService.put as per OrderController.java structure
      await window.apiService.put(`/orders/${orderId}/status`, { status: newStatus });
      window.ToastService?.success("Order status updated successfully!");
      // Optionally, update the visual status in the table directly or reload all orders
      // For direct update:
      const statusCell = selectElement.closest('tr')?.querySelector('td:nth-child(7) span'); // Adjust selector if table structure changes
      if(statusCell) {
        statusCell.className = `status status-${newStatus.toLowerCase()}`;
        statusCell.textContent = newStatus;
      }
      // Or this.loadOrders(); 
    } catch (error) {
      console.error("Error updating order status:", error);
      window.ToastService?.error("Failed to update order status. See console for details.");
      // Revert select to previous value on error
      selectElement.value = previousStatus;
      selectElement.dataset.previousStatus = previousStatus; // Revert stored previous status
    }
  },

  handleExportOrders() {
    console.log("Exporting orders...");
    window.ToastService?.info("Export functionality is not yet fully implemented.");
    // Example: window.open(`/api/orders/export?status=COMPLETED&format=csv`, '_blank');
  },

  handleAddOrder() {
    console.log("Add new order clicked");
     if (window.AdminOrderModals && typeof window.AdminOrderModals.openAddOrderModal === 'function') {
        window.AdminOrderModals.openAddOrderModal(() => this.loadOrders());
    } else {
        window.ToastService?.info("Add order modal not implemented.");
    }
  }
};