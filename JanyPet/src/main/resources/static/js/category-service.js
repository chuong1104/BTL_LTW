// Category Service - Specific implementation for Category entity

// Import necessary modules or declare variables
const apiService = window.apiService // Assuming apiService is available globally or adjust import accordingly
const API_BASE_URL = window.API_BASE_URL // Assuming API_BASE_URL is available globally or adjust import accordingly

const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    return await apiService.getAll("categories")
  },

  // Get a category by ID
  getCategoryById: async (id) => {
    return await apiService.getById("categories", id)
  },

  // Create a new category
  createCategory: async (categoryData) => {
    return await apiService.create("categories", categoryData)
  },

  // Update an existing category
  updateCategory: async (id, categoryData) => {
    return await apiService.update("categories", id, categoryData)
  },

  // Delete a category
  deleteCategory: async (id) => {
    return await apiService.delete("categories", id)
  },

  // Get products by category ID
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/products`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error)
      throw error
    }
  },
}

// Export the category service
window.categoryService = categoryService
