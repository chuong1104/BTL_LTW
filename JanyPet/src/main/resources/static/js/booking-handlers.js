window.BookingHandlers = (() => {
    const API_BASE_URL = "/api/bookings"; // Use this for bookings
    
    // DOM elements
    const appointmentsTableBody = document.getElementById("appointments-table-body");
    // const addAppointmentBtn = document.getElementById("add-appointment-btn"); // REMOVED
    const appointmentForm = document.getElementById("appointment-form"); 
    const appointmentModalElement = document.getElementById("appointment-modal"); 
    const viewAppointmentModalElement = document.getElementById("view-appointment-modal"); 
    let bsAppointmentModal = null;
    let bsViewAppointmentModal = null;

    if (appointmentModalElement) {
        bsAppointmentModal = new bootstrap.Modal(appointmentModalElement);
    }
    if (viewAppointmentModalElement) {
        bsViewAppointmentModal = new bootstrap.Modal(viewAppointmentModalElement);
    }
    
    const verifyServices = () => {
        // Check if apiService exists
        if (!window.apiService) {
            console.error("apiService is not defined. Make sure api-service.js is loaded.");
            return false;
        }
        
        // Check if fetchData method exists on apiService
        if (typeof window.apiService.fetchData !== 'function') {
            console.error("apiService.fetchData is not a function. Check api-service.js implementation.");
            return false;
        }
        
        // Check if toastService exists
        if (!window.toastService) {
            console.error("toastService is not defined. Make sure toast-service.js is loaded.");
            return false;
        }
        
        return true;
    };
    
    const loadBookings = async () => {
        if (!appointmentsTableBody) {
            console.error("Bookings table body element not found (expected 'appointments-table-body')");
            return;
        }
        
        if (!verifyServices() || !window.apiService) {
            appointmentsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Error loading bookings: Required services not available.</td></tr>';
            return;
        }
        
        appointmentsTableBody.innerHTML = `<tr><td colspan="8" class="text-center"><div class="spinner-border text-primary"></div><p class="mt-2">Loading bookings...</p></td></tr>`;
        
        try {
            const bookings = await window.apiService.fetchData(API_BASE_URL, 'GET'); 
            
            if (!bookings || bookings.length === 0) {
                appointmentsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No bookings found.</td></tr>';
                return;
            }
            
            appointmentsTableBody.innerHTML = ''; 
            bookings.forEach(booking => {
                const row = appointmentsTableBody.insertRow();
                row.innerHTML = `
                    <td>${booking.id || 'N/A'}</td>
                    <td>${booking.user ? (booking.user.username || `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim()) : 'N/A'}</td>
                    <td>${booking.pet ? booking.pet.name : 'N/A'}</td>
                    <td>${booking.services && booking.services.length > 0 ? booking.services.map(s => s.name).join(', ') : 'N/A'}</td>
                    <td>${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td>${booking.startTime || 'N/A'}</td>
                    <td><span class="status-badge ${getBookingStatusClass(booking.status)}">${booking.status || 'N/A'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info booking-view-btn" data-id="${booking.id}" title="View Details"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-warning booking-edit-btn" data-id="${booking.id}" title="Edit Status"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger booking-delete-btn" data-id="${booking.id}" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                `;
            });
            
            attachActionListeners();
            
        } catch (error) {
            console.error("Error loading bookings:", error);
            appointmentsTableBody.innerHTML = `<tr><td colspan="9" class="text-center">Error loading bookings: ${error.message}.</td></tr>`;
            if (window.toastService && typeof window.toastService.showToast === 'function') {
                window.toastService.showToast(`Error loading bookings: ${error.message}`, "error");
            }
        }
    };

    const getBookingStatusClass = (status) => {
        if (!status) return 'bg-secondary';
        switch (status.toUpperCase()) {
            case 'CONFIRMED': return 'bg-success';
            case 'PENDING': return 'bg-warning text-dark';
            case 'CANCELLED': return 'bg-danger';
            case 'COMPLETED': return 'bg-primary';
            default: return 'bg-secondary';
        }
    };
    
    const attachActionListeners = () => {
        document.querySelectorAll('.booking-view-btn').forEach(btn => {
            btn.addEventListener('click', function() { openViewBookingModal(this.dataset.id); });
        });
        document.querySelectorAll('.booking-edit-btn').forEach(btn => {
            btn.addEventListener('click', function() { openEditBookingModal(this.dataset.id); });
        });
        document.querySelectorAll('.booking-delete-btn').forEach(btn => {
            btn.addEventListener('click', function() { confirmDeleteBooking(this.dataset.id); });
        });
    };

    // Modified to populate read-only fields and the status dropdown
    const populateBookingForm = (booking) => {
        const form = document.getElementById('appointment-form');
        if (!form || !booking) return; // Ensure booking object is passed
        form.reset();
        document.getElementById('appointment-id').value = booking.id;
        document.getElementById('appointment-modal-title').textContent = 'Edit Booking Status';

        document.getElementById('appointment-customer-display').value = booking.user ? (booking.user.username || `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim()) : 'N/A';
        document.getElementById('appointment-pet-display').value = booking.pet ? booking.pet.name : 'N/A';
        
        const servicesDisplay = document.getElementById('appointment-service-display');
        if (servicesDisplay) {
            servicesDisplay.value = booking.services && booking.services.length > 0 
                ? booking.services.map(s => s.name).join(', ') 
                : 'N/A';
        }
        
        document.getElementById('appointment-date-display').value = booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('vi-VN') : 'N/A';
        document.getElementById('appointment-time-display').value = booking.startTime || 'N/A';
        
        // document.getElementById('appointment-staff-display').value = booking.assignedStaff ? booking.assignedStaff.name : 'None'; // Assuming staff has a name property

        const statusSelect = document.getElementById('appointment-status-display');
        if (statusSelect) {
            statusSelect.value = booking.status || 'PENDING';
        }
        document.getElementById('appointment-notes-display').value = booking.notes || '';
    };
    
    const openEditBookingModal = async (bookingId) => {
        if (!verifyServices() || !window.apiService) return;
        try {
            const booking = await window.apiService.fetchData(`${API_BASE_URL}/${bookingId}`, 'GET');
            if (!booking) {
                if (window.toastService && typeof window.toastService.showToast === 'function') {
                    window.toastService.showToast("Booking not found.", "error");
                }
                return;
            }
            populateBookingForm(booking);
            if(bsAppointmentModal) bsAppointmentModal.show();
        } catch (error) {
            console.error("Error fetching booking for edit:", error);
            if (window.toastService && typeof window.toastService.showToast === 'function') {
                window.toastService.showToast("Error fetching booking for edit: " + error.message, "error");
            }
        }
    };
    
    const openViewBookingModal = async (bookingId) => {
        if (!verifyServices() || !window.apiService) return;
        try {
            const booking = await window.apiService.fetchData(`${API_BASE_URL}/${bookingId}`, 'GET');
            if (!booking) {
                if (window.toastService && typeof window.toastService.showToast === 'function') {
                    window.toastService.showToast("Booking not found.", "error");
                }
                return;
            }
            // Populate view modal (ensure elements with these IDs exist in viewAppointmentModal)
            document.getElementById('view-appointment-id').textContent = booking.id;
            document.getElementById('view-customer-name').textContent = booking.user ? (booking.user.username || `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim()) : 'N/A';
            document.getElementById('view-customer-email').textContent = booking.user ? booking.user.email : 'N/A';
            document.getElementById('view-customer-phone').textContent = booking.user ? booking.user.phoneNumber : 'N/A';
            document.getElementById('view-pet-name').textContent = booking.pet ? `${booking.pet.name} (${booking.pet.breed || booking.pet.type})` : 'N/A';
            document.getElementById('view-services-list').innerHTML = booking.services && booking.services.length > 0 
                ? booking.services.map(s => `<li>${s.name} (${s.basePrice ? s.basePrice.toLocaleString('vi-VN')+'đ' : 'N/A'})</li>`).join('') 
                : '<li>N/A</li>';
            document.getElementById('view-booking-date').textContent = booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('vi-VN') : 'N/A';
            document.getElementById('view-booking-time').textContent = booking.startTime || 'N/A';
            document.getElementById('view-booking-status').innerHTML = `<span class="status-badge ${getBookingStatusClass(booking.status)}">${booking.status||'N/A'}</span>`;
            document.getElementById('view-booking-notes').textContent = booking.notes || 'Không có ghi chú.';
            document.getElementById('view-created-at').textContent = booking.createdAt ? new Date(booking.createdAt).toLocaleString('vi-VN') : 'N/A';
            document.getElementById('view-updated-at').textContent = booking.updatedAt ? new Date(booking.updatedAt).toLocaleString('vi-VN') : 'N/A';

            if(bsViewAppointmentModal) bsViewAppointmentModal.show();
        } catch (error) {
            console.error("Error fetching booking for view:", error);
            if (window.toastService && typeof window.toastService.showToast === 'function') {
                window.toastService.showToast("Error fetching booking for view: " + error.message, "error");
            }
        }
    };
    
    const confirmDeleteBooking = (bookingId) => {
        if (confirm("Bạn có chắc chắn muốn xóa lịch đặt này không? Hành động này không thể hoàn tác.")) {
            deleteBooking(bookingId);
        }
    };
    
    const deleteBooking = async (bookingId) => {
        if (!verifyServices() || !window.apiService) return;
        try {
            await window.apiService.fetchData(`${API_BASE_URL}/${bookingId}`, 'DELETE');
            if (window.toastService && typeof window.toastService.showToast === 'function') {
                window.toastService.showToast("Booking deleted successfully!", "success");
            }
            loadBookings();
        } catch (error) {
            console.error("Error deleting booking:", error);
            if (window.toastService && typeof window.toastService.showToast === 'function') {
                window.toastService.showToast("Error deleting booking: " + error.message, "error");
            }
        }
    };
    
    // Modified to only send status for update
    const saveBooking = async (event) => {
        event.preventDefault();
        if (!verifyServices() || !window.apiService) return;
        
        const bookingId = document.getElementById('appointment-id').value;
        if (!bookingId) { 
            if(window.toastService && typeof window.toastService.showToast === 'function') {
                window.toastService.showToast("Booking ID is missing. Cannot update.", "error");
            }
            return;
        }
        
        const newStatus = document.getElementById('appointment-status-display').value;
        
        const bookingUpdateData = { status: newStatus };

        try {
            // Changed PATCH to PUT to match BookingController
            await window.apiService.fetchData(`${API_BASE_URL}/${bookingId}/status`, 'PUT', bookingUpdateData);
            if (window.toastService && typeof window.toastService.showToast === 'function') {
                window.toastService.showToast("Booking status updated successfully!", "success");
            }
            if(bsAppointmentModal) bsAppointmentModal.hide();
            loadBookings();
        } catch (error) {
            console.error("Error updating booking status:", error);
            if (window.toastService && typeof window.toastService.showToast === 'function') {
                window.toastService.showToast("Error updating booking status: " + error.message, "error");
            }
        }
    };
    
    // REMOVED openNewBookingModal function

    const initializeBookingEvents = () => {
        console.log("Initializing admin booking events...");
        // if (addAppointmentBtn) { // REMOVED
        //     addAppointmentBtn.addEventListener('click', openNewBookingModal);
        // }
        if (appointmentForm) { 
            appointmentForm.addEventListener('submit', saveBooking);
        }
        
        loadBookings();

        // Placeholder for filter event listeners if filter inputs exist
        // document.getElementById('filter-appointment-status')?.addEventListener('change', filterAppointments);
    };
    
    const filterAppointments = async () => {
        // Implement filtering logic here, then call loadBookings with filter params
        console.log("Filtering appointments/bookings...");
        loadBookings(); 
    };

    return {
        initializeBookingEvents,
        loadBookings, 
        filterAppointments,
        // openNewBookingModal, // REMOVED
    };
})();

// Ensure this is called in admin.html's main script block:
// if (window.BookingHandlers) {
//   BookingHandlers.initializeBookingEvents();
// }