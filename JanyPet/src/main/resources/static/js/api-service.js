// Create the API service as a global object
window.apiService = {
    API_BASE_URL: 'https://janypet.onrender.com/api', // Change this line
    isAvailable: true,

    // Add the missing testConnection method
    testConnection: async function() {
        try {
            // Use a simple GET request to a known health or lightweight endpoint
            // Make sure your backend has a /api/health endpoint or similar
            const response = await fetch(`${this.API_BASE_URL}/products`); 
            if (!response.ok) {
                // Try to get a more detailed error message if the server provides one
                let errorMsg = `API connection test failed: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMsg = `API connection test failed: ${errorData.message}`;
                    }
                } catch (e) {
                    // Ignore if parsing errorData fails, stick with statusText
                }
                throw new Error(errorMsg);
            }
            console.log('API connection test: Successful');
            this.isAvailable = true; // Ensure this is set on success
            return true;
        } catch (error) {
            console.error('API connection test: Failed -', error.message);
            this.isAvailable = false; // Ensure this is set on failure
            throw error; // Re-throw so init can catch it
        }
    },

    init: async function() {
        console.log('Initializing API Service');
        try {
            await this.testConnection();
        } catch (error) {
            console.error('API initialization failed:', error);
            this.isAvailable = false;
        }
    },
    
    // Helper function to ensure Authorization header
    ensureAuthHeader: function(options = {}) {
        if (!options.headers) options.headers = {};
        
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return options;
    },
    
    // Generic request method with fallback and retries
    request: async function(endpoint, options = {}, mockData = null) {
        options = this.ensureAuthHeader(options);
        // Try 2 times
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                // Make sure API_BASE_URL doesn't end with slash and endpoint starts with slash
                const url = `${this.API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
                
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
        return this.request(endpoint, { method: 'DELETE' }, mockData);
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

    getAllOrders: function(page = 0, size = 10, sort = 'orderDate,desc') {
        return this.get(`/orders?page=${page}&size=${size}&sort=${sort}`);
    },

    getOrdersByUserId: function(userId, page = 0, size = 10, sort = 'orderDate,desc') {
        return this.get(`/orders/user/${userId}?page=${page}&size=${size}&sort=${sort}`);
    },

    getOrdersByStatus: function(status, page = 0, size = 10, sort = 'orderDate,desc') {
        return this.get(`/orders/status/${status}?page=${page}&size=${size}&sort=${sort}`);
    },

    getOrdersByDateRange: function(startDate, endDate, page = 0, size = 10, sort = 'orderDate,desc') {
        return this.get(`/orders/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&page=${page}&size=${size}&sort=${sort}`);
    },

    updateOrderStatus: function(orderId, statusUpdateRequest) {
        return this.put(`/orders/${orderId}/status`, statusUpdateRequest);
    },

    cancelOrder: function(orderId) {
        return this.put(`/orders/${orderId}/cancel`, {});
    },

    deleteOrder: function(orderId) {
        return this.delete(`/orders/${orderId}`);
    },

    getRecentOrders: function(limit = 5) {
        return this.get(`/orders/recent?limit=${limit}`);
    },

    getRevenueByDateRange: function(startDate, endDate) {
        return this.get(`/orders/revenue?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`);
    },

    countOrdersByStatus: function(status) {
        return this.get(`/orders/count/status/${status}`);
    },

    // Product API methods
    getProducts: function() {
        return this.get('/products');
    },

    getProductById: function(id) {
        return this.get(`/products/${id}`);
    },

    getActiveProducts: function() {
        return this.get('/products');
    },

    getAllProductsIncludingInactive: function() {
        return this.get('/products/all');
    },

    createProduct: function(productData) {
        return this.post('/products', productData);
    },

    updateProduct: function(id, productData) {
        return this.put(`/products/${id}`, productData);
    },

    softDeleteProduct: function(id) {
        return this.delete(`/products/${id}`);
    },

    restoreProduct: function(id) {
        return this.post(`/products/${id}/restore`, {});
    }
};

// Initialize the API service
document.addEventListener('DOMContentLoaded', () => {
    if (window.apiService && typeof window.apiService.init === 'function') {
        window.apiService.init().catch(error => {
            console.error("DOMContentLoaded: API Service init failed:", error);
        });
    } else {
        console.error("DOMContentLoaded: apiService is not defined or init function is missing.");
    }
});