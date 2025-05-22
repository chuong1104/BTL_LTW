/**
 * Category Service - Handles category-related operations
 */
const CategoryService = {
    // Base URL for category API
    baseUrl: '/api/categories',
    
    /**
     * Get all categories
     * @returns {Promise<Array>} Promise that resolves to array of categories
     */
    getAllCategories: async function() {
        try {
            const response = await fetch(this.baseUrl);
            
            if (!response.ok) {
                throw new Error(`Error fetching categories: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },
    
    /**
     * Get a category by ID
     * @param {string} categoryId - ID of the category to retrieve
     * @returns {Promise<Object>} Promise that resolves to category object
     */
    getCategoryById: async function(categoryId) {
        try {
            const response = await fetch(`${this.baseUrl}/${categoryId}`);
            
            if (!response.ok) {
                throw new Error(`Error fetching category: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error fetching category with ID ${categoryId}:`, error);
            throw error;
        }
    },
    
    /**
     * Create a new category
     * @param {Object} categoryData - Data for the new category
     * @returns {Promise<Object>} Promise that resolves to created category
     */
    createCategory: async function(categoryData) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });
            
            if (!response.ok) {
                throw new Error(`Error creating category: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },
    
    /**
     * Update an existing category
     * @param {string} categoryId - ID of category to update
     * @param {Object} categoryData - Updated category data
     * @returns {Promise<Object>} Promise that resolves to updated category
     */
    updateCategory: async function(categoryId, categoryData) {
        try {
            const response = await fetch(`${this.baseUrl}/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });
            
            if (!response.ok) {
                throw new Error(`Error updating category: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error updating category with ID ${categoryId}:`, error);
            throw error;
        }
    },
    
    /**
     * Delete a category
     * @param {string} categoryId - ID of category to delete
     * @returns {Promise<boolean>} Promise that resolves to true if delete successful
     */
    deleteCategory: async function(categoryId) {
        try {
            const response = await fetch(`${this.baseUrl}/${categoryId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`Error deleting category: ${response.status}`);
            }
            
            return true;
        } catch (error) {
            console.error(`Error deleting category with ID ${categoryId}:`, error);
            throw error;
        }
    }
};

// Make it globally available
window.CategoryService = CategoryService;
