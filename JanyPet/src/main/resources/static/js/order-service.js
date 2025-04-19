// Import necessary modules or declare variables
const API_BASE_URL = "your_api_base_url_here" // Replace with your actual API base URL
const apiService = {
  getById: async (endpoint, id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching ${endpoint} by ID:`, error)
      throw error
    }
  },
  create: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error creating ${endpoint}:`, error)
      throw error
    }
  },
  update: async (endpoint, id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error updating ${endpoint}:`, error)
      throw error
    }
  },
  delete: async (endpoint, id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error)
      throw error
    }
  },
  search: async (endpoint, params) => {
    try {
      const queryParams = new URLSearchParams(params)
      const response = await fetch(`${API_BASE_URL}/${endpoint}?${queryParams}`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error searching ${endpoint}:`, error)
      throw error
    }
  },
}

// Order Service - Specific implementation for Order entity
const orderService = {
  // Get all orders with optional pagination and filtering
  getAllOrders: async (page = 0, size = 10, sort = "date,desc", filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: sort,
      })

      // Add any filters to the query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`${API_BASE_URL}/orders?${queryParams}`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw error
    }
  },

  // Get an order by ID
  getOrderById: async (id) => {
    return await apiService.getById("orders", id)
  },

  // Create a new order
  createOrder: async (orderData) => {
    return await apiService.create("orders", orderData)
  },

  // Update an existing order
  updateOrder: async (id, orderData) => {
    return await apiService.update("orders", id, orderData)
  },

  // Delete an order
  deleteOrder: async (id) => {
    return await apiService.delete("orders", id)
  },

  // Get order details
  getOrderDetails: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/details`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching details for order ${orderId}:`, error)
      throw error
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error updating status for order ${orderId}:`, error)
      throw error
    }
  },

  // Get orders by customer
  getOrdersByCustomer: async (customerId) => {
    return await apiService.search("orders", { customerId })
  },

  // Get orders by status
  getOrdersByStatus: async (status) => {
    return await apiService.search("orders", { status })
  },

  // Get orders by date range
  getOrdersByDateRange: async (startDate, endDate) => {
    return await apiService.search("orders", { startDate, endDate })
  },
}

// Export the order service
window.orderService = orderService
