window.BookingHandlers = (() => {
    const API_URL = "/api/bookings";
    
    // DOM elements
    const appointmentsTableBody = document.getElementById("appointments-table-body");
    const addAppointmentBtn = document.getElementById("add-appointment-btn");
    const appointmentForm = document.getElementById("appointment-form");
    const appointmentModal = document.getElementById("appointment-modal");
    const viewAppointmentModal = document.getElementById("view-appointment-modal");
    
    // Service verification
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
    
    // Load all appointments
    const loadAppointments = async () => {
        if (!appointmentsTableBody) {
            console.error("Appointments table body element not found");
            return;
        }
        
        if (!verifyServices()) {
            appointmentsTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Error loading appointments: Required services not available.</td></tr>';
            return;
        }
        
        try {
            // Show loading indicator
            appointmentsTableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading appointments...</span>
                        </div>
                        <p class="mt-2">Loading appointments...</p>
                    </td>
                </tr>
            `;
            
            // In a real app, this would fetch from the backend
            // For now, using mock data
            const appointments = await getMockAppointments();
            
            if (!appointments || appointments.length === 0) {
                appointmentsTableBody.innerHTML = '<tr><td colspan="9" class="text-center">No appointments found.</td></tr>';
                return;
            }
            
            appointmentsTableBody.innerHTML = '';
            appointments.forEach(appointment => {
                const row = document.createElement('tr');
                row.dataset.id = appointment.id;
                
                // Format services as a comma-separated list
                const servicesList = appointment.services 
                    ? appointment.services.map(service => service.name).join(', ') 
                    : 'N/A';
                
                // Format date
                const formattedDate = new Date(appointment.bookingDate).toLocaleDateString();
                
                // Create status badge
                let statusBadge = '';
                switch(appointment.status) {
                    case 'PENDING':
                        statusBadge = '<span class="status pending">Pending</span>';
                        break;
                    case 'CONFIRMED':
                        statusBadge = '<span class="status confirmed">Confirmed</span>';
                        break;
                    case 'COMPLETED':
                        statusBadge = '<span class="status completed">Completed</span>';
                        break;
                    case 'CANCELLED':
                        statusBadge = '<span class="status cancelled">Cancelled</span>';
                        break;
                    default:
                        statusBadge = `<span class="status">${appointment.status}</span>`;
                }
                
                const customerName = appointment.user ? appointment.user.username : 'N/A';
                const petName = appointment.pet ? appointment.pet.name : 'N/A';
                const petSpecies = appointment.pet ? (appointment.pet.species || 'N/A') : 'N/A';
                const petInfo = `${petName} (${petSpecies})`;
                
                // Format time
                const timeInfo = appointment.startTime || 'N/A';
                const staffName = appointment.staff ? appointment.staff.username : 'Unassigned';
                
                row.innerHTML = `
                    <td><input type="checkbox" class="select-item" /></td>
                    <td>${appointment.id.substring(0, 8)}</td>
                    <td>${customerName}</td>
                    <td>${petInfo}</td>
                    <td>${servicesList}</td>
                    <td>${formattedDate} ${timeInfo}</td>
                    <td>${staffName}</td>
                    <td>${statusBadge}</td>
                    <td class="actions">
                        <button class="icon-btn booking-edit-btn" data-id="${appointment.id}" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="icon-btn booking-view-btn" data-id="${appointment.id}" title="View Details"><i class="fas fa-eye"></i></button>
                        <button class="icon-btn booking-delete-btn" data-id="${appointment.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
                
                appointmentsTableBody.appendChild(row);
            });
            
            // Add event listeners to action buttons
            attachActionListeners();
            
        } catch (error) {
            console.error("Error loading appointments:", error);
            appointmentsTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Error loading appointments.</td></tr>';
            if (window.toastService) {
                window.toastService.showErrorToast("Failed to load appointments.");
            }
        }
    };
    
    // Attach event listeners to the table action buttons
    const attachActionListeners = () => {
        // Use specific class names to prevent conflicts with other modules
        document.querySelectorAll('.booking-edit-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent default button action
                e.stopPropagation(); // Stop event bubbling
                const appointmentId = this.getAttribute('data-id');
                console.log("Edit button clicked for appointment:", appointmentId);
                openEditAppointmentModal(appointmentId);
            });
        });
        
        document.querySelectorAll('.booking-view-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const appointmentId = this.getAttribute('data-id');
                console.log("View button clicked for appointment:", appointmentId);
                openViewAppointmentModal(appointmentId);
            });
        });
        
        document.querySelectorAll('.booking-delete-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const appointmentId = this.getAttribute('data-id');
                console.log("Delete button clicked for appointment:", appointmentId);
                confirmDeleteAppointment(appointmentId);
            });
        });
    };
    
    // Open the appointment modal for editing
    const openEditAppointmentModal = async (appointmentId) => {
        if (!verifyServices()) return;
        
        try {
            // Get appointment by ID (in a real app, this would be fetched from the backend)
            const appointment = await getSingleMockAppointment(appointmentId);
            
            console.log("Opening appointment modal for editing:", appointment);
            
            // Populate form fields
            document.getElementById('appointment-id').value = appointment.id;
            document.getElementById('appointment-modal-title').textContent = 'Edit Appointment';
            
            // Populate customer selection
            if (appointment.user) {
                const customerSelect = document.getElementById('appointment-customer');
                if (customerSelect) {
                    // First load customer options
                    await loadCustomers();
                    customerSelect.value = appointment.user.id;
                }
            }
            
            // Populate pet selection
            if (appointment.pet) {
                const petSelect = document.getElementById('appointment-pet');
                if (petSelect) {
                    // Load this customer's pets
                    if (appointment.user) {
                        await loadCustomerPets(appointment.user.id);
                    }
                    petSelect.value = appointment.pet.id;
                }
            }
            
            // Populate service selection
            if (appointment.services && appointment.services.length > 0) {
                const serviceSelect = document.getElementById('appointment-service');
                if (serviceSelect) {
                    // First load service options
                    await loadServices();
                    
                    // Clear all selections
                    Array.from(serviceSelect.options).forEach(option => {
                        option.selected = false;
                    });
                    
                    // Select the services for this appointment
                    appointment.services.forEach(service => {
                        Array.from(serviceSelect.options).forEach(option => {
                            if (option.value === service.id) {
                                option.selected = true;
                            }
                        });
                    });
                }
            }
            
            // Set date and time
            if (appointment.bookingDate) {
                document.getElementById('appointment-date').value = 
                    new Date(appointment.bookingDate).toISOString().split('T')[0];
            }
            
            if (appointment.startTime) {
                document.getElementById('appointment-time').value = appointment.startTime;
            }
            
            // Set staff if assigned
            if (appointment.staff) {
                const staffSelect = document.getElementById('appointment-staff');
                if (staffSelect) {
                    // First load staff options
                    await loadStaff();
                    staffSelect.value = appointment.staff.id;
                }
            }
            
            // Set status
            const statusSelect = document.getElementById('appointment-status');
            if (statusSelect) {
                statusSelect.value = appointment.status;
            }
            
            // Set notes
            document.getElementById('appointment-notes').value = appointment.notes || '';
            
            // Show modal using Bootstrap modal (if you're using Bootstrap)
            if (typeof bootstrap !== 'undefined' && appointmentModal) {
                const bsModal = new bootstrap.Modal(appointmentModal);
                bsModal.show();
            } else {
                // Fallback for custom modal implementation
                if (appointmentModal) {
                    appointmentModal.style.display = 'block';
                }
            }
            
        } catch (error) {
            console.error("Error opening appointment for editing:", error);
            if (window.toastService) {
                window.toastService.showErrorToast("Failed to load appointment details.");
            }
        }
    };
    
    // Open modal to view appointment details
    const openViewAppointmentModal = async (appointmentId) => {
        if (!verifyServices()) return;
        
        try {
            // Get appointment by ID (in a real app, this would be fetched from the backend)
            const appointment = await getSingleMockAppointment(appointmentId);
            
            console.log("Opening appointment modal for viewing:", appointment);
            
            // Populate view modal with details
            document.getElementById('view-appointment-id').textContent = appointment.id;
            
            if (appointment.user) {
                document.getElementById('view-customer-name').textContent = appointment.user.username;
                document.getElementById('view-customer-email').textContent = appointment.user.email || 'N/A';
                document.getElementById('view-customer-phone').textContent = appointment.user.phoneNumber || 'N/A';
            }
            
            if (appointment.pet) {
                document.getElementById('view-pet-name').textContent = appointment.pet.name;
                document.getElementById('view-pet-details').textContent = 
                    `${appointment.pet.species || 'N/A'}, ${appointment.pet.breed || 'N/A'}`;
            }
            
            // Format date and time
            if (appointment.bookingDate) {
                const date = new Date(appointment.bookingDate);
                document.getElementById('view-appointment-date').textContent = 
                    date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
            }
            
            document.getElementById('view-appointment-time').textContent = appointment.startTime || 'N/A';
            
            // Services
            if (appointment.services && appointment.services.length > 0) {
                const servicesList = appointment.services.map(service => service.name).join(', ');
                document.getElementById('view-services').textContent = servicesList;
                
                // Calculate total price
                const totalPrice = appointment.services.reduce((total, service) => {
                    return total + (service.price || 0);
                }, 0);
                document.getElementById('view-price').textContent = `$${totalPrice.toFixed(2)}`;
            } else {
                document.getElementById('view-services').textContent = 'No services selected';
                document.getElementById('view-price').textContent = '$0.00';
            }
            
            // Status
            let statusHTML = '';
            switch(appointment.status) {
                case 'PENDING':
                    statusHTML = '<span class="badge bg-warning text-dark">Pending</span>';
                    break;
                case 'CONFIRMED':
                    statusHTML = '<span class="badge bg-success">Confirmed</span>';
                    break;
                case 'COMPLETED':
                    statusHTML = '<span class="badge bg-info">Completed</span>';
                    break;
                case 'CANCELLED':
                    statusHTML = '<span class="badge bg-danger">Cancelled</span>';
                    break;
                default:
                    statusHTML = `<span class="badge bg-secondary">${appointment.status}</span>`;
            }
            document.getElementById('view-status').innerHTML = statusHTML;
            
            // Additional information
            document.getElementById('view-notes').textContent = appointment.notes || 'No special instructions';
            document.getElementById('view-staff').textContent = 
                appointment.staff ? appointment.staff.username : 'Unassigned';
            
            // Show modal using Bootstrap modal (if you're using Bootstrap)
            if (typeof bootstrap !== 'undefined' && viewAppointmentModal) {
                const bsModal = new bootstrap.Modal(viewAppointmentModal);
                bsModal.show();
            } else {
                // Fallback for custom modal implementation
                if (viewAppointmentModal) {
                    viewAppointmentModal.style.display = 'block';
                }
            }
            
            // Add event listeners to status action buttons
            document.querySelectorAll('.status-action').forEach(btn => {
                btn.addEventListener('click', function() {
                    const newStatus = this.getAttribute('data-status');
                    updateAppointmentStatus(appointmentId, newStatus);
                });
            });
            
            // Add event listener to edit button
            document.querySelector('.edit-from-view')?.addEventListener('click', function() {
                // Close the view modal first
                if (typeof bootstrap !== 'undefined' && viewAppointmentModal) {
                    const viewModal = bootstrap.Modal.getInstance(viewAppointmentModal);
                    viewModal.hide();
                    
                    // Then open the edit modal
                    setTimeout(() => {
                        openEditAppointmentModal(appointmentId);
                    }, 500);
                } else {
                    // Fallback
                    if (viewAppointmentModal) {
                        viewAppointmentModal.style.display = 'none';
                    }
                    openEditAppointmentModal(appointmentId);
                }
            });
            
        } catch (error) {
            console.error("Error opening appointment for viewing:", error);
            if (window.toastService) {
                window.toastService.showErrorToast("Failed to load appointment details.");
            }
        }
    };
    
    // Confirm appointment deletion
    const confirmDeleteAppointment = (appointmentId) => {
        if (confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) {
            deleteAppointment(appointmentId);
        }
    };
    
    // Delete appointment
    const deleteAppointment = async (appointmentId) => {
        if (!verifyServices()) return;
        
        try {
            // In a real app, this would send a DELETE request to the backend
            console.log("Deleting appointment:", appointmentId);
            
            // Mock successful deletion
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (window.toastService) {
                window.toastService.showSuccessToast("Appointment deleted successfully.");
            }
            
            // Reload appointments list
            loadAppointments();
            
        } catch (error) {
            console.error("Error deleting appointment:", error);
            if (window.toastService) {
                window.toastService.showErrorToast("Failed to delete appointment.");
            }
        }
    };
    
    // Update appointment status
    const updateAppointmentStatus = async (appointmentId, newStatus) => {
        if (!verifyServices()) return;
        
        try {
            // In a real app, this would send a PUT request to update the status
            console.log(`Updating appointment ${appointmentId} status to: ${newStatus}`);
            
            // Mock successful update
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (window.toastService) {
                window.toastService.showSuccessToast(`Appointment status updated to ${newStatus}.`);
            }
            
            // Close the view modal
            if (typeof bootstrap !== 'undefined' && viewAppointmentModal) {
                const viewModal = bootstrap.Modal.getInstance(viewAppointmentModal);
                viewModal.hide();
            } else {
                if (viewAppointmentModal) {
                    viewAppointmentModal.style.display = 'none';
                }
            }
            
            // Reload appointments list
            loadAppointments();
            
        } catch (error) {
            console.error("Error updating appointment status:", error);
            if (window.toastService) {
                window.toastService.showErrorToast("Failed to update appointment status.");
            }
        }
    };
    
    // Load services for selection
    const loadServices = async () => {
        if (!verifyServices()) return;
        
        const serviceSelect = document.getElementById('appointment-service');
        if (!serviceSelect) return;
        
        try {
            // In a real app, this would fetch from the backend
            const services = [
                { id: 'service1', name: 'Basic Grooming', price: 35 },
                { id: 'service2', name: 'Premium Grooming', price: 65 },
                { id: 'service3', name: 'Nail Trimming', price: 15 },
                { id: 'service4', name: 'Routine Checkup', price: 45 },
                { id: 'service5', name: 'Vaccination', price: 25 },
                { id: 'service6', name: 'Training', price: 55 },
                { id: 'service7', name: 'Boarding', price: 30 }
            ];
            
            // Clear existing options, but keep the default one
            serviceSelect.innerHTML = '';
            
            // Add service options
            services.forEach(service => {
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = `${service.name} - $${service.price.toFixed(2)}`;
                serviceSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error("Error loading services:", error);
        }
    };
    
    // Load customers for selection
    const loadCustomers = async () => {
        if (!verifyServices()) return;
        
        const customerSelect = document.getElementById('appointment-customer');
        if (!customerSelect) return;
        
        try {
            // In a real app, this would fetch from the backend
            const customers = [
                { id: 'customer1', username: 'John Smith', email: 'john@example.com', phoneNumber: '(555) 123-4567' },
                { id: 'customer2', username: 'Sarah Johnson', email: 'sarah@example.com', phoneNumber: '(555) 234-5678' },
                { id: 'customer3', username: 'Michael Davis', email: 'michael@example.com', phoneNumber: '(555) 345-6789' },
                { id: 'customer4', username: 'Emily Wilson', email: 'emily@example.com', phoneNumber: '(555) 456-7890' }
            ];
            
            // Clear existing options
            customerSelect.innerHTML = '<option value="" disabled selected>Select Customer</option>';
            
            // Add customer options
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = customer.username;
                customerSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error("Error loading customers:", error);
        }
    };
    
    // Load staff for selection
    const loadStaff = async () => {
        if (!verifyServices()) return;
        
        const staffSelect = document.getElementById('appointment-staff');
        if (!staffSelect) return;
        
        try {
            // In a real app, this would fetch from the backend
            const staff = [
                { id: 'staff1', username: 'David Johnson', role: 'Groomer' },
                { id: 'staff2', username: 'Lisa Brown', role: 'Veterinarian' },
                { id: 'staff3', username: 'Robert Wilson', role: 'Trainer' },
                { id: 'staff4', username: 'Jessica Lee', role: 'Pet Care Specialist' }
            ];
            
            // Clear existing options
            staffSelect.innerHTML = '<option value="" selected>Select Staff</option>';
            
            // Add staff options
            staff.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.id;
                option.textContent = `${employee.username} (${employee.role})`;
                staffSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error("Error loading staff:", error);
        }
    };
    
    // Load customer's pets when customer is selected
    const loadCustomerPets = async (customerId) => {
        if (!verifyServices() || !customerId) return;
        
        const petSelect = document.getElementById('appointment-pet');
        if (!petSelect) return;
        
        try {
            // In a real app, this would fetch from the backend based on customer ID
            const pets = {
                'customer1': [
                    { id: 'pet1', name: 'Max', species: 'Dog', breed: 'Labrador' },
                    { id: 'pet2', name: 'Bella', species: 'Cat', breed: 'Siamese' }
                ],
                'customer2': [
                    { id: 'pet3', name: 'Luna', species: 'Cat', breed: 'Persian' },
                    { id: 'pet4', name: 'Charlie', species: 'Dog', breed: 'Beagle' }
                ],
                'customer3': [
                    { id: 'pet5', name: 'Rocky', species: 'Dog', breed: 'German Shepherd' }
                ],
                'customer4': [
                    { id: 'pet6', name: 'Coco', species: 'Rabbit', breed: 'Holland Lop' },
                    { id: 'pet7', name: 'Daisy', species: 'Bird', breed: 'Canary' }
                ]
            };
            
            // Clear existing options
            petSelect.innerHTML = '<option value="" disabled selected>Select Pet</option>';
            
            // Add pet options
            const customerPets = pets[customerId] || [];
            if (customerPets.length > 0) {
                customerPets.forEach(pet => {
                    const option = document.createElement('option');
                    option.value = pet.id;
                    option.textContent = `${pet.name} (${pet.species})`;
                    petSelect.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.disabled = true;
                option.textContent = 'No pets found for this customer';
                petSelect.appendChild(option);
            }
            
        } catch (error) {
            console.error("Error loading customer pets:", error);
        }
    };
    
    // Save appointment (create or update)
    const saveAppointment = async (event) => {
        event.preventDefault();
        console.log("Saving appointment");
        
        if (!verifyServices()) {
            alert("Required services are not available.");
            return;
        }
        
        // Get form values
        const appointmentId = document.getElementById('appointment-id').value;
        const customerId = document.getElementById('appointment-customer').value;
        const petId = document.getElementById('appointment-pet').value;
        const serviceSelect = document.getElementById('appointment-service');
        const serviceIds = Array.from(serviceSelect.selectedOptions).map(option => option.value);
        const appointmentDate = document.getElementById('appointment-date').value;
        const appointmentTime = document.getElementById('appointment-time').value;
        const staffId = document.getElementById('appointment-staff').value;
        const status = document.getElementById('appointment-status').value;
        const notes = document.getElementById('appointment-notes').value;
        
        // Validate required fields
        if (!customerId || !petId || serviceIds.length === 0 || !appointmentDate || !appointmentTime) {
            if (window.toastService) {
                window.toastService.showErrorToast("Please fill in all required fields.");
            } else {
                alert("Please fill in all required fields.");
            }
            return;
        }
        
        // Prepare appointment data
        const appointmentData = {
            id: appointmentId || `appointment${Math.floor(Math.random() * 1000)}`,
            userId: customerId,
            petId: petId,
            serviceIds: serviceIds,
            bookingDate: appointmentDate,
            startTime: appointmentTime,
            staffId: staffId || null,
            status: status,
            notes: notes
        };
        
        try {
            // In a real app, this would send a POST or PUT request to the backend
            console.log("Saving appointment data:", appointmentData);
            
            // Mock successful save
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (window.toastService) {
                window.toastService.showSuccessToast(
                    appointmentId ? "Appointment updated successfully." : "Appointment created successfully."
                );
            }
            
            // Close modal using Bootstrap modal (if you're using Bootstrap)
            if (typeof bootstrap !== 'undefined' && appointmentModal) {
                const bsModal = bootstrap.Modal.getInstance(appointmentModal);
                bsModal.hide();
            } else {
                // Fallback for custom modal implementation
                if (appointmentModal) {
                    appointmentModal.style.display = 'none';
                }
            }
            
            // Reload appointments
            loadAppointments();
            
        } catch (error) {
            console.error("Error saving appointment:", error);
            if (window.toastService) {
                window.toastService.showErrorToast("Failed to save appointment.");
            }
        }
    };
    
    // Initialize the appointment management functionality
    const initializeBookingEvents = () => {
        console.log("Initializing booking events...");
        
        // Add appointment button
        if (addAppointmentBtn) {
            console.log("Adding click event to add appointment button");
            addAppointmentBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Add appointment button clicked");
                openNewAppointmentModal();
            });
        } else {
            console.error("Add appointment button not found");
        }
        
        // Form submission
        if (appointmentForm) {
            console.log("Adding submit event to appointment form");
            appointmentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Appointment form submitted");
                saveAppointment(e);
            });
        } else {
            console.error("Appointment form not found");
        }
        
        // Customer selection change - load that customer's pets
        const customerSelect = document.getElementById('appointment-customer');
        if (customerSelect) {
            customerSelect.addEventListener('change', function() {
                const customerId = this.value;
                if (customerId) {
                    loadCustomerPets(customerId);
                }
            });
        }
        
        // Load the initial data
        loadAppointments();
    };
    
    // Open modal for creating a new appointment
    const openNewAppointmentModal = () => {
        console.log("Opening new appointment modal");
        
        // Reset form
        if (appointmentForm) {
            appointmentForm.reset();
        }
        
        // Clear hidden ID field
        document.getElementById('appointment-id').value = '';
        
        // Set modal title
        document.getElementById('appointment-modal-title').textContent = 'Schedule New Appointment';
        
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointment-date').value = today;
        
        // Load selection options
        loadCustomers();
        loadServices();
        loadStaff();
        
        // Show modal using Bootstrap modal (if you're using Bootstrap)
        if (typeof bootstrap !== 'undefined' && appointmentModal) {
            const bsModal = new bootstrap.Modal(appointmentModal);
            bsModal.show();
        } else {
            // Fallback for custom modal implementation
            if (appointmentModal) {
                appointmentModal.style.display = 'block';
            }
        }
    };
    
    // Filter appointments based on selected criteria
    const filterAppointments = async () => {
        if (!verifyServices()) return;
        
        const statusFilter = document.getElementById('filter-appointment-status')?.value || '';
        const serviceFilter = document.getElementById('filter-service')?.value || '';
        const dateFrom = document.getElementById('date-from')?.value || '';
        const dateTo = document.getElementById('date-to')?.value || '';
        
        console.log("Filtering appointments:", { statusFilter, serviceFilter, dateFrom, dateTo });
        
        // In a real app, this would fetch filtered data from the backend
        // For now, just reload all appointments
        loadAppointments();
    };
    
    // Mock functions to simulate API calls
    const getMockAppointments = async () => {
        // This would normally be a fetch call to your backend
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        
        return [
            {
                id: 'appointment123',
                user: { id: 'customer1', username: 'John Smith', email: 'john@example.com', phoneNumber: '(555) 123-4567' },
                pet: { id: 'pet1', name: 'Max', species: 'Dog', breed: 'Labrador' },
                services: [
                    { id: 'service1', name: 'Basic Grooming', price: 35 },
                    { id: 'service3', name: 'Nail Trimming', price: 15 }
                ],
                bookingDate: '2025-05-10',
                startTime: '10:00',
                staff: { id: 'staff1', username: 'David Johnson', role: 'Groomer' },
                status: 'CONFIRMED',
                notes: 'Please use hypoallergenic shampoo'
            },
            {
                id: 'appointment456',
                user: { id: 'customer2', username: 'Sarah Johnson', email: 'sarah@example.com', phoneNumber: '(555) 234-5678' },
                pet: { id: 'pet3', name: 'Luna', species: 'Cat', breed: 'Persian' },
                services: [
                    { id: 'service4', name: 'Routine Checkup', price: 45 }
                ],
                bookingDate: '2025-05-10',
                startTime: '14:30',
                staff: { id: 'staff2', username: 'Lisa Brown', role: 'Veterinarian' },
                status: 'PENDING',
                notes: 'Luna has been sneezing lately'
            },
            {
                id: 'appointment789',
                user: { id: 'customer3', username: 'Michael Davis', email: 'michael@example.com', phoneNumber: '(555) 345-6789' },
                pet: { id: 'pet5', name: 'Rocky', species: 'Dog', breed: 'German Shepherd' },
                services: [
                    { id: 'service6', name: 'Training', price: 55 }
                ],
                bookingDate: '2025-05-11',
                startTime: '09:15',
                staff: { id: 'staff3', username: 'Robert Wilson', role: 'Trainer' },
                status: 'CONFIRMED',
                notes: 'Working on basic commands'
            },
            {
                id: 'appointment101',
                user: { id: 'customer4', username: 'Emily Wilson', email: 'emily@example.com', phoneNumber: '(555) 456-7890' },
                pet: { id: 'pet6', name: 'Coco', species: 'Rabbit', breed: 'Holland Lop' },
                services: [
                    { id: 'service3', name: 'Nail Trimming', price: 15 }
                ],
                bookingDate: '2025-05-11',
                startTime: '11:00',
                staff: { id: 'staff4', username: 'Jessica Lee', role: 'Pet Care Specialist' },
                status: 'CONFIRMED',
                notes: ''
            }
        ];
    };
    
    const getSingleMockAppointment = async (id) => {
        // This would normally be a fetch call to get a specific appointment
        const allAppointments = await getMockAppointments();
        return allAppointments.find(appointment => appointment.id === id) || null;
    };
    
    // Return public methods
    return {
        initializeBookingEvents,
        loadAppointments,
        filterAppointments,
        openNewAppointmentModal,
        openEditAppointmentModal,
        openViewAppointmentModal,
        saveAppointment
    };
})();