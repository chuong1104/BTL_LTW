/**
 * Booking API Client
 * Handles all API communication related to bookings
 */
const BookingAPI = {
  API_URL: 'http://localhost:8080/api',
  
  /**
   * Create a new booking
   * @param {Object} bookingData - The booking data
   * @returns {Promise<Object>} - Created booking response
   */
  createBooking: async function(bookingData) {
    try {
      const response = await fetch(`${this.API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },
  
  /**
   * Get a booking by ID
   * @param {string} id - Booking ID
   * @returns {Promise<Object>} - Booking data
   */
  getBookingById: async function(id) {
    try {
      const response = await fetch(`${this.API_URL}/bookings/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get booking');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get all bookings (admin only or filtered for users)
   * @param {Object} filters - Optional filters (userId, status, dateFrom, dateTo, search)
   * @returns {Promise<Array>} - List of all bookings
   */
  getAllBookings: async function(filters = {}) {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.userId) queryParams.append('userId', filters.userId); // For fetching specific user's bookings
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom); // Changed from 'date'
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);     // Added for range
      if (filters.search) queryParams.append('search', filters.search);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      // Changed from /admin/bookings to /bookings to align with BookingController.getAll()
      // Assumes BookingController.getAll() will be enhanced to handle these query parameters.
      const response = await fetch(`${this.API_URL}/bookings${queryString}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get bookings');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
  },

  /**
   * Get all bookings for the current user (Simplified: uses getAllBookings with a filter)
   * @returns {Promise<Array>} - List of user bookings
   */
  getUserBookings: async function() {
    const user = JSON.parse(localStorage.getItem('janypet_user')); // Assuming 'janypet_user' stores the user object
    if (!user || !user.id) {
      return Promise.reject(new Error('User not authenticated or user ID missing.'));
    }
    return this.getAllBookings({ userId: user.id });
  },
  
  /**
   * Update a booking
   * @param {string} id - Booking ID
   * @param {Object} updateData - Updated booking data
   * @returns {Promise<Object>} - Updated booking
   */
  updateBooking: async function(id, updateData) {
    try {
      const response = await fetch(`${this.API_URL}/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update booking');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating booking ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Cancel a booking
   * @param {string} id - Booking ID
   * @returns {Promise<Object>} - Canceled booking
   */
  cancelBooking: async function(id) {
    try {
      const updateData = {
        status: 'CANCELLED'
      };
      
      return await this.updateBooking(id, updateData);
    } catch (error) {
      console.error(`Error canceling booking ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a booking (admin only)
   * @param {string} id - Booking ID
   * @returns {Promise<void>}
   */
  deleteBooking: async function(id) {
    try {
      const response = await fetch(`${this.API_URL}/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete booking');
      }
    } catch (error) {
      console.error(`Error deleting booking ${id}:`, error);
      throw error;
    }
  }
};

// Make BookingAPI available globally
window.BookingAPI = BookingAPI;