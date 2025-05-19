let selectedServices = [];
let selectedPet = null;
let allServices = [];
let userPets = [];

let bookingProcessContainer = null;
let bookingContentContainer = null;
let loginMessageContainer = null;

document.addEventListener('DOMContentLoaded', function() {
  bookingProcessContainer = document.getElementById('bookingSteps');
  bookingContentContainer = document.getElementById('bookingStepsContent');
  
  setupLoginMessageContainer();

  if (typeof authService === 'undefined') {
    console.error("CRITICAL: authService is not loaded. Booking page will not function correctly.");
    showLoginRequired();
    return;
  }
  
  checkUserLogin(); 
  initEventListeners(); 

  const bookingDateElem = document.getElementById('booking-date');
  if (bookingDateElem) {
    const today = new Date().toISOString().split('T')[0];
    bookingDateElem.setAttribute('min', today);
    bookingDateElem.addEventListener('change', validateDateTime);
  } else {
    console.warn("Booking date input 'booking-date' not found.");
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
    console.warn("Terms checkbox 'terms-checkbox' not found.");
  }
  
  const step4Tab = document.getElementById('step4-tab');
  if (step4Tab) {
    step4Tab.addEventListener('shown.bs.tab', updateSummary);
  } else {
    console.warn("Step 4 tab 'step4-tab' not found.");
  }

  const petSelectionContainer = document.getElementById('pet-selection-container');
  if (petSelectionContainer) {
    petSelectionContainer.addEventListener('click', function(event) {
        const petCard = event.target.closest('.pet-card');
        if (petCard && petCard.dataset.petId) {
            const previouslySelected = petSelectionContainer.querySelector('.pet-card.selected');
            if (previouslySelected) {
                previouslySelected.classList.remove('selected');
            }
            petCard.classList.add('selected');
            const petId = petCard.dataset.petId;
            selectedPet = userPets.find(p => p.id === petId) || null;
            validateStep2();
            updateSummary();
        }
    });
  }
});

function setupLoginMessageContainer() {
  const bookingSectionRoot = document.querySelector('.booking-steps');
  if (bookingSectionRoot) {
    loginMessageContainer = bookingSectionRoot.querySelector('#login-required-message-container');
    if (!loginMessageContainer) {
      loginMessageContainer = document.createElement('div');
      loginMessageContainer.id = 'login-required-message-container';
      loginMessageContainer.className = 'alert alert-warning py-4 text-center';
      loginMessageContainer.style.display = 'none';
      loginMessageContainer.innerHTML = `
        <i class="fas fa-exclamation-circle fa-2x mb-3"></i>
        <h4 class="alert-heading">Bạn cần đăng nhập để sử dụng tính năng này</h4>
        <p>Vui lòng <a href="login.html" class="alert-link">đăng nhập</a> hoặc <a href="register.html" class="alert-link">đăng ký</a> để tiếp tục.</p>
      `;
      const bookingNav = bookingSectionRoot.querySelector('.booking-steps-nav');
      if (bookingNav) {
        bookingNav.parentNode.insertBefore(loginMessageContainer, bookingNav);
      } else {
        const firstChild = bookingSectionRoot.firstChild;
        if (firstChild) {
            bookingSectionRoot.insertBefore(loginMessageContainer, firstChild);
        } else {
            bookingSectionRoot.appendChild(loginMessageContainer);
        }
      }
    }
  } else {
    console.error("'.booking-steps' container not found for login message setup.");
  }
}

function checkUserLogin() {
  console.log("BookingService: checkUserLogin called.");

  if (!bookingProcessContainer || !bookingContentContainer) {
    bookingProcessContainer = document.getElementById('bookingSteps');
    bookingContentContainer = document.getElementById('bookingStepsContent');
    if (!bookingProcessContainer || !bookingContentContainer) {
        console.error("BookingService: Booking process or content container not found. Cannot proceed.");
        return;
    }
  }
  
  if (window.authService && typeof authService.isAuthenticated === 'function' && typeof authService.getCurrentUser === 'function') {
    const authenticated = authService.isAuthenticated();
    console.log("BookingService: authService.isAuthenticated() returned:", authenticated);

    if (authenticated) {
      const user = authService.getCurrentUser();
      console.log("BookingService: authService.getCurrentUser() returned:", user);

      if (user && user.id) {
        console.log("BookingService: User is authenticated and has an ID. User ID:", user.id);
        if (loginMessageContainer) loginMessageContainer.style.display = 'none';
        if (bookingProcessContainer) bookingProcessContainer.style.display = 'block'; 
        if (bookingContentContainer) bookingContentContainer.style.display = 'block';

        loadServices();
        loadPets(user.id);
      } else {
        console.error('BookingService: Authenticated via authService, but no user data or user.id found.');
        showLoginRequired();
      }
    } else {
      console.log('BookingService: User is not authenticated according to authService.');
      showLoginRequired();
    }
  } else {
    console.error("BookingService: authService is not available or core methods are missing.");
    showLoginRequired(); // Fallback if authService itself is problematic
  }
}

function showLoginRequired() {
  if (!loginMessageContainer) {
    setupLoginMessageContainer();
    if (!loginMessageContainer) {
      console.error("Login message container could not be set up.");
      return;
    }
  }
  loginMessageContainer.style.display = 'block';
  if (bookingProcessContainer) bookingProcessContainer.style.display = 'none';
  if (bookingContentContainer) bookingContentContainer.style.display = 'none';
}

function initEventListeners() {
  const addNewPetBtn = document.getElementById('add-new-pet-btn');
  if (addNewPetBtn) {
    addNewPetBtn.addEventListener('click', showAddPetModal);
  }

  const savePetBtn = document.getElementById('save-pet-btn');
  if (savePetBtn) {
    savePetBtn.addEventListener('click', savePet);
  }

  const refreshPetsBtn = document.getElementById('refresh-pets-btn');
  if (refreshPetsBtn) {
    refreshPetsBtn.addEventListener('click', () => {
        const user = authService.getCurrentUser();
        if (user && user.id) {
            loadPets(user.id);
        } else {
            if(window.ToastService) ToastService.warning("Vui lòng đăng nhập để tải lại danh sách thú cưng.");
        }
    });
  }

  const confirmBookingBtn = document.getElementById('confirm-booking-btn');
  if (confirmBookingBtn) {
    confirmBookingBtn.addEventListener('click', confirmBooking);
  }

  const stepButtons = document.querySelectorAll('.next-step, .prev-step');
  stepButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetTabId = this.dataset.next || this.dataset.prev;
      if (!targetTabId) {
        console.warn("Button does not have data-next or data-prev attribute.");
        return;
      }

      const targetTabButton = document.getElementById(targetTabId); // Lấy button điều khiển tab
      if (!targetTabButton) {
        console.warn(`Target tab button with ID '${targetTabId}' not found.`);
        return;
      }

      // Validate current step before moving to next
      if (this.classList.contains('next-step')) {
        const currentStepPane = this.closest('.tab-pane');
        if (currentStepPane) {
          console.log("Current step pane ID:", currentStepPane.id); // DEBUG
          if (currentStepPane.id === 'step1' && !validateStep1()) {
            if(window.ToastService) window.ToastService.error('Vui lòng chọn ít nhất một dịch vụ.');
            else alert('Vui lòng chọn ít nhất một dịch vụ.');
            return;
          }
          if (currentStepPane.id === 'step2' && !validateStep2()) {
            if(window.ToastService) window.ToastService.error('Vui lòng chọn một thú cưng.');
            else alert('Vui lòng chọn một thú cưng.');
            return;
          }
          if (currentStepPane.id === 'step3' && !validateDateTime()) {
            // validateDateTime sẽ tự hiển thị toast nếu cần
            return;
          }
        } else {
          console.warn("Could not find current tab-pane for next-step button.");
        }
      }
      
      // Logic chuyển tab
      const tabInstance = bootstrap.Tab.getInstance(targetTabButton) || new bootstrap.Tab(targetTabButton);
      tabInstance.show();
      console.log("Showing tab:", targetTabId); // DEBUG

      // Cập nhật summary khi chuyển đến tab 4 (Xác nhận)
      if (targetTabId === 'step4-tab') {
        updateSummary();
      }
    });
  });
  
  const bookingTimeInput = document.getElementById('booking-time');
  if (bookingTimeInput) {
    bookingTimeInput.addEventListener('change', validateDateTime);
  }
}

function showAddPetModal() {
  const addPetModalElement = document.getElementById('addPetModal');
  if (addPetModalElement) {
    const modal = bootstrap.Modal.getInstance(addPetModalElement) || new bootstrap.Modal(addPetModalElement);
    const form = addPetModalElement.querySelector('form');
    if (form) form.reset(); 
    modal.show();
  } else {
    console.error("Add Pet Modal with ID 'addPetModal' not found.");
    if(window.ToastService) ToastService.error("Không thể mở biểu mẫu thêm thú cưng.");
  }
}

function createServiceElement(service) {
  const colDiv = document.createElement('div');
  colDiv.className = 'col-md-6 col-lg-4 mb-4'; 

  const cardDiv = document.createElement('div');
  cardDiv.className = 'card h-100 service-card shadow-sm';
  cardDiv.dataset.serviceId = service.id;

  let imageHTML = '';
  // if (service.images && service.images.split(',').length > 0) {
  //   const firstImage = service.images.split(',')[0].trim();
  //   const imageUrl = firstImage.startsWith('http') || firstImage.startsWith('/') ? firstImage : `images/services/${firstImage}`;
  //   imageHTML = `<img src="${imageUrl}" class="card-img-top" alt="${service.name || "Dịch vụ"}" style="height: 180px; object-fit: cover;">`;
  // } else {
  //   imageHTML = `<img src="images/default-service.jpg" class="card-img-top" alt="Dịch vụ mặc định" style="height: 180px; object-fit: cover;">`;
  // }

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body d-flex flex-column';

  const name = document.createElement('h5');
  name.className = 'card-title';
  name.textContent = service.name || "Tên dịch vụ";

  const description = document.createElement('p');
  description.className = 'card-text small text-muted flex-grow-1';

  let serviceDescription = service.description || "Mô tả dịch vụ.";
 
  serviceDescription = serviceDescription.replace(/<\/?[^>]+(>|$)/g, '');




  // Hiển thị một phần mô tả, phần còn lại trong tooltip
  const shortDescription = serviceDescription.length > 80 ? serviceDescription.substring(0, 77) + '...' : serviceDescription;
  description.textContent = shortDescription;
  
  // Thêm tooltip cho mô tả nếu nó dài
  if (serviceDescription.length > 80) {
    description.setAttribute('data-bs-toggle', 'tooltip');
    description.setAttribute('data-bs-placement', 'top');
    description.setAttribute('title', serviceDescription);
  }

  const price = document.createElement('p');
  price.className = 'card-text fw-bold mt-auto';
  price.textContent = service.basePrice ? `${service.basePrice.toLocaleString('vi-VN')} VNĐ` : 'Liên hệ';
  
  if (imageHTML) cardDiv.innerHTML = imageHTML;
  cardBody.appendChild(name);
  cardBody.appendChild(description);
  cardBody.appendChild(price);
  cardDiv.appendChild(cardBody);
  colDiv.appendChild(cardDiv);

  cardDiv.addEventListener('click', () => toggleServiceSelection(cardDiv, service));
  return colDiv;
}

async function loadServices() {
  const serviceContainer = document.getElementById('services-container'); 
  if (!serviceContainer) {
    console.error("CRITICAL: Service container 'services-container' not found.");
    return;
  }
  serviceContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3">Đang tải danh sách dịch vụ...</p>
    </div>
  `;

  try {
    if (!window.apiService || typeof window.apiService.getServices !== 'function') {
      throw new Error('apiService or getServices function is not available.');
    }
    const services = await window.apiService.getServices(); 
    allServices = services; // Lưu lại để dùng sau nếu cần
    
    serviceContainer.innerHTML = ''; 
    if (services && services.length > 0) {
      services.forEach(service => {
        const serviceElement = createServiceElement(service);
        serviceContainer.appendChild(serviceElement);
      });
      // Khởi tạo tooltips của Bootstrap sau khi các element được thêm vào DOM
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    } else {
      serviceContainer.innerHTML = '<div class="col-12 text-center"><p>Hiện chưa có dịch vụ nào.</p></div>';
    }
    validateStep1(); 
  } catch (error) {
    console.error('Error loading services:', error);
    serviceContainer.innerHTML = `<div class="col-12 text-center"><p class="text-danger">Lỗi khi tải dịch vụ: ${error.message}. Vui lòng thử lại.</p></div>`;
  }
}

function toggleServiceSelection(cardElement, service) {
  const serviceId = service.id;
  const index = selectedServices.findIndex(s => s.id === serviceId);

  if (index > -1) {
    selectedServices.splice(index, 1);
    cardElement.classList.remove('selected');
  } else {
    selectedServices.push(service);
    cardElement.classList.add('selected');
  }
  updateSelectedServicesCount();
  validateStep1();
}

function updateSelectedServicesCount() {
  const countElement = document.getElementById('selected-services-count');
  if (countElement) {
    countElement.textContent = `${selectedServices.length} dịch vụ đã chọn`;
  }
}

function validateStep1() {
  const btnStep1Continue = document.getElementById('btn-step1-continue');
  const isValid = selectedServices.length > 0;
  if (btnStep1Continue) {
    btnStep1Continue.disabled = !isValid;
  }
  return isValid;
}

async function loadPets(userId) {
  const petContainer = document.getElementById('pet-selection-container');
  if (!petContainer) {
    console.error("CRITICAL: Pet container 'pet-selection-container' not found.");
    return;
  }
  petContainer.innerHTML = `<div class="col-12 text-center py-3"><div class="spinner-border text-primary"></div><p class="mt-2">Đang tải danh sách thú cưng...</p></div>`;

  if (!userId) {
    petContainer.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Không thể tải thú cưng, ID người dùng không hợp lệ.</p></div>';
    console.error('loadPets called without a valid userId.');
    return;
  }

  try {
    if (!window.apiService || typeof window.apiService.getPetsByOwnerId !== 'function') {
        throw new Error("apiService or apiService.getPetsByOwnerId is not available.");
    }
    const pets = await window.apiService.getPetsByOwnerId(userId);
    userPets = pets; 
    
    petContainer.innerHTML = ''; 

    if (pets && pets.length > 0) {
      pets.forEach(pet => {
        const petElement = createPetElement(pet);
        petContainer.appendChild(petElement);
      });
    } else {
      petContainer.innerHTML = '<div class="col-12 text-center"><p>Bạn chưa có thú cưng nào. Hãy thêm mới!</p></div>';
    }
    validateStep2(); 
  } catch (error) {
    console.error('Error loading pets:', error);
    petContainer.innerHTML = `<div class="col-12 text-center"><p class="text-danger">Lỗi khi tải danh sách thú cưng: ${error.message}.</p></div>`;
  }
}

function createPetElement(pet) {
  const colDiv = document.createElement('div');
  colDiv.className = 'col-md-6 col-lg-4 mb-3';

  const cardDiv = document.createElement('div');
  cardDiv.className = 'card pet-card shadow-sm';
  cardDiv.dataset.petId = pet.id;
  const cardBody = document.createElement('div');
  cardBody.className = 'card-body text-center';

  const iconClass = pet.type && pet.type.toLowerCase() === 'mèo' ? 'fas fa-cat' : 'fas fa-dog';
  cardBody.innerHTML = `
    <div class="pet-icon mx-auto mb-2"><i class="${iconClass} fa-lg"></i></div>
    <h6 class="card-title mb-1">${pet.name || "Tên thú cưng"}</h6>
    <p class="card-text small text-muted mb-0">${pet.breed || "Giống"} - ${pet.age || '?'} tuổi</p>
  `;

  cardDiv.appendChild(cardBody);
  colDiv.appendChild(cardDiv);
  return colDiv;
}

function validateStep2() {
  const btnStep2Continue = document.getElementById('btn-step2-continue');
  const isValid = selectedPet !== null;
  if (btnStep2Continue) {
    btnStep2Continue.disabled = !isValid;
  }
  return isValid;
}

function validateDateTime() {
  const dateInput = document.getElementById('booking-date');
  const timeInput = document.getElementById('booking-time');
  const btnStep3Continue = document.getElementById('btn-step3-continue');
  
  const selectedDate = dateInput ? dateInput.value : null;
  const selectedTime = timeInput ? timeInput.value : null;
  
  let isValid = true;
  
  if (!selectedDate) {
    isValid = false;
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(selectedDate);
    if (chosenDate < today) {
      isValid = false;
    }
  }
  if (!selectedTime) {
    isValid = false;
  }

  if (btnStep3Continue) {
    btnStep3Continue.disabled = !isValid;
  }
  return isValid;
}

async function savePet() {
  const user = authService.getCurrentUser();
  if (!user || !user.id) {
    if(window.ToastService) ToastService.error('Bạn cần đăng nhập để thêm thú cưng.');
    return;
  }

  const petName = document.getElementById('new-pet-name').value.trim();
  const petType = document.getElementById('new-pet-type').value.trim();
  const petBreed = document.getElementById('new-pet-breed').value.trim();
  const petAge = document.getElementById('new-pet-age').value;
  const petGender = document.getElementById('new-pet-gender').value;

  if (!petName || !petType || !petAge) {
    if(window.ToastService) ToastService.warning('Vui lòng nhập tên, loại và tuổi thú cưng.');
    return;
  }

  const petData = {
    name: petName,
    type: petType, 
    breed: petBreed,
    age: parseInt(petAge),
    gender: petGender,
  };

  const savePetButton = document.getElementById('save-pet-btn');
  savePetButton.disabled = true;
  savePetButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang lưu...';

  try {
    if (!window.apiService || typeof window.apiService.post !== 'function') {
        throw new Error("apiService or apiService.post is not available.");
    }
    const newPet = await window.apiService.post(`pets/owner/${user.id}`, petData);
    if(window.ToastService) ToastService.success(`Đã thêm thú cưng ${newPet.name}!`);
    const addPetModal = bootstrap.Modal.getInstance(document.getElementById('addPetModal'));
    if (addPetModal) addPetModal.hide();
    loadPets(user.id);
  } catch (error) {
    console.error('Error saving pet:', error);
    if(window.ToastService) ToastService.error(`Lỗi khi thêm thú cưng: ${error.message || 'Unknown error'}`);
  } finally {
    savePetButton.disabled = false;
    savePetButton.innerHTML = 'Lưu thú cưng';
  }
}

function updateSummary() {
  const summaryServices = document.getElementById('summary-services');
  const summaryPet = document.getElementById('summary-pet');
  const summaryDate = document.getElementById('summary-date');
  const summaryTime = document.getElementById('summary-time');
  const summaryNotes = document.getElementById('summary-notes');
  const summaryCustomerName = document.getElementById('summary-customer-name'); 

  if (summaryCustomerName) { 
    if (window.authService && authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      if (user) {
        summaryCustomerName.textContent = user.username || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email) || 'Khách hàng';
      } else {
        summaryCustomerName.textContent = 'Vui lòng đăng nhập';
      }
    } else {
      summaryCustomerName.textContent = 'Vui lòng đăng nhập';
    }
  }

  if (summaryServices) {
    if (selectedServices.length > 0) {
      summaryServices.innerHTML = selectedServices.map(s => `<li>${s.name} (${s.basePrice ? s.basePrice.toLocaleString('vi-VN') + ' VNĐ' : 'N/A'})</li>`).join('');
    } else {
      summaryServices.innerHTML = '<li>Chưa chọn dịch vụ</li>';
    }
  }
  if (summaryPet) {
    summaryPet.textContent = selectedPet ? `${selectedPet.name} (${selectedPet.breed || selectedPet.type})` : 'Chưa chọn thú cưng';
  }
  if (summaryDate) {
    const dateInput = document.getElementById('booking-date');
    const dateVal = dateInput ? dateInput.value : null;
    summaryDate.textContent = dateVal ? new Date(dateVal).toLocaleDateString('vi-VN') : 'Chưa chọn ngày';
  }
  if (summaryTime) {
    const timeInput = document.getElementById('booking-time');
    summaryTime.textContent = timeInput ? timeInput.value : 'Chưa chọn giờ';
  }
  if (summaryNotes) {
    const notesInput = document.getElementById('booking-notes'); // This is the textarea from Step 3
    summaryNotes.textContent = notesInput ? (notesInput.value.trim() || 'Không có') : 'Không có';
  }
}

async function confirmBooking() {
  if (!validateStep1() || !validateStep2() || !validateDateTime()) {
    if(window.ToastService) ToastService.error('Vui lòng hoàn tất các bước trước đó và kiểm tra lại thông tin.');
    else alert('Vui lòng hoàn tất các bước trước đó và kiểm tra lại thông tin.');
    return;
  }
  const termsCheckbox = document.getElementById('terms-checkbox');
  if (!termsCheckbox || !termsCheckbox.checked) {
    if(window.ToastService) ToastService.error('Vui lòng đồng ý với điều khoản dịch vụ.');
    else alert('Vui lòng đồng ý với điều khoản dịch vụ.');
    return;
  }

  const bookingDate = document.getElementById('booking-date').value;
  const bookingTime = document.getElementById('booking-time').value;
  const notes = document.getElementById('booking-notes').value;

  const user = authService.getCurrentUser();

  if (!user || !user.id) {
    if(window.ToastService) ToastService.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
    else alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
    return;
  }
  if (!selectedPet || !selectedPet.id) {
    if(window.ToastService) ToastService.error('Vui lòng chọn thú cưng.');
    else alert('Vui lòng chọn thú cưng.');
    return;
  }
  if (selectedServices.length === 0) {
    if(window.ToastService) ToastService.error('Vui lòng chọn ít nhất một dịch vụ.');
    else alert('Vui lòng chọn ít nhất một dịch vụ.');
    return;
  }

  const bookingDataForCreation = {
    userId: user.id,
    petId: selectedPet.id,
    serviceIds: selectedServices.map(s => s.id),
    bookingDate: bookingDate, 
    startTime: bookingTime,   
    notes: notes,
    status: 'PENDING' // Default status
  };

  const confirmBtn = document.getElementById('confirm-booking-btn');
  confirmBtn.disabled = true;
  confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang xử lý...';

  try {
    if (!window.BookingAPI || typeof window.BookingAPI.createBooking !== 'function') {
        throw new Error("BookingAPI is not available or createBooking function is missing.");
    }
    const createdBookingResponse = await window.BookingAPI.createBooking(bookingDataForCreation);
    
    if (window.ToastService) ToastService.success('Đặt lịch thành công!');
    else alert('Đặt lịch thành công!');

    // Now fetch the full booking details using the ID from the response
    if (createdBookingResponse && createdBookingResponse.id) {
        await fetchAndShowBookingDetails(createdBookingResponse.id);
    } else {
        console.error("Booking created, but no ID returned in response.", createdBookingResponse);
        // Fallback or show a generic success message without full details
        // For now, we'll just log and the modal won't show if ID is missing.
    }
    resetBookingForm(); 

  } catch (error) {
    console.error('Error confirming booking:', error);
    if (window.ToastService) ToastService.error(`Đặt lịch thất bại: ${error.message}`);
    else alert(`Đặt lịch thất bại: ${error.message}`);
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = 'Xác nhận Đặt lịch';
  }
}

async function fetchAndShowBookingDetails(bookingId) {
    if (!bookingId) {
        console.error("fetchAndShowBookingDetails: bookingId is missing.");
        return;
    }
    try {
        if (!window.BookingAPI || typeof window.BookingAPI.getBookingById !== 'function') {
            throw new Error("BookingAPI is not available or getBookingById function is missing.");
        }
        const bookingDetails = await window.BookingAPI.getBookingById(bookingId);
        if (bookingDetails) {
            showBookingDetailModal(bookingDetails); // Call existing modal function with fresh data
        } else {
            console.error("Failed to fetch booking details for ID:", bookingId);
            if(window.ToastService) ToastService.warning("Không thể tải chi tiết lịch hẹn đầy đủ.");
        }
    } catch (error) {
        console.error("Error fetching full booking details:", error);
        if(window.ToastService) ToastService.error(`Lỗi tải chi tiết lịch hẹn: ${error.message}`);
    }
}

// The existing showBookingDetailModal function in BookingService.html's <script> tag
// will now receive the booking object fetched directly from the API.
// Ensure its logic correctly handles the structure of BookingResponse.
// For example, booking.user.username, booking.pet.name, booking.services (array of objects)

// ... (rest of your booking-service.js code) ...