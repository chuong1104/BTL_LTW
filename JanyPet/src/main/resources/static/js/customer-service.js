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
      return // Or return response.json() if the API returns data on delete
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error)
      throw error
    }
  },
  search: async (endpoint, params) => {
    try {
      const queryParams = new URLSearchParams(params)
      const response = await fetch(`${API_BASE_URL}/${endpoint}/search?${queryParams}`)
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

// Customer Service - Specific implementation for User entity
const customerService = {
  // Get all customers with optional pagination and filtering
  getAllCustomers: async (page = 0, size = 10, sort = "lastName,asc", filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: sort,
        role: "CUSTOMER", // Assuming users with role CUSTOMER are considered customers
      })

      // Add any filters to the query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`${API_BASE_URL}/users?${queryParams}`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching customers:", error)
      throw error
    }
  },

  // Get a customer by ID
  getCustomerById: async (id) => {
    return await apiService.getById("users", id)
  },

  // Create a new customer
  createCustomer: async (customerData) => {
    // Ensure the role is set to CUSTOMER
    const data = { ...customerData, role: "CUSTOMER" }
    return await apiService.create("users", data)
  },

  // Update an existing customer
  updateCustomer: async (id, customerData) => {
    return await apiService.update("users", id, customerData)
  },

  // Delete a customer
  deleteCustomer: async (id) => {
    return await apiService.delete("users", id)
  },

  // Get customer's pets
  getCustomerPets: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${customerId}/pets`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching pets for customer ${customerId}:`, error)
      throw error
    }
  },

  // Get customer's orders
  getCustomerOrders: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${customerId}/orders`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching orders for customer ${customerId}:`, error)
      throw error
    }
  },

  // Get customer's appointments
  getCustomerAppointments: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${customerId}/bookings`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching appointments for customer ${customerId}:`, error)
      throw error
    }
  },

  // Search customers
  searchCustomers: async (query) => {
    return await apiService.search("users", { query, role: "CUSTOMER" })
  },
}

// Export the customer service
window.customerService = customerService
