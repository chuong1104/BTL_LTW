// Authentication Service for Admin Dashboard
class AuthService {
    constructor() {
      this.token = localStorage.getItem("token")
      this.refreshToken = localStorage.getItem("refreshToken")
      this.user = JSON.parse(localStorage.getItem("user") || "null")
      this.tokenExpiry = localStorage.getItem("tokenExpiry")
    }
  
    // Check if user is authenticated
    isAuthenticated() {
      if (!this.token) return false
  
      // Check if token is expired
      if (this.tokenExpiry && new Date().getTime() > Number.parseInt(this.tokenExpiry)) {
        // Try to refresh token
        this.refreshAccessToken()
        return false
      }
  
      return true
    }
  
    // Check if user is admin
    isAdmin() {
      return this.user && this.user.role === "ADMIN"
    }
  
    // Login user
    async login(email, password) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Login failed")
        }
  
        const data = await response.json()
        this.setSession(data)
        return data
      } catch (error) {
        console.error("Login error:", error)
        throw error
      }
    }
  
    // Logout user
    async logout() {
      try {
        if (this.token) {
          // Call logout endpoint to invalidate token on server
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: this.user?.id }),
          }).catch((err) => console.warn("Logout API error:", err))
        }
      } finally {
        // Clear local storage regardless of API success
        this.clearSession()
      }
    }
  
    // Refresh access token
    async refreshAccessToken() {
      if (!this.refreshToken) {
        this.clearSession()
        return false
      }
  
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        })
  
        if (!response.ok) {
          this.clearSession()
          return false
        }
  
        const data = await response.json()
        this.setSession(data)
        return true
      } catch (error) {
        console.error("Token refresh error:", error)
        this.clearSession()
        return false
      }
    }
  
    // Set session data
    setSession(authData) {
      this.token = authData.token
      this.refreshToken = authData.refreshToken
      this.user = authData.user
  
      // Calculate token expiry (assuming 1 hour validity)
      const expiryTime = new Date().getTime() + 60 * 60 * 1000
      this.tokenExpiry = expiryTime.toString()
  
      // Save to localStorage
      localStorage.setItem("token", this.token)
      localStorage.setItem("refreshToken", this.refreshToken)
      localStorage.setItem("user", JSON.stringify(this.user))
      localStorage.setItem("tokenExpiry", this.tokenExpiry)
  
      // Update UI based on authentication
      this.updateUI()
    }
  
    // Clear session data
    clearSession() {
      this.token = null
      this.refreshToken = null
      this.user = null
      this.tokenExpiry = null
  
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      localStorage.removeItem("tokenExpiry")
  
      // Update UI based on authentication
      this.updateUI()
    }
  
    // Get authorization header
    getAuthHeader() {
      return this.token ? { Authorization: `Bearer ${this.token}` } : {}
    }
  
    // Update UI based on authentication status
    updateUI() {
      const isAuth = this.isAuthenticated()
      const isAdminUser = this.isAdmin()
  
      document.body.classList.toggle("authenticated", isAuth)
      document.body.classList.toggle("not-authenticated", !isAuth)
      document.body.classList.toggle("is-admin", isAdminUser)
  
      // Update username if available
      if (this.user && this.user.username) {
        const usernameElement = document.getElementById("admin-username")
        if (usernameElement) {
          usernameElement.textContent = this.user.username
        }
      }
    }
  
    // Get current user
    getCurrentUser() {
      return this.user
    }
  }
  
  // Define API base URL
  const API_BASE_URL = "http://localhost:8080/api"
  
  // Create and export auth service instance
  const authService = new AuthService()
  
  // Initialize UI on page load
  document.addEventListener("DOMContentLoaded", () => {
    authService.updateUI()
  })
  
  // Mock showToast function (replace with your actual implementation)
  function showToast(message, type) {
    console.log(`Toast: ${message} (Type: ${type})`)
    // In a real application, you would use a library like Toastify or implement your own toast notification system.
  }
  
  // Handle direct logout button click
  function handleDirectLogout(event) {
    event.preventDefault()
    authService
      .logout()
      .then(() => {
        showToast("Logged out successfully", "success")
        // Redirect to login page or reload
        window.location.href = "login.html"
      })
      .catch((error) => {
        console.error("Logout error:", error)
        showToast("Logout failed", "error")
      })
  }
  