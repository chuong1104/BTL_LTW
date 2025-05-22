/**
 * Booking API Client
 * Handles all API communication related to bookings
 */
const BookingAPI = {
  API_URL: 'http://localhost:8080/api', // Ensure this is correct

  /**
   * Helper to get authorization headers.
   * Relies on window.authService being available.
   */
  _getAuthHeaders: function() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (window.authService && typeof window.authService.getToken === 'function') {
      const token = window.authService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('BookingAPI: No auth token found via authService.getToken()');
      }
    } else {
      console.warn('BookingAPI: authService.getToken() is not available. Request will be unauthenticated.');
    }
    return headers;
  },
  
  /**
   * Create a new booking
   * @param {Object} bookingData - The booking data
   * @returns {Promise<Object>} - Created booking response
   */
  createBooking: async function(bookingData) {
    try {
      const response = await fetch(`${this.API_URL}/bookings`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create booking and parse error response.' }));
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
      const headers = this._getAuthHeaders();
      // Content-Type is not strictly needed for GET but doesn't hurt
      // delete headers['Content-Type']; // Optionally remove for GET

      const response = await fetch(`${this.API_URL}/bookings/${id}`, {
        headers: headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to get booking and parse error response.' }));
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
      const queryParams = new URLSearchParams();
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.search) queryParams.append('search', filters.search);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const headers = this._getAuthHeaders();
      // delete headers['Content-Type']; // Optionally remove for GET
      
      const response = await fetch(`${this.API_URL}/bookings${queryString}`, {
        headers: headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to get bookings and parse error response.' }));
        throw new Error(errorData.message || 'Failed to get bookings');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
  },

  /**
   * Get all bookings for a specific user by their ID.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array>} - List of user bookings.
   */
  getBookingsByUserId: async function(userId) {
    if (!userId) {
      console.warn('BookingAPI: userId is required to fetch user bookings.');
      return Promise.reject(new Error('User ID is required.'));
    }
    try {
      const headers = this._getAuthHeaders();
      const response = await fetch(`${this.API_URL}/bookings/user/${userId}`, {
        headers: headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to get user bookings and parse error response.' }));
        throw new Error(errorData.message || 'Failed to get user bookings');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching bookings for user ${userId}:`, error);
      throw error;
    }
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
        headers: this._getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update booking and parse error response.' }));
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
      // Backend might prefer a dedicated endpoint or a specific payload for cancellation.
      // This example assumes updating status via the general updateBooking endpoint.
      const updateData = {
        status: 'CANCELLED' 
      };
      // If your backend has a specific cancel endpoint like PATCH /bookings/{id}/cancel, use that:
      // const response = await fetch(`${this.API_URL}/bookings/${id}/cancel`, {
      //   method: 'PATCH', // or POST
      //   headers: this._getAuthHeaders(),
      // });
      // if (!response.ok) { /* ... error handling ... */ }
      // return await response.json();
      
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
      const headers = this._getAuthHeaders();
      // delete headers['Content-Type']; // Optionally remove for DELETE if no body

      const response = await fetch(`${this.API_URL}/bookings/${id}`, {
        method: 'DELETE',
        headers: headers
      });
      
      if (!response.ok) {
        // DELETE might return 204 No Content on success, or error details in JSON
        if (response.status === 204) return; // Successful deletion with no content
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete booking and parse error response.' }));
        throw new Error(errorData.message || 'Failed to delete booking');
      }
      // If backend returns JSON on successful DELETE (e.g. the deleted object or a success message)
      // return await response.json(); 
      // Otherwise, for 200 OK or 204 No Content, just return (or return a success indicator)
    } catch (error) {
      console.error(`Error deleting booking ${id}:`, error);
      throw error;
    }
  }
};

// Make BookingAPI available globally
if (window) {
  window.BookingAPI = BookingAPI;
}