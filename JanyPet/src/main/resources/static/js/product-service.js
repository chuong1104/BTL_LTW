/**
 * Service for handling product-related API calls
 */
const ProductService = {
    // API endpoints
    API_BASE_URL: '/api/products',
    
    /**
     * Get all products including inactive ones (admin only)
     * @returns {Promise<Array>} Array of products
     */
    getAllProductsIncludingInactive: async function() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/all`);
            if (!response.ok) {
                throw new Error(`Error fetching products: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching all products:', error);
            throw error;
        }
    },
    
    /**
     * Get active products for shop display
     * @returns {Promise<Array>} Array of active products
     */
    getActiveProducts: async function() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/active`);
            if (!response.ok) {
                throw new Error(`Error fetching active products: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching active products:', error);
            throw error;
        }
    },
    
    /**
     * Get a single product by ID
     * @param {string} productId - ID of the product to fetch
     * @returns {Promise<Object>} Product object
     */
    getProductById: async function(productId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/${productId}`);
            if (!response.ok) {
                throw new Error(`Error fetching product: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching product with ID ${productId}:`, error);
            throw error;
        }
    },
    
    /**
     * Create a new product
     * @param {FormData} formData - Form data containing product details
     * @returns {Promise<Object>} Created product
     */
    createProduct: async function(formData) {
        try {
            const response = await fetch(`${this.API_BASE_URL}`, {
                method: 'POST',
                body: formData
                // No Content-Type header needed as the browser sets it with the boundary for FormData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error creating product: ${response.status} - ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },
    
    /**
     * Update an existing product
     * @param {string} productId - ID of the product to update
     * @param {FormData} formData - Form data containing updated product details
     * @returns {Promise<Object>} Updated product
     */
    updateProduct: async function(productId, formData) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/${productId}`, {
                method: 'PUT',
                body: formData
                // No Content-Type header needed as the browser sets it with the boundary for FormData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error updating product: ${response.status} - ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error updating product with ID ${productId}:`, error);
            throw error;
        }
    },
    
    /**
     * Delete a product
     * @param {string} productId - ID of the product to delete
     * @returns {Promise<void>}
     */
    deleteProduct: async function(productId) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/${productId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error deleting product: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error(`Error deleting product with ID ${productId}:`, error);
            throw error;
        }
    },
    
    /**
     * Toggle product active status
     * @param {string} productId - ID of product to toggle status
     * @param {boolean} active - New active status
     * @returns {Promise<Object>} Updated product
     */
    toggleProductStatus: async function(productId, active) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/${productId}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ active })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error toggling product status: ${response.status} - ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error toggling status for product ID ${productId}:`, error);
            throw error;
        }
    },
    
    /**
     * Get all active products
     * @returns {Promise<Array>} Array of active products
     */
    getAllProducts: async function() {
        try {
            const response = await fetch(`${this.API_BASE_URL}`);
            if (!response.ok) {
                throw new Error(`Error fetching products: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },
    
    /**
     * Get products by category ID
     * @param {string} categoryId - ID of the category to filter products
     * @returns {Promise<Array>} Array of products in the specified category
     */
    getProductsByCategory: async function(categoryId) {
        try {
            // Change to use the existing filter endpoint with categoryId parameter
            const response = await fetch(`${this.API_BASE_URL}/filter?categoryId=${categoryId}`);
            if (!response.ok) {
                throw new Error(`Error fetching products by category: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching products for category ${categoryId}:`, error);
            throw error;
        }
    },
    
    /**
     * Helper method to get the correct image URL for a product
     * @param {string} imageUrl - The raw image URL from the server
     * @returns {string} Processed image URL for display
     */
    getImageUrl: function(imageUrl) {
        // Handle null/undefined or empty image URL
        if (!imageUrl) {
            return '/images/placeholder-product.jpg';
        }
        
        // If the image URL already starts with http/https, it's an external URL
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        // If it starts with a slash, it's already a relative path from the server root
        if (imageUrl.startsWith('/')) {
            return imageUrl;
        }
        
        // Otherwise, assume it's a relative path from the product images directory
        return `/images/products/${imageUrl}`;
    }
};

// Ensure it's globally accessible
window.ProductService = ProductService;