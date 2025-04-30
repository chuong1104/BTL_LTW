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