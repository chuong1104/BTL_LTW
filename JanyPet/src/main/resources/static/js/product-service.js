/**
 * Product Service - Handles product-related operations
 */
const ProductService = {
  // Base URL for product API
  baseUrl: '/api/products',
  
  /**
   * Get all products
   * @returns {Promise<Array>} Promise that resolves to array of products
   */
  getAllProducts: async function() {
      try {
          const response = await fetch(this.baseUrl, {
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              }
          });
          
          if (!response.ok) {
              if (response.status === 406) {
                  // For demo/development purpose, return mock data when API is not available
                  console.warn('API not available, using mock product data');
                  return this.getMockProducts();
              }
              throw new Error(`Error fetching products: ${response.status}`);
          }
          
          const products = await response.json();
          // Process image URLs to ensure they're properly formatted
          return products.map(this.processProductImageUrl);
      } catch (error) {
          console.error('Error fetching products:', error);
          // Return mock data as fallback
          console.warn('Falling back to mock product data');
          return this.getMockProducts();
      }
  },
  
  /**
   * Get product by ID
   * @param {string} productId - ID of product to retrieve
   * @returns {Promise<Object>} Promise that resolves to product object
   */
  getProductById: async function(productId) {
      try {
          const response = await fetch(`${this.baseUrl}/${productId}`, {
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              }
          });
          
          if (!response.ok) {
              if (response.status === 406 || response.status === 404) {
                  // Return mock product for development
                  console.warn(`API not available or product not found, using mock data for ID ${productId}`);
                  const mockProducts = this.getMockProducts();
                  const mockProduct = mockProducts.find(p => p.id == productId) || mockProducts[0];
                  return mockProduct;
              }
              throw new Error(`Error fetching product: ${response.status}`);
          }
          
          const product = await response.json();
          // Process image URL
          return this.processProductImageUrl(product);
      } catch (error) {
          console.error(`Error fetching product with ID ${productId}:`, error);
          // Try to find the product in mock data
          const mockProducts = this.getMockProducts();
          const mockProduct = mockProducts.find(p => p.id == productId) || mockProducts[0];
          return mockProduct;
      }
  },
  
  /**
   * Process product image URL to ensure it's properly formatted
   * @param {Object} product - Product object
   * @returns {Object} Product with processed imageUrl
   */
  processProductImageUrl: function(product) {
      if (!product) return product;
      
      // Create a copy to avoid modifying the original
      const processedProduct = {...product};
      
      if (processedProduct.imageUrl) {
          // If it already starts with http/https or a slash, use as is
          if (processedProduct.imageUrl.startsWith('http') || processedProduct.imageUrl.startsWith('/')) {
              // URL is already absolute, do nothing
          } else {
              // If it's a relative path in the database, prefix with the uploads path
              processedProduct.imageUrl = `/uploads/${processedProduct.imageUrl}`;
          }
      } else {
          // No image URL, use placeholder
          processedProduct.imageUrl = '/images/placeholder.jpg';
      }
      
      return processedProduct;
  },
  
  /**
   * Process image URL to ensure it's valid and properly formatted
   * @param {string} url - Raw image URL from API
   * @returns {string} Properly formatted image URL for display
   */
  getImageUrl: function(url) {
      // If URL is empty or null, return default image
      if (!url) {
          return '/images/placeholder-product.jpg';
      }
      
      // If URL already starts with http:// or https://, return as is
      if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
      }
      
      // If URL starts with /uploads/, it's already a proper path
      if (url.startsWith('/uploads/')) {
          return url;
      }
      
      // If URL is just a filename without path, assume it's in /uploads/
      if (!url.startsWith('/')) {
          return `/uploads/${url}`;
      }
      
      // Otherwise, return the URL as is
      return url;
  },
  
  /**
   * Get products by category ID
   * @param {string} categoryId - ID of category
   * @returns {Promise<Array>} Promise that resolves to array of products in the category
   */
  getProductsByCategory: async function(categoryId) {
      try {
          const response = await fetch(`${this.baseUrl}/category/${categoryId}`, {
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              }
          });
          
          if (!response.ok) {
              if (response.status === 406) {
                  // Return mock products filtered by category for development
                  console.warn(`API not available, using mock data for category ${categoryId}`);
                  const mockProducts = this.getMockProducts();
                  return mockProducts.filter(p => p.categoryId == categoryId);
              }
              throw new Error(`Error fetching products by category: ${response.status}`);
          }
          
          return await response.json();
      } catch (error) {
          console.error(`Error fetching products for category ${categoryId}:`, error);
          // Filter mock products by category as fallback
          const mockProducts = this.getMockProducts();
          return mockProducts.filter(p => p.categoryId == categoryId);
      }
  },
  
  /**
   * Search products by keyword
   * @param {string} keyword - Search term
   * @returns {Promise<Array>} Promise that resolves to array of matching products
   */
  searchProducts: async function(keyword) {
      try {
          const response = await fetch(`${this.baseUrl}/search?keyword=${encodeURIComponent(keyword)}`, {
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              }
          });
          
          if (!response.ok) {
              if (response.status === 406) {
                  // Search in mock data for development
                  console.warn('API not available, searching in mock data');
                  const mockProducts = this.getMockProducts();
                  const lowercaseKeyword = keyword.toLowerCase();
                  return mockProducts.filter(p => 
                      p.name.toLowerCase().includes(lowercaseKeyword) || 
                      (p.description && p.description.toLowerCase().includes(lowercaseKeyword))
                  );
              }
              throw new Error(`Error searching products: ${response.status}`);
          }
          
          return await response.json();
      } catch (error) {
          console.error(`Error searching products with keyword "${keyword}":`, error);
          // Search in mock data as fallback
          const mockProducts = this.getMockProducts();
          const lowercaseKeyword = keyword.toLowerCase();
          return mockProducts.filter(p => 
              p.name.toLowerCase().includes(lowercaseKeyword) || 
              (p.description && p.description.toLowerCase().includes(lowercaseKeyword))
          );
      }
  },
  
  /**
   * Get related products for a product
   * @param {string} productId - ID of the product to find related items for
   * @param {number} limit - Maximum number of related products to return
   * @returns {Promise<Array>} Promise that resolves to array of related products
   */
  getRelatedProducts: async function(productId, limit = 4) {
      try {
          const response = await fetch(`${this.baseUrl}/${productId}/related?limit=${limit}`, {
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              }
          });
          
          if (!response.ok) {
              if (response.status === 406) {
                  // Generate mock related products
                  console.warn(`API not available, generating mock related products for ${productId}`);
                  const mockProducts = this.getMockProducts();
                  const product = mockProducts.find(p => p.id == productId);
                  if (!product) return mockProducts.slice(0, limit);
                  
                  // First try to get products from same category
                  let related = mockProducts.filter(p => p.id != productId && p.categoryId === product.categoryId);
                  
                  // If we don't have enough, add some random products
                  if (related.length < limit) {
                      const remaining = mockProducts.filter(p => p.id != productId && p.categoryId !== product.categoryId);
                      related = related.concat(remaining.slice(0, limit - related.length));
                  }
                  
                  return related.slice(0, limit);
              }
              throw new Error(`Error fetching related products: ${response.status}`);
          }
          
          return await response.json();
      } catch (error) {
          console.error(`Error fetching related products for ${productId}:`, error);
          // Generate mock related products as fallback
          const mockProducts = this.getMockProducts();
          const product = mockProducts.find(p => p.id == productId);
          if (!product) return mockProducts.slice(0, limit);
          
          // First try to get products from same category
          let related = mockProducts.filter(p => p.id != productId && p.categoryId === product.categoryId);
          
          // If we don't have enough, add some random products
          if (related.length < limit) {
              const remaining = mockProducts.filter(p => p.id != productId && p.categoryId !== product.categoryId);
              related = related.concat(remaining.slice(0, limit - related.length));
          }
          
          return related.slice(0, limit);
      }
  },
  
  /**
   * Get all products including inactive ones (for admin)
   * @returns {Promise<Array>} Promise that resolves to array of all products
   */
  getAllProductsIncludingInactive: async function() {
      try {
          const response = await fetch(`${this.baseUrl}/all`);
          
          if (!response.ok) {
              throw new Error(`Error fetching all products: ${response.status}`);
          }
          
          const products = await response.json();
          return products;
      } catch (error) {
          console.error('Error fetching all products:', error);
          return this.getMockProducts(); // Return mock data as fallback
      }
  },
  
  /**
   * Toggle product active status
   * @param {string} productId - ID of product to toggle status
   * @param {boolean} active - New status (true for active, false for inactive)
   * @returns {Promise<Object>} Promise that resolves to updated product
   */
  toggleProductStatus: async function(productId, active) {
      try {
          const response = await fetch(`${this.baseUrl}/${productId}/status?active=${active}`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          
          if (!response.ok) {
              throw new Error(`Error toggling product status: ${response.status}`);
          }
          
          return await response.json();
      } catch (error) {
          console.error(`Error toggling status for product with ID ${productId}:`, error);
          throw error;
      }
  },
  
  /**
   * Get mock products for development when API is not available
   * @returns {Array} Array of mock products
   */
  getMockProducts: function() {
      return [
          { 
              id: 1, 
              name: 'Premium Dog Food', 
              description: 'High-quality nutrition for your dog', 
              price: 250000,
              stock: 50,
              categoryId: 1,
              imageUrl: '/images/item1.jpg',
              categoryName: 'Food'
          },
          { 
              id: 2, 
              name: 'Interactive Cat Toy', 
              description: 'Keep your cat entertained for hours', 
              price: 120000,
              stock: 30,
              categoryId: 2,
              imageUrl: '/images/item2.jpg',
              categoryName: 'Toys'
          },
          { 
              id: 3, 
              name: 'Pet Carrier Backpack', 
              description: 'Comfortable and secure pet carrier for travel', 
              price: 450000,
              stock: 15,
              categoryId: 3,
              imageUrl: '/images/item3.jpg',
              categoryName: 'Accessories'
          },
          { 
              id: 4, 
              name: 'Pet Multivitamins', 
              description: 'Essential vitamins for your pet\'s health', 
              price: 180000,
              stock: 45,
              categoryId: 4,
              imageUrl: '/images/item4.jpg',
              categoryName: 'Medicine'
          },
          { 
              id: 5, 
              name: 'Gourmet Cat Food', 
              description: 'Delicious meals your cat will love', 
              price: 220000,
              stock: 0, // Out of stock for testing
              categoryId: 1,
              imageUrl: '/images/item5.jpg',
              categoryName: 'Food'
          },
          { 
              id: 6, 
              name: 'Dog Chew Toy', 
              description: 'Durable toy for aggressive chewers', 
              price: 95000,
              stock: 60,
              categoryId: 2,
              imageUrl: '/images/item6.jpg',
              categoryName: 'Toys'
          },
          { 
              id: 7, 
              name: 'Pet Grooming Kit', 
              description: 'Complete kit for home grooming', 
              price: 350000,
              stock: 20,
              categoryId: 3,
              imageUrl: '/images/item7.jpg',
              categoryName: 'Accessories'
          },
          { 
              id: 8, 
              name: 'Flea & Tick Treatment', 
              description: 'Effective protection against parasites', 
              price: 275000,
              stock: 35,
              categoryId: 4,
              imageUrl: '/images/item8.jpg',
              categoryName: 'Medicine'
          }
      ];
  }
};

// Make it globally available
window.ProductService = ProductService;