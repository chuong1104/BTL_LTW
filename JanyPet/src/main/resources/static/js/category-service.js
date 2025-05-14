/**
 * Category Service - Handles category-related operations
 */
const CategoryService = {
  // Base URL của API
  baseUrl: '/api/categories',
  
  /**
   * Lấy tất cả danh mục
   * @returns {Promise<Array>} Promise trả về mảng các danh mục
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
   * Lấy danh mục theo ID
   * @param {string} categoryId - ID của danh mục cần lấy
   * @returns {Promise<Object>} Promise trả về thông tin danh mục
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
   * Tạo danh mục mới
   * @param {Object} categoryData - Dữ liệu danh mục để tạo
   * @returns {Promise<Object>} Promise trả về thông tin danh mục đã tạo
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
   * Cập nhật danh mục
   * @param {string} categoryId - ID của danh mục cần cập nhật
   * @param {Object} categoryData - Dữ liệu danh mục để cập nhật
   * @returns {Promise<Object>} Promise trả về thông tin danh mục đã cập nhật
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
   * Xóa danh mục
   * @param {string} categoryId - ID của danh mục cần xóa
   * @returns {Promise<boolean>} Promise trả về true nếu xóa thành công
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

// Đặt vào object window để sử dụng toàn cục
window.CategoryService = CategoryService;
