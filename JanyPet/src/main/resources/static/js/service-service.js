// Add initialization check at the beginning of the file
// Add this before the ServiceService declaration:

// Check if required dependencies exist
if (!window.apiService) {
  console.warn("apiService not found. ServiceService will not function properly.")

  // Create a minimal fallback for apiService
  window.apiService = {
    fetchData: async (url, method, data) => {
      console.error(`API Service not available. Cannot ${method} ${url}`)
      throw new Error("API Service not initialized")
    },
  }
}

// Ensure ToastService exists
if (!window.ToastService) {
  console.warn("ToastService not found. Creating fallback.")

  window.ToastService = {
    success: (msg) => {
      console.log("Success:", msg)
      try {
        if (window.toast && typeof window.toast.show === "function") {
          window.toast.show("success", msg)
        } else {
          alert("Success: " + msg)
        }
      } catch (error) {
        console.log("Toast notification failed:", error)
        alert("Success: " + msg)
      }
    },
    error: (msg) => {
      console.error("Error:", msg)
      try {
        if (window.toast && typeof window.toast.show === "function") {
          window.toast.show("error", msg)
        } else {
          alert("Error: " + msg)
        }
      } catch (error) {
        console.error("Toast notification failed:", error)
        alert("Error: " + msg)
      }
    },
    warning: (msg) => {
      console.warn("Warning:", msg)
      try {
        if (window.toast && typeof window.toast.show === "function") {
          window.toast.show("warning", msg)
        } else {
          alert("Warning: " + msg)
        }
      } catch (error) {
        console.warn("Toast notification failed:", error)
        alert("Warning: " + msg)
      }
    },
    info: (msg) => {
      console.info("Info:", msg)
      try {
        if (window.toast && typeof window.toast.show === "function") {
          window.toast.show("info", msg)
        } else {
          alert("Info: " + msg)
        }
      } catch (error) {
        console.info("Toast notification failed:", error)
        alert("Info: " + msg)
      }
    },
  }
}

/**
 * Service API Module
 * Handles all service-related API interactions
 */

const ServiceService = {
  /**
   * Get all services
   */
  getAllServices: async () => {
    try {
      return await window.apiService.fetchData("/api/services", "GET")
    } catch (error) {
      console.error("Error fetching services:", error)
      window.ToastService?.error("Failed to fetch services")
      throw error
    }
  },

  /**
   * Get service by ID
   */
  getServiceById: async (id) => {
    try {
      return await window.apiService.fetchData(`/api/services/${id}`, "GET")
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error)
      window.ToastService?.error("Failed to fetch service details")
      throw error
    }
  },

  /**
   * Create a new service
   */
  createService: async (serviceData) => {
    try {
      const result = await window.apiService.fetchData("/api/services", "POST", serviceData)
      window.ToastService?.success("Service created successfully")
      return result
    } catch (error) {
      console.error("Error creating service:", error)
      window.ToastService?.error("Failed to create service")
      throw error
    }
  },

  /**
   * Update an existing service
   */
  updateService: async (id, serviceData) => {
    try {
      const result = await window.apiService.fetchData(`/api/services/${id}`, "PUT", serviceData)
      window.ToastService?.success("Service updated successfully")
      return result
    } catch (error) {
      console.error(`Error updating service ${id}:`, error)
      window.ToastService?.error("Failed to update service")
      throw error
    }
  },

  /**
   * Delete a service
   */
  deleteService: async (id) => {
    try {
      await window.apiService.fetchData(`/api/services/${id}`, "DELETE")
      window.ToastService?.success("Service deleted successfully")
    } catch (error) {
      console.error(`Error deleting service ${id}:`, error)
      window.ToastService?.error("Failed to delete service")
      throw error
    }
  },

  /**
   * Get services by category
   */
  getServicesByCategory: async (category) => {
    try {
      return await window.apiService.fetchData(`/api/services/category/${category}`, "GET")
    } catch (error) {
      console.error(`Error fetching ${category} services:`, error)
      window.ToastService?.error("Failed to fetch services by category")
      throw error
    }
  },

  /**
   * Get featured services
   */
  getFeaturedServices: async () => {
    try {
      return await window.apiService.fetchData("/api/services/featured", "GET")
    } catch (error) {
      console.error("Error fetching featured services:", error)
      window.ToastService?.error("Failed to fetch featured services")
      throw error
    }
  },

  /**
   * Get popular services
   */
  getPopularServices: async () => {
    try {
      return await window.apiService.fetchData("/api/services/popular", "GET")
    } catch (error) {
      console.error("Error fetching popular services:", error)
      window.ToastService?.error("Failed to fetch popular services")
      throw error
    }
  },

  /**
   * Search services by keyword
   */
  searchServices: async (keyword) => {
    try {
      return await window.apiService.fetchData(`/api/services/search?keyword=${encodeURIComponent(keyword)}`, "GET")
    } catch (error) {
      console.error(`Error searching services with keyword "${keyword}":`, error)
      window.ToastService?.error("Failed to search services")
      throw error
    }
  },

  /**
   * Toggle service active status
   */
  toggleServiceStatus: async function (id) {
    try {
      // First get the current service
      const service = await this.getServiceById(id)
      if (!service) {
        throw new Error("Service not found")
      }

      // Toggle the active status
      const updatedService = {
        ...service,
        active: !service.active,
      }

      // Update the service
      const result = await window.apiService.fetchData(`/api/services/${id}`, "PUT", updatedService)
      window.ToastService?.success(`Service ${updatedService.active ? "activated" : "deactivated"} successfully`)
      return result
    } catch (error) {
      console.error(`Error toggling service status for ${id}:`, error)
      window.ToastService?.error("Failed to update service status")
      throw error
    }
  },

  /**
   * Duplicate a service
   */
  duplicateService: async function (id) {
    try {
      // Get the service to duplicate
      const service = await this.getServiceById(id)
      if (!service) {
        throw new Error("Service not found")
      }

      // Create a new service based on the existing one
      const newService = {
        ...service,
        name: `${service.name} (Copy)`,
        id: undefined, // Remove ID so a new one will be generated
      }

      // Create the new service
      const result = await this.createService(newService)
      window.ToastService?.success("Service duplicated successfully")
      return result
    } catch (error) {
      console.error(`Error duplicating service ${id}:`, error)
      window.ToastService?.error("Failed to duplicate service")
      throw error
    }
  },

  /**
   * Get active services
   */
  getActiveServices: async function () {
    try {
      const services = await this.getAllServices()
      return services.filter((service) => service.active)
    } catch (error) {
      console.error("Error fetching active services:", error)
      window.ToastService?.error("Failed to fetch active services")
      throw error
    }
  },

  /**
   * Update service item
   */
  updateServiceItem: async function (serviceId, itemId, itemData) {
    try {
      // Get the current service
      const service = await this.getServiceById(serviceId)
      if (!service || !service.serviceItems) {
        throw new Error("Service or service items not found")
      }

      // Find and update the specific item
      const updatedItems = service.serviceItems.map((item) => {
        if (item.id === itemId) {
          return { ...item, ...itemData }
        }
        return item
      })

      // Update the service with the modified items
      const updatedService = {
        ...service,
        serviceItems: updatedItems,
      }

      const result = await this.updateService(serviceId, updatedService)
      window.ToastService?.success("Service item updated successfully")
      return result
    } catch (error) {
      console.error(`Error updating service item ${itemId}:`, error)
      window.ToastService?.error("Failed to update service item")
      throw error
    }
  },

  /**
   * Delete service item
   */
  deleteServiceItem: async function (serviceId, itemId) {
    try {
      // Get the current service
      const service = await this.getServiceById(serviceId)
      if (!service || !service.serviceItems) {
        throw new Error("Service or service items not found")
      }

      // Filter out the item to delete
      const updatedItems = service.serviceItems.filter((item) => item.id !== itemId)

      // Update the service with the filtered items
      const updatedService = {
        ...service,
        serviceItems: updatedItems,
      }

      const result = await this.updateService(serviceId, updatedService)
      window.ToastService?.success("Service item deleted successfully")
      return result
    } catch (error) {
      console.error(`Error deleting service item ${itemId}:`, error)
      window.ToastService?.error("Failed to delete service item")
      throw error
    }
  },

  /**
   * Batch update services (for bulk operations)
   */
  batchUpdateServices: async function (serviceIds, updateData) {
    try {
      const results = []
      for (const id of serviceIds) {
        // Get current service
        const service = await this.getServiceById(id)
        if (!service) continue

        // Apply updates
        const updatedService = {
          ...service,
          ...updateData,
        }

        // Update the service
        const result = await this.updateService(id, updatedService)
        results.push(result)
      }

      window.ToastService?.success(`${results.length} services updated successfully`)
      return results
    } catch (error) {
      console.error("Error performing batch update:", error)
      window.ToastService?.error("Failed to update services")
      throw error
    }
  },
}

// Make the service available globally
window.ServiceService = ServiceService

// Export as module
export default ServiceService
