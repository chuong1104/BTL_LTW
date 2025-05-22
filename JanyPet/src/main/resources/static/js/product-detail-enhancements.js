/* 
 * Product Detail Page Enhancements
 * Add this script to enhance the product detail page functionality
 */

document.addEventListener("DOMContentLoaded", function() {
  // Product image zoom functionality
  function initializeImageZoom() {
    const productImages = document.querySelectorAll('.product-gallery-img, .product-main-image-dynamic, #product-image-gallery-main');
    const zoomButtons = document.querySelectorAll('[title="Phóng to"], [title="Phóng to ảnh"]');
    
    function createImageModal(imageSrc) {
      // Create modal for zoomed image view
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.id = 'imageZoomModal';
      modal.tabIndex = '-1';
      modal.setAttribute('aria-hidden', 'true');
      
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-xl">
          <div class="modal-content bg-transparent border-0">
            <div class="modal-header border-0 p-2">
              <button type="button" class="btn-close bg-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center p-0">
              <img src="${imageSrc}" class="img-fluid" style="max-height: 85vh;">
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
      
      modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
      });
    }
    
    // Add click handlers for zoom buttons
    zoomButtons.forEach(button => {
      button.addEventListener('click', function() {
        const imageContainer = button.closest('.product-main-image-wrapper, .card, .position-relative');
        const image = imageContainer.querySelector('img');
        if(image) {
          createImageModal(image.src);
        }
      });
    });
    
    // Add click handlers for images
    productImages.forEach(image => {
      image.style.cursor = 'zoom-in';
      image.addEventListener('click', function() {
        createImageModal(this.src);
      });
    });
  }
  
  // Initialize image zoom on page load
  initializeImageZoom();
  
  // Re-initialize image zoom when switching tabs (to handle dynamically loaded content)
  const tabLinks = document.querySelectorAll('.nav-link[data-bs-toggle="pill"]');
  tabLinks.forEach(link => {
    link.addEventListener('click', function() {
      setTimeout(() => {
        initializeImageZoom();
        
        const tabsSection = document.querySelector('.product-info-tabs');
        if (tabsSection) {
          window.scrollTo({
            top: tabsSection.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      }, 150);
    });
  });
  
  // Make tabs sticky on scroll for better user experience
  const makeTabsSticky = () => {
    const tabsNav = document.getElementById('productDetailTabs');
    if (!tabsNav) return;
    
    const tabsTop = tabsNav.offsetTop;
    const handleScroll = () => {
      if (window.pageYOffset > tabsTop) {
        tabsNav.classList.add('sticky-tabs', 'py-2', 'bg-white', 'shadow-sm', 'rounded');
        tabsNav.style.zIndex = '100';
      } else {
        tabsNav.classList.remove('sticky-tabs', 'py-2', 'bg-white', 'shadow-sm', 'rounded');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
  };
  
  // Initialize sticky tabs
  if (window.innerWidth >= 992) {
    makeTabsSticky();
  }
  
  // Extract and display image links from product description
  function extractImagesFromDescription() {
    const descriptionElement = document.getElementById('product-long-description-details-tab');
    const galleryContainer = document.getElementById('product-gallery-container');
    
    if (descriptionElement && galleryContainer) {
      const description = descriptionElement.textContent;
      
      // Enhanced pattern to catch more image URL formats
      const imageLinkPattern = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|bmp))/gi;
      const matches = description.match(imageLinkPattern);
      
      if (matches && matches.length > 0) {
        // Process only unique URLs (avoid duplicates)
        const uniqueUrls = [...new Set(matches)];
        
        uniqueUrls.forEach((url, index) => {
          // Create image element with proper error handling
          const imageDiv = document.createElement('div');
          imageDiv.className = 'col';
          imageDiv.innerHTML = `
            <div class="card h-100 border-0 shadow-sm overflow-hidden product-gallery-card">
              <img src="${url}" class="card-img-top product-gallery-img" alt="Hình ảnh bổ sung ${index + 1}" 
                   onerror="this.onerror=null;this.src='images/placeholder.jpg'; this.alt='Không thể tải hình ảnh';">
              <div class="card-body text-center py-2">
                <p class="card-text small mb-0">Hình ảnh bổ sung ${index + 1}</p>
              </div>
            </div>
          `;
          galleryContainer.appendChild(imageDiv);
        });
        
        // Clean up description by removing image URLs in a more gentle way
        // Instead of removing URLs completely, we'll preserve the text but convert URLs to a note
        descriptionElement.textContent = description
          .replace(imageLinkPattern, '[Xem hình ảnh trong tab Hình ảnh bổ sung]')
          .replace(/\s{2,}/g, ' ')
          .trim();
        
        // Re-initialize image zoom for new images
        initializeImageZoom();
      }
    }
  }
  
  // Run image extraction when product details are loaded
  const observeDescriptionChanges = () => {
    const descriptionElement = document.getElementById('product-long-description-details-tab');
    if (descriptionElement) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            extractImagesFromDescription();
            observer.disconnect();
          }
        });
      });
      
      observer.observe(descriptionElement, { 
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  };
  
  observeDescriptionChanges();
});
