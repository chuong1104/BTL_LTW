/**
 * Shop Product Service
 * Handles product data retrieval and manipulation
 */
window.ShopProductService = window.ShopProductService || {};

// Add the missing initialization function
window.ShopProductService.initializeHomepage = function() {
    console.log('ShopProductService: Homepage initialized');
};

/**
 * Service for handling product-related operations in the shop
 */
const ShopProductService = {
    baseUrl: '/api/products',
    
    /**
     * Get all products
     */
    getAllProducts: async function() {
        try {
            const response = await fetch(`${this.baseUrl}`);
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
     * Search for products by name
     * @param {string} keyword - The search keyword
     */
    searchProducts: async function(keyword) {
        try {
            // Encode the keyword to handle special characters
            const encodedKeyword = encodeURIComponent(keyword);
            const response = await fetch(`${this.baseUrl}/search?keyword=${encodedKeyword}`);
            
            if (!response.ok) {
                // Try to get more detailed error information if available
                let errorText = "";
                try {
                    const errorData = await response.json();
                    errorText = errorData.message || errorData.error || "";
                } catch (e) {
                    // If can't parse the error response, just use the status
                    errorText = response.status;
                }
                
                console.error(`Search request failed: ${errorText}`);
                throw new Error(`Network response was not ok: ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error searching products:', error);
            // Provide a fallback (empty array) so the UI can still render
            return [];
        }
    },
    
    /**
     * Get products by category
     * @param {string} categoryId - Category ID
     * @returns {Promise<Array>} - Products in the category
     */
    getProductsByCategory: async function(categoryId) {
        try {
            // First try the proper REST endpoint
            let response = await fetch(`/api/products/category/${categoryId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            // If that fails, try the fallback query parameter approach
            if (!response.ok) {
                console.log(`Category endpoint failed, trying fallback. Status: ${response.status}`);
                response = await fetch(`/api/products?category=${categoryId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
            }
            
            if (!response.ok) {
                // If both approaches fail, return empty array instead of throwing
                console.error(`Error fetching products by category: ${response.status}`);
                return [];
            }
            
            const products = await response.json();
            return products;
        } catch (error) {
            console.error('Error fetching products by category:', error);
            // Return empty array instead of throwing error to avoid breaking UI
            return [];
        }
    }
};

// Add to window object for global access
window.ShopProductService = ShopProductService;

// Find existing ShopProductService or add this at the end of the file
if (!window.ShopProductService.initializeHomepage) {
    window.ShopProductService.initializeHomepage = function() {
        console.log('Homepage product service initialized');
        // Initialize any homepage-specific product functionality
    }
}

// Add the core product service functions if they're missing
if (!window.ProductService) {
    window.ProductService = {
        // Get all products with optional filtering
        getAllProducts: async function(filter = {}) {
            try {
                let url = '/api/products';
                const queryParams = [];
                
                if (filter.category) queryParams.push(`category=${filter.category}`);
                if (filter.search) queryParams.push(`search=${filter.search}`);
                if (filter.sort) queryParams.push(`sort=${filter.sort}`);
                
                if (queryParams.length > 0) {
                    url += '?' + queryParams.join('&');
                }
                
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error fetching products:', error);
                // Return empty array as fallback
                return [];
            }
        },
        
        // Get best-selling products
        getBestSellingProducts: async function(limit = 8) {
            try {
                const response = await fetch(`/api/products/bestselling?limit=${limit}`);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error fetching best-selling products:', error);
                // Return empty array as fallback so UI doesn't break
                return [];
            }
        },
        
        // Get product by ID
        getProductById: async function(id) {
            try {
                const response = await fetch(`/api/products/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                console.error(`Error fetching product ${id}:`, error);
                return null;
            }
        }
    };
}