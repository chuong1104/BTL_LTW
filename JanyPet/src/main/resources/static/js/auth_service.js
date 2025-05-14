/**
 * PetCare Authentication Service
 * Handles user authentication, registration, and session management
 */

// Configuration
const API_URL = "http://localhost:8080/api" // Update with your API URL
const TOKEN_NAME = "token"
const DEBUG = true

// Debug logging helper
function debugLog(...args) {
  if (DEBUG) {
    console.log(`[AUTH ${new Date().toISOString()}]`, ...args)
  }
}

// State tracking to prevent loops
let isProcessingAuth = false
let lastAuthCheck = 0
let redirectInProgress = false

// Define a variable to cache the current user
let currentUser = null

// ===== Token Management =====

/**
 * Get the authentication token from storage
 */
function getToken() {
  return localStorage.getItem(TOKEN_NAME) || sessionStorage.getItem(TOKEN_NAME)
}

/**
 * Save the authentication token to storage
 * @param {string} token - JWT token
 * @param {boolean} rememberMe - Whether to persist in localStorage
 */
function saveToken(token, rememberMe = false) {
  if (rememberMe) {
    localStorage.setItem(TOKEN_NAME, token)
    sessionStorage.removeItem(TOKEN_NAME)
  } else {
    sessionStorage.setItem(TOKEN_NAME, token)
    localStorage.removeItem(TOKEN_NAME)
  }
}

/**
 * Clear the authentication token from all storage
 */
function clearToken() {
  localStorage.removeItem(TOKEN_NAME)
  sessionStorage.removeItem(TOKEN_NAME)
}

/**
 * Parse JWT token to get user data
 * @param {string} token - JWT token
 * @returns {Object|null} Parsed token data or null if invalid
 */
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    debugLog("Error parsing JWT token:", error)
    return null
  }
}

// ===== Authentication Functions =====

/**
 * Login user with username/password
 * @param {string} username - Username or email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to persist login
 * @returns {Promise<Object>} Login result
 */
async function login(username, password, rememberMe = false) {
  if (isProcessingAuth) {
    debugLog("Login already in progress, skipping");
    return { success: false, message: "Login already in progress" };
  }

  isProcessingAuth = true;
  debugLog("Starting login process for:", username);

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();
    const token = data.token;
    saveToken(token, rememberMe);
    const userData = parseJwt(token);
    currentUser = userData; 
    storeUserData(userData); 
    debugLog("Token:", token); 
    debugLog("User data:", userData); 
    
    updateAuthUI(); 
    
    return { success: true, user: userData };
  } catch (error) {
    debugLog("Login error:", error);
    return {
      success: false,
      message: error.message || "Đăng nhập thất bại",
    };
  } finally {
    setTimeout(() => {
      isProcessingAuth = false;
    }, 500);
  }
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration result
 */
async function register(userData) {
  if (isProcessingAuth) {
    debugLog("Registration already in progress, skipping")
    return { success: false, message: "Registration already in progress" }
  }

  isProcessingAuth = true
  debugLog("Starting registration process")

  try {
    if (!userData.username && !userData.userName) {
      throw new Error("Username is required")
    }
    if (!userData.email) {
      throw new Error("Email is required")
    }
    if (!userData.password) {
      throw new Error("Password is required")
    }

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username: userData.username || userData.userName,
        email: userData.email,
        phoneNumber: userData.phoneNumber || "",
        password: userData.password,
        confirmPassword: userData.confirmPassword || userData.password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Registration failed")
    }

    debugLog("Registration successful")
    return { success: true }
  } catch (error) {
    debugLog("Registration error:", error)
    return { success: false, message: error.message }
  } finally {
    setTimeout(() => {
      isProcessingAuth = false
    }, 500)
  }
}

/**
 * Logout the current user
 * @param {boolean} redirect - Whether to redirect after logout
 * @returns {void}
 */
function logout(redirect = true) {
  if (isProcessingAuth) {
    debugLog("Logout already in progress, skipping");
    return;
  }

  isProcessingAuth = true;
  debugLog("Starting logout process");

  clearToken();
  currentUser = null; 
  localStorage.removeItem('currentUser'); 
  
  updateAuthUI(); 

  if (redirect) {
    redirectInProgress = true;
    setTimeout(() => {
      window.location.href = "index.html"; 
    }, 100); 
  } else {
     setTimeout(() => {
        isProcessingAuth = false;
        redirectInProgress = false; 
     }, 500);
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
function isAuthenticated() {
  const token = getToken()
  if (!token) return false

  const userData = parseJwt(token)
  if (!userData) return false

  const currentTime = Date.now() / 1000
  if (userData.exp && userData.exp < currentTime) {
    clearToken()
    return false
  }
  return true
}

/**
 * Get current user data
 * @returns {Object|null} User data or null if not authenticated
 */
function getCurrentUser() {
    if (currentUser) {
        return currentUser;
    }
    if (isAuthenticated()) {
        const token = getToken();
        try {
            currentUser = parseJwt(token);
            return currentUser;
        } catch (error) {
            debugLog("Error getting current user:", error);
            logout(false); 
            return null;
        }
    }
    return getUserFromStorage();
}

/**
 * Check if user has a specific role (giữ lại nếu cần cho logic khác, nhưng không dùng cho UI admin)
 * @param {string} role - Role to check
 * @param {Object} userData - Optional user data (uses current user if not provided)
 * @returns {boolean} Whether user has the role
 */
function hasRole(role, userData = null) {
  const user = userData || getCurrentUser()
  if (!user) return false
  if (user.authorities && Array.isArray(user.authorities)) {
    return user.authorities.some((auth) => auth.authority === `ROLE_${role}` || auth.authority === role)
  }
  if (user.role) {
    return user.role === role
  }
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.includes(role) || user.roles.includes(`ROLE_${role}`)
  }
  return false
}

/**
 * Make an authenticated API request
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithAuth(url, options = {}) {
  const token = getToken()
  if (!token) {
    console.warn("No authentication token for fetchWithAuth");
    return Promise.reject(new Error("User not authenticated"));
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  if (options.body && typeof options.body !== 'string') {
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      debugLog("Unauthorized or Forbidden. Logging out.");
      logout(); 
      return Promise.reject(new Error("Session expired or unauthorized."));
    }
    return response;
  } catch (error) {
    debugLog("API request error:", error);
    throw error; 
  }
}


// ===== UI Management =====

/**
 * Update UI elements based on authentication state
 */
function updateAuthUI() {
  const isLoggedIn = isAuthenticated();

  if (isLoggedIn) {
    document.body.classList.add('authenticated');
    document.body.classList.remove('not-authenticated');
    document.body.classList.remove('is-admin'); 
  } else {
    document.body.classList.add('not-authenticated');
    document.body.classList.remove('authenticated');
    document.body.classList.remove('is-admin');
  }
  
  debugLog('Auth UI updated. Logged in:', isLoggedIn);
}

// Add logout handler
function setupLogoutHandler() {
  document.body.addEventListener('click', function(event) {
    if (event.target.matches('.logout-btn') || event.target.closest('.logout-btn')) {
      event.preventDefault(); 
      logout();
    }
  });
}

/**
 * Check if redirection is needed based on current page and auth status
 * @param {boolean} forceCheck - Whether to force check regardless of throttling
 */
function checkAuthRedirect(forceCheck = false) {
  if (redirectInProgress) {
    debugLog("Redirection already in progress, skipping check")
    return
  }

  const now = Date.now()
  if (!forceCheck && now - lastAuthCheck < 1000) {
    return
  }
  lastAuthCheck = now

  const currentPath = window.location.pathname.split('/').pop(); 
  debugLog("Checking auth redirect for path:", currentPath)

  const isLoggedIn = isAuthenticated()

  const protectedPages = ["checkout.html", "wishlist.html", "BookingService.html"]; 
  const guestPages = ["login.html", "register.html", "login_admin.html"];


  if (protectedPages.includes(currentPath) && !isLoggedIn) {
    debugLog(`Accessing protected page ${currentPath} without login. Redirecting to login.`);
    redirectInProgress = true;
    window.location.href = `login.html?redirect=${encodeURIComponent(currentPath)}`;
    return;
  }

  if (guestPages.includes(currentPath) && isLoggedIn) {
    debugLog(`Accessing guest page ${currentPath} while logged in. Redirecting to home.`);
    redirectInProgress = true;
    window.location.href = "index.html";
    return;
  }

  debugLog("No redirection needed for path:", currentPath);
}

/**
 * Initialize authentication system
 */
function initAuth() {
  debugLog("Initializing Auth Service...");
  updateAuthUI(); 
  setupLogoutHandler(); 
  checkAuthRedirect(); 
  debugLog("Auth Service Initialized.");
}

document.addEventListener("DOMContentLoaded", initAuth);

// Direct logout handler for buttons (nếu cần)
function handleDirectLogout(event) {
  event.preventDefault()
  logout()
}

// Store the user object in localStorage
function storeUserData(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
}

// Get user from localStorage
function getUserFromStorage() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (e) {
            console.error('Failed to parse user data from storage', e);
            localStorage.removeItem('currentUser'); 
        }
    }
    return null;
}

// Export the auth service
window.authService = {
  login,
  register,
  logout,
  isAuthenticated,
  getCurrentUser,
  hasRole, 
  fetchWithAuth,
  updateAuthUI,
  checkAuthRedirect,
  initAuth,
  handleDirectLogout,
}
