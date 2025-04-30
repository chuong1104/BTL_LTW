document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced UX script loaded successfully');
    
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }

    // Initialize all Swiper sliders
    initSwipers();
    
    // Initialize product card hover effects
    initProductCardEffects();
    
    // Initialize service card hover effects
    initServiceCardEffects();
    
    // Initialize filter buttons
    initFilterButtons();
    
    // Initialize toast notifications
    initToastNotifications();
    
    // Header scroll effect
    initHeaderScrollEffect();
    
    // Count down timer
    initCountdownTimer();
    
    // Back to top button
    initBackToTop();
    
    // Initialize Bootstrap components
    initBootstrapComponents();
});

// Initialize all Swiper sliders
function initSwipers() {
    // Main banner swiper
    if (document.querySelector('.main-swiper')) {
        new Swiper('.main-swiper', {
            loop: true,
            speed: 1000,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            }
        });
    }
    
    // Products carousel
    if (document.querySelector('.products-carousel')) {
        new Swiper('.products-carousel', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            navigation: {
                nextEl: '.products-carousel .swiper-button-next',
                prevEl: '.products-carousel .swiper-button-prev',
            },
            breakpoints: {
                640: {
                    slidesPerView: 2
                },
                768: {
                    slidesPerView: 3
                },
                1024: {
                    slidesPerView: 4
                }
            }
        });
    }
    
    // Best selling products carousel
    if (document.querySelector('.bestselling-swiper')) {
        new Swiper('.bestselling-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 4500,
                disableOnInteraction: false
            },
            pagination: {
                el: '.bestselling-swiper .swiper-pagination',
                clickable: true
            },
            breakpoints: {
                640: {
                    slidesPerView: 2
                },
                768: {
                    slidesPerView: 3
                },
                1024: {
                    slidesPerView: 4
                }
            }
        });
    }
    
    // Testimonial swiper
    if (document.querySelector('.testimonial-swiper')) {
        new Swiper('.testimonial-swiper', {
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false
            },
            pagination: {
                el: '.testimonial-swiper .swiper-pagination',
                clickable: true
            }
        });
    }
}

// Initialize product card hover effects
function initProductCardEffects() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const actionsContainer = card.querySelector('.product-actions');
        if (actionsContainer) {
            card.addEventListener('mouseenter', () => {
                actionsContainer.style.opacity = '1';
                actionsContainer.style.transform = 'translateY(0)';
            });
            
            card.addEventListener('mouseleave', () => {
                actionsContainer.style.opacity = '0';
                actionsContainer.style.transform = 'translateY(10px)';
            });
        }
    });

    // // Add click events to Add to Cart buttons
    // const addToCartButtons = document.querySelectorAll('.btn-cart, [data-toast]');
    // addToCartButtons.forEach(button => {
    //     button.addEventListener('click', function(e) {
    //         // Prevent default only if it's not a link to another page
    //         if (this.getAttribute('href') === '#' || this.getAttribute('data-toast')) {
    //             e.preventDefault();
            
    //             const type = this.getAttribute('data-toast-type') || 'success';
                
    //             // Show toast
    //             showToast(message, type);
    //         }
    //     });
    // });
    
    // // Add click events to Wishlist buttons
    // const wishlistButtons = document.querySelectorAll('.btn-wishlist');
    // wishlistButtons.forEach(button => {
    //     button.addEventListener('click', function(e) {
    //         e.preventDefault();
    //         showToast('Sản phẩm đã được thêm vào danh sách yêu thích!', 'info');
    //     });
    // });
}

// Initialize service card hover effects
function initServiceCardEffects() {
    const serviceCards = document.querySelectorAll('#pet-services .card');
    
    serviceCards.forEach(card => {
        const iconWrapper = card.querySelector('.service-icon-wrapper');
        const img = card.querySelector('.service-img-container img');
        
        card.addEventListener('mouseenter', () => {
            if (iconWrapper) {
                iconWrapper.style.backgroundColor = '#3682f4';
                iconWrapper.style.transform = 'translateY(-5px) rotateY(180deg)';
                
                // Change icon color to white
                const icon = iconWrapper.querySelector('i');
                if (icon) {
                    icon.style.color = 'white';
                    icon.style.transform = 'rotateY(180deg)';
                }
            }
            
            if (img) {
                img.style.transform = 'scale(1.1)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (iconWrapper) {
                iconWrapper.style.backgroundColor = '';
                iconWrapper.style.transform = '';
                
                // Reset icon color
                const icon = iconWrapper.querySelector('i');
                if (icon) {
                    icon.style.color = '';
                    icon.style.transform = '';
                }
            }
            
            if (img) {
                img.style.transform = '';
            }
        });
    });
}

// Initialize filter buttons
function initFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-button');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Get all items
            const items = document.querySelectorAll('.isotope-container .item');
            
            // Filter items
            items.forEach(item => {
                if (filterValue === '*') {
                    item.style.display = 'block';
                } else {
                    if (item.classList.contains(filterValue.replace('.', ''))) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        });
    });
}

// Initialize toast notifications
// function initToastNotifications() {
//     // Create toast container if it doesn't exist
//     if (!document.getElementById('toast-container')) {
//         const toastContainer = document.createElement('div');
//         toastContainer.id = 'toast-container';
//         toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
//         toastContainer.style.zIndex = '1050';
//         document.body.appendChild(toastContainer);
//     }
// }

// Show toast notification
// function showToast(message, type = 'success') {
//     const toastContainer = document.getElementById('toast-container');
    
//     // Create toast element
//     const toast = document.createElement('div');
//     toast.className = 'toast';
//     toast.setAttribute('role', 'alert');
//     toast.setAttribute('aria-live', 'assertive');
//     toast.setAttribute('aria-atomic', 'true');
    
//     // Set toast header class based on type
//     let headerClass = '';
//     let iconClass = '';
    
//     switch(type) {
//         case 'success':
//             headerClass = 'bg-success';
//             iconClass = 'fas fa-check-circle';
//             break;
//         case 'info':
//             headerClass = 'bg-info';
//             iconClass = 'fas fa-info-circle';
//             break;
//         case 'warning':
//             headerClass = 'bg-warning';
//             iconClass = 'fas fa-exclamation-triangle';
//             break;
//         case 'error':
//             headerClass = 'bg-danger';
//             iconClass = 'fas fa-exclamation-circle';
//             break;
//         default:
//             headerClass = 'bg-success';
//             iconClass = 'fas fa-check-circle';
//     }
    
//     // Set toast content
//     toast.innerHTML = `
//         <div class="toast-header ${headerClass} text-white">
//             <i class="${iconClass} me-2"></i>
//             <strong class="me-auto">Thông báo</strong>
//             <small>Vừa xong</small>
//             <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
//         </div>
//         <div class="toast-body">
//             ${message}
//         </div>
//     `;
    
//     // Add toast to container
//     toastContainer.appendChild(toast);
    
//     // Initialize Bootstrap toast
//     const bsToast = new bootstrap.Toast(toast, {
//         autohide: true,
//         delay: 3000
//     });
    
//     // Show toast
//     bsToast.show();
    
//     // Remove toast after it's hidden
//     toast.addEventListener('hidden.bs.toast', function() {
//         this.remove();
//     });
// }

// Initialize header scroll effect
function initHeaderScrollEffect() {
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

// Initialize countdown timer
function initCountdownTimer() {
    const countdownContainer = document.querySelector('.countdown');
    
    if (countdownContainer) {
        const days = countdownContainer.querySelector('.time-block:nth-child(1) .time-value');
        const hours = countdownContainer.querySelector('.time-block:nth-child(2) .time-value');
        const minutes = countdownContainer.querySelector('.time-block:nth-child(3) .time-value');
        const seconds = countdownContainer.querySelector('.time-block:nth-child(4) .time-value');
        
        // Set target date (10 days from now)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 10);
        
        // Update countdown every second
        setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;
            
            // Calculate time
            const daysValue = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hoursValue = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutesValue = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const secondsValue = Math.floor((distance % (1000 * 60)) / 1000);
            
            // Update countdown
            if (days) days.textContent = String(daysValue).padStart(2, '0');
            if (hours) hours.textContent = String(hoursValue).padStart(2, '0');
            if (minutes) minutes.textContent = String(minutesValue).padStart(2, '0');
            if (seconds) seconds.textContent = String(secondsValue).padStart(2, '0');
            
            // If countdown is over
            if (distance < 0) {
                if (days) days.textContent = '00';
                if (hours) hours.textContent = '00';
                if (minutes) minutes.textContent = '00';
                if (seconds) seconds.textContent = '00';
            }
        }, 1000);
    }
}

// Initialize back to top button
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('d-none');
                setTimeout(() => {
                    backToTopBtn.style.opacity = '1';
                    backToTopBtn.style.visibility = 'visible';
                }, 10);
            } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.visibility = 'hidden';
                setTimeout(() => {
                    backToTopBtn.classList.add('d-none');
                }, 300);
            }
        });
        
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Initialize Bootstrap components
function initBootstrapComponents() {
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltipTriggerList.length > 0) {
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
    
    // Initialize popovers
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    if (popoverTriggerList.length > 0) {
        [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
    }
    
    // Initialize dropdown menus
    const dropdownToggleList = document.querySelectorAll('.dropdown-toggle');
    dropdownToggleList.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            // Only for mobile views
            if (window.innerWidth < 992) {
                e.preventDefault();
                const dropdownMenu = this.nextElementSibling;
                if (dropdownMenu.classList.contains('show')) {
                    dropdownMenu.classList.remove('show');
                } else {
                    // Close all other dropdown menus
                    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                        if (menu !== dropdownMenu) {
                            menu.classList.remove('show');
                        }
                    });
                    dropdownMenu.classList.add('show');
                }
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth < 992 && !e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

// Helper function to add animation class to elements
function animateElement(element, animationClass) {
    element.classList.add(animationClass);
    element.addEventListener('animationend', () => {
        element.classList.remove(animationClass);
    });
}

// Make all elements with data-animate attribute animated on scroll
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animation = element.getAttribute('data-animate');
                    element.classList.add(animation);
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.1 });
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
});