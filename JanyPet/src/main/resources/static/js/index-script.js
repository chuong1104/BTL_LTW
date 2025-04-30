// Main JavaScript file for JanyPet website

// Initialize on document ready
document.addEventListener("DOMContentLoaded", function() {
  // Initialize preloader
  setTimeout(function() {
    const preloader = document.querySelector('.preloader-wrapper');
    if (preloader) {
      preloader.style.opacity = '0';
      setTimeout(function() {
        preloader.style.display = 'none';
      }, 500);
    }
  }, 800);

  // Initialize header scroll effect
  const header = document.querySelector('.main-header');
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
  
  // Initialize banner Swiper
  const bannerSwiper = new Swiper('.banner-swiper', {
    loop: true,
    grabCursor: true,
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.banner-swiper .swiper-pagination',
      clickable: true,
    },
  });
  
  // Initialize testimonial Swiper
  const testimonialSwiper = new Swiper('.testimonial-swiper', {
    loop: true,
    grabCursor: true,
    spaceBetween: 30,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.testimonial-swiper .swiper-pagination',
      clickable: true,
    },
  });
  
  // Product filtering functionality
  const filterButtons = document.querySelectorAll('.filter-button');
  const productItems = document.querySelectorAll('[data-category]');
  
  if (filterButtons.length > 0 && productItems.length > 0) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get filter value
        const filterValue = button.getAttribute('data-filter');
        
        // Filter products
        productItems.forEach(item => {
          if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }
  
  // Scroll animations
  const fadeElements = document.querySelectorAll('.fade-in');
  
  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeInObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  if (fadeElements.length > 0) {
    fadeElements.forEach(element => {
      fadeInObserver.observe(element);
      // Set initial state
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });
  }
  
  // Add CSS for visible state
  const style = document.createElement('style');
  style.innerHTML = `
    .fade-in.visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
  
  // Cart functionality
  const cartButtons = document.querySelectorAll('.btn-cart');
  
  if (cartButtons.length > 0) {
    cartButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get product details from parent card
        const card = this.closest('.product-card');
        const productName = card.querySelector('.product-title').textContent;
        const productPrice = card.querySelector('.product-price').textContent;
        
        // Animation effect
        this.classList.add('adding');
        setTimeout(() => {
          this.classList.remove('adding');
        }, 1500);
        
        // Update cart count
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          let count = parseInt(cartCount.textContent);
          cartCount.textContent = count + 1;
          
          // Show success message
          // const successToast = document.createElement('div');
          // successToast.className = 'toast-notification';
          // successToast.innerHTML = `<div class="toast-content">
          //   <iconify-icon icon="mdi:check-circle" style="color: green; font-size: 20px;"></iconify-icon>
          //   <span>${productName} added to cart</span>
          // </div>`;
          
          document.body.appendChild(successToast);
          
          // Toast styling
          // const style = document.createElement('style');
          // style.innerHTML = `
          //   .toast-notification {
          //     position: fixed;
          //     top: 20px;
          //     right: 20px;
          //     background-color: white;
          //     border-radius: 8px;
          //     box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          //     z-index: 9999;
          //     overflow: hidden;
          //     animation: slideIn 0.3s ease forwards, slideOut 0.3s ease forwards 3s;
          //   }
          //   .toast-content {
          //     display: flex;
          //     align-items: center;
          //     padding: 12px 20px;
          //     gap: 10px;
          //   }
          //   @keyframes slideIn {
          //     from { transform: translateX(100%); opacity: 0; }
          //     to { transform: translateX(0); opacity: 1; }
          //   }
          //   @keyframes slideOut {
          //     from { transform: translateX(0); opacity: 1; }
          //     to { transform: translateX(100%); opacity: 0; }
          //   }
          // `;
          document.head.appendChild(style);
          
          // Remove toast after animation
          setTimeout(() => {
            document.body.removeChild(successToast);
          }, 3500);
        }
        
        console.log(`Added to cart: ${productName} - ${productPrice}`);
      });
    });
  }
  
  // Mobile menu enhancements
  const mobileMenu = document.getElementById('offcanvasNavbar');
  if (mobileMenu) {
    const bsOffcanvas = new bootstrap.Offcanvas(mobileMenu);
    
    // Close mobile menu when clicking on a link
    const mobileLinks = mobileMenu.querySelectorAll('.nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (!link.classList.contains('dropdown-toggle')) {
          bsOffcanvas.hide();
        }
      });
    });
  }
  
  // Thêm nút cuộn lên đầu trang
  const scrollTopButton = document.createElement('div');
  scrollTopButton.className = 'scroll-to-top';
  scrollTopButton.innerHTML = '<iconify-icon icon="mdi:arrow-up"></iconify-icon>';
  document.body.appendChild(scrollTopButton);
  
  // Hiển thị nút cuộn khi người dùng cuộn xuống
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      scrollTopButton.classList.add('visible');
    } else {
      scrollTopButton.classList.remove('visible');
    }
  });
  
  // Cuộn lên đầu trang khi nhấp vào nút
  scrollTopButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Thêm hiệu ứng cho các thẻ sản phẩm
  document.querySelectorAll('.product-rating iconify-icon').forEach((icon, index) => {
    icon.style.setProperty('--i', index);
  });
  
  document.querySelectorAll('.testimonial-rating iconify-icon').forEach((icon, index) => {
    icon.style.setProperty('--i', index);
  });
  
  // Thêm hiệu ứng gradient background cho các phần
  const sections = document.querySelectorAll('section:not(.banner-section)');
  sections.forEach(section => {
    const gradientBg = document.createElement('div');
    gradientBg.className = 'gradient-bg';
    section.appendChild(gradientBg);
  });
  
  // Thêm hiệu ứng hover cho các sản phẩm
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.querySelectorAll('.product-badge').forEach(badge => {
        badge.style.transform = 'translateY(-3px)';
      });
    });
    
    card.addEventListener('mouseleave', function() {
      this.querySelectorAll('.product-badge').forEach(badge => {
        badge.style.transform = 'translateY(0)';
      });
    });
  });
});

// Add to wishlist functionality
document.querySelectorAll('.btn-wishlist').forEach(button => {
  button.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Toggle heart filled/outline
    const icon = this.querySelector('iconify-icon');
    if (icon) {
      if (icon.getAttribute('icon') === 'ph:heart') {
        icon.setAttribute('icon', 'ph:heart-fill');
        icon.style.color = '#ff6666';
      } else {
        icon.setAttribute('icon', 'ph:heart');
        icon.style.color = '';
      }
    }
  });
});
// Enhanced UX functions for JanyPet

document.addEventListener('DOMContentLoaded', function() {
  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Initialize AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  }
  
  // Product cards hover effects
  const productCards = document.querySelectorAll('.product-card');
  
  productCards.forEach(card => {
    const actionsContainer = card.querySelector('.product-actions');
    if (!actionsContainer) return;
    
    card.addEventListener('mouseenter', () => {
      actionsContainer.style.opacity = '1';
      actionsContainer.style.bottom = '15px';
    });
    
    card.addEventListener('mouseleave', () => {
      actionsContainer.style.opacity = '0';
      actionsContainer.style.bottom = '-50px';
    });
  });
  
  // Toast notifications
  const toastTriggers = document.querySelectorAll('.btn-cart, .btn-wishlist');
  const toastContainer = document.getElementById('toast-container');
  
  if (toastContainer) {
    toastTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        
        const isCart = e.currentTarget.classList.contains('btn-cart');
        // const message = isCart ? 'Sản phẩm đã được thêm vào giỏ hàng' : 'Sản phẩm đã được thêm vào danh sách yêu thích';
        const icon = isCart ? 'fas fa-shopping-cart' : 'fas fa-heart';
        const bgColor = isCart ? 'bg-success' : 'bg-danger';
        
        const toastEl = document.createElement('div');
        toastEl.className = 'toast';
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        
        toastEl.innerHTML = `
          <div class="toast-header ${bgColor} text-white">
            <i class="${icon} me-2"></i>
            <strong class="me-auto">Thông báo</strong>
            <small>Bây giờ</small>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
            ${message}
          </div>
        `;
        
        toastContainer.appendChild(toastEl);
        
        const toast = new bootstrap.Toast(toastEl, {
          autohide: true,
          delay: 3000
        });
        
        toast.show();
        
        // Remove toast from DOM after it's hidden
        toastEl.addEventListener('hidden.bs.toast', () => {
          toastEl.remove();
        });
      });
    });
  }
  
  // Image lazy loading with fade-in effect
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('fade-in');
          observer.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  }
  
  // Dynamic countdown timer
  const countdownBlocks = document.querySelectorAll('.countdown');
  
  if (countdownBlocks.length > 0) {
    // Set the date we're counting down to (10 days from now)
    const countDownDate = new Date();
    countDownDate.setDate(countDownDate.getDate() + 10);
    
    // Update the countdown every 1 second
    const countdownTimer = setInterval(function() {
      // Get current date and time
      const now = new Date().getTime();
      
      // Find the distance between now and the countdown date
      const distance = countDownDate - now;
      
      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Update countdown blocks if they exist
      countdownBlocks.forEach(block => {
        const daysBlock = block.querySelector('.time-block:nth-child(1) .time-value');
        const hoursBlock = block.querySelector('.time-block:nth-child(2) .time-value');
        const minutesBlock = block.querySelector('.time-block:nth-child(3) .time-value');
        const secondsBlock = block.querySelector('.time-block:nth-child(4) .time-value');
        
        if (daysBlock) daysBlock.innerHTML = days.toString().padStart(2, '0');
        if (hoursBlock) hoursBlock.innerHTML = hours.toString().padStart(2, '0');
        if (minutesBlock) minutesBlock.innerHTML = minutes.toString().padStart(2, '0');
        if (secondsBlock) secondsBlock.innerHTML = seconds.toString().padStart(2, '0');
      });
      
      // If the countdown is finished, clear the interval
      if (distance < 0) {
        clearInterval(countdownTimer);
        countdownBlocks.forEach(block => {
          block.innerHTML = "<p class='text-center'>Khuyến mãi đã kết thúc!</p>";
        });
      }
    }, 1000);
  }
  
  // Back to top button
  const backToTopBtn = document.getElementById('back-to-top');
  
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
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
  
  // Add smooth scrolling to all internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      if (href !== '#') {
        e.preventDefault();
        
        const targetElement = document.querySelector(this.getAttribute('href'));
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
  
  // Enhanced form validation with feedback
  const forms = document.querySelectorAll('.needs-validation');
  
  forms.forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      form.classList.add('was-validated');
      
      // Add shake animation to invalid fields
      const invalidFields = form.querySelectorAll(':invalid');
      invalidFields.forEach(field => {
        field.classList.add('shake-animation');
        setTimeout(() => {
          field.classList.remove('shake-animation');
        }, 500);
      });
    });
  });
});

// Add keyframe animation for shake effect
const style = document.createElement('style');
style.textContent = `
  @keyframes shakeAnimation {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  
  .shake-animation {
    animation: shakeAnimation 0.5s ease-in-out;
  }
`;
document.head.appendChild(style);