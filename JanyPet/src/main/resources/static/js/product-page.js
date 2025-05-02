/**
 * JanyPet - Product Page Enhancement Script
 * This script provides functionality for product pages, including quick view, 
 * adding to cart, product navigation and filtering
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize quick view functionality if we're on a product listing page
    initQuickView();
    
    // Initialize product detail functionality if we're on a product detail page
    if (window.location.pathname.includes('single-product.html')) {
        initProductDetail();
    }
    
    // Initialize product filtering if we're on shop page
    if (window.location.pathname.includes('shop.html')) {
        initProductFilters();
    }
    
    // Make header navigation dropdown menus work better on mobile
    enhanceNavigation();
});

/**
 * Initialize product quick view functionality
 */
function initQuickView() {
    // Set up quick view buttons
    const quickViewBtns = document.querySelectorAll('.quick-view-btn');
    
    quickViewBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product data from data attributes
            const productId = this.dataset.id;
            const productName = this.dataset.name;
            const productPrice = this.dataset.price;
            const productImage = this.dataset.image;
            const productDescription = this.dataset.description || 'Không có mô tả chi tiết cho sản phẩm này.';
            
            // Populate quick view modal with product data
            const quickViewModal = document.getElementById('quickViewModal');
            if (quickViewModal) {
                const modalTitle = quickViewModal.querySelector('.modal-title');
                const modalImage = quickViewModal.querySelector('.product-image');
                const modalPrice = quickViewModal.querySelector('.product-price');
                const modalDescription = quickViewModal.querySelector('.product-description');
                const modalAddToCartBtn = quickViewModal.querySelector('.add-to-cart-btn');
                
                if (modalTitle) modalTitle.textContent = productName;
                if (modalImage) modalImage.src = productImage;
                if (modalPrice) modalPrice.textContent = formatPrice(productPrice);
                if (modalDescription) modalDescription.textContent = productDescription;
                
                if (modalAddToCartBtn) {
                    modalAddToCartBtn.dataset.id = productId;
                    modalAddToCartBtn.dataset.name = productName;
                    modalAddToCartBtn.dataset.price = productPrice;
                    modalAddToCartBtn.dataset.image = productImage;
                }
                
                // Show the modal
                const bsModal = new bootstrap.Modal(quickViewModal);
                bsModal.show();
            } else {
                console.error('Quick view modal element not found');
            }
        });
    });
}

/**
 * Initialize product detail page functionality
 */
function initProductDetail() {
    // Product image gallery
    initProductGallery();
    
    // Product quantity selector
    initQuantitySelector();
    
    // Product tabs (description, reviews, etc.)
    initProductTabs();
    
    // Related products slider
    initRelatedProductsSlider();
    
    // Buy now button
    initBuyNowButton();
}

/**
 * Initialize product gallery
 */
function initProductGallery() {
    // Check if the product gallery container exists
    const galleryContainer = document.querySelector('.product-gallery');
    if (!galleryContainer) return;
    
    // Main product image
    const mainImage = document.querySelector('.product-main-image');
    
    // Thumbnail images
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    
    // Add click event to thumbnails
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Get the full-size image URL from the data attribute
            const fullSizeUrl = this.dataset.image;
            
            // Update main image source
            if (mainImage) {
                // Add a fade effect
                mainImage.style.opacity = 0;
                
                setTimeout(() => {
                    mainImage.src = fullSizeUrl;
                    mainImage.style.opacity = 1;
                }, 300);
            }
            
            // Update active thumbnail
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Initialize zoom functionality if available
    if (typeof ImageZoom !== 'undefined' && mainImage) {
        new ImageZoom(mainImage, {
            scale: 1.5,
            zoomWidth: 300,
            zoomHeight: 300,
            offset: {vertical: 0, horizontal: 10}
        });
    }
}

/**
 * Initialize quantity selector on product pages
 */
function initQuantitySelector() {
    const quantityInput = document.getElementById('quantity');
    if (!quantityInput) return;
    
    const decreaseBtn = document.querySelector('.quantity-decrease');
    const increaseBtn = document.querySelector('.quantity-increase');
    
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
    }
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
    }
    
    // Validate input to ensure only numbers
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
                this.value = 1;
            } else {
                this.value = value;
            }
        });
    }
}

/**
 * Initialize product tabs (description, reviews, etc.)
 */
function initProductTabs() {
    const tabLinks = document.querySelectorAll('.product-tab-link');
    if (tabLinks.length === 0) return;
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(tab => {
                tab.classList.remove('active');
                const tabContentId = tab.getAttribute('href');
                const tabContent = document.querySelector(tabContentId);
                if (tabContent) {
                    tabContent.classList.remove('active', 'show');
                }
            });
            
            // Add active class to current tab
            this.classList.add('active');
            const contentId = this.getAttribute('href');
            const content = document.querySelector(contentId);
            if (content) {
                content.classList.add('active', 'show');
            }
        });
    });
}

/**
 * Initialize related products slider
 */
function initRelatedProductsSlider() {
    // Check if Swiper is available
    if (typeof Swiper === 'undefined') return;
    
    // Check if the related products container exists
    const relatedProductsContainer = document.querySelector('.related-products-slider');
    if (!relatedProductsContainer) return;
    
    // Initialize Swiper
    new Swiper(relatedProductsContainer, {
        slidesPerView: 1,
        spaceBetween: 20,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            576: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            992: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            1200: {
                slidesPerView: 4,
                spaceBetween: 30,
            },
        },
    });
}

/**
 * Initialize Buy Now button
 */
function initBuyNowButton() {
    const buyNowBtn = document.querySelector('.buy-now-btn');
    if (!buyNowBtn) return;
    
    buyNowBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get product data
        const id = this.dataset.id;
        const name = this.dataset.name;
        const price = parseFloat(this.dataset.price);
        const image = this.dataset.image;
        
        // Get quantity
        const quantityInput = document.getElementById('quantity');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        
        // Add to cart
        if (typeof addToCart === 'function') {
            addToCart(id, name, price, image, quantity);
            
            // Navigate to checkout page
            setTimeout(() => {
                window.location.href = 'checkout.html';
            }, 800);
        } else {
            console.error('addToCart function not available');
        }
    });
}

/**
 * Initialize product filters
 */
function initProductFilters() {
    // Category filters
    const categoryFilters = document.querySelectorAll('.category-filter');
    
    // Price range filter
    const priceRangeMin = document.getElementById('price-range-min');
    const priceRangeMax = document.getElementById('price-range-max');
    
    // Sort options
    const sortSelect = document.getElementById('sort-products');
    
    // Product items
    const productItems = document.querySelectorAll('.product-item');
    
    // If any of these filters exist, set up filter functionality
    if (categoryFilters.length > 0 || priceRangeMin || priceRangeMax || sortSelect) {
        // Filter by category
        categoryFilters.forEach(filter => {
            filter.addEventListener('change', applyFilters);
        });
        
        // Filter by price range
        if (priceRangeMin) priceRangeMin.addEventListener('change', applyFilters);
        if (priceRangeMax) priceRangeMax.addEventListener('change', applyFilters);
        
        // Sort products
        if (sortSelect) sortSelect.addEventListener('change', applyFilters);
        
        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', function() {
                // Reset category filters
                categoryFilters.forEach(filter => {
                    filter.checked = false;
                });
                
                // Reset price range
                if (priceRangeMin) priceRangeMin.value = '';
                if (priceRangeMax) priceRangeMax.value = '';
                
                // Apply the reset filters
                applyFilters();
            });
        }
    }
}

/**
 * Update the cart count badges in the header
 */
function updateHeaderCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    
    const cartBadges = document.querySelectorAll('.badge.rounded-pill');
    cartBadges.forEach(badge => {
        if (badge.closest('a[href="cart.html"]') || 
            badge.closest('a[data-bs-target="#offcanvasCart"]')) {
            badge.textContent = cartCount;
        }
    });
}

/**
 * Format currency value to VND format
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount).replace('VND', 'đ');
}