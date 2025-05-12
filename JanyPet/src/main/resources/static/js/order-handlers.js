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
        size: 10, // Example: Add a page size if your API supports it
        status: document.getElementById("filter-order-status")?.value || null,
        paymentStatus: document.getElementById("filter-payment-status")?.value || null,
        dateFrom: document.getElementById("order-date-from")?.value || null,
        dateTo: document.getElementById("order-date-to")?.value || null,
      };

      // Filter out null or empty params
      const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== null && value !== "") {
          acc[key] = value;
        }
        return acc;
      }, {});

      // Assuming api.getOrders is a function that calls your backend
      // and your backend returns a structure like { content: [], totalPages: X, ... }
      const response = await window.apiService.get("/admin/orders", filteredParams); // Ensure this endpoint and params are correct
      
      if (response && response.content) {
        this.renderOrders(response.content);
        // Assuming updatePagination is a global function or part of this object
        if (typeof updatePagination === "function") {
            updatePagination(response.totalPages, page, (p) => this.loadOrders(p));
        } else if (typeof this.updatePagination === "function") {
            this.updatePagination(response.totalPages, page, (p) => this.loadOrders(p));
        }
      } else {
        this.renderOrders([]); // Render empty if no content
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
c
    // Log the entire array of orders received by the function
    console.log("RenderOrders received data:", JSON.parse(JSON.stringify(orders)));

    const formatCurrency = (amount) => {
      if (typeof amount !== 'number') amount = 0;
      return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    };

    if (!orders || orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No orders found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = orders.map((order, index) => {
      // Log details for each individual order object being processed
      console.log(`Processing order at index ${index}:`, JSON.parse(JSON.stringify(order)));
      //console.log(`Order ID: ${order.id}, Raw orderCode: "${order.orderCode}", Type of orderCode: ${typeof order.orderCode}`);
     
      const orderCode = order.orderCode; // Fallback to ID if orderCode is not availabl
      const orderDate = new Date(order.orderDate);
      const formattedDate = `${String(orderDate.getDate()).padStart(2, '0')}/${String(orderDate.getMonth() + 1).padStart(2, '0')}/${orderDate.getFullYear()}`;
      
      const paymentStatusDisplay = order.paymentStatus || "UNKNOWN";
      
      let orderIdentifier = orderCode; // Default to orderCode
      // Check if order.orderCode is a string and not empty after trimming
      if (orderCode && typeof orderCode === '' && orderCode.trim() !== "") {
        orderIdentifier = orderCode;
      } else {
        // If orderCode is empty, null, undefined, or not a string, display 'N/A'
        orderIdentifier = 'N/A'; 
      }
      
      // Log the determined identifier
      console.log(`For order ID ${order.id}, determined orderIdentifier to display: "${orderIdentifier}"`);

      return `
      <tr>
        <td>${orderCode}</td>
        <td>${order.customerName || 'N/A'}</td>
        <td>${formattedDate}</td>
        <td>${order.itemCount || 0}</td>
        <td>${formatCurrency(order.totalAmount)}</td>
        <td><span class="status status-${paymentStatusDisplay.toLowerCase()}">${paymentStatusDisplay}</span></td>
        <td><span class="status status-${order.status.toLowerCase()}">${order.status}</span></td>
        <td class="actions">
          <button class="icon-btn view-btn" data-id="${orderCode}" title="View Details">
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
    // Edit buttons
    document.querySelectorAll("#orders-table-body .edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const orderId = e.currentTarget.dataset.id; // Use currentTarget
        this.openOrderModal("edit", orderId); // Assuming this function exists
        console.log("Edit order:", orderId);
      });
    });

    // Delete buttons
    document.querySelectorAll("#orders-table-body .delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const orderId = e.currentTarget.dataset.id; // Use currentTarget
        this.openDeleteModal(orderId); // Assuming this function exists
        console.log("Delete order:", orderId);
      });
    });
  },

  // Add this new method to handle view button clicks
  initializeViewOrderActions(orders) {
    document.querySelectorAll("#orders-table-body .view-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const orderId = e.currentTarget.dataset.id;
            const orderDetail = orders.find(o => o.id === orderId);
            if (orderDetail) {
                // You'll need a modal or a way to display order details for admin
                // This could reuse/adapt viewOrderDetails from order-history.js or be specific for admin
                console.log("View order details:", orderDetail);
                // Example: alert(`Viewing Order: ${orderDetail.orderCode || orderDetail.id}`);
                if (window.AdminOrderModals && typeof window.AdminOrderModals.openViewOrderModal === 'function') {
                    window.AdminOrderModals.openViewOrderModal(orderDetail);
                } else {
                    alert(`Order Code: ${orderDetail.orderCode || orderDetail.id}\nCustomer: ${orderDetail.customerName}\nTotal: ${formatCurrency(orderDetail.totalAmount)}`);
                }
            } else {
                window.ToastService?.error("Could not find order details to view.");
            }
        });
    });
  },

  async handleStatusChange(e) {
    const orderId = e.target.dataset.orderId
    const newStatus = e.target.value

    try {
      await api.updateOrderStatus(orderId, newStatus)
      window.ToastService?.success("Order status updated")
    } catch (error) {
      console.error("Error updating order status:", error)
      window.ToastService?.error("Error updating order status")
      // Reset select to previous value
      e.target.value = e.target.dataset.previousStatus
    }
  },

  handleExportOrders() {
    // Implementation for exporting orders
    console.log("Exporting orders...")
  }
}