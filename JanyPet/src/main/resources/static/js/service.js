document.addEventListener('DOMContentLoaded', function() {
    // Initialize Swiper sliders
    const serviceSlider = new Swiper('.service-slider', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    const testimonialSlider = new Swiper('.testimonial-slider', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            640: {
                slidesPerView: 1,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        },
    });

    // Handle service tab switching
    const servicesTabs = document.getElementById('servicesTabs');
    if (servicesTabs) {
        const tabs = servicesTabs.querySelectorAll('.nav-link');
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding content
                const targetId = this.getAttribute('data-bs-target');
                const tabPanes = document.querySelectorAll('.tab-pane');
                tabPanes.forEach(pane => {
                    pane.classList.remove('show', 'active');
                });
                document.querySelector(targetId).classList.add('show', 'active');
            });
        });
    }

    // Handle pet size selectors
    const petSizeButtons = document.querySelectorAll('.pet-size-btn');
    petSizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Find all buttons in the same selector group
            const selectorGroup = this.closest('.pet-size-selector');
            const buttons = selectorGroup.querySelectorAll('.pet-size-btn');
            
            // Remove active class from all buttons in this group
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update price display based on selected size if needed
            const size = this.getAttribute('data-size');
            const packageCard = this.closest('.package-card');
            if (packageCard) {
                const priceElement = packageCard.querySelector('.package-price');
                updatePriceBasedOnSize(priceElement, size);
            }
        });
    });

    // Example function to update prices based on pet size
    function updatePriceBasedOnSize(priceElement, size) {
        if (!priceElement) return;
        
        let priceRange = '';
        switch(size) {
            case 'small':
                priceRange = packageCard.classList.contains('popular-package') 
                    ? '250.000đ' 
                    : packageCard.querySelector('h3').textContent.includes('VIP')
                        ? '450.000đ'
                        : packageCard.querySelector('h3').textContent.includes('Cơ Bản')
                            ? '150.000đ'
                            : '300.000đ';
                break;
            case 'medium':
                priceRange = packageCard.classList.contains('popular-package') 
                    ? '300.000đ' 
                    : packageCard.querySelector('h3').textContent.includes('VIP')
                        ? '500.000đ'
                        : packageCard.querySelector('h3').textContent.includes('Cơ Bản')
                            ? '200.000đ'
                            : '350.000đ';
                break;
            case 'large':
                priceRange = packageCard.classList.contains('popular-package') 
                    ? '400.000đ' 
                    : packageCard.querySelector('h3').textContent.includes('VIP')
                        ? '600.000đ'
                        : packageCard.querySelector('h3').textContent.includes('Cơ Bản')
                            ? '300.000đ'
                            : '450.000đ';
                break;
            case 'xlarge':
                priceRange = packageCard.classList.contains('popular-package') 
                    ? '450.000đ' 
                    : packageCard.querySelector('h3').textContent.includes('VIP')
                        ? '650.000đ'
                        : packageCard.querySelector('h3').textContent.includes('Cơ Bản')
                            ? '350.000đ'
                            : '500.000đ';
                break;
        }
        
        if (priceRange) {
            priceElement.textContent = priceRange;
        }
    }

    // Service detail modals - add any custom logic needed
    const serviceModals = document.querySelectorAll('.service-detail-modal');
    serviceModals.forEach(modal => {
        modal.addEventListener('show.bs.modal', function(event) {
            // Get button that triggered the modal
            const button = event.relatedTarget;
            
            // You can extract info from data-* attributes if needed
            // const serviceId = button.getAttribute('data-service-id');
            
            // If needed, update modal content based on which button was clicked
            // const modalTitle = modal.querySelector('.modal-title');
            // const modalBody = modal.querySelector('.modal-body');
            // modalTitle.textContent = 'New title based on ' + serviceId;
        });
    });

    // Back to top button functionality
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        // Initially hide the button
        backToTopButton.style.display = 'none';
        
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.style.display = 'flex';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
        
        // Scroll to top when clicked
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // FAQ Accordion - enhance with custom animations if needed
    const faqItems = document.querySelectorAll('.accordion-item');
    faqItems.forEach(item => {
        const button = item.querySelector('.accordion-button');
        const collapse = item.querySelector('.accordion-collapse');
        
        button.addEventListener('click', function() {
            // Bootstrap handles the toggling, but you can add custom animations
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            if (!isExpanded) {
                // About to expand
                button.classList.add('active');
                // Add any custom animation classes
            } else {
                // About to collapse
                button.classList.remove('active');
                // Remove any custom animation classes
            }
        });
    });

    // Booking button click tracking
    const bookingButtons = document.querySelectorAll('a[href="booking.html"]');
    bookingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Track the click for analytics if needed
            console.log('Booking button clicked from:', this.closest('.modal')?.id || 'main page');
            
            // You could send analytics data here
            // saveAnalytics('booking_click', {...});
            
            // If you want to pass data to the booking page:
            const serviceType = this.closest('.modal')?.querySelector('.modal-title')?.textContent || '';
            if (serviceType) {
                // Append service type to URL
                e.preventDefault();
                window.location.href = `booking.html?service=${encodeURIComponent(serviceType)}`;
            }
        });
    });

    // Enhanced modal image loading
    document.querySelectorAll('.service-detail-img').forEach(img => {
        img.addEventListener('error', function() {
            // If image fails to load, replace with a fallback
            this.src = 'images/service-fallback.jpg';
        });
    });

    // Initialize AOS animations if used
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
});

// Service card generation function with "Add to cart" button
function createServiceCard(service) {
  // Determine which icon to use based on the service name
  let iconClass = 'fa-spa'; // default icon
  
  if (service.name.toLowerCase().includes('bath') || service.name.toLowerCase().includes('wash') || service.name.toLowerCase().includes('tắm')) {
    iconClass = 'fa-shower';
  } else if (service.name.toLowerCase().includes('groom') || service.name.toLowerCase().includes('trim') || service.name.toLowerCase().includes('cut') || service.name.toLowerCase().includes('cắt')) {
    iconClass = 'fa-cut';
  } else if (service.name.toLowerCase().includes('nail') || service.name.toLowerCase().includes('móng')) {
    iconClass = 'fa-hand-scissors';
  } else if (service.name.toLowerCase().includes('dental') || service.name.toLowerCase().includes('teeth') || service.name.toLowerCase().includes('răng')) {
    iconClass = 'fa-tooth';
  } else if (service.name.toLowerCase().includes('massage') || service.name.toLowerCase().includes('mát-xa')) {
    iconClass = 'fa-hands';
  }

  // Prepare service image with fallback
  const serviceImage = service.imageUrl || `https://via.placeholder.com/300x200?text=${encodeURIComponent(service.name)}`;
  
  return `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="service-card" data-service-id="${service.id}">
        <img src="${serviceImage}" 
             class="service-img card-img-top" alt="${service.name}" style="height: 200px; object-fit: cover;">
        <div class="card-body p-4">
          <div class="d-flex align-items-center mb-3">
            <div class="service-icon me-3">
              <i class="fas ${iconClass}"></i>
            </div>
          </div>
          <h5 class="card-title fw-bold">${service.name}</h5>
          <p class="card-text text-muted">${service.description || 'Dịch vụ chăm sóc thú cưng chuyên nghiệp'}</p>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <span class="fw-bold text-primary">${formatPrice(service.price)}</span>
            <span class="badge bg-light text-secondary px-3 py-2">${service.duration || '60'} phút</span>
          </div>
          <div class="d-grid gap-2 mt-3">
            <button class="btn btn-sm btn-primary add-to-cart-btn" 
                    data-id="${service.id}" 
                    data-name="${service.name}" 
                    data-price="${service.price}" 
                    data-image="${serviceImage}">
              <i class="fas fa-cart-plus me-1"></i> Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price).replace('VND', 'đ');
}

// Pet card generation function
function createPetCard(pet) {
  // Determine pet icon based on species
  let petIconClass = 'fa-paw';
  if (pet.species === 'Dog') {
    petIconClass = 'fa-dog';
  } else if (pet.species === 'Cat') {
    petIconClass = 'fa-cat';
  } else if (pet.species === 'Bird') {
    petIconClass = 'fa-dove';
  }
  
  return `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="pet-card p-3" data-pet-id="${pet.id}">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="pet-icon">
            <i class="fas ${petIconClass}"></i>
          </div>
          <button class="btn btn-sm edit-pet-btn" data-pet-id="${pet.id}">
            <i class="fas fa-pencil-alt"></i>
          </button>
        </div>
        <h5 class="fw-bold mb-1">${pet.name}</h5>
        <p class="text-muted mb-2">${pet.species} · ${pet.breed || 'Không rõ giống'}</p>
        <div class="d-flex mt-2">
          <span class="badge ${pet.vaccinated ? 'bg-success' : 'bg-warning text-dark'} me-2">
            ${pet.vaccinated ? 'Đã tiêm phòng' : 'Chưa tiêm phòng'}
          </span>
          <span class="badge bg-info text-dark">
            ${pet.gender || 'Không rõ giới tính'}
          </span>
        </div>
      </div>
    </div>
  `;
}

// Initialize date/time fields
document.addEventListener('DOMContentLoaded', function() {
  const today = new Date().toISOString().split('T')[0];
  const bookingDateInput = document.getElementById('booking-date');
  if (bookingDateInput) {
    bookingDateInput.min = today;
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    bookingDateInput.value = tomorrow.toISOString().split('T')[0];
    
    // When date changes, populate time slots
    bookingDateInput.addEventListener('change', function() {
      populateTimeSlots(this.value);
    });
    
    // Initialize time slots
    populateTimeSlots(bookingDateInput.value);
  }
  
  // Load services with Add to Cart buttons
  loadServices();
  
  // Initialize pet cards click handler
  initializePetCards();
});

// Function to load services from API or sample data
function loadServices() {
  const servicesContainer = document.getElementById('services-container');
  if (!servicesContainer) return;

  // Simulate API data (replace with actual API call in production)
  const sampleServices = [
    {
      id: 1,
      name: 'Tắm và vệ sinh',
      description: 'Tắm, sấy lông và vệ sinh toàn diện cho thú cưng',
      price: 200000,
      duration: 60,
      imageUrl: 'images/service-bath.jpg' 
    },
    {
      id: 2,
      name: 'Cắt tỉa lông',
      description: 'Cắt tỉa lông theo yêu cầu, tạo kiểu cho thú cưng',
      price: 300000,
      duration: 90,
      imageUrl: 'images/service-grooming.jpg'
    },
    {
      id: 3,
      name: 'Cắt móng',
      description: 'Cắt và mài móng an toàn cho thú cưng',
      price: 100000,
      duration: 30,
      imageUrl: 'images/service-nails.jpg'
    },
    {
      id: 4,
      name: 'Vệ sinh tai',
      description: 'Làm sạch tai và phòng ngừa viêm nhiễm',
      price: 150000,
      duration: 30,
      imageUrl: 'images/service-ears.jpg'
    },
    {
      id: 5,
      name: 'Vệ sinh răng miệng',
      description: 'Làm sạch cao răng và vệ sinh răng miệng',
      price: 250000,
      duration: 45,
      imageUrl: 'images/service-dental.jpg'
    },
    {
      id: 6,
      name: 'Gói chăm sóc toàn diện',
      description: 'Bao gồm tắm, cắt tỉa lông, cắt móng, vệ sinh tai và răng',
      price: 500000,
      duration: 120,
      imageUrl: 'images/service-full.jpg'
    }
  ];
  
  // Clear loading spinner
  servicesContainer.innerHTML = '';
  
  // Generate service cards
  sampleServices.forEach(service => {
    servicesContainer.insertAdjacentHTML('beforeend', createServiceCard(service));
  });
  
  // Initialize service cards click handler
  initializeServiceCards();
  
  // Initialize Add to Cart buttons
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent triggering the service card selection
      
      const id = this.getAttribute('data-id');
      const name = this.getAttribute('data-name');
      const price = parseFloat(this.getAttribute('data-price'));
      const image = this.getAttribute('data-image');
      
      // Add to cart using the cart.js function
      if (typeof addToCart === 'function') {
        addToCart(id, name, price, image, 1);
        
        // Change button text temporarily
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check me-1"></i> Đã thêm';
        this.classList.add('btn-success');
        this.classList.remove('btn-primary');
        
        setTimeout(() => {
          this.innerHTML = originalText;
          this.classList.add('btn-primary');
          this.classList.remove('btn-success');
        }, 1500);
      } else {
        console.error('addToCart function not found. Make sure cart.js is loaded.');
        alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.');
      }
    });
  });
}

function populateTimeSlots(selectedDate) {
  const timeSlots = [
    '09:00', '10:00', '11:00', 
    '14:00', '15:00', '16:00', '17:00'
  ];
  
  const bookingTimeSelect = document.getElementById('booking-time');
  if (!bookingTimeSelect) return;
  
  // Clear current options except the first one
  while (bookingTimeSelect.options.length > 1) {
    bookingTimeSelect.remove(1);
  }
  
  // Add time slots
  timeSlots.forEach(time => {
    const option = document.createElement('option');
    option.value = time;
    option.textContent = time;
    bookingTimeSelect.appendChild(option);
  });
}

// Function to handle service card selection
function initializeServiceCards() {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', function(e) {
      // Ignore clicks on the Add to Cart button
      if (e.target.closest('.add-to-cart-btn')) return;
      
      // Toggle selected class
      this.classList.toggle('selected');
      
      // Update booking summary if on step 4
      if (document.getElementById('step4').classList.contains('active')) {
        updateBookingSummary();
      }
    });
  });
}

// Function to handle pet card selection
function initializePetCards() {
  document.querySelectorAll('.pet-card').forEach(card => {
    card.addEventListener('click', function(e) {
      // Ignore clicks on edit buttons
      if (e.target.closest('.edit-pet-btn')) return;
      
      // Remove selected class from all pet cards
      document.querySelectorAll('.pet-card').forEach(c => {
        c.classList.remove('selected');
      });
      
      // Add selected class to clicked card
      this.classList.add('selected');
      
      // Display pet details in the selected pet details section
      const petId = this.getAttribute('data-pet-id');
      updateSelectedPetDetails(petId);
    });
  });
}

// Helper function to update the booking summary
function updateBookingSummary() {
  // Implement the logic to update the summary based on selected services, pet, date, time
  const selectedServices = document.querySelectorAll('.service-card.selected');
  const selectedPet = document.querySelector('.pet-card.selected');
  const bookingDate = document.getElementById('booking-date').value;
  const bookingTime = document.getElementById('booking-time').value;
  const bookingNotes = document.getElementById('booking-notes').value;
  
  // Update the summary fields
  const summaryServices = document.getElementById('summary-services');
  const summaryPet = document.getElementById('summary-pet');
  const summaryDate = document.getElementById('summary-date');
  const summaryTime = document.getElementById('summary-time');
  const summaryNotes = document.getElementById('summary-notes');
  const summaryTotal = document.getElementById('summary-total');
  
  if (summaryServices) {
    summaryServices.innerHTML = Array.from(selectedServices)
      .map(service => service.querySelector('.card-title').textContent)
      .join('<br>') || 'Chưa chọn dịch vụ';
  }
  
  if (summaryPet) {
    summaryPet.textContent = selectedPet ? 
      selectedPet.querySelector('h5').textContent : 
      'Chưa chọn thú cưng';
  }
  
  if (summaryDate) {
    try {
      const formattedDate = new Date(bookingDate).toLocaleDateString('vi-VN', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
      summaryDate.textContent = formattedDate;
    } catch(e) {
      summaryDate.textContent = bookingDate || 'Chưa chọn ngày';
    }
  }
  
  if (summaryTime) {
    summaryTime.textContent = bookingTime || 'Chưa chọn giờ';
  }
  
  if (summaryNotes) {
    summaryNotes.textContent = bookingNotes || 'Không có ghi chú';
  }
  
  // Calculate total
  if (summaryTotal) {
    let total = 0;
    selectedServices.forEach(service => {
      const priceText = service.querySelector('.text-primary').textContent;
      const price = parseFloat(priceText.replace(/[^\d]/g, ''));
      if (!isNaN(price)) {
        total += price;
      }
    });
    
    summaryTotal.textContent = formatPrice(total);
  }
}