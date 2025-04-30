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
    
    // Additional methods for the rest of the API
    // ...
};

// Initialize the API service
document.addEventListener('DOMContentLoaded', () => {
    window.apiService.init().catch(console.error);
});