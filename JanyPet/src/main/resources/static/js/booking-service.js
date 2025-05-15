// Constants

let currentUser; // Will be populated by authService.getCurrentUser()
let selectedServices = [];
let selectedPet = null;
let allServices = [];
let userPets = [];

// DOM Elements that might need to be shown/hidden
let bookingProcessContainer = null;
let bookingContentContainer = null;
let loginMessageContainer = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize references to DOM elements after they are loaded
  bookingProcessContainer = document.getElementById('bookingSteps'); // The ul.nav
  bookingContentContainer = document.getElementById('bookingStepsContent'); // The div.tab-content
  
  setupLoginMessageContainer(); // Prepare the login message placeholder

  // auth_service.js should be initialized by its own DOMContentLoaded listener
  // as it's included before this script.
  if (typeof authService === 'undefined') {
    console.error("CRITICAL: authService is not loaded. Booking page will not function correctly.");
    showLoginRequired(); // Show login message as a fallback
    return; // Stop further initialization if authService is missing
  }
  
  checkUserLogin(); 
  initEventListeners(); 

  const bookingDateElem = document.getElementById('booking-date');
  if (bookingDateElem) {
    bookingDateElem.min = new Date().toISOString().split('T')[0];
  } else {
    console.warn("Element 'booking-date' for min date setting not found directly in DOMContentLoaded.");
  }
  
  const termsCheckbox = document.getElementById('terms-checkbox');
  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', function() {
      const confirmBtn = document.getElementById('confirm-booking-btn');
      if (confirmBtn) {
        confirmBtn.disabled = !this.checked;
      }
    });
  } else {
    console.warn("Element 'terms-checkbox' not found directly in DOMContentLoaded.");
  }
  
  const step4Tab = document.getElementById('step4-tab');
  if (step4Tab) {
    step4Tab.addEventListener('shown.bs.tab', updateSummary);
  } else {
    console.warn("Element 'step4-tab' not found directly in DOMContentLoaded.");
  }
});

function setupLoginMessageContainer() {
  const bookingSectionRoot = document.querySelector('.booking-steps'); // The main container for booking steps and messages
  if (bookingSectionRoot) {
    loginMessageContainer = bookingSectionRoot.querySelector('#login-required-message-container');
    if (!loginMessageContainer) {
      loginMessageContainer = document.createElement('div');
      loginMessageContainer.id = 'login-required-message-container';
      loginMessageContainer.className = 'alert alert-warning py-4 text-center';
      loginMessageContainer.style.display = 'none'; // Initially hidden
      loginMessageContainer.innerHTML = `
        <i class="fas fa-exclamation-circle fa-2x mb-3"></i>
        <h4 class="alert-heading">Bạn cần đăng nhập để sử dụng tính năng này</h4>
        <p>Vui lòng <a href="login.html" class="alert-link">đăng nhập</a> hoặc <a href="register.html" class="alert-link">đăng ký</a> để tiếp tục.</p>
      `;
      // Insert the message container before the booking navigation tabs
      const bookingNav = bookingSectionRoot.querySelector('.booking-steps-nav');
      if (bookingNav) {
        bookingNav.parentNode.insertBefore(loginMessageContainer, bookingNav);
      } else {
        bookingSectionRoot.prepend(loginMessageContainer);
      }
    }
  } else {
    console.error("'.booking-steps' container not found for login message setup.");
  }
}

// Check user login
function checkUserLogin() {
  if (!bookingProcessContainer || !bookingContentContainer) {
    console.warn("Booking containers not yet initialized in checkUserLogin. DOM might not be fully ready or IDs are incorrect.");
    bookingProcessContainer = document.getElementById('bookingSteps');
    bookingContentContainer = document.getElementById('bookingStepsContent');
  }
  
  if (window.authService && authService.isAuthenticated()) {
    const user = authService.getCurrentUser();
    if (user && user.id) { // Ensure user and user.id exist
      currentUser = user; 

      // Hide login required message
      if (loginMessageContainer) loginMessageContainer.style.display = 'none';
      
      // Show booking content
      if (bookingProcessContainer) bookingProcessContainer.style.display = ''; 
      if (bookingContentContainer) bookingContentContainer.style.display = 'block';

      loadPets(); 
      if (allServices.length === 0) { 
        loadServices(); 
      }
    } else {
      console.error('Authenticated via authService but no user data (or user.id) found.');
      showLoginRequired();
    }
  } else {
    showLoginRequired();
  }
}

// Show login required message
function showLoginRequired() {
  if (!loginMessageContainer) {
    setupLoginMessageContainer(); // Attempt to set it up if not already
    if (!loginMessageContainer) {
      console.error("Login message container could not be set up.");
      return;
    }
  }

  loginMessageContainer.style.display = 'block';
  
  // Hide booking content
  if (bookingProcessContainer) bookingProcessContainer.style.display = 'none';
  if (bookingContentContainer) bookingContentContainer.style.display = 'none';
}

// Initialize event listeners
function initEventListeners() {
  console.log("Initializing event listeners..."); // For debugging

  const addNewPetBtn = document.getElementById('add-new-pet-btn');
  if (addNewPetBtn) {
    addNewPetBtn.addEventListener('click', showAddPetModal);
  } else {
    console.warn("Element with ID 'add-new-pet-btn' not found for event listener.");
  }

  const savePetBtn = document.getElementById('save-pet-btn');
  if (savePetBtn) {
    savePetBtn.addEventListener('click', savePet);
  } else {
    console.warn("Element with ID 'save-pet-btn' not found for event listener.");
  }

  const refreshPetsBtn = document.getElementById('refresh-pets-btn');
  if (refreshPetsBtn) {
    refreshPetsBtn.addEventListener('click', loadPets);
  } else {
    console.warn("Element with ID 'refresh-pets-btn' not found for event listener.");
  }

  const confirmBookingBtn = document.getElementById('confirm-booking-btn');
  if (confirmBookingBtn) {
    confirmBookingBtn.addEventListener('click', confirmBooking);
  } else {
    console.error("CRITICAL: Element with ID 'confirm-booking-btn' not found.");
  }

  const stepButtons = document.querySelectorAll('.next-step, .prev-step');
  if (stepButtons.length > 0) {
    stepButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetTabId = this.classList.contains('next-step') ? this.getAttribute('data-next') : this.getAttribute('data-prev');
        if (targetTabId) {
          const targetTab = document.getElementById(targetTabId);
          if (targetTab) {
            try {
              const bsTab = new bootstrap.Tab(targetTab);
              bsTab.show();
            } catch (e) {
              console.error(`Error initializing Bootstrap tab for ID '${targetTabId}':`, e);
            }
          } else {
            console.warn(`Target tab element with ID '${targetTabId}' not found for step navigation.`);
          }
        } else {
          console.warn("Step button is missing 'data-next' or 'data-prev' attribute:", this);
        }
      });
    });
  } else {
    console.warn("No elements found with class '.next-step' or '.prev-step'.");
  }
  

  const bookingDateInput = document.getElementById('booking-date');
  if (bookingDateInput) {
    bookingDateInput.addEventListener('change', validateDateTime);
  } else {
    console.error("CRITICAL: Element with ID 'booking-date' not found for event listener. This might be line 101's issue.");
  }

  const bookingTimeInput = document.getElementById('booking-time');
  if (bookingTimeInput) {
    bookingTimeInput.addEventListener('change', validateDateTime);
  } else {
    console.error("CRITICAL: Element with ID 'booking-time' not found for event listener. This might be line 101's issue.");
  }
  console.log("Event listeners initialization attempt finished."); // For debugging
}

// Load services from API
function loadServices() {
  const serviceContainer = document.getElementById('services-container'); 
  if (!serviceContainer) {
    console.error("CRITICAL: Service container 'services-container' not found.");
    return;
  }
  serviceContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải danh sách dịch vụ...</span>
      </div>
      <p class="mt-3">Đang tải danh sách dịch vụ...</p>
    </div>
  `;

  const apiUrl = (typeof BookingAPI !== 'undefined' && BookingAPI.API_URL) ? BookingAPI.API_URL : '/api';

  fetch(`${apiUrl}/services`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(services => {
    serviceContainer.innerHTML = ''; // Clear spinner
    if (services && services.length > 0) {
      allServices = services; // Store all services
      services.forEach(service => {
        if (service.active) { // Only display active services
            const serviceElement = createServiceElement(service);
            serviceContainer.appendChild(serviceElement);
        }
      });
    } else {
      serviceContainer.innerHTML = '<div class="col-12 text-center"><p>Không có dịch vụ nào.</p></div>';
    }
  })
  .catch(error => {
    console.error('Error loading services:', error);
    serviceContainer.innerHTML = `<div class="col-12 text-center"><p class="text-danger">Lỗi khi tải dịch vụ. Vui lòng thử lại.</p></div>`;
  });
}

// Create HTML element for a single service
function createServiceElement(service) {
  const colDiv = document.createElement('div');
  colDiv.className = 'col-md-6 col-lg-4 mb-4';

  const cardDiv = document.createElement('div');
  cardDiv.className = 'card h-100 service-card shadow-sm';
  cardDiv.dataset.serviceId = service.id; // Store service ID

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body d-flex flex-column';

  const name = document.createElement('h5');
  name.className = 'card-title';
  name.textContent = service.name || "Tên dịch vụ";

  const description = document.createElement('p');
  description.className = 'card-text small text-muted flex-grow-1';
  description.textContent = service.description || "Mô tả dịch vụ.";

  const price = document.createElement('p');
  price.className = 'card-text fw-bold mt-auto';
  price.textContent = service.basePrice ? `${service.basePrice.toLocaleString('vi-VN')} VNĐ` : 'Liên hệ';

  cardBody.appendChild(name);
  cardBody.appendChild(description);
  cardBody.appendChild(price);
  cardDiv.appendChild(cardBody);
  colDiv.appendChild(cardDiv);

  cardDiv.addEventListener('click', () => toggleServiceSelection(cardDiv, service));
  return colDiv;
}

// Handle service selection
function toggleServiceSelection(cardElement, service) {
  const serviceId = service.id;
  const index = selectedServices.findIndex(s => s.id === serviceId);

  if (index > -1) {
    selectedServices.splice(index, 1); // Deselect
    cardElement.classList.remove('selected');
  } else {
    selectedServices.push(service); // Select
    cardElement.classList.add('selected');
  }
  updateSelectedServicesCount();
  validateStep1();
}

// Update selected services count display
function updateSelectedServicesCount() {
  const countElement = document.getElementById('selected-services-count');
  if (countElement) {
    countElement.textContent = selectedServices.length;
  }
}

function validateStep1() {
  const btnStep1Continue = document.getElementById('btn-step1-continue');
  if (btnStep1Continue) {
    btnStep1Continue.disabled = selectedServices.length === 0;
  }
}

// The rest of the file remains unchanged
// ...