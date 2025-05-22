/**
 * Shop Product Service
 * Connects admin product management with shop frontend display
 */

const ShopProductService = (() => {
    // Store cached data to reduce API calls
    let cachedProducts = null;
    let cachedCategories = null;
    let lastFetchTime = 0;
    const CACHE_DURATION = 60000; // Cache duration in milliseconds (1 minute)

    /**
     * Initialize the service and set up event listeners
     */
    const init = () => {
        console.log('Initializing Shop Product Service...');
        
        // Listen for custom events from admin panel
        window.addEventListener('product-updated', () => {
            console.log('Product update event received, refreshing products...');
            refreshProducts();
        });
        
        window.addEventListener('category-updated', () => {
            console.log('Category update event received, refreshing categories...');
            refreshCategories();
        });

        // Check if we're on the shop page
        if (window.location.pathname.includes('shop.html')) {
            // Initialize the shop with fresh data
            refreshData();
        }
    };

    /**
     * Refresh both products and categories data
     */
    const refreshData = async () => {
        await refreshCategories();
        await refreshProducts();
    };

    /**
     * Refresh product data and update UI
     */
    const refreshProducts = async () => {
        // Clear cache to force reload
        cachedProducts = null;
        
        // If we're on the shop page, reload the products
        if (window.location.pathname.includes('shop.html') && window.ShopManager) {
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get('cat');
            const tagParam = urlParams.get('tag');
            
            if (categoryParam) {
                await window.ShopManager.loadProductsByTag('category', categoryParam);
            } else if (tagParam) {
                await window.ShopManager.loadProductsByTag('tag', tagParam);
            } else {
                await window.ShopManager.loadAllProducts();
            }
        }
    };

    /**
     * Refresh category data and update UI
     */
    const refreshCategories = async () => {
        // Clear cache to force reload
        cachedCategories = null;
        
        // If we're on the shop page, reload the categories
        if (window.location.pathname.includes('shop.html') && window.ShopManager) {
            await window.ShopManager.loadCategories();
        }
    };

    /**
     * Get all products with caching
     */
    const getAllProducts = async () => {
        const currentTime = Date.now();
        
        // Check if we have cached data and it's still fresh
        if (cachedProducts && (currentTime - lastFetchTime) < CACHE_DURATION) {
            console.log('Using cached product data');
            return cachedProducts;
        }
        
        try {
            console.log('Fetching fresh product data');
            const products = await window.ProductService.getAllProducts();
            
            // Update cache
            cachedProducts = products;
            lastFetchTime = currentTime;
            
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    };

    /**
     * Get all categories with caching
     */
    const getAllCategories = async () => {
        const currentTime = Date.now();
        
        // Check if we have cached data and it's still fresh
        if (cachedCategories && (currentTime - lastFetchTime) < CACHE_DURATION) {
            console.log('Using cached category data');
            return cachedCategories;
        }
        
        try {
            console.log('Fetching fresh category data');
            const categories = await window.CategoryService.getAllCategories();
            
            // Update cache
            cachedCategories = categories;
            lastFetchTime = currentTime;
            
            return categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    };

    /**
     * Get products by category ID
     */
    const getProductsByCategory = async (categoryId) => {
        try {
            const products = await getAllProducts();
            return products.filter(product => product.categoryId === categoryId);
        } catch (error) {
            console.error(`Error filtering products by category ${categoryId}:`, error);
            throw error;
        }
    };

    /**
     * Trigger product update event after admin operations
     */
    const notifyProductChange = () => {
        console.log('Dispatching product update event');
        window.dispatchEvent(new CustomEvent('product-updated'));
    };

    /**
     * Trigger category update event after admin operations
     */
    const notifyCategoryChange = () => {
        console.log('Dispatching category update event');
        window.dispatchEvent(new CustomEvent('category-updated'));
    };

    // Public API
    return {
        init,
        refreshProducts,
        refreshCategories,
        refreshData,
        getAllProducts,
        getAllCategories,
        getProductsByCategory,
        notifyProductChange,
        notifyCategoryChange
    };
})();

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    ShopProductService.init();
});

// Make available globally
window.ShopProductService = ShopProductService;