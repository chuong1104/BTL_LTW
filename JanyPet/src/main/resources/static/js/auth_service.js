/**
 * PetCare Authentication Service
 * Handles user authentication, registration, and session management
 */

// Configuration
const API_URL = "https://nguyendangcong.onrender.com/api" // Update with your API URL
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
const DETAILED_USER_KEY = 'janyPetDetailedUser'; // New key for the full user object from login response
let cachedDetailedUser = null; // Cache for the detailed user object

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
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    // Ensure 'id' field exists, map from 'sub' if necessary
    if (typeof payload.id === 'undefined' && payload.sub) {
        payload.id = payload.sub;
    }
    return payload;
  } catch (error) {
    debugLog("Error parsing JWT token:", error);
    return null;
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
      let errorData = { message: "Login failed and error response unparseable" };
      try {
        errorData = await response.json();
      } catch (e) {
        debugLog("Could not parse error response JSON", e);
      }
      throw new Error(errorData.message || `Login failed with status: ${response.status}`);
    }

    const loginResponseData = await response.json();
    // **CRITICAL DEBUG LOG: Check this output in your browser console**
    console.log('AuthService: Full login API Response Data:', JSON.stringify(loginResponseData, null, 2));
    debugLog("AuthService: Full login API Response Data (object):", loginResponseData);


    // ---- ADAPT THIS SECTION BASED ON YOUR ACTUAL BACKEND RESPONSE ----
    // Your backend's JwtResponse sends fields directly, not nested under 'user'
    
    const token = loginResponseData.token; // Assuming JwtResponse has a 'token' field for the JWT
    
    // Construct the 'detailedUserFromResponse' object from the flat JwtResponse fields
    const detailedUserFromResponse = {
        id: loginResponseData.id, // Assuming JwtResponse has an 'id' field for user ID
        username: loginResponseData.username,
        email: loginResponseData.email,
        phoneNumber: loginResponseData.phoneNumber,
        roles: loginResponseData.roles, // Assuming JwtResponse has a 'roles' field
        // Add any other relevant user fields that JwtResponse might provide
        // authorities: loginResponseData.roles ? loginResponseData.roles.map(role => ({ authority: role })) : [] // Optional: if you need 'authorities' structure elsewhere
    };
    // ---- END ADAPTATION SECTION ----


    if (!token || !detailedUserFromResponse || typeof detailedUserFromResponse.id === 'undefined') {
        console.error('AuthService: Login response missing expected fields (token, user.id). Actual data received:', loginResponseData);
        clearToken();
        localStorage.removeItem(DETAILED_USER_KEY);
        cachedDetailedUser = null;
        throw new Error('Login failed: Invalid response structure from server.');
    }

    saveToken(token, rememberMe); 

    localStorage.setItem(DETAILED_USER_KEY, JSON.stringify(detailedUserFromResponse));
    cachedDetailedUser = detailedUserFromResponse; 
    
    debugLog("Token stored successfully."); 
    debugLog("Detailed user data stored successfully:", detailedUserFromResponse); 
    
    updateAuthUI(); 
    
    return { success: true, user: detailedUserFromResponse };
  } catch (error) {
    debugLog("Login error:", error.message, error);
    clearToken();
    localStorage.removeItem(DETAILED_USER_KEY);
    cachedDetailedUser = null;
    updateAuthUI(); 
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
  if (isProcessingAuth && !redirectInProgress) { // Allow logout even if processing other auth, unless redirecting
    debugLog("Logout called while another auth process might be running, but proceeding.");
  }

  isProcessingAuth = true; // Mark as processing to avoid immediate re-checks
  debugLog("Starting logout process");

  clearToken(); // Clears JWT token
  localStorage.removeItem(DETAILED_USER_KEY); // Clear the stored detailed user object
  cachedDetailedUser = null; // Clear the in-memory cache
  
  updateAuthUI(); 

  if (redirect) {
    if (redirectInProgress) return; // Avoid multiple redirects
    redirectInProgress = true;
    // Redirect to home or login page after a short delay
    setTimeout(() => {
      window.location.href = "index.html"; 
      // Reset flags after navigation attempt, though page context will be lost
      // isProcessingAuth = false; 
      // redirectInProgress = false;
    }, 100); 
  } else {
     // If not redirecting, reset processing flag after a delay
     setTimeout(() => {
        isProcessingAuth = false;
        // redirectInProgress should already be false or handled by the caller
     }, 500);
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
function isAuthenticated() {
  const token = getToken();
  if (!token) return false;

  const jwtPayload = parseJwt(token); // Use our parseJwt that ensures id mapping
  if (!jwtPayload) { // Token is malformed
      clearToken(); // Clean up bad token
      localStorage.removeItem(DETAILED_USER_KEY);
      cachedDetailedUser = null;
      return false;
  }

  const currentTime = Date.now() / 1000;
  if (jwtPayload.exp && jwtPayload.exp < currentTime) {
    debugLog("Token expired. Clearing session.");
    logout(false); // Logout without immediate redirect to clear state
    return false;
  }
  return true;
}

/**
 * Get current user data
 * @returns {Object|null} User data or null if not authenticated
 */
function getCurrentUser() {
    // 1. Try the in-memory cache first
    if (cachedDetailedUser && typeof cachedDetailedUser.id !== 'undefined') {
        return cachedDetailedUser;
    }

    // 2. Try to get the detailed user object from localStorage
    const storedUserJson = localStorage.getItem(DETAILED_USER_KEY);
    if (storedUserJson) {
        try {
            const storedUser = JSON.parse(storedUserJson);
            if (storedUser && typeof storedUser.id !== 'undefined') {
                cachedDetailedUser = storedUser; // Cache it
                return storedUser;
            } else {
                // Invalid data in storage, clear it
                debugLog("Invalid detailed user data in localStorage. Clearing.");
                localStorage.removeItem(DETAILED_USER_KEY);
                // Also clear token if user data is essential for authenticated state
                // clearToken(); 
            }
        } catch (error) {
            debugLog("Error parsing detailed user data from localStorage:", error);
            localStorage.removeItem(DETAILED_USER_KEY); // Remove corrupted data
        }
    }

    // 3. Fallback: If detailed user is not found, but a token exists (isAuthenticated might be true)
    //    Attempt to construct a minimal user object from the token.
    //    This is a less ideal state, login should provide the full user object.
    const token = getToken();
    if (token) {
        const jwtPayload = parseJwt(token); // parseJwt now maps 'sub' to 'id' if 'id' is missing
        if (jwtPayload && typeof jwtPayload.id !== 'undefined') {
            // This user object might be less complete than the one from login response
            debugLog("Falling back to user data from JWT payload.", jwtPayload);
            cachedDetailedUser = jwtPayload; // Cache this minimal user object
            // Optionally, store this minimal version if nothing else is available
            // localStorage.setItem(DETAILED_USER_KEY, JSON.stringify(jwtPayload)); 
            return jwtPayload;
        }
    }
    
    // If all attempts fail, clear cache and return null
    cachedDetailedUser = null;
    return null;
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
  getToken // Expose getToken if other services need it directly
};

// Initialize Auth Service on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    if (window.authService && typeof window.authService.initAuth === 'function') {
        window.authService.initAuth();
    } else {
        console.error("AuthService or initAuth not found on DOMContentLoaded.");
    }
});