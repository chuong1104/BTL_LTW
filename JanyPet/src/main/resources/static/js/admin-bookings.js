/**
 * Admin Bookings Handler
 * Manages bookings in the admin dashboard
 */

// Global variables
let adminBookings = [];
let currentBooking = null;
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let statusFilter = '';
let dateFilter = '';
let searchTerm = '';

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing admin bookings handler');
  
  // Check if on admin page and appointment section exists
  if (document.getElementById('appointments-section')) {
    console.log('Appointments section found');
    // Replace the undefined function with our actual initialization
    if (typeof window.BookingHandlers?.initializeBookingEvents === 'function') {
      window.BookingHandlers.initializeBookingEvents();
    }
    loadAllBookings();
  }
  
  // Check if booking panel exists (in case we're using the separate panel)
  if (document.getElementById('bookings-panel')) {
    console.log('Bookings panel found');
    setupBookingFilters();
    setupBookingActionButtons();
    loadAllBookings();
  }
});

// Set up booking filters
function setupBookingFilters() {
  console.log('Setting up booking filters');
  
  // Status filter
  const statusFilterEl = document.getElementById('booking-status-filter');
  if (statusFilterEl) {
    statusFilterEl.addEventListener('change', function() {
      statusFilter = this.value;
      currentPage = 1;
      loadAllBookings();
    });
  }
  
  // Date filter
  const dateFilterEl = document.getElementById('booking-date-filter');
  if (dateFilterEl) {
    dateFilterEl.addEventListener('change', function() {
      dateFilter = this.value;
      currentPage = 1;
      loadAllBookings();
    });
  }
  
  // Search filter
  const searchInput = document.getElementById('booking-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      searchTerm = this.value;
      currentPage = 1;
      loadAllBookings();
    });
  }
  
  // Refresh button
  const refreshBtn = document.getElementById('refresh-bookings');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      loadAllBookings();
    });
  }
  
  // Pagination setup
  const paginationContainer = document.getElementById('bookings-pagination');
  if (paginationContainer) {
    paginationContainer.addEventListener('click', function(e) {
      if (e.target.classList.contains('page-link')) {
        e.preventDefault();
        const page = e.target.getAttribute('data-page');
        if (page) {
          currentPage = parseInt(page);
          loadAllBookings();
        }
      }
    });
  }
}

// Set up booking action buttons
function setupBookingActionButtons() {
  console.log('Setting up booking action buttons');
  
  // Confirm booking
  const confirmBtn = document.getElementById('admin-confirm-booking');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function() {
      updateBookingStatus('CONFIRMED');
    });
  }
  
  // Complete booking
  const completeBtn = document.getElementById('admin-complete-booking');
  if (completeBtn) {
    completeBtn.addEventListener('click', function() {
      updateBookingStatus('COMPLETED');
    });
  }
  
  // Cancel booking
  const cancelBtn = document.getElementById('admin-cancel-booking');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      updateBookingStatus('CANCELLED');
    });
  }
  
  // Save booking button in the modal
  const saveBookingBtn = document.getElementById('save-booking-btn');
  if (saveBookingBtn) {
    saveBookingBtn.addEventListener('click', function() {
      saveBooking();
    });
  }
  
  // Add booking button
  const addBookingBtn = document.getElementById('add-booking-btn');
  if (addBookingBtn) {
    addBookingBtn.addEventListener('click', function() {
      showBookingModal();
    });
  }
}

// Load all bookings with proper API call
async function loadAllBookings() {
  console.log('Loading bookings with filters:', { status: statusFilter, date: dateFilter, search: searchTerm });
  
  try {
    // Show loading indicator
    const tableBody = document.getElementById('booking-table-body') || 
                      document.getElementById('appointments-table-body');
    
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading bookings...</p>
          </td>
        </tr>
      `;
    }
    
    // Create filter object
    const filters = {
      status: statusFilter,
      date: dateFilter,
      search: searchTerm
    };
    
    // Fetch bookings using BookingAPI
    const bookings = await window.BookingAPI.getAllBookings(filters);
    
    // Update global variable
    adminBookings = bookings;
    
    // Calculate total pages
    totalPages = Math.ceil(adminBookings.length / pageSize);
    
    // Update UI
    updateBookingsTable();
    updatePagination();
    
  } catch (error) {
    console.error('Error loading bookings:', error);
    
    // Show error in table
    const tableBody = document.getElementById('booking-table-body') || 
                      document.getElementById('appointments-table-body');
    
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center py-4">
            <div class="alert alert-danger">
              <i class="fas fa-exclamation-circle"></i> 
              Error loading bookings: ${error.message}
            </div>
          </td>
        </tr>
      `;
    }
  }
}

// Update bookings table
function updateBookingsTable() {
  console.log('Updating bookings table with', adminBookings.length, 'bookings');
  
  // Update both possible table locations
  updateAdminBookingsTable();
  updateAppointmentsTable();
}

// Update admin bookings table in the dedicated panel
function updateAdminBookingsTable() {
  const tableBody = document.getElementById('booking-table-body');
  if (!tableBody) {
    // console.warn('Admin bookings table body (booking-table-body) not found.'); // Optional: less verbose
    return;
  }
  
  // Clear table
  tableBody.innerHTML = '';
  
  if (!adminBookings || adminBookings.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> No bookings found.
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  // Apply pagination
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, adminBookings.length);
  const paginatedBookings = adminBookings.slice(start, end);
  
  // Add booking rows
  paginatedBookings.forEach(booking => {
    const row = document.createElement('tr');
    
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('vi-VN');
    const bookingTime = booking.startTime ? booking.startTime.substring(0, 5) : 'N/A';
    
    const serviceNames = Array.isArray(booking.services) 
      ? booking.services.map(s => s.name).join(', ')
      : 'No services';
    
    let statusBadgeClass = 'secondary';
    if (booking.status) {
        switch (booking.status.toUpperCase()) {
          case 'PENDING':
            statusBadgeClass = 'warning text-dark';
            break;
          case 'CONFIRMED': // Using booking-handlers.js style
            statusBadgeClass = 'success'; 
            break;
          case 'COMPLETED': // Using booking-handlers.js style
            statusBadgeClass = 'primary';
            break;
          case 'CANCELLED':
            statusBadgeClass = 'danger';
            break;
        }
    }
    
    const shortId = booking.id && booking.id.length > 8 ? booking.id.substring(0, 8) + '...' : (booking.id || 'N/A');
    
    row.innerHTML = `
      <td>${shortId}</td>
      <td>${booking.user ? (booking.user.username || `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim() || 'N/A') : 'N/A'}</td>
      <td>${booking.pet ? (booking.pet.name || 'N/A') : 'N/A'}</td>
      <td>${serviceNames}</td>
      <td>${bookingDate} ${bookingTime}</td>
      <td><span class="status-badge ${statusBadgeClass}">${booking.status || 'N/A'}</span></td>
      <td>
        <button class="btn btn-sm btn-primary view-booking-btn" data-booking-id="${booking.id}">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    `;
    
    const viewBtn = row.querySelector('.view-booking-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        // Attempt to use BookingHandlers modal if available, otherwise use admin-bookings specific one
        if (window.BookingHandlers && typeof window.BookingHandlers.openViewBookingModal === 'function') {
            window.BookingHandlers.openViewBookingModal(booking.id);
        } else if (typeof showBookingDetails === 'function') { // Fallback to admin-bookings.js's own detail view
            showBookingDetails(booking); 
        } else {
            console.warn('No view function available for booking details.');
        }
      });
    }
    
    tableBody.appendChild(row);
  });
}

// Update appointments table in the main dashboard section
function updateAppointmentsTable() {
  const tableBody = document.getElementById('appointments-table-body');
  if (!tableBody) {
    console.warn('Appointments table body (appointments-table-body) not found in admin-bookings.js for updateAppointmentsTable');
    return;
  }
  
  tableBody.innerHTML = ''; // Clear existing content

  if (!adminBookings || adminBookings.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4"> <!-- Ensure colspan matches your table headers -->
          <div class="alert alert-info">
            <i class="fas fa-info-circle"></i> No bookings found with current filters.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, adminBookings.length);
  const paginatedBookings = adminBookings.slice(start, end);

  paginatedBookings.forEach(booking => {
    const row = tableBody.insertRow();

    const bookingIdToDisplay = booking.id || 'N/A';
    const customerName = booking.user ? (booking.user.username || `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim() || 'N/A') : 'N/A';
    const petName = booking.pet ? (booking.pet.name || 'N/A') : 'N/A';
    const serviceNames = booking.services && booking.services.length > 0 
      ? booking.services.map(s => s.name).join(', ') 
      : 'N/A';
    const bookingDateFormatted = booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('vi-VN') : 'N/A';
    const bookingTimeFormatted = booking.startTime ? booking.startTime.substring(0, 5) : 'N/A';
    
    const statusValue = booking.status ? String(booking.status).toUpperCase() : 'N/A';
    let statusBadgeClass = 'bg-secondary'; // Default badge class

    switch (statusValue) {
        case 'CONFIRMED': 
            statusBadgeClass = 'bg-success'; 
            break;
        case 'PENDING': 
            statusBadgeClass = 'bg-warning text-dark'; 
            break;
        case 'CANCELLED': 
            statusBadgeClass = 'danger'; 
            break;
        case 'COMPLETED': 
            statusBadgeClass = 'bg-primary'; 
            break;
    }
    
    row.innerHTML = `
      <td>${bookingIdToDisplay}</td>
      <td>${customerName}</td>
      <td>${petName}</td>
      <td>${serviceNames}</td>
      <td>${bookingDateFormatted}</td>
      <td>${bookingTimeFormatted}</td>
      <td><span class="status-badge ${statusBadgeClass}">${booking.status || 'N/A'}</span></td>
      <td>
        <button class="btn btn-sm btn-info view-booking-btn-admin" data-booking-id="${booking.id}" title="View Details"><i class="fas fa-eye"></i></button>
        <button class="btn btn-sm btn-warning edit-booking-btn-admin" data-booking-id="${booking.id}" title="Edit Status"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger delete-booking-btn-admin" data-booking-id="${booking.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    `;

    // Attach event listeners for action buttons
    const viewBtn = row.querySelector('.view-booking-btn-admin');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        if (window.BookingHandlers && typeof window.BookingHandlers.openViewBookingModal === 'function') {
             window.BookingHandlers.openViewBookingModal(booking.id);
        } else if (typeof showBookingDetails === 'function') {
            showBookingDetails(booking); 
        } else {
            console.warn('No view function available for booking details (appointments table).');
        }
      });
    }

    const editBtn = row.querySelector('.edit-booking-btn-admin');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (window.BookingHandlers && typeof window.BookingHandlers.openEditBookingModal === 'function') {
                window.BookingHandlers.openEditBookingModal(booking.id);
            } else {
                console.warn("Edit booking modal not available via BookingHandlers (appointments table).");
            }
        });
    }

    const deleteBtn = row.querySelector('.delete-booking-btn-admin');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
             if (window.BookingHandlers && typeof window.BookingHandlers.confirmDeleteBooking === 'function') {
                window.BookingHandlers.confirmDeleteBooking(booking.id);
            } else {
                 console.warn("Confirm delete booking not available via BookingHandlers (appointments table).");
            }
        });
    }
  });
  updatePagination(); 
}

// Save booking (create or update)
async function saveBooking() {
  console.log('Saving booking');
  
  // Validate form
  if (!validateBookingForm()) {
    return;
  }
  
  // Get form data
  const bookingId = document.getElementById('booking-id').value;
  const userId = document.getElementById('booking-user').value;
  const petId = document.getElementById('booking-pet').value;
  const statusValue = document.getElementById('booking-status').value;
  const dateValue = document.getElementById('booking-date').value;
  const timeValue = document.getElementById('booking-time').value;
  const notesValue = document.getElementById('booking-notes').value;
  
  // Get selected services
  const serviceSelect = document.getElementById('booking-services');
  const selectedServices = Array.from(serviceSelect.selectedOptions).map(option => ({
    id: option.value
  }));
  
  // Prepare booking data
  const bookingData = {
    user: { id: userId },
    pet: { id: petId },
    services: selectedServices,
    bookingDate: dateValue,
    startTime: timeValue + ':00', // Add seconds
    notes: notesValue,
    status: statusValue
  };
  
  try {
    // Disable save button
    const saveBtn = document.getElementById('save-booking-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    }
    
    let result;
    
    if (bookingId) {
      // Update existing booking
      result = await window.BookingAPI.updateBooking(bookingId, bookingData);
    } else {
      // Create new booking
      result = await window.BookingAPI.createBooking({
        userId: userId,
        petId: petId,
        serviceIds: selectedServices.map(s => s.id),
        bookingDate: dateValue,
        startTime: timeValue,
        status: statusValue,
        notes: notesValue
      });
    }
    
    // Show success toast
    showToast(`Booking ${bookingId ? 'updated' : 'created'} successfully`, 'success');
    
    // Close modal
    const modalElement = document.getElementById('bookingModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    
    // Reload bookings
    loadAllBookings();
    
  } catch (error) {
    console.error('Error saving booking:', error);
    showToast(`Error: ${error.message}`, 'danger');
  } finally {
    // Re-enable save button
    const saveBtn = document.getElementById('save-booking-btn');
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Appointment';
    }
  }
}

// Validate booking form
function validateBookingForm() {
  const userSelect = document.getElementById('booking-user');
  const petSelect = document.getElementById('booking-pet');
  const serviceSelect = document.getElementById('booking-services');
  const dateInput = document.getElementById('booking-date');
  const timeInput = document.getElementById('booking-time');
  
  if (!userSelect.value) {
    showToast('Please select a customer', 'warning');
    userSelect.focus();
    return false;
  }
  
  if (!petSelect.value) {
    showToast('Please select a pet', 'warning');
    petSelect.focus();
    return false;
  }
  
  if (serviceSelect.selectedOptions.length === 0) {
    showToast('Please select at least one service', 'warning');
    serviceSelect.focus();
    return false;
  }
  
  if (!dateInput.value) {
    showToast('Please select a date', 'warning');
    dateInput.focus();
    return false;
  }
  
  if (!timeInput.value) {
    showToast('Please select a time', 'warning');
    timeInput.focus();
    return false;
  }
  
  return true;
}

// Show success toast notification
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 3000
  });
  
  bsToast.show();
  
  // Remove from DOM after hiding
  toast.addEventListener('hidden.bs.toast', function() {
    toast.remove();
  });
}