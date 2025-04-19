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

// Appointment Service - Specific implementation for Booking entity
const appointmentService = {
  // Get all appointments with optional pagination and filtering
  getAllAppointments: async (page = 0, size = 10, sort = "date,desc", filters = {}) => {
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

      const response = await fetch(`${API_BASE_URL}/bookings?${queryParams}`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching appointments:", error)
      throw error
    }
  },

  // Get an appointment by ID
  getAppointmentById: async (id) => {
    return await apiService.getById("bookings", id)
  },

  // Create a new appointment
  createAppointment: async (appointmentData) => {
    return await apiService.create("bookings", appointmentData)
  },

  // Update an existing appointment
  updateAppointment: async (id, appointmentData) => {
    return await apiService.update("bookings", id, appointmentData)
  },

  // Delete an appointment
  deleteAppointment: async (id) => {
    return await apiService.delete("bookings", id)
  },

  // Get appointments by status
  getAppointmentsByStatus: async (status) => {
    return await apiService.search("bookings", { status })
  },

  // Get appointments by date range
  getAppointmentsByDateRange: async (startDate, endDate) => {
    return await apiService.search("bookings", { startDate, endDate })
  },

  // Get appointments by customer
  getAppointmentsByCustomer: async (customerId) => {
    return await apiService.search("bookings", { customerId })
  },
}

// Export the appointment service
window.appointmentService = appointmentService
