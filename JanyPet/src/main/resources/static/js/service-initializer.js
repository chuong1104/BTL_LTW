/**
 * Service Initializer
 * Ensures all required services are properly initialized
 */
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Initializing services...');
        
        // Initialize ProductService if not available
        if (!window.ProductService) {
            console.warn('ProductService not found, creating fallback');
            window.ProductService = {
                getAllProducts: async function() {
                    console.log('Using fallback ProductService');
                    return []; // Return empty array as fallback
                },
                getProductById: async function(id) {
                    console.log('Using fallback ProductService');
                    return null; 
                },
                getImageUrl: function(imageUrl) {
                    if (!imageUrl) return 'images/placeholder.jpg';
                    if (imageUrl.startsWith('http')) return imageUrl;
                    return imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
                }
            };
        }
        
        // Initialize CategoryService if not available
        if (!window.CategoryService) {
            console.warn('CategoryService not found, creating fallback');
            window.CategoryService = {
                getAllCategories: async function() {
                    console.log('Using fallback CategoryService');
                    return []; // Return empty array as fallback
                },
                getCategoryById: async function(id) {
                    console.log('Using fallback CategoryService');
                    return null;
                }
            };
        }
        
        console.log('Services initialized');
    });
})();