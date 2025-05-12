/**
 * Admin Dashboard Initialization
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
     console.log("Initializing admin dashboard...");

    // Fix: Make sure ToastService exists and is functional, using available toast implementations
    if (!window.ToastService || typeof window.ToastService.success !== 'function') {
      if (window.toastService && typeof window.toastService.showSuccessToast === 'function') {
        // Use window.toastService from toast-service.js (preferred)
        console.log("Initializing window.ToastService using window.toastService (from toast-service.js)");
        window.ToastService = {
          success: (message) => window.toastService.showSuccessToast(message),
          error: (message) => window.toastService.showErrorToast(message),
          warning: (message) => window.toastService.showWarningToast(message),
          info: (message) => window.toastService.showInfoToast(message)
        };
      } else if (window.toastManager && typeof window.toastManager.showToast === 'function') {
        // Fallback to window.toastManager from toast-manager.js
        console.log("Initializing window.ToastService using window.toastManager (from toast-manager.js)");
        window.ToastService = {
          success: (message) => window.toastManager.showToast(message, 'success'),
          error: (message) => window.toastManager.showToast(message, 'error'),
          warning: (message) => window.toastManager.showToast(message, 'warning'),
          info: (message) => window.toastManager.showToast(message, 'info')
        };
      } else {
        // Ultimate fallback if no recognized toast service is found
        console.warn("No compatible toast service (toastService or toastManager) found. Using console for ToastService.");
        window.ToastService = {
          success: (message) => console.log('Success:', message),
          error: (message) => console.error('Error:', message),
          warning: (message) => console.warn('Warning:', message),
          info: (message) => console.info('Info:', message)
        };
      }
    }

    // Fix: Make sure apiService exists
    if (!window.apiService) {
      console.warn("API service not defined, using fallback");
      window.apiService = {
        fetchData: async function(url, method = "GET", data = null) {
          console.log(`[MOCK] ${method} ${url}`);
          // Return mock data for essential endpoints
          if (url.includes('/api/services')) {
            return [
              { id: "mock1", name: "Basic Grooming", category: "GROOMING", basePrice: 200000, duration: 60, active: true },
              { id: "mock2", name: "Premium Grooming", category: "GROOMING", basePrice: 350000, duration: 90, active: true },
              { id: "mock3", name: "Pet Boarding", category: "BOARDING", basePrice: 250000, duration: 1440, active: true }
            ];
          }
          return [];
        }
      };
    }

    // Initialize core functionality
    await initializeAdminDashboard();

  } catch (error) {
    console.error("Failed to initialize admin dashboard:", error);
    alert("Dashboard initialization failed: " + error.message);
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

  // Initialize handlers (safely)
  try {
    // Initialize product section if available
    if (typeof initializeProductSection === 'function') {
      await initializeProductSection();
    }
    
    // Initialize event listeners
    initializeEventListeners();

    // Initialize service handlers if available
    if (window.ServiceHandlers?.initializeServiceEvents) {
      window.ServiceHandlers.initializeServiceEvents();
    }

    // Initialize appointment handlers if available  
    if (window.AppointmentHandlers?.initializeAppointmentEvents) {
      window.AppointmentHandlers.initializeAppointmentEvents();
    }
  } catch (error) {
    console.error("Error initializing handlers:", error);
  }

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
function loadSectionData(sectionId) {
  try {
    switch (sectionId) {
      case "dashboard-section":
        window.DashboardHandlers?.loadDashboard();
        break;
      case "products-section":
        window.ProductHandlers?.loadProducts();
        break;
      case "services-section":
        window.ServiceHandlers?.loadServices();
        break;
      case "appointments-section":
        window.AppointmentHandlers?.loadAppointments();
        break;
      case "orders-section":
        window.OrderHandlers?.loadOrders();
        break;
      case "categories-section":
        window.CategoryHandlers?.loadCategories();
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

// Create a namespace for AppointmentHandlers if it doesn't exist yet
window.AppointmentHandlers = window.AppointmentHandlers || {};

// Add methods to AppointmentHandlers
Object.assign(window.AppointmentHandlers, {
  openBookingModal(mode, id) {
    const label = document.getElementById('bookingModalLabel');
    const form = document.getElementById('booking-form');
    form.reset();
    document.getElementById('booking-id').value = '';
    // load users, pets, services lists
    Promise.all([
      window.apiService.fetchData('/api/users', 'GET'),
      window.apiService.fetchData('/api/pets', 'GET'),
      window.apiService.fetchData('/api/services', 'GET')
    ]).then(([users, pets, services]) => {
      const uSelect = document.getElementById('booking-user'); 
      uSelect.innerHTML = users.map(u=>`<option value="${u.id}">${u.username}</option>`).join('');
      
      const pSelect = document.getElementById('booking-pet'); 
      pSelect.innerHTML = pets.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
      
      const sSelect = document.getElementById('booking-services'); 
      sSelect.innerHTML = services.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
    });
    
    if (mode==='edit') {
      label.textContent='Edit Appointment';
      window.apiService.fetchData(`/api/bookings/${id}`, 'GET').then(b=>{
        document.getElementById('booking-id').value=b.id;
        document.getElementById('booking-user').value=b.user.id;
        document.getElementById('booking-pet').value=b.pet.id;
        document.getElementById('booking-services').value=b.services.map(s=>s.id);
        document.getElementById('booking-date').value=b.bookingDate;
        document.getElementById('booking-time').value=b.startTime;
        document.getElementById('booking-status').value=b.status;
        document.getElementById('booking-notes').value=b.notes;
      });
    } else {
      label.textContent='Add Appointment';
    }
    new bootstrap.Modal(document.getElementById('bookingModal')).show();
  },
  
  saveBooking() {
    const id = document.getElementById('booking-id').value;
    const data = {
      userId: document.getElementById('booking-user').value,
      petId: document.getElementById('booking-pet').value,
      serviceIds: Array.from(document.getElementById('booking-services').selectedOptions).map(o=>o.value),
      bookingDate: document.getElementById('booking-date').value,
      startTime: document.getElementById('booking-time').value,
      status: document.getElementById('booking-status').value,
      notes: document.getElementById('booking-notes').value
    };
    
    const req = id 
      ? window.apiService.fetchData(`/api/bookings/${id}`, 'PUT', data) 
      : window.apiService.fetchData('/api/bookings', 'POST', data);
      
    req.then(()=>{
      window.ToastService.success(id ? 'Updated appointment' : 'Added appointment');
      bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
      window.AppointmentHandlers.loadAppointments();
    }).catch(err=>{
      console.error('Save booking failed', err);
      window.ToastService.error('Save failed');
    });
  },
  
  deleteBooking(id) {
    if(!confirm('Delete this appointment?')) return;
    
    window.apiService.fetchData(`/api/bookings/${id}`, 'DELETE').then(()=>{
      window.ToastService.success('Appointment deleted');
      window.AppointmentHandlers.loadAppointments();
    }).catch(err=>{
      console.error('Delete booking error', err);
      window.ToastService.error('Delete failed');
    });
  },
  
  initializeAppointmentEvents() {
    document.getElementById('add-appointment-btn')?.addEventListener('click', () => this.openBookingModal('add'));
    document.getElementById('save-booking-btn')?.addEventListener('click', () => this.saveBooking());
    document.getElementById('appointments-table-body')?.addEventListener('click', e => {
      if(e.target.closest('.edit-appointment-btn')) 
        this.openBookingModal('edit', e.target.closest('.edit-appointment-btn').dataset.id);
      if(e.target.closest('.delete-appointment-btn')) 
        this.deleteBooking(e.target.closest('.delete-appointment-btn').dataset.id);
    });
  },
  
  loadAppointments() {
    // Implementation would go here
    console.log('Loading appointments...');
  }
});
