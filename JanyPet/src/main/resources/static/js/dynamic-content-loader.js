/**
 * Dynamic Content Loader
 * Handles loading real data from APIs to replace mock content
 */

const DynamicContentLoader = {
    /**
     * Initialize all dynamic content loading
     */
    init: function() {
        // Load all dynamic content sections
        this.loadCategories();
        this.loadBestSellingProducts();
        this.loadPetClothing();
        this.loadPetFood();
        this.loadServices();
        this.loadTestimonials();
        this.loadBlogPosts();
        this.loadInstagramFeed();
    },

    /**
     * Load category data from API
     */
    loadCategories: async function() {
        const categoryContainer = document.querySelector('#categories .row:not(#categories .row.text-center)');
        const loadingElement = document.getElementById('categories-loading');
        
        if (!categoryContainer) return;
        
        try {
            // Show loading indicator
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }
            
            // Get categories from API
            let categories = [];
            if (window.CategoryService && typeof window.CategoryService.getAllCategories === 'function') {
                categories = await window.CategoryService.getAllCategories();
            } else if (window.apiService && typeof window.apiService.getCategories === 'function') {
                categories = await window.apiService.getCategories();
            } else {
                console.error('No category service available');
                throw new Error('Category service not available');
            }
            
            // Remove loading indicator and clear container
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            categoryContainer.innerHTML = '';
            
            // If no categories, show message
            if (!categories || categories.length === 0) {
                categoryContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <p>No categories found. Check back soon!</p>
                    </div>
                `;
                return;
            }
            
            // Render each category
            categories.forEach(category => {
                // Create category icon based on name or use default
                let iconClass = 'fa-paw'; // default
                if (category.name) {
                    const nameLower = category.name.toLowerCase();
                    if (nameLower.includes('food')) iconClass = 'fa-drumstick-bite';
                    else if (nameLower.includes('toy')) iconClass = 'fa-baseball-ball';
                    else if (nameLower.includes('cloth')) iconClass = 'fa-tshirt';
                    else if (nameLower.includes('access')) iconClass = 'fa-tags';
                    else if (nameLower.includes('health')) iconClass = 'fa-heartbeat';
                }
                
                const categoryCard = document.createElement('div');
                categoryCard.className = 'col-6 col-md-4 col-lg-3';
                categoryCard.innerHTML = `
                    <a href="shop.html?category=${category.id}" class="text-decoration-none">
                        <div class="card h-100 border-0 shadow-sm rounded-4 text-center category-card">
                            <div class="card-body p-4">
                                <div class="category-icon mb-3">
                                    <i class="fas ${iconClass} fa-2x text-primary"></i>
                                </div>
                                <h3 class="card-title h5">${category.name}</h3>
                                <p class="card-text small text-muted">${category.productCount || ''} sản phẩm</p>
                            </div>
                        </div>
                    </a>
                `;
                categoryContainer.appendChild(categoryCard);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            categoryContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-danger">Unable to load categories. Please try again later.</p>
                </div>
            `;
        }
    },

    /**
     * Load best selling products from API
     */
    loadBestSellingProducts: async function() {
        const productContainer = document.querySelector('.bestselling-swiper .swiper-wrapper');
        const loadingElement = document.getElementById('bestselling-loading');
        
        if (!productContainer) return;
        
        try {
            // Check if product service is available, use mock data if not
            if (!window.ProductService) {
                console.warn('Product service not available, initializing fallback');
                window.ProductService = {
                    getAllProducts: async function() {
                        return [
                            {
                                id: 'p001',
                                name: 'Áo hoodie cho chó',
                                price: 170000,
                                description: 'Áo hoodie ấm áp cho thú cưng',
                                imageUrl: 'images/item8.jpg'
                            },
                            // Add more mock products
                        ];
                    },
                    getImageUrl: function(url) {
                        return url || 'images/placeholder.jpg';
                    }
                };
            }
            
            // Show loading indicator
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }
            
            // Get products from API
            let products = [];
            if (window.ShopProductService && typeof window.ShopProductService.getBestSellingProducts === 'function') {
                products = await window.ShopProductService.getBestSellingProducts();
            } else if (window.apiService && typeof window.apiService.getProducts === 'function') {
                products = await window.apiService.getProducts({ sort: 'bestselling', limit: 8 });
            } else {
                console.error('No product service available');
                throw new Error('Product service not available');
            }
            
            // Remove loading and clear container
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            productContainer.innerHTML = '';
            
            // If no products, show message
            if (!products || products.length === 0) {
                productContainer.innerHTML = `
                    <div class="swiper-slide text-center">
                        <p>No products found. Check back soon!</p>
                    </div>
                `;
                return;
            }
            
            // Render each product
            products.forEach(product => {
                const productSlide = document.createElement('div');
                productSlide.className = 'swiper-slide';
                
                // Calculate discount percentage if applicable
                let discountBadge = '';
                if (product.originalPrice && product.originalPrice > product.price) {
                    const discountPercentage = Math.round((1 - (product.price / product.originalPrice)) * 100);
                    discountBadge = `<span class="badge bg-danger position-absolute top-0 start-0 m-2">-${discountPercentage}%</span>`;
                }
                
                // Create product card
                productSlide.innerHTML = `
                    <div class="card position-relative product-card-hover h-100 border-0 shadow-sm rounded-4">
                        ${discountBadge}
                        <div class="img-hover-zoom position-relative">
                            <a href="single-product.html?id=${product.id}" class="d-block">
                                <img src="${product.imageUrl || '/images/placeholder.jpg'}" class="card-img-top rounded-top-4" alt="${product.name}" style="height: 220px; object-fit: cover;">
                            </a>
                            <div class="product-actions position-absolute start-50 bottom-0 translate-middle-x mb-3 d-flex gap-2">
                                <button class="btn-cart rounded-circle btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center"
                                        onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.imageUrl || '/images/placeholder.jpg'}', 1); return false;">
                                    <i class="fas fa-shopping-cart"></i>
                                </button>
                                <button class="btn-wishlist rounded-circle btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center"
                                        onclick="addToWishlist('${product.id}', '${product.name}', ${product.price}, '${product.imageUrl || '/images/placeholder.jpg'}'); return false;">
                                    <i class="fas fa-heart"></i>
                                </button>
                                <button class="btn-quickview rounded-circle btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center" 
                                        data-bs-toggle="modal" data-bs-target="#quickViewModal" data-product-id="${product.id}">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body p-3">
                            <h3 class="card-title h6">${product.name}</h3>
                            <div class="rating small mb-2">
                                <i class="fas fa-star text-warning"></i>
                                <i class="fas fa-star text-warning"></i>
                                <i class="fas fa-star text-warning"></i>
                                <i class="fas fa-star text-warning"></i>
                                <i class="fas fa-star text-warning"></i>
                                <span class="text-primary">5.0</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="text-primary fw-bold">${this.formatCurrency(product.price)}</span>
                                ${product.originalPrice ? `<del class="ms-2 text-muted small">${this.formatCurrency(product.originalPrice)}</del>` : ''}
                            </div>
                        </div>
                    </div>
                `;
                
                productContainer.appendChild(productSlide);
            });
            
            // Reinitialize swiper if it exists
            if (window.Swiper && typeof window.bestsellingSwiper !== 'undefined') {
                window.bestsellingSwiper.destroy();
                window.bestsellingSwiper = new Swiper('.bestselling-swiper', {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    pagination: {
                        el: '.bestselling-swiper .swiper-pagination',
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.bestselling-swiper .swiper-button-next',
                        prevEl: '.bestselling-swiper .swiper-button-prev',
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
        } catch (error) {
            console.error('Error loading best selling products:', error);
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            productContainer.innerHTML = `
                <div class="swiper-slide text-center">
                    <p class="text-danger">Unable to load products. Please try again later.</p>
                </div>
            `;
        }
    },

    /**
     * Load pet clothing products from API
     */
    loadPetClothing: async function() {
        const productContainer = document.querySelector('#clothing .swiper-wrapper');
        const loadingElement = document.getElementById('clothing-loading');
        
        if (!productContainer) return;
        
        try {
            // Show loading indicator
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }
            
            // Get clothing products from API
            let products = [];
            if (window.ShopProductService && typeof window.ShopProductService.getProductsByCategory === 'function') {
                // Find clothing category ID - this might need to be adapted based on your data structure
                const categories = await window.CategoryService.getAllCategories();
                const clothingCategory = categories.find(cat => 
                    cat.name.toLowerCase().includes('cloth') || 
                    cat.name.toLowerCase().includes('apparel')
                );
                
                if (clothingCategory) {
                    products = await window.ShopProductService.getProductsByCategory(clothingCategory.id);
                } else {
                    // Fallback to all products if clothing category not found
                    products = await window.ShopProductService.getAllProducts();
                    products = products.slice(0, 8); // Limit to 8 products
                }
            } else if (window.apiService && typeof window.apiService.getProducts === 'function') {
                products = await window.apiService.getProducts({ category: 'clothing', limit: 8 });
            } else {
                console.error('No product service available');
                throw new Error('Product service not available');
            }
            
            // Clear loading indicator
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            productContainer.innerHTML = '';
            
            // If no products found, show message
            if (!products || products.length === 0) {
                productContainer.innerHTML = `
                    <div class="swiper-slide text-center">
                        <p>No clothing products found. Check back soon!</p>
                    </div>
                `;
                return;
            }
            
            // Similar rendering logic as loadBestSellingProducts but for clothing products
            products.forEach(product => {
                const productSlide = document.createElement('div');
                productSlide.className = 'swiper-slide';
                
                // Similar product card HTML as before
                // (code similar to the best selling products section with minor adaptations)
                productSlide.innerHTML = `
                    <div class="card position-relative product-card-hover h-100 border-0 shadow-sm rounded-4">
                        <div class="img-hover-zoom position-relative">
                            <a href="single-product.html?id=${product.id}" class="d-block">
                                <img src="${product.imageUrl || '/images/placeholder.jpg'}" class="card-img-top rounded-top-4" alt="${product.name}" style="height: 220px; object-fit: cover;">
                            </a>
                            <div class="product-actions position-absolute start-50 bottom-0 translate-middle-x mb-3 d-flex gap-2">
                                <button class="btn-cart rounded-circle btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center"
                                        onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.imageUrl || '/images/placeholder.jpg'}', 1); return false;">
                                    <i class="fas fa-shopping-cart"></i>
                                </button>
                                <button class="btn-wishlist rounded-circle btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center"
                                        onclick="addToWishlist('${product.id}', '${product.name}', ${product.price}, '${product.imageUrl || '/images/placeholder.jpg'}'); return false;">
                                    <i class="fas fa-heart"></i>
                                </button>
                                <button class="btn-quickview rounded-circle btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center" 
                                        data-bs-toggle="modal" data-bs-target="#quickViewModal" data-product-id="${product.id}">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body p-3">
                            <h3 class="card-title h6">${product.name}</h3>
                            <div class="rating small mb-2">
                                <i class="fas fa-star text-warning"></i>
                                <i class="fas fa-star text-warning"></i>
                                <i class="fas fa-star text-warning"></i>
                                <i class="fas fa-star text-warning"></i>
                                <i class="fas fa-star text-warning"></i>
                                <span class="text-primary">5.0</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="text-primary fw-bold">${this.formatCurrency(product.price)}</span>
                                ${product.originalPrice ? `<del class="ms-2 text-muted small">${this.formatCurrency(product.originalPrice)}</del>` : ''}
                            </div>
                        </div>
                    </div>
                `;
                
                productContainer.appendChild(productSlide);
            });
            
            // Reinitialize swiper for clothing section
            if (window.Swiper) {
                const clothingSwiper = new Swiper('#clothing .products-carousel', {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    pagination: {
                        el: '#clothing .swiper-pagination',
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
        } catch (error) {
            console.error('Error loading clothing products:', error);
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            productContainer.innerHTML = `
                <div class="swiper-slide text-center">
                    <p class="text-danger">Unable to load clothing products. Please try again later.</p>
                </div>
            `;
        }
    },

    /**
     * Load pet food products and categories from API
     */
    loadPetFood: async function() {
        const productContainer = document.querySelector('#foodies .isotope-container');
        const categoryFiltersContainer = document.getElementById('category-filters-loading').parentElement;
        const loadingElement = document.getElementById('foodies-loading');
        
        if (!productContainer || !categoryFiltersContainer) return;
        
        try {
            // Show loading indicator
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }
            
            // Get categories for filters
            let categories = [];
            if (window.CategoryService && typeof window.CategoryService.getAllCategories === 'function') {
                categories = await window.CategoryService.getAllCategories();
                // Filter to only include food related categories
                categories = categories.filter(cat => 
                    cat.name.toLowerCase().includes('food') || 
                    cat.name.toLowerCase().includes('treat')
                );
            }
            
            // Get food products from API
            let products = [];
            if (window.ShopProductService && typeof window.ShopProductService.getProductsByCategory === 'function') {
                // Find food category IDs
                const foodCategoryIds = categories.map(cat => cat.id);
                
                if (foodCategoryIds.length > 0) {
                    // Get products for each food category
                    const productPromises = foodCategoryIds.map(categoryId => 
                        window.ShopProductService.getProductsByCategory(categoryId)
                    );
                    
                    const productsArrays = await Promise.all(productPromises);
                    products = productsArrays.flat();
                } else {
                    // Fallback to all products if no food categories found
                    products = await window.ShopProductService.getAllProducts();
                    products = products.slice(0, 12); // Limit to 12 products
                }
            } else if (window.apiService && typeof window.apiService.getProducts === 'function') {
                products = await window.apiService.getProducts({ category: 'food', limit: 12 });
            } else {
                console.error('No product service available');
                throw new Error('Product service not available');
            }
            
            // Remove loading indicator
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            // Update category filters
            document.getElementById('category-filters-loading').style.display = 'none';
            // Clear all filters except the "ALL" button
            const allFilterButton = categoryFiltersContainer.querySelector('.filter-button');
            categoryFiltersContainer.innerHTML = '';
            categoryFiltersContainer.appendChild(allFilterButton);
            
            // Add category filter buttons
            categories.forEach(category => {
                const filterButton = document.createElement('button');
                filterButton.className = 'filter-button me-4';
                filterButton.setAttribute('data-filter', category.id);
                filterButton.textContent = category.name;
                categoryFiltersContainer.appendChild(filterButton);
            });
            
            // Clear product container
            productContainer.innerHTML = '';
            
            // If no products found, show message
            if (!products || products.length === 0) {
                productContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <p>No food products found. Check back soon!</p>
                    </div>
                `;
                return;
            }
            
            // Render food products
            products.forEach(product => {
                const productCol = document.createElement('div');
                productCol.className = 'col-sm-6 col-lg-3 mb-4 isotope-item';
                productCol.setAttribute('data-category', product.categoryId || '');
                
                productCol.innerHTML = `
                    <div class="card position-relative product-card-hover h-100 border-0 shadow-sm rounded-4">
                        <div class="img-hover-zoom position-relative">
                            <a href="single-product.html?id=${product.id}" class="d-block">
                                <img src="${product.imageUrl || '/images/placeholder.jpg'}" class="card-img-top rounded-top-4" alt="${product.name}" style="height: 200px; object-fit: cover;">
                            </a>
                            <div class="product-actions position-absolute start-50 bottom-0 translate-middle-x mb-3 d-flex gap-2">
                                <button class="btn-cart rounded-circle btn-sm btn-outline-primary d-inline-flex align-items-center justify-content-center"
                                        onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.imageUrl || '/images/placeholder.jpg'}', 1); return false;">
                                    <i class="fas fa-shopping-cart"></i>
                                </button>
                                <button class="btn-wishlist rounded-circle btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center"
                                        onclick="addToWishlist('${product.id}', '${product.name}', ${product.price}, '${product.imageUrl || '/images/placeholder.jpg'}'); return false;">
                                    <i class="fas fa-heart"></i>
                                </button>
                                <button class="btn-quickview rounded-circle btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center" 
                                        data-bs-toggle="modal" data-bs-target="#quickViewModal" data-product-id="${product.id}">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body p-3">
                            <h3 class="card-title h6">${product.name}</h3>
                            <div class="d-flex align-items-center justify-content-between">
                                <span class="text-primary fw-bold">${this.formatCurrency(product.price)}</span>
                                <div class="rating small">
                                    <i class="fas fa-star text-warning"></i>
                                    <span>5.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                productContainer.appendChild(productCol);
            });
            
            // Setup isotope filtering if available
            if (window.Isotope) {
                const iso = new Isotope('.isotope-container', {
                    itemSelector: '.isotope-item',
                    layoutMode: 'fitRows'
                });
                
                // Setup filter button click handler
                document.querySelectorAll('.filter-button').forEach(button => {
                    button.addEventListener('click', function() {
                        const filterValue = this.getAttribute('data-filter');
                        
                        // Remove 'active' class from all buttons and add to clicked
                        document.querySelectorAll('.filter-button').forEach(btn => {
                            btn.classList.remove('active');
                        });
                        this.classList.add('active');
                        
                        // Apply filter
                        if (filterValue === '*') {
                            iso.arrange({ filter: '*' });
                        } else {
                            iso.arrange({ filter: `[data-category="${filterValue}"]` });
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Error loading pet food products:', error);
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            document.getElementById('category-filters-loading').style.display = 'none';
            productContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-danger">Unable to load food products. Please try again later.</p>
                </div>
            `;
        }
    },

    /**
     * Load blog posts from API
     */
    loadBlogPosts: async function() {
        const blogContainer = document.querySelector('#latest-blog .row:nth-child(2)');
        
        if (!blogContainer) return;
        
        try {
            // Create loading indicator
            blogContainer.innerHTML = `
                <div class="col-12 text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Đang tải bài viết...</p>
                </div>
            `;
            
            // Get blog posts from API
            let blogPosts = [];
            if (window.BlogService && typeof window.BlogService.getRecentPosts === 'function') {
                blogPosts = await window.BlogService.getRecentPosts(3);
            } else if (window.apiService && typeof window.apiService.getBlogPosts === 'function') {
                blogPosts = await window.apiService.getBlogPosts({ limit: 3 });
            } else {
                // Mock blog data structure for demo until API is ready
                blogPosts = [
                    { id: 1, title: 'Loading blog posts...', excerpt: 'Blog content will be available soon.', date: new Date(), imageUrl: '/images/placeholder.jpg' }
                ];
                console.warn('No blog service available, showing placeholder');
            }
            
            // Clear container
            blogContainer.innerHTML = '';
            
            // If no posts, show message
            if (!blogPosts || blogPosts.length === 0) {
                blogContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <p>No blog posts available. Check back soon for exciting content!</p>
                    </div>
                `;
                return;
            }
            
            // Render blog posts
            blogPosts.forEach(post => {
                const date = new Date(post.date);
                const day = date.getDate();
                const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
                
                const postCol = document.createElement('div');
                postCol.className = 'col-md-4 my-4 my-md-0';
                
                postCol.innerHTML = `
                    <div class="z-1 position-absolute rounded-3 m-2 px-3 pt-1 bg-light">
                        <h3 class="secondary-font text-primary m-0">${day}</h3>
                        <p class="secondary-font fs-6 m-0">${month}</p>
                    </div>
                    <div class="card position-relative">
                        <a href="single-post.html?id=${post.id}">
                            <img src="${post.imageUrl || '/images/placeholder.jpg'}" class="img-fluid rounded-4" alt="${post.title}">
                        </a>
                        <div class="card-body p-0">
                            <a href="single-post.html?id=${post.id}">
                                <h3 class="card-title pt-4 pb-3 m-0">${post.title}</h3>
                            </a>
                            <div class="card-text">
                                <p class="blog-paragraph fs-6">${post.excerpt || 'Click to read this blog post.'}</p>
                                <a href="single-post.html?id=${post.id}" class="blog-read">read more</a>
                            </div>
                        </div>
                    </div>
                `;
                
                blogContainer.appendChild(postCol);
            });
        } catch (error) {
            console.error('Error loading blog posts:', error);
            blogContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-danger">Unable to load blog posts. Please try again later.</p>
                </div>
            `;
        }
    },

    /**
     * Load testimonials/reviews
     */
    loadTestimonials: async function() {
        const testimonialContainer = document.querySelector('#testimonial .swiper-wrapper');
        
        if (!testimonialContainer) return;
        
        try {
            // Add loading indicator
            testimonialContainer.innerHTML = `
                <div class="swiper-slide">
                    <div class="row">
                        <div class="col-12 text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2">Đang tải đánh giá...</p>
                        </div>
                    </div>
                </div>
            `;
            
            // Get testimonials from API
            let testimonials = [];
            if (window.TestimonialService && typeof window.TestimonialService.getAllTestimonials === 'function') {
                testimonials = await window.TestimonialService.getAllTestimonials();
            } else if (window.apiService && typeof window.apiService.getTestimonials === 'function') {
                testimonials = await window.apiService.getTestimonials();
            } else {
                console.warn('No testimonial service available');
                // This section will show loading until API is ready
                setTimeout(() => {
                    this.loadTestimonials(); // Try again after 5 seconds
                }, 5000);
                return;
            }
            
            // Clear container
            testimonialContainer.innerHTML = '';
            
            // If no testimonials, show message
            if (!testimonials || testimonials.length === 0) {
                testimonialContainer.innerHTML = `
                    <div class="swiper-slide">
                        <div class="row">
                            <div class="col-12 text-center py-5">
                                <p>No testimonials available yet. Be the first to leave a review!</p>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }
            
            // Render testimonials
            testimonials.forEach(testimonial => {
                const testimonialSlide = document.createElement('div');
                testimonialSlide.className = 'swiper-slide';
                
                testimonialSlide.innerHTML = `
                    <div class="row">
                        <div class="col-2">
                            <iconify-icon icon="ri:double-quotes-l" class="quote-icon text-primary"></iconify-icon>
                        </div>
                        <div class="col-md-10 mt-md-5 p-5 pt-0 pt-md-5">
                            <p class="testimonial-content fs-2">${testimonial.content}</p>
                            <p class="text-black">- ${testimonial.customerName}</p>
                        </div>
                    </div>
                `;
                
                testimonialContainer.appendChild(testimonialSlide);
            });
            
            // Reinitialize testimonial swiper
            if (window.Swiper && typeof window.testimonialSwiper !== 'undefined') {
                window.testimonialSwiper.destroy();
                window.testimonialSwiper = new Swiper('.testimonial-swiper', {
                    pagination: {
                        el: '.testimonial-swiper .swiper-pagination',
                        clickable: true
                    }
                });
            }
        } catch (error) {
            console.error('Error loading testimonials:', error);
            testimonialContainer.innerHTML = `
                <div class="swiper-slide">
                    <div class="row">
                        <div class="col-12 text-center py-5">
                            <p class="text-danger">Unable to load testimonials. Please try again later.</p>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Load Instagram feed
     */
    loadInstagramFeed: async function() {
        const instaContainer = document.querySelector('#insta .row');
        
        if (!instaContainer) return;
        
        try {
            // Add loading indicator
            instaContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Đang tải hình ảnh Instagram...</p>
                </div>
            `;
            
            // Get Instagram posts
            let instaPosts = [];
            if (window.SocialMediaService && typeof window.SocialMediaService.getInstagramFeed === 'function') {
                instaPosts = await window.SocialMediaService.getInstagramFeed(6);
            } else if (window.apiService && typeof window.apiService.getInstagramPosts === 'function') {
                instaPosts = await window.apiService.getInstagramPosts({ limit: 6 });
            } else {
                console.warn('No social media service available');
                // If no service is available, just remove loading and leave placeholder images
                setTimeout(() => {
                    document.querySelector('#insta .row .col-12')?.remove();
                }, 1000);
                return;
            }
            
            // Clear container
            instaContainer.innerHTML = '';
            
            // If no posts, use placeholder images
            if (!instaPosts || instaPosts.length === 0) {
                // Add placeholder message
                instaContainer.innerHTML = `
                    <div class="col-12 text-center py-3">
                        <p>Connect with us on Instagram for the latest updates!</p>
                    </div>
                `;
                return;
            }
            
            // Render Instagram posts
            instaPosts.forEach(post => {
                const instaItem = document.createElement('div');
                instaItem.className = 'col instagram-item text-center position-relative';
                
                instaItem.innerHTML = `
                    <div class="icon-overlay d-flex justify-content-center position-absolute">
                        <iconify-icon class="text-white" icon="la:instagram"></iconify-icon>
                    </div>
                    <a href="${post.link || '#'}" target="_blank">
                        <img src="${post.imageUrl}" alt="Instagram post" class="img-fluid rounded-3">
                    </a>
                `;
                
                instaContainer.appendChild(instaItem);
            });
        } catch (error) {
            console.error('Error loading Instagram feed:', error);
            instaContainer.innerHTML = `
                <div class="col-12 text-center py-3">
                    <p class="text-danger">Unable to load Instagram feed. Please check back later.</p>
                </div>
            `;
        }
    },

    /**
     * Load services data
     */
    loadServices: async function() {
        // This is already static content designed to match your services, 
        // but we could fetch from an API if needed in the future
        console.log('Services section uses static content by design');
    },

    /**
     * Format currency value
     * @param {number} value - Amount to format
     * @returns {string} - Formatted currency string
     */
    formatCurrency: function(value) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(value);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    DynamicContentLoader.init();
});