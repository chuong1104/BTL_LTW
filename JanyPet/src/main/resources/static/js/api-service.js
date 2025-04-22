/**
 * API Service - Handles API requests
 */
class ApiService {
  constructor() {
    this.baseUrl = '/api'; // Use relative URL to respect context path
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      } catch (e) {
        errorMessage = `HTTP error! status: ${response.status}`;
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  }

  // GET request
  async get(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    return this.handleResponse(response);
  }

  // POST request
  async post(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    return this.handleResponse(response);
  }

  // PUT request
  async put(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    return this.handleResponse(response);
  }

  // DELETE request
  async delete(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  }

  // Upload file
  async upload(endpoint, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    return this.handleResponse(response);
  }
}

const api = new ApiService();
export default api;