/**
 * Product Service - Handles product-related operations
 */
const ProductService = {
  // Base URL của API
  baseUrl: '/api/products',
  
  /**
   * Lấy tất cả sản phẩm
   * @returns {Promise<Array>} Promise trả về mảng các sản phẩm
   */
  getAllProducts: async function() {
      try {
          const response = await fetch(this.baseUrl);
          
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
   * Lấy sản phẩm theo ID
   * @param {string} productId - ID của sản phẩm cần lấy
   * @returns {Promise<Object>} Promise trả về thông tin sản phẩm
   */
  getProductById: async function(productId) {
      try {
          const response = await fetch(`${this.baseUrl}/${productId}`);
          
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
   * Tạo sản phẩm mới
   * @param {Object} productData - Dữ liệu sản phẩm để tạo
   * @returns {Promise<Object>} Promise trả về thông tin sản phẩm đã tạo
   */
  createProduct: async function(productData) {
      try {
          // Kiểm tra nếu có file hình ảnh
          if (productData instanceof FormData) {
              const response = await fetch(this.baseUrl, {
                  method: 'POST',
                  body: productData
                  // Không cần set Content-Type khi dùng FormData, browser sẽ tự set
              });
              
              if (!response.ok) {
                  throw new Error(`Error creating product: ${response.status}`);
              }
              
              return await response.json();
          } else {
              // Nếu không có file, gửi dữ liệu JSON
              const response = await fetch(this.baseUrl, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(productData)
              });
              
              if (!response.ok) {
                  throw new Error(`Error creating product: ${response.status}`);
              }
              
              return await response.json();
          }
      } catch (error) {
          console.error('Error creating product:', error);
          throw error;
      }
  },
  
  /**
   * Cập nhật sản phẩm
   * @param {string} productId - ID của sản phẩm cần cập nhật
   * @param {Object} productData - Dữ liệu sản phẩm để cập nhật
   * @returns {Promise<Object>} Promise trả về thông tin sản phẩm đã cập nhật
   */
  updateProduct: async function(productId, productData) {
      try {
          // Kiểm tra nếu có file hình ảnh
          if (productData instanceof FormData) {
              const response = await fetch(`${this.baseUrl}/${productId}`, {
                  method: 'PUT',
                  body: productData
              });
              
              if (!response.ok) {
                  throw new Error(`Error updating product: ${response.status}`);
              }
              
              return await response.json();
          } else {
              // Nếu không có file, gửi dữ liệu JSON
              const response = await fetch(`${this.baseUrl}/${productId}`, {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(productData)
              });
              
              if (!response.ok) {
                  throw new Error(`Error updating product: ${response.status}`);
              }
              
              return await response.json();
          }
      } catch (error) {
          console.error(`Error updating product with ID ${productId}:`, error);
          throw error;
      }
  },
  
  /**
   * Xóa sản phẩm
   * @param {string} productId - ID của sản phẩm cần xóa
   * @returns {Promise<boolean>} Promise trả về true nếu xóa thành công
   */
  deleteProduct: async function(productId) {
      try {
          const response = await fetch(`${this.baseUrl}/${productId}`, {
              method: 'DELETE'
          });
          
          if (!response.ok) {
              throw new Error(`Error deleting product: ${response.status}`);
          }
          
          return true;
      } catch (error) {
          console.error(`Error deleting product with ID ${productId}:`, error);
          throw error;
      }
  },
  
  /**
   * Lấy sản phẩm theo danh mục
   * @param {string} categoryId - ID của danh mục
   * @returns {Promise<Array>} Promise trả về mảng các sản phẩm thuộc danh mục
   */
  getProductsByCategory: async function(categoryId) {
      try {
          const products = await this.getAllProducts();
          return products.filter(product => product.categoryId === categoryId);
      } catch (error) {
          console.error(`Error filtering products by category ${categoryId}:`, error);
          throw error;
      }
  },

  /**
   * Lấy URL hình ảnh đúng cho sản phẩm
   * @param {string} imageUrl - Đường dẫn ảnh sản phẩm
   * @returns {string} URL hình ảnh hoàn chỉnh
   */
  getImageUrl: function(imageUrl) {
    if (!imageUrl) {
        return '/images/placeholder.jpg'; // Placeholder nên là đường dẫn tuyệt đối từ root
    }

    // Trả về URL đầy đủ nếu đã là URL hoàn chỉnh
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Đảm bảo đường dẫn luôn bắt đầu bằng '/' để nó là đường dẫn tuyệt đối từ root của trang web
    return imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;
  }
};

// Đặt vào object window để sử dụng toàn cục
window.ProductService = ProductService;