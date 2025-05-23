/**
 * JanyPet - Index Page Controller
 * Handles loading and displaying products by category on the homepage
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize homepage functionality
    initializeHomepage();
    
    // If authentication service is available and has checkLoginStatus method, call it
    if (window.authService && typeof window.authService.checkLoginStatus === 'function') {
        window.authService.checkLoginStatus();
    } else {
        console.info('Auth service not available or checkLoginStatus method not found');
    }
});

/**
 * Initialize homepage components and load data
 */
async function initializeHomepage() {
    try {
        console.log('Initializing homepage components...');
        
        // Initialize Swiper for main banner
        const mainSwiper = new Swiper('.main-swiper', {
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            autoplay: {
                delay: 5000,
            },
        });
        
        // Load popular categories
        await loadPopularCategories();
        
        // Load and display products by category
        await loadProductsByCategory();
        
        // Initialize other components
        initializeTestimonialSwiper();
        setupCountdown();
        
    } catch (error) {
        console.error('Error initializing homepage:', error);
    }
}

/**
 * Load popular categories for the category section
 */
async function loadPopularCategories() {
    try {
        const categoriesContainer = document.getElementById('popular-categories-container');
        if (!categoriesContainer) return;
        
        // Show loading state
        categoriesContainer.innerHTML = '<div class="col-12 text-center"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Loading categories...</p></div>';
        
        // Fetch categories from API
        const categories = await CategoryService.getAllCategories();
        
        if (!categories || categories.length === 0) {
            categoriesContainer.innerHTML = '<div class="col-12 text-center"><p>No categories found.</p></div>';
            return;
        }
        
        // Clear loading message
        categoriesContainer.innerHTML = '';
        
        // Display all categories in a single scrollable row
        categoriesContainer.className = 'd-flex flex-nowrap overflow-auto pb-3 gap-3 snap-x';
        
        // Category icons mapping - Add more icons as needed
        const categoryIcons = {
            'Food': 'fas fa-bone',
            'Toys': 'fas fa-baseball-ball',
            'Accessories': 'fas fa-tshirt',
            'Medicine': 'fas fa-pills',
            'default': 'fas fa-paw'
        };
        
        categories.forEach(category => {
            // Determine icon
            const iconClass = categoryIcons[category.name] || categoryIcons.default;
            
            // Create category card
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-item flex-shrink-0 snap-center';
            categoryCard.style.width = '220px'; // Fixed width for consistent sizing
            
            categoryCard.innerHTML = `
                <a href="shop.html?cat=${category.id}" class="text-decoration-none">
                    <div class="card border-0 shadow-sm text-center hover-lift category-card h-100">
                        <div class="card-body py-4">
                            <div class="category-icon-wrapper rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center mx-auto mb-3">
                                <i class="${iconClass} fa-2x text-primary"></i>
                            </div>
                            <h3 class="card-title h5">${category.name}</h3>
                        </div>
                    </div>
                </a>
            `;
            
            categoriesContainer.appendChild(categoryCard);
        });
        
        // Also populate the navigation dropdown with all categories
        await populateCategoryDropdown(categories);
        
    } catch (error) {
        console.error('Error loading categories:', error);
        const categoriesContainer = document.getElementById('popular-categories-container');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Error loading categories. Please try again later.</p></div>';
        }
    }
}

/**
 * Populate the navigation category dropdown
 */
async function populateCategoryDropdown(categories = null) {
    try {
        const dropdown = document.getElementById('product-category-dropdown');
        if (!dropdown) return;
        
        // If categories not provided, fetch them
        if (!categories) {
            categories = await CategoryService.getAllCategories();
        }
        
        // Get the divider and "All products" elements
        const divider = dropdown.querySelector('hr.dropdown-divider');
        const allProductsLink = dropdown.querySelector('a[href="shop.html"]').parentNode;
        
        // Clear existing category items but keep the divider and "all products" link
        while (dropdown.firstChild && dropdown.firstChild !== divider.parentNode) {
            dropdown.removeChild(dropdown.firstChild);
        }
        
        // Add categories to dropdown
        categories.forEach(category => {
            const li = document.createElement('li');
            li.innerHTML = `<a class="dropdown-item" href="shop.html?cat=${category.id}">${category.name}</a>`;
            dropdown.insertBefore(li, divider.parentNode);
        });
        
    } catch (error) {
        console.error('Error populating category dropdown:', error);
    }
}

/**
 * Load products organized by category
 */
async function loadProductsByCategory() {
    try {
        const containerEl = document.getElementById('category-products-showcase-container');
        if (!containerEl) return;
        
        // Show loading state
        containerEl.innerHTML = '<div class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Loading product collections...</p></div>';
        
        // Fetch categories
        const categories = await CategoryService.getAllCategories();
        
        if (!categories || categories.length === 0) {
            containerEl.innerHTML = '<div class="text-center py-5"><p>No product categories found.</p></div>';
            return;
        }
        
        // Clear container
        containerEl.innerHTML = '';
        
        // Load products for each category (limit to top 4 categories for homepage)
        const displayCategories = categories.slice(0, 4);
        
        for (const category of displayCategories) {
            // Fetch products for this category
            const products = await fetchProductsByCategory(category.id);
            
            if (products && products.length > 0) {
                // Create category section
                const categorySection = createCategorySection(category, products);
                containerEl.appendChild(categorySection);
            }
        }
        
        // If no products were added, show message
        if (containerEl.children.length === 0) {
            containerEl.innerHTML = '<div class="text-center py-5"><p>No products available at this time.</p></div>';
        }
        
        // Initialize product quick view
        if (typeof initializeQuickView === 'function') {
            initializeQuickView();
        }
        
    } catch (error) {
        console.error('Error loading products by category:', error);
        const containerEl = document.getElementById('category-products-showcase-container');
        if (containerEl) {
            containerEl.innerHTML = '<div class="text-center py-5"><p class="text-danger">Error loading products. Please try again later.</p></div>';
        }
    }
}

/**
 * Fetch products for a specific category
 */
async function fetchProductsByCategory(categoryId) {
    try {
        // Use the dedicated function for fetching by category
        return await ProductService.getProductsByCategory(categoryId);
    } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error);
        return []; // Return empty array if failed
    }
}

/**
 * Create a section for a category of products
 */
function createCategorySection(category, products) {
    // Create section container
    const section = document.createElement('section');
    section.className = 'my-5 overflow-hidden product-category-section';
    section.id = `category-${category.id}`;
    
    // Limit products to show (maximum 8 per category)
    const displayProducts = products.slice(0, 8);
    
    // Create section HTML
    section.innerHTML = `
        <div class="row mb-4 align-items-center">
            <div class="col-md-8">
                <h2 class="section-title display-6 fw-bold mb-0">${category.name}</h2>
            </div>
            <div class="col-md-4 text-md-end mt-3 mt-md-0">
                <a href="shop.html?cat=${category.id}" class="btn btn-outline-primary rounded-pill">
                    View All <i class="fas fa-arrow-right ms-1"></i>
                </a>
            </div>
        </div>
        
        <div class="row product-cards-container g-4">
            ${displayProducts.map(product => createProductCard(product)).join('')}
        </div>
    `;
    
    return section;
}

/**
 * Create HTML for a product card
 */
function createProductCard(product) {
    // Format price with VND currency
    const formattedPrice = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(product.price);
    
    // Process product image URL
    let imageUrl = processImageUrl(product.imageUrl);
    
    // Stock status
    const inStock = product.stock > 0;
    const stockStatusClass = inStock ? 'text-success' : 'text-danger';
    const stockStatusText = inStock ? 'Còn hàng' : 'Hết hàng';
    
    // Product card HTML with quick view and add to cart buttons
    return `
        <div class="col-md-6 col-lg-3">
            <div class="card product-card h-100 border-0 shadow-sm hover-effect" data-product-id="${product.id}">
                <div class="position-relative">
                    <img src="${imageUrl}" 
                        class="card-img-top product-img" 
                        alt="${product.name}"
                        onerror="this.onerror=null; this.src='/images/placeholder.jpg';">
                        
                    <div class="product-overlay d-flex justify-content-center">
                        <button class="btn btn-sm btn-primary rounded-circle quick-view-btn me-2" 
                            data-product-id="${product.id}" 
                            data-product-name="${product.name}"
                            data-product-price="${product.price}"
                            data-product-image="${imageUrl}"
                            data-product-description="${product.description ? product.description.replace(/"/g, '&quot;').substring(0, 100) + '...' : 'No description available'}"
                            data-bs-toggle="tooltip" 
                            title="Quick View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary rounded-circle add-to-cart-btn"
                            data-product-id="${product.id}"
                            data-product-name="${product.name}"
                            data-product-price="${product.price}"
                            data-product-image="${imageUrl}"
                            ${!inStock ? 'disabled' : ''}
                            data-bs-toggle="tooltip" 
                            title="Add to Cart">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger rounded-circle add-to-wishlist-btn"
                            data-product-id="${product.id}"
                            data-bs-toggle="tooltip" 
                            title="Add to Wishlist">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
                
                <div class="card-body p-3">
                    <h3 class="card-title h5 mb-2">
                        <a href="single-product.html?productId=${product.id}" class="text-decoration-none text-dark">
                            ${product.name}
                        </a>
                    </h3>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold text-primary">${formattedPrice}</span>
                        <small class="stock-status ${stockStatusClass}">${stockStatusText}</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Process image URL to ensure it's valid
 * @param {string} url - Image URL from API
 * @returns {string} Processed image URL
 */
function processImageUrl(url) {
    if (!url) {
        return '/images/placeholder.jpg';
    }
    
    // If it already starts with http/https or a slash, use as is
    if (url.startsWith('http') || url.startsWith('/')) {
        return url;
    }
    
    // Otherwise, assume it's a relative path in the database and prefix with uploads
    return `/uploads/${url}`;
}

/**
 * Initialize the testimonial swiper
 */
function initializeTestimonialSwiper() {
    const testimonialSwiper = new Swiper(".testimonial-swiper", {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        autoplay: {
            delay: 5000,
        },
    });
}

/**
 * Set up countdown timer
 */
function setupCountdown() {
    // Set the target date 10 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 10);
    
    // Update countdown every second
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        // Time calculations
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Display countdown
        const daysElement = document.querySelector('.countdown .time-block:nth-child(1) .time-value');
        const hoursElement = document.querySelector('.countdown .time-block:nth-child(2) .time-value');
        const minutesElement = document.querySelector('.countdown .time-block:nth-child(3) .time-value');
        const secondsElement = document.querySelector('.countdown .time-block:nth-child(4) .time-value');
        
        if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
        
        // Clear interval when countdown finished
        if (distance < 0) {
            clearInterval(countdownInterval);
            
            // Reset countdown to 0
            if (daysElement) daysElement.textContent = '00';
            if (hoursElement) hoursElement.textContent = '00';
            if (minutesElement) minutesElement.textContent = '00';
            if (secondsElement) secondsElement.textContent = '00';
        }
    }
    
    // Initial call
    updateCountdown();
}
