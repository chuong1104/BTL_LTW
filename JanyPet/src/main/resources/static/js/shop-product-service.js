/**
 * Shop Product Service - Handles loading and displaying products/categories on the shop frontend
 */
window.ShopProductService = (function() {
    // Base API endpoints
    const PRODUCT_API = "/api/products";
    const CATEGORY_API = "/api/categories";

    // Event listeners
    let productChangeListeners = [];
    let categoryChangeListeners = [];

    /**
     * Fetch all products from the API
     * Only active products are returned from the default endpoint
     */
    const getAllProducts = async () => {
        try {
            const response = await fetch(PRODUCT_API);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const products = await response.json();
            // Additional filter to ensure only active products are shown on frontend
            return products.filter(product => product.isActive !== false);
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    };

    /**
     * Fetch all categories from the API
     */
    const getAllCategories = async () => {
        try {
            const response = await fetch(CATEGORY_API);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching categories:", error);
            return [];
        }
    };

    /**
     * Fetch products by category ID
     */
    const getProductsByCategory = async (categoryId) => {
        try {
            const allProducts = await getAllProducts(); // This already filters for active products
            return allProducts.filter(product => product.categoryId === categoryId);
        } catch (error) {
            console.error("Error filtering products by category:", error);
            return [];
        }
    };

    /**
     * Renders the category sections on the homepage
     */
    const renderCategoriesSection = async () => {
        try {
            const categories = await getAllCategories();
            const categoriesContainer = document.querySelector('#categories .row.g-4');
            
            if (!categoriesContainer || !categories.length) return;
            
            let categoriesHTML = '';
            
            categories.forEach((category, index) => {
                // Only show up to 6 categories on homepage
                if (index < 6) {
                    categoriesHTML += `
                        <div class="col-lg-2 col-md-4 col-6">
                            <div class="categories-card hover-effect">
                                <a href="shop.html?category=${category.id}" class="categories-item text-center d-block p-3 rounded-4 bg-white shadow-sm">
                                    <div class="icon-wrapper mb-3">
                                        <i class="fas fa-paw category-icon"></i>
                                    </div>
                                    <h5 class="m-0">${category.name}</h5>
                                </a>
                            </div>
                        </div>
                    `;
                }
            });
            
            categoriesContainer.innerHTML = categoriesHTML;
        } catch (error) {
            console.error("Error rendering categories:", error);
        }
    };

    /**
     * Renders the best selling products section
     */
    const renderBestSellingProducts = async () => {
        try {
            const products = await getAllProducts(); // Only get active products
            const productsContainer = document.querySelector('.bestselling-swiper .swiper-wrapper');
            
            if (!productsContainer || !products.length) return;
            
            let productsHTML = '';
            
            // Just get first 5 products for best selling
            products.slice(0, 5).forEach(product => {
                const imageUrl = product.imageUrl || 'images/item5.jpg'; // Fallback image
                
                productsHTML += `
                    <div class="swiper-slide">
                        <div class="card position-relative">
                            <a href="single-product.html?id=${product.id}">
                                <img src="${imageUrl}" class="img-fluid rounded-4" alt="${product.name}">
                            </a>
                            <div class="card-body p-0">
                                <a href="single-product.html?id=${product.id}">
                                    <h3 class="card-title pt-4 m-0">${product.name}</h3>
                                </a>
                                <div class="card-text">
                                    <span class="rating secondary-font">
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                    </span>
                                    5.0
                                    <p class="product-desc">${product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : 'No description available'}</p>
                                    <h3 class="secondary-font text-primary">$${parseFloat(product.price).toFixed(2)}</h3>
                                    <div class="d-flex flex-wrap mt-3">
                                        <a href="#" class="btn-cart me-2 rounded-circle btn-outline-primary d-inline-flex align-items-center justify-content-center" 
                                           onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${imageUrl}', 1); return false;">
                                            <i class="fas fa-shopping-cart"></i>
                                        </a>
                                        <a href="#" class="btn-wishlist me-2 rounded-circle btn-outline-danger d-inline-flex align-items-center justify-content-center">
                                            <i class="fas fa-heart"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            productsContainer.innerHTML = productsHTML;
            
            // Reinitialize the swiper
            if (typeof Swiper !== 'undefined' && productsHTML !== '') {
                new Swiper('.bestselling-swiper', {
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
                        640: {
                            slidesPerView: 2,
                        },
                        768: {
                            slidesPerView: 3,
                        },
                        1024: {
                            slidesPerView: 4,
                        },
                    },
                });
            }
        } catch (error) {
            console.error("Error rendering best selling products:", error);
        }
    };

    /**
     * Renders the clothing products section
     */
    const renderClothingProducts = async () => {
        try {
            const products = await getAllProducts();
            const productsContainer = document.querySelector('.products-carousel .swiper-wrapper');
            
            if (!productsContainer || !products.length) return;
            
            let productsHTML = '';
            
            // Get different set of products for clothing section
            products.slice(3, 7).forEach(product => {
                const imageUrl = product.imageUrl || 'images/item3.jpg'; // Fallback image
                
                productsHTML += `
                    <div class="swiper-slide">
                        <div class="card position-relative">
                            <a href="single-product.html?id=${product.id}">
                                <img src="${imageUrl}" class="img-fluid rounded-4" alt="${product.name}">
                            </a>
                            <div class="card-body p-0">
                                <a href="single-product.html?id=${product.id}">
                                    <h3 class="card-title pt-4 m-0">${product.name}</h3>
                                </a>
                                <div class="card-text">
                                    <span class="rating secondary-font">
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                    </span>
                                    5.0
                                    <p class="product-desc">${product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : 'No description available'}</p>
                                    <h3 class="secondary-font text-primary">$${parseFloat(product.price).toFixed(2)}</h3>
                                    <div class="d-flex flex-wrap mt-3">
                                        <a href="#" class="btn-cart me-2 rounded-circle btn-outline-primary d-inline-flex align-items-center justify-content-center" 
                                           onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${imageUrl}', 1); return false;">
                                            <i class="fas fa-shopping-cart"></i>
                                        </a>
                                        <a href="#" class="btn-wishlist me-2 rounded-circle btn-outline-danger d-inline-flex align-items-center justify-content-center">
                                            <i class="fas fa-heart"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            productsContainer.innerHTML = productsHTML;
            
            // Reinitialize the swiper
            if (typeof Swiper !== 'undefined' && productsHTML !== '') {
                new Swiper('.products-carousel', {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true,
                    },
                    breakpoints: {
                        640: {
                            slidesPerView: 2,
                        },
                        768: {
                            slidesPerView: 3,
                        },
                        1024: {
                            slidesPerView: 4,
                        },
                    },
                });
            }
        } catch (error) {
            console.error("Error rendering clothing products:", error);
        }
    };

    /**
     * Renders the foodies section with category filters
     */
    const renderFoodiesSection = async () => {
        try {
            const products = await getAllProducts();
            const categories = await getAllCategories();
            const productsContainer = document.querySelector('.isotope-container');
            const filterContainer = document.querySelector('#foodies .section-header .mb-4');
            
            if (!productsContainer || !products.length || !filterContainer) return;
            
            // Generate category filter buttons
            let categoriesHTML = `<p class="m-0">
                <button class="filter-button me-4 active" data-filter="*">ALL</button>`;
                
            categories.forEach(category => {
                categoriesHTML += `
                    <button class="filter-button me-4" data-filter=".${category.id.toLowerCase()}">${category.name.toUpperCase()}</button>`;
            });
            
            categoriesHTML += `</p>`;
            filterContainer.innerHTML = categoriesHTML;
            
            // Generate products HTML
            let productsHTML = '';
            
            products.forEach(product => {
                const imageUrl = product.imageUrl || 'images/item9.jpg'; // Fallback image
                const categoryClass = product.categoryId ? product.categoryId.toLowerCase() : 'uncategorized';
                
                productsHTML += `
                    <div class="item ${categoryClass} col-md-4 col-lg-3 my-4">
                        <div class="card position-relative">
                            <a href="single-product.html?id=${product.id}">
                                <img src="${imageUrl}" class="img-fluid rounded-4" alt="${product.name}">
                            </a>
                            <div class="card-body p-0">
                                <a href="single-product.html?id=${product.id}">
                                    <h3 class="card-title pt-4 m-0">${product.name}</h3>
                                </a>
                                <div class="card-text">
                                    <span class="rating secondary-font">
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                        <iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>
                                    </span>
                                    5.0
                                    <p class="product-desc">${product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : 'No description available'}</p>
                                    <h3 class="secondary-font text-primary">$${parseFloat(product.price).toFixed(2)}</h3>
                                    <div class="d-flex flex-wrap mt-3">
                                        <a href="#" class="btn-cart me-2 rounded-circle btn-outline-primary d-inline-flex align-items-center justify-content-center" 
                                           onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${imageUrl}', 1); return false;">
                                            <i class="fas fa-shopping-cart"></i>
                                        </a>
                                        <a href="#" class="btn-wishlist me-2 rounded-circle btn-outline-danger d-inline-flex align-items-center justify-content-center">
                                            <i class="fas fa-heart"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            productsContainer.innerHTML = productsHTML;
            
            // Initialize isotope filtering if library exists
            if (typeof Isotope !== 'undefined' && productsHTML !== '') {
                const iso = new Isotope(productsContainer, {
                    itemSelector: '.item',
                    layoutMode: 'fitRows'
                });
                
                // Filter buttons functionality
                document.querySelectorAll('.filter-button').forEach(button => {
                    button.addEventListener('click', function() {
                        const filterValue = this.getAttribute('data-filter');
                        
                        // Remove active class from all buttons
                        document.querySelectorAll('.filter-button').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        
                        // Add active class to clicked button
                        this.classList.add('active');
                        
                        if (filterValue === '*') {
                            iso.arrange({ filter: '*' });
                        } else {
                            iso.arrange({ filter: filterValue });
                        }
                    });
                });
            } else {
                // Basic filtering when Isotope is not available
                document.querySelectorAll('.filter-button').forEach(button => {
                    button.addEventListener('click', function() {
                        const filterValue = this.getAttribute('data-filter');
                        
                        // Remove active class from all buttons
                        document.querySelectorAll('.filter-button').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        
                        // Add active class to clicked button
                        this.classList.add('active');
                        
                        if (filterValue === '*') {
                            document.querySelectorAll('.item').forEach(item => {
                                item.style.display = 'block';
                            });
                        } else {
                            document.querySelectorAll('.item').forEach(item => {
                                if (item.classList.contains(filterValue.substring(1))) {
                                    item.style.display = 'block';
                                } else {
                                    item.style.display = 'none';
                                }
                            });
                        }
                    });
                });
            }
        } catch (error) {
            console.error("Error rendering foodies section:", error);
        }
    };

    /**
     * Initialize all product sections on the homepage
     */
    const initializeHomepage = () => {
        renderCategoriesSection();
        renderBestSellingProducts();
        renderClothingProducts();
        renderFoodiesSection();
    };

    /**
     * Observer notification methods
     */
    const notifyProductChange = () => {
        productChangeListeners.forEach(listener => listener());
    };

    const notifyCategoryChange = () => {
        categoryChangeListeners.forEach(listener => listener());
    };

    const addProductChangeListener = (listener) => {
        if (typeof listener === 'function') {
            productChangeListeners.push(listener);
        }
    };

    const addCategoryChangeListener = (listener) => {
        if (typeof listener === 'function') {
            categoryChangeListeners.push(listener);
        }
    };

    /**
     * Public API
     */
    return {
        initializeHomepage,
        getAllProducts,
        getAllCategories,
        getProductsByCategory,
        renderCategoriesSection,
        renderBestSellingProducts,
        renderClothingProducts,
        renderFoodiesSection,
        notifyProductChange,
        notifyCategoryChange,
        addProductChangeListener,
        addCategoryChangeListener
    };
})();