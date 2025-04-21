// Index page script
document.addEventListener('DOMContentLoaded', () => {
  // Check if auth service exists
  if (!window.authService) {
    console.error('Auth service not loaded');
    return;
  }

  // Initialize auth
  window.authService.initAuth();

  // Check auth status periodically
  setInterval(() => {
    window.authService.updateAuthUI();
  }, 60000); // Check every minute
  
  // Load products data
  loadProducts();
  
  // Set up event listeners
  setupEventListeners();
});

// Load products data
async function loadProducts() {
  try {
    // Call products API (no authentication needed for public page)
    const response = await fetch(`${API_URL}/products`);
    
    if (!response.ok) {
      throw new Error("Failed to load products data");
    }
    
    const products = await response.json();
    
    // Update UI with products data
    updateProductsUI(products);
  } catch (error) {
    console.error("Error loading products data:", error);
    
    // For demo purposes, we'll continue without showing an error to the user
  }
}

// Update products UI with data
function updateProductsUI(products) {
  // This function would update the product carousels and listings
  // For demo purposes, we'll leave this empty
}

// Set up event listeners
function setupEventListeners() {
  // Add event listeners for logout buttons
  document.querySelectorAll(".logout-btn").forEach(button => {
    button.addEventListener("click", () => {
      window.authService.logout();
    });
  });
  
  // Add other event listeners as needed
}

// // Define API_URL if not already defined
// const API_URL = window.API_URL || "http://localhost:8080/api"