/**
 * JanyPet - Order Service
 * This service handles communication with the order API
 */

const OrderService = (() => {
  // API_BASE_URL is handled by api-service.js

  /**
   * Create a new order
   * @param {Object} orderData - Order data to be submitted
   * @returns {Promise} - Promise with the created order
   */
  const createOrder = async (orderData) => {
    if (!window.apiService) {
      console.error("OrderService: apiService is not available.");
      return Promise.reject(new Error("API service is not available."));
    }
    try {
      // Using apiService.post which prepends /api automatically
      return await window.apiService.post("/orders", orderData);
    } catch (error) {
      console.error("Failed to create order via apiService:", error);
      throw error; // Re-throw to be handled by the caller
    }
  };

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise} - Promise with the order details
   */
  const getOrderById = async (orderId) => {
    if (!window.apiService) {
      console.error("OrderService: apiService is not available.");
      return Promise.reject(new Error("API service is not available."));
    }
    try {
      return await window.apiService.get(`/orders/${orderId}`);
    } catch (error) {
      console.error(`Failed to fetch order ${orderId} via apiService:`, error);
      throw error;
    }
  };

  /**
   * Get all orders
   * @returns {Promise} - Promise with list of orders
   */
  const getAllOrders = async () => {
    if (!window.apiService) {
      console.error("OrderService: apiService is not available.");
      return Promise.reject(new Error("API service is not available."));
    }
    try {
      return await window.apiService.get("/orders");
    } catch (error) {
      console.error("Failed to fetch all orders via apiService:", error);
      throw error;
    }
  };

  /**
   * Get orders by user ID
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with user's orders
   */
  const getOrdersByUserId = async (userId) => {
    if (!window.apiService) {
      console.error("OrderService: apiService is not available.");
      return Promise.reject(new Error("API service is not available."));
    }
    try {
      return await window.apiService.get(`/orders/user/${userId}`);
    } catch (error) {
      console.error(`Failed to fetch orders for user ${userId} via apiService:`, error);
      throw error;
    }
  };

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status (should be one of OrderStatus enum values)
   * @returns {Promise} - Promise with updated order
   */
  const updateOrderStatus = async (orderId, status) => {
    if (!window.apiService) {
      console.error("OrderService: apiService is not available.");
      return Promise.reject(new Error("API service is not available."));
    }
    try {
      // The body for this request should be an OrderStatusUpdateRequest object
      // e.g., { "status": "PROCESSING" }
      return await window.apiService.put(`/orders/${orderId}/status`, { status: status.toUpperCase() });
    } catch (error) {
      console.error(`Failed to update status for order ${orderId} via apiService:`, error);
      throw error;
    }
  };

  /**
   * Cancel an order
   * @param {string} orderId - Order ID
   * @returns {Promise} - Promise with cancelled order
   */
  const cancelOrder = async (orderId) => {
    if (!window.apiService) {
      console.error("OrderService: apiService is not available.");
      return Promise.reject(new Error("API service is not available."));
    }
    try {
      return await window.apiService.put(`/orders/${orderId}/cancel`, {}); // Empty body
    } catch (error) {
      console.error(`Failed to cancel order ${orderId} via apiService:`, error);
      throw error;
    }
  };

  /**
   * Get recent orders
   * @param {number} limit - Number of orders to fetch
   * @returns {Promise} - Promise with recent orders
   */
  const getRecentOrders = async (limit = 5) => {
    if (!window.apiService) {
      console.error("OrderService: apiService is not available.");
      return Promise.reject(new Error("API service is not available."));
    }
    try {
      return await window.apiService.get(`/orders/recent?limit=${limit}`);
    } catch (error) {
      console.error("Failed to fetch recent orders via apiService:", error);
      throw error;
    }
  };

  /**
   * Get orders by status
   * @param {string} status - Order status
   * @returns {Promise} - Promise with filtered orders
   */
  const getOrdersByStatus = async (status) => {
    if (!window.apiService) {
      console.error("OrderService: apiService is not available.");
      return Promise.reject(new Error("API service is not available."));
    }
    try {
      return await window.apiService.get(`/orders/status/${status.toUpperCase()}`);
    } catch (error) {
      console.error(`Failed to fetch orders by status ${status} via apiService:`, error);
      throw error;
    }
  };

  /**
   * Get orders by date range
   * @param {string} startDate - Start date (ISO string, e.g., "2025-05-01T00:00:00")
   * @param {string} endDate - End date (ISO string, e.g., "2025-05-10T23:59:59")
   * @returns {Promise} - Promise with filtered orders
   */
  const getOrdersByDateRange = async (startDate, endDate) => {
    if (!window.apiService) {
      console.error("OrderService: apiService is not available.");
      return Promise.reject(new Error("API service is not available."));
    }
    try {
      const params = new URLSearchParams({ start: startDate, end: endDate });
      return await window.apiService.get(`/orders/date-range?${params.toString()}`);
    } catch (error) {
      console.error(`Failed to fetch orders by date range via apiService:`, error);
      throw error;
    }
  };

  /**
   * Get revenue by date range
   * @param {string} startDate - Start date (ISO string)
   * @param {string} endDate - End date (ISO string)
   * @returns {Promise} - Promise with revenue data
   */
  const getRevenueByDateRange = async (startDate, endDate) => {
    if (!window.apiService) {
      console.error("OrderService: apiService is not available.");
      return Promise.reject(new Error("API service is not available."));
    }
    try {
      const params = new URLSearchParams({ start: startDate, end: endDate });
      return await window.apiService.get(`/orders/revenue?${params.toString()}`);
    } catch (error) {
      console.error("Failed to fetch revenue via apiService:", error);
      throw error;
    }
  };

  /**
   * Count orders by status
   * @param {string} status - Order status
   * @returns {Promise} - Promise with count
   */
  const countOrdersByStatus = async (status) => {
    if (!window.apiService) {
      console.error("OrderService: apiService is not available.");
      return Promise.reject(new Error("API service is not available."));
    }
    try {
      return await window.apiService.get(`/orders/count/status/${status.toUpperCase()}`);
    } catch (error) {
      console.error(`Failed to count orders with status ${status} via apiService:`, error);
      throw error;
    }
  };

  // Public API
  return {
    createOrder,
    getOrderById,
    getAllOrders,
    getOrdersByUserId,
    updateOrderStatus,
    cancelOrder,
    getRecentOrders,
    getOrdersByStatus,
    getOrdersByDateRange,
    getRevenueByDateRange,
    countOrdersByStatus,
  };
})();

// Make the service available globally
window.OrderService = OrderService;
