/**
 * Product Service - Handles product-related operations
 */
import api from './api-service.js';
import { fileUploadService } from './file-upload-service.js';

const ProductService = {
  // Get all products
  getAllProducts: async () => {
    try {
      return await api.get('/products');
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (productId) => {
    try {
      return await api.get(`/products/${productId}`);
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      throw error;
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      // Handle file upload separately if imageFile is present
      if (productData.imageFile) {
        const uploadResult = await ProductService.uploadProductImage(productData.imageFile);
        productData.imageUrl = uploadResult.data.filename || uploadResult.data.url;
        delete productData.imageFile; // Remove the file object before sending JSON
      }

      return await api.post('/products', productData);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (productId, productData) => {
    try {
      // Handle file upload separately if imageFile is present
      if (productData.imageFile) {
        const uploadResult = await ProductService.uploadProductImage(productData.imageFile);
        productData.imageUrl = uploadResult.data.filename || uploadResult.data.url;
        delete productData.imageFile; // Remove the file object before sending JSON
      }

      return await api.put(`/products/${productId}`, productData);
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Upload product image
  uploadProductImage: async (file) => {
    try {
      const result = await fileUploadService.uploadFile(file, '/api/upload/file');
      if (!result.success) {
        throw new Error(result.message || 'Image upload failed');
      }
      return result;
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw error;
    }
  },

  // Get image URL with proper context path
  getImageUrl: (imageUrl) => {
    if (!imageUrl) {
      return '/images/logo.png'; // Default image if no URL is provided
    }

    // Return as is if it's already a full URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Handle image path from the server
    return `/uploads/${imageUrl}`;
  }
};

export default ProductService;