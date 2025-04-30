document.addEventListener('DOMContentLoaded', async () => {
  // Check if auth service exists
  if (!window.authService) {
    console.error('Auth service not loaded');
  } else {
    // Initialize auth
    window.authService.initAuth();
  }
  
  // Load services for booking
  await loadServices();
  
  // Set up event listeners
  setupBookingListeners();
});

// Load services for booking form
async function loadServices() {
  try {
    // Get services from API
    const services = await window.apiService.getServices();
    
    // Update services dropdown
    updateServicesDropdown(services);
    
  } catch (error) {
    console.error("Error loading services:", error);
    showErrorMessage("Unable to load services. Please try again later.");
  }
}

// Update services dropdown with fetched services
function updateServicesDropdown(services) {
  if (!services || services.length === 0) return;
  
  const serviceSelect = document.getElementById('service-select');
  if (!serviceSelect) return;
  
  // Clear existing options except the default one
  while (serviceSelect.options.length > 1) {
    serviceSelect.remove(1);
  }
  
  // Add service options
  services.forEach(service => {
    const option = document.createElement('option');
    option.value = service.id;
    option.textContent = `${service.name} ($${service.price.toFixed(2)})`;
    option.dataset.price = service.price;
    option.dataset.duration = service.duration || 60; // Default duration 60 minutes
    serviceSelect.appendChild(option);
  });
  
  // Add change event to update price display and available time slots
  serviceSelect.addEventListener('change', updateServiceDetails);
}

// Update service details when service is selected
function updateServiceDetails() {
  const serviceSelect = document.getElementById('service-select');
  const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
  
  if (serviceSelect.value && selectedOption) {
    // Update price display
    const priceDisplay = document.getElementById('service-price');
    if (priceDisplay) {
      priceDisplay.textContent = `Price: $${parseFloat(selectedOption.dataset.price).toFixed(2)}`;
      priceDisplay.style.display = 'block';
    }
    
    // Update duration display
    const durationDisplay = document.getElementById('service-duration');
    if (durationDisplay) {
      durationDisplay.textContent = `Duration: ${selectedOption.dataset.duration} minutes`;
      durationDisplay.style.display = 'block';
    }
    
    // Update available time slots
    updateAvailableTimeSlots(selectedOption.dataset.duration);
  } else {
    // Hide price and duration display if no service selected
    const priceDisplay = document.getElementById('service-price');
    if (priceDisplay) {
      priceDisplay.style.display = 'none';
    }
    
    const durationDisplay = document.getElementById('service-duration');
    if (durationDisplay) {
      durationDisplay.style.display = 'none';
    }
  }
}

// Update available time slots based on service duration
function updateAvailableTimeSlots(duration) {
  const timeSelect = document.getElementById('time-select');
  if (!timeSelect) return;
  
  // Clear existing options
  timeSelect.innerHTML = '';
  
  // Get selected date
  const dateInput = document.getElementById('date-input');
  const selectedDate = dateInput ? new Date(dateInput.value) : new Date();
  
  // Check if date is valid and in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!selectedDate || selectedDate < today) {
    // Add a default option indicating invalid date
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Please select a valid date';
    timeSelect.appendChild(defaultOption);
    return;
  }
  
  // Business hours (9 AM to 5 PM)
  const startHour = 9;
  const endHour = 17;
  
  // Duration in hours (convert from minutes)
  const durationHours = parseInt(duration) / 60;
  
  // Generate time slots every 30 minutes
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Ensure slot end time doesn't exceed business hours
      if (hour + durationHours > endHour) {
        continue;
      }
      
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hour, minute, 0, 0);
      
      // Skip times in the past for today
      if (
        selectedDate.getDate() === today.getDate() && 
        selectedDate.getMonth() === today.getMonth() && 
        selectedDate.getFullYear() === today.getFullYear() && 
        slotTime < new Date()
      ) {
        continue;
      }
      
      // Format time for display (e.g., "9:00 AM")
      const formattedTime = slotTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      
      // Create option element
      const option = document.createElement('option');
      option.value = formattedTime;
      option.textContent = formattedTime;
      timeSelect.appendChild(option);
    }
  }
  
  // If no time slots are available
  if (timeSelect.options.length === 0) {
    const noSlotsOption = document.createElement('option');
    noSlotsOption.value = '';
    noSlotsOption.textContent = 'No available time slots';
    timeSelect.appendChild(noSlotsOption);
  }
}

// Set up booking form listeners
function setupBookingListeners() {
  // Date input change event
  const dateInput = document.getElementById('date-input');
  if (dateInput) {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    dateInput.addEventListener('change', () => {
      const serviceSelect = document.getElementById('service-select');
      const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
      
      if (serviceSelect.value && selectedOption) {
        updateAvailableTimeSlots(selectedOption.dataset.duration);
      }
    });
  }
  
  // Booking form submission
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      // Check if user is logged in
      if (!window.authService || !window.authService.isLoggedIn()) {
        // Save form data to session storage
        saveBookingFormData();
        
        // Redirect to login page
        window.location.href = 'login.html?redirect=BookingService.html';
        return;
      }
      
      // Validate form
      if (!validateBookingForm()) {
        return;
      }
      
      try {
        // Show loading state
        showLoadingState();
        
        // Get form data
        const bookingData = {
          serviceId: document.getElementById('service-select').value,
          date: document.getElementById('date-input').value,
          time: document.getElementById('time-select').value,
          petType: document.getElementById('pet-type').value,
          petName: document.getElementById('pet-name').value,
          notes: document.getElementById('booking-notes').value
        };
        
        // Send booking request
        const response = await window.apiService.createBooking(bookingData);
        
        // Show success message
        showSuccessMessage('Your appointment has been successfully booked! We will confirm shortly.');
        
        // Reset form
        bookingForm.reset();
        
        // Hide loading state
        hideLoadingState();
        
      } catch (error) {
        console.error('Error submitting booking:', error);
        
        // Hide loading state
        hideLoadingState();
        
        // Show error message
        showErrorMessage(error.message || 'Failed to book appointment. Please try again later.');
      }
    });
  }
}

// Validate booking form
function validateBookingForm() {
  const serviceSelect = document.getElementById('service-select');
  const dateInput = document.getElementById('date-input');
  const timeSelect = document.getElementById('time-select');
  const petType = document.getElementById('pet-type');
  const petName = document.getElementById('pet-name');
  
  // Check service selection
  if (!serviceSelect.value) {
    showErrorMessage('Please select a service');
    return false;
  }
  
  // Check date selection
  if (!dateInput.value) {
    showErrorMessage('Please select a date');
    return false;
  }
  
  // Check time selection
  if (!timeSelect.value) {
    showErrorMessage('Please select a time slot');
    return false;
  }
  
  // Check pet type selection
  if (!petType.value) {
    showErrorMessage('Please select your pet type');
    return false;
  }
  
  // Check pet name
  if (!petName.value.trim()) {
    showErrorMessage('Please enter your pet\'s name');
    return false;
  }
  
  return true;
}

// Save booking form data to session storage
function saveBookingFormData() {
  const formData = {
    serviceId: document.getElementById('service-select').value,
    date: document.getElementById('date-input').value,
    time: document.getElementById('time-select').value,
    petType: document.getElementById('pet-type').value,
    petName: document.getElementById('pet-name').value,
    notes: document.getElementById('booking-notes').value
  };
  
  sessionStorage.setItem('bookingFormData', JSON.stringify(formData));
}

// Restore booking form data from session storage
function restoreBookingFormData() {
  const storedData = sessionStorage.getItem('bookingFormData');
  if (!storedData) return;
  
  try {
    const formData = JSON.parse(storedData);
    
    document.getElementById('service-select').value = formData.serviceId;
    document.getElementById('date-input').value = formData.date;
    
    // Update service details and time slots before setting time
    updateServiceDetails();
    
    // Set time after time slots are updated
    setTimeout(() => {
      document.getElementById('time-select').value = formData.time;
    }, 100);
    
    document.getElementById('pet-type').value = formData.petType;
    document.getElementById('pet-name').value = formData.petName;
    document.getElementById('booking-notes').value = formData.notes;
    
    // Clear stored data
    sessionStorage.removeItem('bookingFormData');
    
  } catch (error) {
    console.error('Error restoring booking form data:', error);
  }
}

// Show loading state
function showLoadingState() {
  const submitButton = document.querySelector('#booking-form button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
  }
}

// Hide loading state
function hideLoadingState() {
  const submitButton = document.querySelector('#booking-form button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Book Appointment';
  }
}

// Show success message
function showSuccessMessage(message) {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) return;
  
  const alert = document.createElement('div');
  alert.className = 'alert alert-success alert-dismissible fade show';
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alert);
  
  // Scroll to alert
  alertContainer.scrollIntoView({ behavior: 'smooth' });
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}

// Show error message
function showErrorMessage(message) {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) return;
  
  const alert = document.createElement('div');
  alert.className = 'alert alert-danger alert-dismissible fade show';
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alert);
  
  // Scroll to alert
  alertContainer.scrollIntoView({ behavior: 'smooth' });
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}

// Check if user returned from login page and restore form data
if (window.location.href.includes('BookingService.html') && sessionStorage.getItem('bookingFormData')) {
  window.addEventListener('load', () => {
    setTimeout(restoreBookingFormData, 500);
  });
}