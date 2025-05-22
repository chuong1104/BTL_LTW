/**
 * File Upload Service - Xử lý việc upload file lên server
 */
const FileUploadService = {
  /**
   * Upload file lên server
   * @param {File} file - File cần upload
   * @param {string} endpoint - Endpoint API để upload
   * @returns {Promise<Object>} Kết quả từ API
   */
  uploadFile: async function(file, endpoint = '/api/upload') {
    try {
      if (!file) {
        throw new Error('No file provided');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to upload file: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result,
        message: 'File uploaded successfully'
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        message: error.message || 'Error uploading file'
      };
    }
  },
  
  /**
   * Upload nhiều file lên server
   * @param {FileList} files - Danh sách file cần upload
   * @param {string} endpoint - Endpoint API để upload
   * @returns {Promise<Array>} Mảng kết quả từ API
   */
  uploadMultipleFiles: async function(files, endpoint = '/api/upload') {
    try {
      if (!files || files.length === 0) {
        throw new Error('No files provided');
      }
      
      const uploadPromises = Array.from(files).map(file => this.uploadFile(file, endpoint));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      return {
        success: false,
        message: error.message || 'Error uploading multiple files'
      };
    }
  }
};

// Đặt vào object window để sử dụng toàn cục
window.FileUploadService = FileUploadService;
