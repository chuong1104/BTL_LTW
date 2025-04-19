// Import necessary modules (replace with your actual import paths)
import { authService } from "./auth-service" // Assuming authService is in auth-service.js
import { showToast } from "./toast-service" // Assuming showToast is in toast-service.js

// API Service for Admin Dashboard
class ApiService {
  constructor() {
    this.baseUrl = "http://localhost:8080/api"
  }

  // Generic fetch method with authentication
  async fetchWithAuth(endpoint, options = {}) {
    try {
      // Check authentication
      if (!authService.isAuthenticated()) {
        // Try to refresh token if not authenticated
        const refreshed = await authService.refreshAccessToken()
        if (!refreshed) {
          throw new Error("Authentication required")
        }
      }

      // Set default headers
      const headers = {
        "Content-Type": "application/json",
        ...authService.getAuthHeader(),
        ...(options.headers || {}),
      }

      // Make request
      const response = await fetch(this.baseUrl+endpoint, {
        ...options,
        headers,
      })

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await authService.refreshAccessToken()
        if (refreshed) {
          // Retry request with new token
          return this.fetchWithAuth(endpoint, options)
        } else {
          authService.clearSession()
          window.location.href = "login.html"
          throw new Error("Session expired. Please login again.")
        }
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        showToast("You do not have permission to perform this action", "error")
        throw new Error("Forbidden")
      }

      // Parse JSON response
      if (response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json()

        // Check if response is not ok
        if (!response.ok) {
          throw new Error(data.message || `API error: ${response.status}`)
        }

        return data
      }

      // Return response for non-JSON responses
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return response
    } catch (error) {
      console.error("API request failed:", error)

      // Show error toast
      showToast(error.message || "API request failed", "error")

      throw error
    }
  }

  // Dashboard Statistics
  async getDashboardStats() {
    return this.fetchWithAuth("/admin/dashboard/stats", {
      method: "GET",
    })
  }

  // Bookings API
  async getBookings(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    const endpoint = `/admin/bookings${queryParams ? `?${queryParams}` : ""}`
    return this.fetchWithAuth(endpoint, {
      method: "GET",
    })
  }

  async getBookingById(id) {
    return this.fetchWithAuth(`/admin/bookings/${id}`, {
      method: "GET",
    })
  }

  async updateBookingStatus(id, status) {
    return this.fetchWithAuth(`/admin/bookings/${id}/status?status=${status}`, {
      method: "PUT",
    })
  }

  async deleteBooking(id) {
    return this.fetchWithAuth(`/admin/bookings/${id}`, {
      method: "DELETE",
    })
  }

  // Users API
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    const endpoint = `/admin/users${queryParams ? `?${queryParams}` : ""}`
    return this.fetchWithAuth(endpoint, {
      method: "GET",
    })
  }

  async getUserById(id) {
    return this.fetchWithAuth(`/admin/users/${id}`, {
      method: "GET",
    })
  }

  async updateUser(id, userData) {
    return this.fetchWithAuth(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async toggleLockUser(id, locked) {
    return this.fetchWithAuth(`/admin/users/${id}/toggle-lock?locked=${locked}`, {
      method: "PUT",
    })
  }

  async deleteUser(id) {
    return this.fetchWithAuth(`/admin/users/${id}`, {
      method: "DELETE",
    })
  }

  // Pets API
  async getPets() {
    return this.fetchWithAuth(`/admin/pets`, {
      method: "GET",
    })
  }

  // Reports API
  async getBookingsByStatus(startDate, endDate) {
    let endpoint = `/admin/reports/bookings-by-status`
    const params = new URLSearchParams()

    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)

    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }

    return this.fetchWithAuth(endpoint, {
      method: "GET",
    })
  }

  async getBookingsByService(startDate, endDate) {
    let endpoint = `/admin/reports/bookings-by-service`
    const params = new URLSearchParams()

    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)

    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }

    return this.fetchWithAuth(endpoint, {
      method: "GET",
    })
  }

  async getRevenueByService(startDate, endDate) {
    let endpoint = `/admin/reports/revenue-by-service`
    const params = new URLSearchParams()

    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)

    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }

    return this.fetchWithAuth(endpoint, {
      method: "GET",
    })
  }

  async getBookingsByDay(startDate, endDate) {
    let endpoint = `/admin/reports/bookings-by-day`
    const params = new URLSearchParams()

    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)

    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }

    return this.fetchWithAuth(endpoint, {
      method: "GET",
    })
  }

  async getRevenueByDay(startDate, endDate) {
    let endpoint = `/admin/reports/revenue-by-day`
    const params = new URLSearchParams()

    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)

    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }

    return this.fetchWithAuth(endpoint, {
      method: "GET",
    })
  }

  // Services API
  async getServices() {
    return this.fetchWithAuth(`/services`, {
      method: "GET",
    })
  }

  async createService(serviceData) {
    return this.fetchWithAuth(`/services`, {
      method: "POST",
      body: JSON.stringify(serviceData),
    })
  }

  async updateService(id, serviceData) {
    return this.fetchWithAuth(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(serviceData),
    })
  }

  async deleteService(id) {
    return this.fetchWithAuth(`/services/${id}`, {
      method: "DELETE",
    })
  }
}

// Create and export API service instance
const apiService = new ApiService()
