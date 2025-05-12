/**
 * API Service
 * Centralizes API access and provides fallback mechanisms
 */

// Create the API service as a global object
window.apiService = {
    API_BASE_URL: '/api',
    isAvailable: true,
    
    init: async function() {
        console.log('Initializing API Service');
        try {
            await this.testConnection();
        } catch (error) {
            console.error('API initialization failed:', error);
            this.isAvailable = false;
        }
    },
    
    testConnection: async function() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/health`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                timeout: 5000
            });
            
            if (response.ok) {
                console.log('API connection test: Success');
                this.isAvailable = true;
                return true;
            } else {
                console.log('API connection test: Failed');
                this.isAvailable = false;
                return false;
            }
        } catch (error) {
            console.error('API connection test: Failed', error);
            this.isAvailable = false;
            return false;
        }
    },
    
    // Generic request method with fallback and retries
    request: async function(endpoint, options = {}, mockData = null) {
        // Try 2 times
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                // Make sure API_BASE_URL doesn't end with slash and endpoint starts with slash
                const url = `${this.API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
                
                // Add auth token if available
                if (!options.headers) {
                    options.headers = {};
                }
                
                const token = localStorage.getItem('token');
                if (token && !options.headers.Authorization) {
                    options.headers.Authorization = `Bearer ${token}`;
                }
                
                // Add json content-type if not set
                if (options.method && (options.method === 'POST' || options.method === 'PUT') && !options.headers['Content-Type']) {
                    options.headers['Content-Type'] = 'application/json';
                }
                
                console.log(`API Request (${attempt + 1}/2): ${options.method || 'GET'} ${url}`);
                if (options.body) {
                    console.log('Request body:', options.body);
                }
                
                const response = await fetch(url, options);
                
                // Log the response status
                console.log(`API Response: ${response.status} ${response.statusText}`);
                
                // Check if response is OK
                if (response.ok) {
                    // Return JSON if content exists, otherwise return empty object
                    if (response.status === 204) { // No content
                        return {};
                    }
                    
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return await response.json();
                    } else {
                        const text = await response.text();
                        try {
                            return JSON.parse(text);
                        } catch (e) {
                            return { message: text };
                        }
                    }
                } else {
                    // Try to get error message from response
                    let errorMessage;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || `${response.status} ${response.statusText}`;
                    } catch (e) {
                        errorMessage = `${response.status} ${response.statusText}`;
                    }
                    
                    throw new Error(errorMessage);
                }
            } catch (error) {
                console.error(`API Request failed (${attempt + 1}/2):`, error);
                
                // If this is the last attempt and we have mock data, return it
                if (attempt === 1 && mockData !== null) {
                    console.warn('Using mock data as fallback');
                    this.isAvailable = false;
                    return mockData;
                }
                
                // If it's the last attempt, throw the error
                if (attempt === 1) {
                    this.isAvailable = false;
                    throw error;
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    },
    
    // Convenience methods for common HTTP verbs
    get: function(endpoint, mockData = null) {
        return this.request(endpoint, { method: 'GET' }, mockData);
    },
    
    post: function(endpoint, data, mockData = null) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        }, mockData);
    },
    
    put: function(endpoint, data, mockData = null) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        }, mockData);
    },
    
    delete: function(endpoint, mockData = null) {
        return this.request(endpoint, {
            method: 'DELETE'
        }, mockData);
    },
    
    // Generic RESTful API method that works with any endpoint
    fetchData: async function(url, method = "GET", data = null) {
        console.log(`fetchData called: ${method} ${url}`);
        
        // Handle both full URLs and relative paths
        let endpoint = url;
        
        // If this is a full URL (not just an endpoint)
        if (url.startsWith('http') || url.startsWith('/api')) {
            // Remove API_BASE_URL if it's at the beginning of the URL
            if (url.startsWith(this.API_BASE_URL)) {
                endpoint = url.substring(this.API_BASE_URL.length);
            } 
            // If it's just starting with /api but not the exact API_BASE_URL
            else if (url.startsWith('/api')) {
                endpoint = url.substring(4); // Remove /api
            } 
            // Otherwise, use the full URL (might be external API)
            else {
                // For external APIs, use fetch directly
                const options = {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                
                if (data && (method === "POST" || method === "PUT")) {
                    options.body = JSON.stringify(data);
                }
                
                try {
                    console.log(`External API Request: ${method} ${url}`);
                    const response = await fetch(url, options);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    // For DELETE requests with 204 No Content
                    if (response.status === 204) {
                        return null;
                    }
                    
                    return await response.json();
                } catch (error) {
                    console.error(`External API Error (${url}):`, error);
                    throw error;
                }
            }
        }
        
        // Make sure endpoint starts with /
        if (!endpoint.startsWith('/')) {
            endpoint = '/' + endpoint;
        }
        
        // Use the appropriate method based on the HTTP verb
        switch (method.toUpperCase()) {
            case 'GET':
                return this.get(endpoint);
            case 'POST':
                return this.post(endpoint, data);
            case 'PUT':
                return this.put(endpoint, data);
            case 'DELETE':
                return this.delete(endpoint);
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }
    },
    
    // Domain-specific methods
    getServices: function() {
        return this.get('/services', [
            {
                id: 'mock-service-1',
                name: 'Basic Grooming',
                description: 'Basic grooming service for dogs and cats',
                price: 350000,
                duration: 60,
                active: true
            },
            {
                id: 'mock-service-2',
                name: 'Premium Bath',
                description: 'Premium bath with special shampoo and conditioner',
                price: 450000,
                duration: 90,
                active: true
            },
            {
                id: 'mock-service-3',
                name: 'Nail Trimming',
                description: 'Nail trimming for dogs and cats',
                price: 150000,
                duration: 30,
                active: true
            }
        ]);
    },
    
    getServiceById: function(id) {
        return this.get(`/services/${id}`);
    },
    
    getPetsByOwnerId: function(ownerId) {
        if (!ownerId) {
            console.error('getPetsByOwnerId: ownerId is undefined or null');
            return Promise.reject(new Error('Owner ID is required'));
        }
        
        return this.get(`/pets/owner/${ownerId}`, [
            {
                id: 'mock-pet-1',
                name: 'Max',
                breed: 'Labrador',
                gender: 'Male',
                age: 3,
                vaccinated: true,
                owner: { id: ownerId }
            },
            {
                id: 'mock-pet-2',
                name: 'Luna',
                breed: 'Persian Cat',
                gender: 'Female',
                age: 2,
                vaccinated: false,
                owner: { id: ownerId }
            }
        ]);
    },
    
    // Add these convenience methods for category operations
    getCategories: function() {
        return this.fetchData('/api/categories', 'GET');
    },
    
    getCategoryById: function(id) {
        return this.fetchData(`/api/categories/${id}`, 'GET');
    },
    
    createCategory: function(categoryData) {
        return this.fetchData('/api/categories', 'POST', categoryData);
    },
    
    updateCategory: function(id, categoryData) {
        return this.fetchData(`/api/categories/${id}`, 'PUT', categoryData);
    },
    
    deleteCategory: function(id) {
        return this.fetchData(`/api/categories/${id}`, 'DELETE');
    },

    // Order API methods
    createOrder: function(orderData) {
        return this.post('/orders', orderData);
    },

    getOrderById: function(orderId) {
        return this.get(`/orders/${orderId}`);
    },

    getAllOrders: function() {
        return this.get('/orders'); // No pagination params
    },

    getOrdersByUserId: function(userId) {
        return this.get(`/orders/user/${userId}`); // No pagination params
    },

    getOrdersByStatus: function(status) {
        return this.get(`/orders/status/${status}`); // No pagination params
    },

    getOrdersByDateRange: function(startDate, endDate) {
        // Dates should be in ISO format (e.g., "2025-05-11T00:00:00")
        return this.get(`/orders/date-range?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`); // No pagination params
    },

    updateOrderStatus: function(orderId, statusUpdateRequest) {
        // statusUpdateRequest should be like { "status": "PROCESSING" }
        return this.put(`/orders/${orderId}/status`, statusUpdateRequest);
    },

    cancelOrder: function(orderId) {
        return this.put(`/orders/${orderId}/cancel`, {}); // Empty body for this PUT request
    },

    deleteOrder: function(orderId) {
        return this.delete(`/orders/${orderId}`);
    },

    getRecentOrders: function(limit) {
        return this.get(`/orders/recent?limit=${limit}`);
    },

    getRevenueByDateRange: function(startDate, endDate) {
        // Dates should be in ISO format
        return this.get(`/orders/revenue?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`);
    },

    countOrdersByStatus: function(status) {
        return this.get(`/orders/count/status/${status}`);
    }
};

// OrderService implementation
const API_BASE_URL = "/api"; // Or your actual API base URL for OrderService

window.OrderService = {
    getAllOrders: async () => {
        const response = await fetch(`${API_BASE_URL}/orders`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Failed to fetch all orders`);
        }
        return response.json();
    },

    getOrderById: async (orderId) => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Failed to fetch order ${orderId}`);
        }
        return response.json();
    },

    getOrdersByStatus: async (status) => {
        const response = await fetch(`${API_BASE_URL}/orders/status/${status}`); // Adjust endpoint as needed
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Failed to fetch orders by status ${status}`);
        }
        return response.json();
    },
    
    getOrdersByDateRange: async (startDate, endDate) => {
        const response = await fetch(`${API_BASE_URL}/orders/date-range?startDate=${startDate}&endDate=${endDate}`); // Adjust endpoint
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Failed to fetch orders by date range`);
        }
        return response.json();
    },

    updateOrderStatus: async (orderId, newStatus) => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, { 
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }), 
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Failed to update order status`);
        }
        // For PUT, backend might return the updated object or 200 OK / 204 No Content
        if (response.status === 204) return { success: true, id: orderId, status: newStatus };
        return response.json();
    },

    deleteOrderById: async (orderId) => {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            // For DELETE, a 204 No Content is often a success
            if (response.status === 204) {
                return { success: true, message: "Order deleted successfully." }; 
            }
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Failed to delete order ${orderId}`);
        }
        // For DELETE, a 204 No Content is often a success, response.json() might fail
        if (response.status === 204) {
            return { success: true, message: "Order deleted successfully." };
        }
        // If backend returns a JSON body on successful delete (e.g. a confirmation message)
        try {
            return await response.json(); 
        } catch (e) {
            // If no body or non-JSON body, but status was ok (e.g. 200 OK with no content)
            return { success: true, message: "Order deleted (status " + response.status + ")." };
        }
    }
};

// Initialize the API service
document.addEventListener('DOMContentLoaded', () => {
    window.apiService.init().catch(console.error);
});