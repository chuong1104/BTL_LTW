// Constants

// let currentUser = null; // Comment out or remove this line if another script declares it
// If this script IS the owner, ensure no other script loaded on BookingService.html declares 'currentUser' globally.
// For now, let's assume it's declared elsewhere or we are fixing a re-declaration within this file's scope if it was accidentally duplicated.
// If it's meant to be local to this script's module/closure, ensure it's not leaking to global.

let selectedServices = [];
let selectedPet = null;
let allServices = [];
let userPets = [];

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
  // Ensure currentUser is declared at the top of the file: let currentUser = null;
  checkUserLogin();
  initEventListeners(); // Error at line 101 occurs here or within this function

  const bookingDateElem = document.getElementById('booking-date');
  if (bookingDateElem) {
    bookingDateElem.min = new Date().toISOString().split('T')[0];
  } else {
    // This is not in initEventListeners, but good to check
    console.warn("Element 'booking-date' for min date setting not found directly in DOMContentLoaded.");
  }
  
  loadServices();
  
  const termsCheckbox = document.getElementById('terms-checkbox');
  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', function() {
      const confirmBtn = document.getElementById('confirm-booking-btn');
      if (confirmBtn) {
        confirmBtn.disabled = !this.checked;
      }
    });
  } else {
     // This is not in initEventListeners, but good to check
    console.warn("Element 'terms-checkbox' not found directly in DOMContentLoaded.");
  }
  
  const step4Tab = document.getElementById('step4-tab');
  if (step4Tab) {
    step4Tab.addEventListener('shown.bs.tab', updateSummary);
  } else {
     // This is not in initEventListeners, but good to check
    console.warn("Element 'step4-tab' not found directly in DOMContentLoaded.");
  }
});

// Check user login
function checkUserLogin() {
  // Try to get token from localStorage
  const token = localStorage.getItem('authToken'); // Ensure this is the correct key you use for storing the token

  if (!token) {
    // Show login required message
    showLoginRequired();
    return;
  }

  // Get current user
  // Use the API_URL from BookingAPI
  fetch(`${BookingAPI.API_URL}/users/me`, { 
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.warn('User token is invalid or expired.');
        localStorage.removeItem('authToken'); // Clear invalid token
      }
      throw new Error('Unauthorized or failed to fetch user data');
    }
    return response.json();
  })
  .then(data => {
    // Make currentUser globally available if other functions in this file need it directly
    // Or, pass it as an argument to functions that need it.
    // For now, assuming it's intended to be a global within the scope of booking-service.js
    window.currentUser = data; // Or just currentUser = data; if it's declared with let at the top
    
    // Hide login required message and show booking content
    const loginRequiredDiv = document.querySelector('.booking-steps .alert-warning');
    if (loginRequiredDiv) {
        loginRequiredDiv.parentElement.style.display = 'none'; // Hide the container of the message
    }
    // You might need to explicitly show the main booking content container here if it's initially hidden
    // e.g., document.getElementById('main-booking-content').style.display = 'block';

    loadPets(); // Load pets now that user is confirmed
  })
  .catch(error => {
    console.error('Error fetching user:', error);
    showLoginRequired();
  });
}

// Show login required message
function showLoginRequired() {
  const bookingSteps = document.querySelector('.booking-steps');
  bookingSteps.innerHTML = `
    <div class="alert alert-warning py-4 text-center">
      <i class="fas fa-exclamation-circle fa-2x mb-3"></i>
      <h4 class="alert-heading">Bạn cần đăng nhập để sử dụng tính năng này</h4>
      <p>Vui lòng <a href="login.html" class="alert-link">đăng nhập</a> hoặc <a href="register.html" class="alert-link">đăng ký</a> để tiếp tục.</p>
    </div>
  `;
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
    // If this is the element causing the error at line 101, this message will appear.
    console.error("CRITICAL: Element with ID 'confirm-booking-btn' not found for event listener. This might be line 101's issue.");
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
  const serviceContainer = document.getElementById('service-list-container');
  // Show loading spinner
  serviceContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải danh sách dịch vụ...</span>
      </div>
      <p class="mt-3">Đang tải danh sách dịch vụ...</p>
    </div>
  `;

  fetch(`${BookingAPI.API_URL}/services`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => { 
        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
      });
    }
    return response.json();
  })
  .then(services => {
    allServices = services;
    serviceContainer.innerHTML = '';

    if (services && services.length > 0) {
      services.forEach(service => {
        serviceContainer.appendChild(createServiceElement(service));
      });
    } else {
      serviceContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center" role="alert">
            Hiện tại không có dịch vụ nào.
          </div>
        </div>
      `;
    }
    updateSelectedServicesCount();
  })
  .catch(error => {
    console.error('Error loading services:', error);
    serviceContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger text-center" role="alert">
          Không thể tải danh sách dịch vụ. Vui lòng thử lại sau. <br>
          <small>${error.message}</small>
        </div>
      </div>
    `;
  });
}

// Create HTML element for a single service
function createServiceElement(service) {
  const colDiv = document.createElement('div');
  colDiv.className = 'col-md-6 col-lg-4 mb-4';

  const cardDiv = document.createElement('div');
  cardDiv.className = 'card h-100 service-item shadow-sm';
  cardDiv.dataset.serviceId = service.id;
  cardDiv.style.cursor = 'pointer';

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body d-flex flex-column';

  const formCheckDiv = document.createElement('div');
  formCheckDiv.className = 'form-check mb-2';

  const checkbox = document.createElement('input');
  checkbox.className = 'form-check-input service-checkbox visually-hidden';
  checkbox.type = 'checkbox';
  checkbox.value = service.id;
  checkbox.id = `service-checkbox-${service.id}`;
  checkbox.addEventListener('change', (event) => {
    handleServiceSelection(event, service);
    cardDiv.classList.toggle('selected', checkbox.checked);
  });
  
  const titleLabel = document.createElement('label');
  titleLabel.className = 'form-check-label w-100';
  titleLabel.htmlFor = `service-checkbox-${service.id}`;

  const title = document.createElement('h5');
  title.className = 'card-title'; 
  title.textContent = service.name || "Tên dịch vụ không xác định";

  titleLabel.appendChild(title);

  const description = document.createElement('p');
  description.className = 'card-text text-muted small flex-grow-1';
  description.textContent = service.description ? (service.description.length > 100 ? service.description.substring(0, 97) + '...' : service.description) : 'Không có mô tả chi tiết.';

  const price = document.createElement('p');
  price.className = 'card-text fw-bold mb-1';
  price.textContent = `Giá từ: ${service.basePrice ? service.basePrice.toLocaleString('vi-VN') + ' VNĐ' : 'Liên hệ'}`;

  const durationText = service.duration ? `${service.duration} phút` : 'Thời gian không xác định';
  const duration = document.createElement('p');
  duration.className = 'card-text small text-muted';
  duration.innerHTML = `<i class="far fa-clock me-1"></i> ${durationText}`;
  
  formCheckDiv.appendChild(checkbox);
  formCheckDiv.appendChild(titleLabel);

  cardBody.appendChild(formCheckDiv);
  cardBody.appendChild(description);
  cardBody.appendChild(price);
  cardBody.appendChild(duration);
  cardDiv.appendChild(cardBody);
  colDiv.appendChild(cardDiv);

  cardDiv.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a, button')) {
        return;
    }
    checkbox.checked = !checkbox.checked;
    const changeEvent = new Event('change', { bubbles: true });
    checkbox.dispatchEvent(changeEvent);
  });

  return colDiv;
}

// Handle service selection
function handleServiceSelection(event, service) {
  const checkbox = event.target;
  if (checkbox.checked) {
    if (!selectedServices.find(s => s.id === service.id)) {
      selectedServices.push(service);
    }
  } else {
    selectedServices = selectedServices.filter(s => s.id !== service.id);
  }
  updateSelectedServicesCount();
}

// Update selected services count display
function updateSelectedServicesCount() {
  const countElement = document.getElementById('selected-services-count');
  if (countElement) {
    countElement.textContent = selectedServices.length;
  }
  const nextButtonStep1 = document.querySelector('#step1-tab-pane .btn-next-step');
  if (nextButtonStep1) {
    nextButtonStep1.disabled = selectedServices.length === 0;
  }
}

// The rest of the file remains unchanged
// ...