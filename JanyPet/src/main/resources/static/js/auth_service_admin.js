// Configuration
const API_URL = "http://localhost:8080/api";
const TOKEN_NAME = "token";
const DEBUG = false;

// Debug logging helper
function debugLog(...args) {
  if (DEBUG) {
    console.log(`[AUTH_ADMIN ${new Date().toISOString()}]`, ...args);
  }
}

// State tracking
let isProcessingAuth = false;

// Token management functions
function getToken() {
  return localStorage.getItem(TOKEN_NAME) || sessionStorage.getItem(TOKEN_NAME);
}
function getCurrentUser() {
    const token = getToken();
    if (!token) return null;
    return parseJwt(token);
  }
function saveToken(token, rememberMe = false) {
  if (rememberMe) {
    localStorage.setItem(TOKEN_NAME, token);
    sessionStorage.removeItem(TOKEN_NAME);
  } else {
    sessionStorage.setItem(TOKEN_NAME, token);
    localStorage.removeItem(TOKEN_NAME);
  }
}

function clearToken() {
  localStorage.removeItem(TOKEN_NAME);
  sessionStorage.removeItem(TOKEN_NAME);
}

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
    return JSON.parse(jsonPayload);
  } catch (error) {
    debugLog("Error parsing JWT token:", error);
    return null;
  }
}

// Login function for admin
// async function login(username, password, rememberMe = false) {
//   if (isProcessingAuth) {
//     debugLog("Login already in progress, skipping");
//     return { success: false, message: "Login already in progress" };
//   }

//   isProcessingAuth = true;
//   debugLog("Starting admin login process for:", username);

//   try {
//     const response = await fetch(`${API_URL}/auth/login-admin`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//       },
//       body: JSON.stringify({ username, password }),
//       credentials: "include",
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Login failed");
//     }

//     const users = await response.json();
//     const user = users.find((u) => u.username === username);


//     if (!user) {
//       throw new Error("User not found");
//     }

//     if (user.role !== "ADMIN") {
//       throw new Error("User does not have ADMIN role");
//     }

//     const token = user.token; // Giả định API trả về token
//     if (!token) {
//       throw new Error("No token received");
//     }

//     saveToken(token, rememberMe);
//     const userData = parseJwt(token);
//     debugLog("Login successful, user data:", userData);

//     // Chuyển hướng sang trang admin sau khi đăng nhập thành công
//     window.location.href = "admin.html";
//     return { success: true, user: userData };
//   } catch (error) {
//     debugLog("Login error:", error);
//     return {
//       success: false,
//       message: error.message || "Đăng nhập thất bại",
//     };
//   } finally {
//     setTimeout(() => {
//       isProcessingAuth = false;
//     }, 500);
//   }
// }
async function login(username, password, rememberMe = false) {
    if (isProcessingAuth) {
      debugLog("Login already in progress, skipping");
      return { success: false, message: "Login already in progress" };
    }
  
    isProcessingAuth = true;
    debugLog("Starting admin login process for:", username);
  
    try {
      const response = await fetch(`${API_URL}/auth/login-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ username, password }), // Gửi username và password trong body
        credentials: "include",
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
  
      const result = await response.json();
      const token = result.token; // API trả về token trong JwtResponse
  
      if (!token) {
        throw new Error("No token received");
      }
  
      saveToken(token, rememberMe);
      const userData = parseJwt(token);
      debugLog("Login successful, user data:", userData);
  
      // Chuyển hướng sang trang admin sau khi đăng nhập thành công
      window.location.href = "admin.html";
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

// Check if user is authenticated
function isAuthenticated() {
  const token = getToken();
  if (!token) return false;

  const userData = parseJwt(token);
  if (!userData) return false;

  const currentTime = Date.now() / 1000;
  if (userData.exp && userData.exp < currentTime) {
    clearToken();
    return false;
  }

  return true;
}

// Check if user has ADMIN role
function hasRole(role) {
  const token = getToken();
  if (!token) return false;

  const userData = parseJwt(token);
  if (!userData) return false;

  return userData.role === role;
}

// Initialize authentication service and check redirect
function initAuth() {
  // Kiểm tra nếu đã đăng nhập và có vai trò ADMIN thì chuyển hướng
  if (isAuthenticated() && hasRole("ADMIN")) {
    debugLog("User already authenticated as admin, redirecting to admin.html");
    window.location.href = "admin.html";
  }

  // Khởi tạo window.authServiceAdmin nếu chưa tồn tại
  if (!window.authServiceAdmin) {
    window.authServiceAdmin = {
      login,
      getToken,
      saveToken,
      clearToken,
      parseJwt,
      isAuthenticated,
      hasRole,
    };
    debugLog("Auth service initialized successfully");
  } else {
    debugLog("Auth service already initialized");
  }
}

// Run initialization when DOM is fully loaded
document.addEventListener("DOMContentLoaded", initAuth);

// Export the auth service for admin
window.authServiceAdmin = window.authServiceAdmin || {
  login,
  getToken,
  saveToken,
  clearToken,
  parseJwt,
  isAuthenticated,
  hasRole,
  getCurrentUser,
};