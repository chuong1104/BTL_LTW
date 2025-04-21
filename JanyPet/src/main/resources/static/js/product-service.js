/**
 * Product Service - Xử lý các thao tác liên quan đến sản phẩm
 */
import api from './api-service.js';

const ProductService = {
  // Lấy tất cả sản phẩm
  getAllProducts: async () => {
    try {
      return await api.get('/products');
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Lấy sản phẩm theo ID
  getProductById: async (productId) => {
    try {
      return await api.get(`/products/${productId}`);
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      throw error;
    }
  },

  // Tạo sản phẩm mới
  createProduct: async (productData) => {
    try {
      return await api.post('/products', productData);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (productId, productData) => {
    try {
      return await api.put(`/products/${productId}`, productData);
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      throw error;
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (productId) => {
    try {
      return await api.delete(`/products/${productId}`);
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error);
      throw error;
    }
  },

  // Upload hình ảnh sản phẩm
  uploadProductImage: async (file) => {
    try {
      return await api.upload('/upload/file', file);
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw error;
    }
  }
};

export default ProductService;