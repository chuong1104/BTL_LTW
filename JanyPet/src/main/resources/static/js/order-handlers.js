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
        page: page - 1,
        status: document.getElementById("filter-order-status")?.value,
        paymentStatus: document.getElementById("filter-payment-status")?.value,
        dateFrom: document.getElementById("order-date-from")?.value,
        dateTo: document.getElementById("order-date-to")?.value
      }

      const response = await api.getOrders(params)
      this.renderOrders(response.content)
      updatePagination(response.totalPages, page)
    } catch (error) {
      console.error("Error loading orders:", error)
      window.ToastService?.error("Error loading orders")
    }
  },

  renderOrders(orders) {
    const tableBody = document.querySelector("#orders-table tbody")
    if (!tableBody) return

    tableBody.innerHTML = orders.map(order => `
      <tr>
        <td><input type="checkbox" class="select-item" data-id="${order.id}"></td>
        <td>#ORD-${order.id}</td>
        <td>${order.customerName}</td>
        <td>${new Date(order.date).toLocaleDateString()}</td>
        <td>${order.items.length} items</td>
        <td>$${order.total.toFixed(2)}</td>
        <td><span class="status ${order.paymentStatus.toLowerCase()}">${order.paymentStatus}</span></td>
        <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
        <td class="actions">
          <button class="icon-btn edit-btn" data-id="${order.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="icon-btn delete-btn" data-id="${order.id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `).join("")

    // Add event listeners to action buttons
    this.initializeOrderActions()
  },

  initializeOrderActions() {
    // Edit buttons
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const orderId = e.target.closest(".edit-btn").dataset.id
        this.openOrderModal("edit", orderId)
      })
    })

    // Delete buttons
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const orderId = e.target.closest(".delete-btn").dataset.id
        this.openDeleteModal(orderId)
      })
    })
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