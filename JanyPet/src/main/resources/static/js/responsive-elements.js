/**
 * JS file to handle responsive elements and improve UX
 */
document.addEventListener('DOMContentLoaded', function() {
    // Resize buttons based on screen size
    function resizeButtons() {
        const buttons = document.querySelectorAll('.btn-cart, .btn-wishlist');
        const width = window.innerWidth;
        
        buttons.forEach(btn => {
            // Reset all button text first
            if (btn.dataset.originalHtml) {
                btn.innerHTML = btn.dataset.originalHtml;
            } else {
                btn.dataset.originalHtml = btn.innerHTML;
            }
            
            // For small screens
            if (width < 768) {
                // If it's an Add to Cart button
                if (btn.classList.contains('btn-cart')) {
                    const cartText = btn.querySelector('h5');
                    if (cartText && cartText.textContent.includes('Add to Cart')) {
                        cartText.innerHTML = '<i class="fas fa-shopping-cart"></i>';
                    }
                }
                
                // If it's a wishlist button
                if (btn.classList.contains('btn-wishlist')) {
                    btn.innerHTML = '<iconify-icon icon="fluent:heart-28-filled" class="fs-5"></iconify-icon>';
                }
            }
        });
    }
    
    // Header hide/show on scroll
function handleHeaderScroll() {
  const header = document.querySelector('.auto-hide-header');
  let lastScrollPosition = 0;
  let scrollDelta = 10; // Minimum scroll amount to trigger hide/show
  let headerHeight = header.offsetHeight;
  
  window.addEventListener('scroll', function() {
    let currentScrollPosition = window.pageYOffset;
    
    // Make sure they scroll more than scrollDelta
    if (Math.abs(lastScrollPosition - currentScrollPosition) <= scrollDelta) 
      return;
      
    // If scrolled down and past the header, add class .is-hidden
    if (currentScrollPosition > lastScrollPosition && currentScrollPosition > headerHeight) {
      // Scrolling down
      header.classList.add('is-hidden');
    } else {
      // Scrolling up
      header.classList.remove('is-hidden');
    }
    
    lastScrollPosition = currentScrollPosition;
  });
}

    // Add hover effects to product cards
    function initProductCardEffects() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const addToCartBtn = this.querySelector('.btn-cart');
                const wishlistBtn = this.querySelector('.btn-wishlist');
                
                if (addToCartBtn) {
                    addToCartBtn.classList.add('btn-primary');
                    addToCartBtn.classList.remove('btn-outline-primary');
                }
                
                if (wishlistBtn) {
                    wishlistBtn.classList.add('btn-danger');
                    wishlistBtn.classList.remove('btn-outline-danger');
                }
            });
            
            card.addEventListener('mouseleave', function() {
                const addToCartBtn = this.querySelector('.btn-cart');
                const wishlistBtn = this.querySelector('.btn-wishlist');
                
                if (addToCartBtn) {
                    addToCartBtn.classList.remove('btn-primary');
                    addToCartBtn.classList.add('btn-outline-primary');
                }
                
                if (wishlistBtn) {
                    wishlistBtn.classList.remove('btn-danger');
                    wishlistBtn.classList.add('btn-outline-danger');
                }
            });
        });
    }
    
    // Add visual feedback when clicking buttons
    function addButtonFeedback() {
        const allButtons = document.querySelectorAll('.btn, .btn-cart, .btn-wishlist, [class*="btn-"]');
        
        allButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.classList.add('btn-click-effect');
                
                setTimeout(() => {
                    this.classList.remove('btn-click-effect');
                }, 300);
            });
        });
    }
    
    // Add hover effects to service cards
    function initServiceCardEffects() {
        const serviceCards = document.querySelectorAll('#pet-services .card');
        
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const iconWrapper = this.querySelector('.service-icon-wrapper');
                
                if (iconWrapper) {
                    iconWrapper.style.transform = 'translateY(-5px) rotate(5deg)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                const iconWrapper = this.querySelector('.service-icon-wrapper');
                
                if (iconWrapper) {
                    iconWrapper.style.transform = '';
                }
            });
        });
    }
    
    // Initialize all responsive functions
    function initResponsive() {
        resizeButtons();
        handleHeaderScroll();
        initProductCardEffects();
        initServiceCardEffects();
        addButtonFeedback();
        
        // Add responsive CSS classes
        const sectionTitles = document.querySelectorAll('.section-title, h2.display-3, h2.display-4');
        sectionTitles.forEach(title => {
            title.classList.add('responsive-title');
        });
        
        const paragraphs = document.querySelectorAll('p.lead');
        paragraphs.forEach(p => {
            p.classList.add('responsive-text');
        });
    }
    
    // Run on load
    initResponsive();
    
    // Run on resize
    window.addEventListener('resize', resizeButtons);
    
    // Add CSS for button click effect
    const style = document.createElement('style');
    style.innerHTML = `
        .btn-click-effect {
            transform: scale(0.95);
        }
        
        .responsive-title {
            font-size: clamp(1.5rem, 5vw, 2.5rem);
        }
        
        .responsive-text {
            font-size: clamp(1rem, 2vw, 1.2rem);
        }
        
        @media (max-width: 768px) {
            .btn-cart, .btn-wishlist {
                padding: 0.4rem 0.8rem;
            }
        }
    `;
    document.head.appendChild(style);
});