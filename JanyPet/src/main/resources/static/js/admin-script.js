/**
 * Admin Dashboard Initialization
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("Initializing admin dashboard...")

    // Check for required services
    const requiredServices = ['ProductHandlers', 'ToastService', 'ApiService'];
    const missingServices = requiredServices.filter(service => !window[service]);
    
    if (missingServices.length > 0) {
      throw new Error(`Missing required services: ${missingServices.join(', ')}`);
    }
    // Initialize core functionality
    await initializeAdminDashboard();

  } catch (error) {
    console.error("Failed to initialize admin dashboard:", error);
    window.ToastService?.error("Dashboard initialization failed");
  }
});

/**
 * Initialize admin dashboard components
 */
async function initializeAdminDashboard() {
  // Initialize UI components
  initializeSidebar();
  initializeNavigation();
  initializeResponsiveBehavior();

  // Initialize handlers
  await Promise.all([
    initializeProductSection(),
    initializeInventorySection(),
    initializeEventListeners()
  ]);

  // Load initial data
  loadInitialData();
}

/**
 * Initialize sidebar functionality
 */
function initializeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggle-sidebar");
  const menuToggle = document.getElementById("menu-toggle");

  if (!sidebar || !toggleSidebar || !menuToggle) {
    console.warn("Some sidebar elements are missing");
    return;
  }

  // Sidebar toggle
  toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    document.querySelector(".main-content")?.classList.toggle("expanded");
  });

  // Mobile menu toggle
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  // Close sidebar when clicking outside
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target)) {
      sidebar.classList.remove("open");
    }
  });
}

/**
 * Initialize navigation between sections
 */
function initializeNavigation() {
  const menuItems = document.querySelectorAll(".menu-item");
  const contentSections = document.querySelectorAll(".content-section");

  if (!menuItems.length || !contentSections.length) {
    console.warn("Navigation elements not found");
    return;
  }

  menuItems.forEach((item) => {
    item.addEventListener("click", function() {
      const sectionId = this.getAttribute("data-section");
      if (!sectionId) return;

      // Update UI
      updateActiveSection(sectionId, menuItems, contentSections);

      // Load section data
      loadSectionData(sectionId);

      // Handle mobile view
      handleMobileNavigation();
    });
  });
}

/**
 * Update active section
 */
function updateActiveSection(sectionId, menuItems, contentSections) {
  // Update menu items
  menuItems.forEach(item => item.classList.remove("active"));
  document.querySelector(`[data-section="${sectionId}"]`)?.classList.add("active");

  // Update content sections
  contentSections.forEach(section => {
    section.classList.toggle("active", section.id === sectionId);
  });
}

/**
 * Initialize responsive behavior
 */
function initializeResponsiveBehavior() {
  const handleResize = () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.toggle("collapsed", window.innerWidth <= 768);
    }
  };

  // Initial check
  handleResize();

  // Add resize listener
  window.addEventListener("resize", handleResize);
}

/**
 * Initialize product section
 */
async function initializeProductSection() {
  try {
    await window.ProductHandlers.initializeProductEvents();
    console.log("Product handlers initialized successfully");
  } catch (error) {
    console.error("Failed to initialize product handlers:", error);
    window.ToastService?.error("Failed to initialize product section");
  }
}
/**
 * Initialize inventory section
 */
async function initializeInventorySection() {
  try {
    if (window.InventoryHandlers) {
      await window.InventoryHandlers.initializeInventoryEvents();
      console.log("Inventory handlers initialized successfully");
    } else {
      console.warn("InventoryHandlers not available");
    }
  } catch (error) {
    console.error("Failed to initialize inventory handlers:", error);
    window.ToastService?.error("Failed to initialize inventory section");
  }
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  // Global error handler
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    window.ToastService?.error("An unexpected error occurred");
  });

  // Handle session timeout
  document.addEventListener("sessionExpired", () => {
    window.location.href = "/login_admin.html";
  });
}

/**
 * Handle mobile navigation
 */
function handleMobileNavigation() {
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.remove("open");
    }
  }
}

/**
 * Load section data
 */
function loadSectionData(sectionId) {  try {
    switch (sectionId) {
      case "dashboard-section":
        window.DashboardHandlers?.loadDashboard();
        break;
      case "products-section":
        window.ProductHandlers?.loadProducts();
        break;
      case "staff-section":
        window.StaffHandlers?.loadStaffData();
        break;
      case "orders-section":
        window.OrderHandlers?.loadOrders();
        break;      case "inventory-section":
        window.InventoryHandlers?.loadInventoryData();
        break;      case "branches-section":
        console.log('Loading branches section...');
        if (window.BranchManager) {
          console.log('BranchManager found, calling loadBranches...');
          window.BranchManager.loadBranches();
        } else {
          console.error('BranchManager not found!');
        }
        break;
      // Add other sections as needed
      default:
        console.warn(`No handler for section: ${sectionId}`);
    }
  } catch (error) {
    console.error(`Error loading section ${sectionId}:`, error);
    window.ToastService?.error(`Failed to load ${sectionId}`);
  }
}

/**
 * Load initial data
 */
function loadInitialData() {
  // Get initial section from URL or default to dashboard
  const initialSection = new URLSearchParams(window.location.search).get('section') || 'dashboard-section';
  
  // Load initial section
  const initialMenuItem = document.querySelector(`[data-section="${initialSection}"]`);
  if (initialMenuItem) {
    initialMenuItem.click();
  }
}
