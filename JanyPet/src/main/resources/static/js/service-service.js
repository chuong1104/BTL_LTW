// Import the apiService (assuming it's in a separate file)
import { apiService } from "./api-service.js"

// Service Service - Specific implementation for Service entity
const serviceService = {
  // Get all services
  getAllServices: async () => {
    return await apiService.getAll("services")
  },

  // Get a service by ID
  getServiceById: async (id) => {
    return await apiService.getById("services", id)
  },

  // Create a new service
  createService: async (serviceData) => {
    return await apiService.create("services", serviceData)
  },

  // Update an existing service
  updateService: async (id, serviceData) => {
    return await apiService.update("services", id, serviceData)
  },

  // Delete a service
  deleteService: async (id) => {
    return await apiService.delete("services", id)
  },

  // Get services by category
  getServicesByCategory: async (category) => {
    return await apiService.search("services", { category })
  },
}

// Export the service service
window.serviceService = serviceService
