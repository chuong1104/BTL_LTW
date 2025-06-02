/**
 * Category Service
 * Handles API calls for category data
 */
window.CategoryService = (function() {
    const API_URL = '/api/categories';
    
    return {
        /**
         * Get all categories
         * @returns {Promise<Array>} Promise that resolves to array of categories
         */
        getAllCategories: async function() {
            try {
                const response = await fetch(API_URL);
                
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                
                const categories = await response.json();
                console.log('Categories loaded:', categories);
                return categories;
            } catch (error) {
                console.error('Error fetching categories:', error);
                throw error;
            }
        },
        
        /**
         * Get category by ID
         * @param {number} id - Category ID
         * @returns {Promise<Object>} Promise that resolves to category object
         */
        getCategoryById: async function(id) {
            try {
                const response = await fetch(`${API_URL}/${id}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error(`Error fetching category ${id}:`, error);
                throw error;
            }
        }
    };
})();
