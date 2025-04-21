/**
 * PetCare Authentication Service
 * Handles user authentication, registration, and session management
 */

// Configuration
const API_URL = "http://localhost:8080/api" // Update with your API URL
const TOKEN_NAME = "token"
const DEBUG = false

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
let authCheckInterval = null

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
    debugLog("Login already in progress, skipping")
    return { success: false, message: "Login already in progress" }
  }

  isProcessingAuth = true
  debugLog("Starting login process for:", username)

  try {
    // Call login API from Spring Boot backend
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Support CORS with allowCredentials
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Login failed")
    }

    const data = await response.json();
    const token = data.token;
    saveToken(token, rememberMe);
    const userData = parseJwt(token);
    console.log("Token:", token); // Log token
    console.log("User data:", userData); // Log dữ liệu người dùng
    console.log("Has ADMIN role:", hasRole("ADMIN", userData)); // Log vai trò
    redirectInProgress = true;
    return { success: true, user: userData };
  } catch (error) {
    debugLog("Login error:", error)
    return {
      success: false,
      message: error.message || "Đăng nhập thất bại",
    }
  } finally {
    setTimeout(() => {
      isProcessingAuth = false
    }, 500)
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
    // Validate required fields
    if (!userData.username && !userData.userName) {
      throw new Error("Username is required")
    }

    if (!userData.email) {
      throw new Error("Email is required")
    }

    if (!userData.password) {
      throw new Error("Password is required")
    }

    // Call register API from Spring Boot backend
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Support CORS with allowCredentials
      body: JSON.stringify({
        username: userData.username || userData.userName, // Use userName to match data
        email: userData.email,
        phoneNumber: userData.phoneNumber || "",
        password: userData.password,
        confirmPassword: userData.confirmPassword || userData.password, // Add confirmPassword
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
    // Reset processing flag after a short delay
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
    debugLog("Logout already in progress, skipping")
    return
  }

  isProcessingAuth = true
  debugLog("Starting logout process")

  // Clear token from storage
  clearToken()

  // Set flag to prevent multiple redirects
  if (redirect) {
    redirectInProgress = true

    // Redirect after a short delay
    setTimeout(() => {
      window.location.href = "index.html"
    }, 100)
  }

  // // Reset processing flag after a short delay
  // setTimeout(() => {
  //   isProcessingAuth = false
  // }, 500)
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
function isAuthenticated() {
  const token = getToken()
  if (!token) return false

  // Check if token is valid
  const userData = parseJwt(token)
  if (!userData) return false

  // Check if token is expired
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
  if (!isAuthenticated()) return null

  const token = getToken()
  try {
    return parseJwt(token)
  } catch (error) {
    debugLog("Error getting current user:", error)
    logout(false) // Invalid token, log out without redirect
    return null
  }
}

/**
 * Check if user has a specific role
 * @param {string} role - Role to check
 * @param {Object} userData - Optional user data (uses current user if not provided)
 * @returns {boolean} Whether user has the role
 */
function hasRole(role, userData = null) {
  const user = userData || getCurrentUser()
  if (!user) return false

  // Check in authorities array
  if (user.authorities && Array.isArray(user.authorities)) {
    return user.authorities.some((auth) => auth.authority === `ROLE_${role}` || auth.authority === role)
  }

  // Check role field
  if (user.role) {
    return user.role === role
  }

  // Check in roles array if present
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
    throw new Error("No authentication token")
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      // Invalid or expired token
      logout()
      throw new Error("Session expired")
    }

    return response
  } catch (error) {
    debugLog("API error:", error)
    throw error
  }
}

// ===== UI Management =====

/**
 * Update UI elements based on authentication state
 */
function updateAuthUI() {
  const isLoggedIn = isAuthenticated();
  const user = getCurrentUser();

  // Get UI elements 
  const authButtons = document.querySelector('.auth-buttons');
  const userInfo = document.querySelector('.user-info');
  const userName = document.querySelector('.user-name');
  
  if (!authButtons || !userInfo) {
    console.warn('Auth UI elements not found');
    return;
  }

  if (isLoggedIn && user) {
    // User is logged in
    authButtons.style.display = 'none';
    userInfo.style.display = 'flex'; // Show user info
    if (userName) {
      userName.textContent = user.name || user.username || 'User';
    }
  } else {
    // User is not logged in
    authButtons.style.display = 'flex';
    userInfo.style.display = 'none';
  }
}

// Add logout handler
function setupLogoutHandler() {
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
      updateAuthUI();
    });
  }
}

/**
 * Check if redirection is needed based on current page and auth status
 * @param {boolean} forceCheck - Whether to force check regardless of throttling
 */
function checkAuthRedirect(forceCheck = false) {
  // Skip if redirection is already in progress
  if (redirectInProgress) {
    debugLog("Redirection already in progress, skipping check")
    return
  }

  // Throttle checks to prevent excessive processing
  const now = Date.now()
  if (!forceCheck && now - lastAuthCheck < 1000) {
    // Only check once per second at most
    return
  }
  lastAuthCheck = now

  const currentPath = window.location.pathname
  debugLog("Checking auth redirect for path:", currentPath)

  const isLoggedIn = isAuthenticated()
  const isAdmin = isLoggedIn && hasRole("ADMIN")

  // Admin page protection
  if (currentPath.includes("admin.html")) {
    if (!isLoggedIn) {
      debugLog("Not authenticated, redirecting to login")
      redirectInProgress = true
      window.location.replace("login_admin.html") // Use replace instead of href
      return
    }

    if (!isAdmin) {
      debugLog("Not admin, redirecting to home")
      redirectInProgress = true
      window.location.replace("index.html") // Use replace instead of href
      return
    }

    debugLog("User is admin, staying on admin page")
  }
  // Login page redirect if already logged in
  else if (currentPath.includes("login_admin.html") && isLoggedIn) {
    if (isAdmin) {
      debugLog("Already authenticated as admin, redirecting to admin")
      redirectInProgress = true
      window.location.replace("admin.html") // Use replace instead of href
      return
    } else {
      debugLog("Already authenticated but not admin, redirecting to home")
      redirectInProgress = true
      window.location.replace("index.html") // Use replace instead of href
      return
    }
  }

  debugLog("No redirection needed")
}

/**
 * Initialize authentication system
 */
function initAuth() {
  updateAuthUI();
  setupLogoutHandler();
}

// Initialize on DOM content loaded
document.addEventListener("DOMContentLoaded", initAuth)

// Direct logout handler for buttons
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
  // Expose state for debugging
  isProcessingAuth,
  redirectInProgress,
}
