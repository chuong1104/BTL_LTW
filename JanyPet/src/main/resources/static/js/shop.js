/**
 * Shop page functionality
 * Handles loading products, categories, and managing filters
 */
const ShopHandler = {
    // State management
    state: {
        products: [],
        categories: [],
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: 9,
        filter: {
            category: null,
            tag: null,
            search: '',
            priceRange: null,
            sortBy: 'default'
        }
    },

    /**
     * Initialize shop functionality
     */
    initialize: async function() {
        console.log('Initializing shop page...');
        
        // Get URL parameters
        this.parseUrlParams();
        
        // Initialize filter dropdowns and events
        this.setupFilterEvents();
        
        // Load data
        await Promise.all([
            this.loadCategories(),
            this.loadProducts()
        ]);
        
        // Load Instagram feed
        this.loadInstagramFeed();
        
        // Setup search functionality
        this.setupSearch();
        
        console.log('Shop initialization complete');
    },
    
    /**
     * Parse URL parameters for filtering
     */
    parseUrlParams: function() {
        const params = new URLSearchParams(window.location.search);
        
        // Get filter params
        const category = params.get('cat');
        const tag = params.get('tag');
        const search = params.get('keyword');
        const page = params.get('page');
        const sort = params.get('sort');
        const priceMin = params.get('min');
        const priceMax = params.get('max');
        
        // Update state with URL parameters
        if (category) this.state.filter.category = category;
        if (tag) this.state.filter.tag = tag;
        if (search) this.state.filter.search = search;
        if (sort) this.state.filter.sortBy = sort;
        
        // Set price range if both min and max are provided
        if (priceMin && priceMax) {
            this.state.filter.priceRange = {
                min: parseInt(priceMin),
                max: parseInt(priceMax)
            };
        }
        
        // Set current page, default to 1
        if (page && !isNaN(parseInt(page))) {
            this.state.currentPage = parseInt(page);
        } else if (page === 'prev') {
            this.state.currentPage = Math.max(1, this.state.currentPage - 1);
        } else if (page === 'next') {
            this.state.currentPage = Math.min(this.state.totalPages, this.state.currentPage + 1);
        }
        
        console.log('URL parameters parsed:', this.state.filter);
    },
    
    /**
     * Set up filter events
     */
    setupFilterEvents: function() {
        // Set up sorting dropdown
        const sortDropdown = document.querySelector('.filter-categories');
        if (sortDropdown) {
            // Set initial value based on state
            if (this.state.filter.sortBy) {
                Array.from(sortDropdown.options).forEach(option => {
                    if (option.value === this.state.filter.sortBy) {
                        option.selected = true;
                    }
                });
            }
            
            // Add change event
            sortDropdown.addEventListener('change', async (e) => {
                this.state.filter.sortBy = e.target.value;
                this.state.currentPage = 1; // Reset to first page when changing filters
                
                // Update URL without reloading page
                const url = new URL(window.location);
                if (this.state.filter.sortBy) {
                    url.searchParams.set('sort', this.state.filter.sortBy);
                } else {
                    url.searchParams.delete('sort');
                }
                url.searchParams.delete('page'); // Reset page parameter
                window.history.pushState({}, '', url);
                
                // Reload products with new filter
                await this.loadProducts();
            });
        }
        
        // Set up price filter links
        document.querySelectorAll('.widget-price-filter .tags-item a').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const text = e.target.textContent.trim();
                let priceRange = null;
                
                // Parse price ranges from text
                if (text.includes('Dưới')) {
                    priceRange = { min: 0, max: 100000 };
                } else if (text.includes('Trên')) {
                    priceRange = { min: 400000, max: Infinity };
                } else {
                    const rangeParts = text.split('-').map(part => 
                        parseInt(part.replace(/\D/g, ''))
                    );
                    priceRange = { min: rangeParts[0], max: rangeParts[1] };
                }
                
                this.state.filter.priceRange = priceRange;
                this.state.currentPage = 1; // Reset to first page
                
                // Update URL
                const url = new URL(window.location);
                url.searchParams.set('min', priceRange.min);
                url.searchParams.set('max', priceRange.max);
                url.searchParams.delete('page'); // Reset page parameter
                window.history.pushState({}, '', url);
                
                // Highlight active price filter
                document.querySelectorAll('.widget-price-filter .tags-item a').forEach(a => 
                    a.classList.remove('active'));
                e.target.classList.add('active');
                
                // Reload products
                await this.loadProducts();
            });
        });
    },
    
    /**
     * Set up search functionality
     */
    setupSearch: function() {
        // Handle search form submissions
        const searchForms = document.querySelectorAll('#search-form-header, #search-form-sidebar');
        searchForms.forEach(form => {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const searchInput = form.querySelector('input[type="text"]');
                if (!searchInput) return;
                
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    this.state.filter.search = searchTerm;
                    this.state.currentPage = 1; // Reset to first page
                    
                    // Update URL
                    const url = new URL(window.location);
                    url.searchParams.set('keyword', searchTerm);
                    url.searchParams.delete('page'); // Reset page parameter
                    window.history.pushState({}, '', url);
                    
                    // Reload products
                    await this.loadProducts();
                }
            });
        });
        
        // Populate search input with current search term if any
        if (this.state.filter.search) {
            document.querySelectorAll('#searchInputHeader, #searchInputSidebar').forEach(input => {
                input.value = this.state.filter.search;
            });
        }
    },
    
    /**
     * Load categories from API
     */
    loadCategories: async function() {
        const categoryList = document.getElementById('category-list');
        const loadingElement = document.getElementById('categories-loading');
        
        if (!categoryList) return;
        
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
            
            // Update state
            this.state.categories = categories;
            
            // Remove loading indicator
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            // Clear the category list
            categoryList.innerHTML = '';
            
            // Add "All" category at the top
            const allItem = document.createElement('li');
            allItem.className = 'cat-item';
            const allLink = document.createElement('a');
            allLink.href = 'shop.html';
            allLink.className = !this.state.filter.category ? 'nav-link active' : 'nav-link';
            allLink.textContent = 'Tất cả sản phẩm';
            
            // Add click event for "All" category
            allLink.addEventListener('click', async (e) => {
                e.preventDefault();
                this.state.filter.category = null;
                this.state.currentPage = 1;
                
                // Update URL
                const url = new URL(window.location);
                url.searchParams.delete('cat');
                url.searchParams.delete('page');
                window.history.pushState({}, '', url);
                
                // Update active class
                document.querySelectorAll('#category-list .nav-link').forEach(link => 
                    link.classList.remove('active'));
                allLink.classList.add('active');
                
                // Reload products
                await this.loadProducts();
            });
            
            allItem.appendChild(allLink);
            categoryList.appendChild(allItem);
            
            // Render categories
            if (categories && categories.length > 0) {
                // Add categories
                categories.forEach(category => {
                    const li = document.createElement('li');
                    li.className = 'cat-item';
                    
                    const a = document.createElement('a');
                    a.href = `shop.html?cat=${category.id}`;
                    a.className = this.state.filter.category === category.id ? 'nav-link active' : 'nav-link';
                    a.textContent = category.name;
                    
                    // Add click event
                    a.addEventListener('click', async (e) => {
                        e.preventDefault();
                        this.state.filter.category = category.id;
                        this.state.currentPage = 1; // Reset to first page
                        
                        // Update URL
                        const url = new URL(window.location);
                        url.searchParams.set('cat', category.id);
                        url.searchParams.delete('page'); // Reset page
                        window.history.pushState({}, '', url);
                        
                        // Highlight active category
                        document.querySelectorAll('#category-list .nav-link').forEach(link => 
                            link.classList.remove('active'));
                        a.classList.add('active');
                        
                        // Reload products
                        await this.loadProducts();
                    });
                    
                    li.appendChild(a);
                    categoryList.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            if (loadingElement) {
                loadingElement.innerHTML = `
                    <span class="nav-link text-danger">
                        <i class="fas fa-exclamation-circle me-1"></i>
                        Unable to load categories
                    </span>
                `;
            }
        }
    },
    
    /**
     * Load products from API
     */
    loadProducts: async function() {
        const productContainer = document.getElementById('product-container');
        const loadingElement = document.getElementById('products-loading');
        const paginationContainer = document.getElementById('pagination-container');
        const paginationLoading = document.getElementById('pagination-loading');
        const productCountElement = document.getElementById('product-count');
        
        if (!productContainer) return;
        
        try {
            // Show loading indicators
            if (loadingElement) loadingElement.style.display = 'block';
            if (paginationLoading) paginationLoading.style.display = 'inline-block';
            if (productCountElement) productCountElement.textContent = 'Loading products...';
            
            // Get products from API
            let products = [];
            
            try {
                if (window.ShopProductService) {
                    // Use appropriate method based on filters
                    if (this.state.filter.category) {
                        products = await window.ShopProductService.getProductsByCategory(this.state.filter.category);
                        console.log('Loaded products by category:', this.state.filter.category, products);
                    } else if (this.state.filter.search) {
                        products = await window.ShopProductService.searchProducts(this.state.filter.search);
                        console.log('Loaded products by search:', this.state.filter.search, products);
                    } else {
                        products = await window.ShopProductService.getAllProducts();
                        console.log('Loaded all products:', products);
                    }
                } else {
                    console.warn('ShopProductService not available, trying to use fallback');
                    products = [];
                    
                    // Try to get mock data for development
                    try {
                        const mockResponse = await fetch('data/mock-products.json');
                        if (mockResponse.ok) {
                            products = await mockResponse.json();
                            console.log('Loaded mock products:', products);
                        }
                    } catch (mockError) {
                        console.error('Could not load mock data:', mockError);
                    }
                }
            } catch (apiError) {
                console.error('API error:', apiError);
                products = [];  // Fallback to empty array
            }
            
            // Hide loading indicators
            if (loadingElement) loadingElement.style.display = 'none';
            
            // Check if we got any products
            if (!products || products.length === 0) {
                if (this.state.filter.category) {
                    productContainer.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <i class="fas fa-exclamation-circle text-warning fa-3x mb-3"></i>
                            <h4>Không thể tải sản phẩm</h4>
                            <p class="text-muted">Không thể tải sản phẩm cho danh mục này. Vui lòng thử lại sau.</p>
                            <button class="btn btn-outline-primary mt-3" onclick="window.location.href='shop.html'">
                                <i class="fas fa-arrow-left me-2"></i> Xem tất cả sản phẩm
                            </button>
                        </div>
                    `;
                } else {
                    productContainer.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <i class="fas fa-search fa-3x text-muted mb-3"></i>
                            <h4>Không tìm thấy sản phẩm</h4>
                            <p class="text-muted">Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm.</p>
                        </div>
                    `;
                }
                
                // Update product count
                if (productCountElement) productCountElement.textContent = 'Không có sản phẩm';
                
                // Hide pagination
                if (paginationContainer) paginationContainer.innerHTML = '';
                if (paginationLoading) paginationLoading.style.display = 'none';
                
                return;
            }
            
            // Apply additional filters client-side
            products = this.applyClientSideFilters(products);
            
            // Update state
            this.state.products = products;
            
            // Calculate pagination
            const totalItems = products.length;
            this.state.totalPages = Math.ceil(totalItems / this.state.itemsPerPage);
            
            // Adjust current page if it's out of bounds
            if (this.state.currentPage > this.state.totalPages) {
                this.state.currentPage = Math.max(1, this.state.totalPages);
            }
            
            // Get products for current page
            const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
            const endIndex = startIndex + this.state.itemsPerPage;
            const productsToShow = products.slice(startIndex, endIndex);
            
            // Update product count info
            if (productCountElement) {
                productCountElement.textContent = 
                    `Hiển thị ${startIndex + 1}–${Math.min(endIndex, totalItems)} của ${totalItems} sản phẩm`;
            }
            
            // Render products
            this.renderProducts(productsToShow, productContainer);
            
            // Update pagination
            this.updatePagination(paginationContainer, paginationLoading);
            
        } catch (error) {
            console.error('Error loading products:', error);
            
            if (loadingElement) {
                loadingElement.style.display = 'none';
                productContainer.innerHTML = `
                    <div class="col-12 text-center py-4">
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            Không thể tải sản phẩm. Vui lòng thử lại sau.
                        </div>
                        <button class="btn btn-outline-primary" onclick="location.reload()">
                            <i class="fas fa-sync-alt me-1"></i> Thử lại
                        </button>
                    </div>
                `;
            }
            
            if (paginationLoading) {
                paginationLoading.style.display = 'none';
            }
            
            if (paginationContainer) {
                paginationContainer.innerHTML = '';
            }
        }
    },
    
    /**
     * Apply client-side filters to products
     */
    applyClientSideFilters: function(products) {
        if (!products) return [];
        
        let filtered = [...products];
        
        // Apply tag filter if set
        if (this.state.filter.tag) {
            filtered = filtered.filter(product => 
                product.tags && product.tags.includes(this.state.filter.tag)
            );
        }
        
        // Apply price range filter if set
        if (this.state.filter.priceRange) {
            const { min, max } = this.state.filter.priceRange;
            filtered = filtered.filter(product => 
                product.price >= min && (max === Infinity || product.price <= max)
            );
        }
        
        // Apply sorting
        if (this.state.filter.sortBy) {
            switch(this.state.filter.sortBy) {
                case 'name-asc':
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    filtered.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'price-asc':
                    filtered.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filtered.sort((a, b) => b.price - a.price);
                    break;
                case 'rating-desc':
                    filtered.sort((a, b) => b.rating - a.rating);
                    break;
                case 'rating-asc':
                    filtered.sort((a, b) => a.rating - b.rating);
                    break;
                // Default sorting is handled by the server or remains as is
            }
        }
        
        return filtered;
    },
    
    /**
     * Render products to container
     */
    renderProducts: function(products, container) {
        if (!products || !container) return;
        
        // Clear container first
        container.innerHTML = '';
        
        products.forEach(product => {
            const productEl = document.createElement('div');
            productEl.className = 'col-lg-4 col-md-6 col-sm-6';
            productEl.dataset.productId = product.id;
            
            // Calculate discount percentage if there's a sale price
            let discountBadge = '';
            if (product.salePrice && product.price > product.salePrice) {
                const discount = Math.round(((product.price - product.salePrice) / product.price) * 100);
                discountBadge = `<span class="discount-badge">-${discount}%</span>`;
            }
            
            // Format the price display
            const price = this.formatCurrency(product.price);
            const salePrice = product.salePrice ? this.formatCurrency(product.salePrice) : null;
            const priceDisplay = salePrice ? 
                `<span class="product-price">${salePrice} <del class="text-muted ms-2 small">${price}</del></span>` :
                `<span class="product-price">${price}</span>`;
            
            // Build the rating display if available
            let ratingDisplay = '';
            if (product.rating) {
                ratingDisplay = '<div class="rating">';
                for (let i = 0; i < 5; i++) {
                    if (i < Math.floor(product.rating)) {
                        ratingDisplay += '<i class="fas fa-star"></i>';
                    } else if (i < product.rating) {
                        ratingDisplay += '<i class="fas fa-star-half-alt"></i>';
                    } else {
                        ratingDisplay += '<i class="far fa-star"></i>';
                    }
                }
                ratingDisplay += '</div>';
            }
            
            productEl.innerHTML = `
                <div class="product-card">
                    <div class="product-image-container">
                        ${discountBadge}
                        <a href="single-product.html?id=${product.id}">
                            <img src="${product.imageUrl || 'images/placeholder.jpg'}" alt="${product.name}" class="card-img-top">
                        </a>
                        <div class="product-actions">
                            <button class="action-button add-to-cart" data-id="${product.id}" title="Thêm vào giỏ hàng">
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                            <button class="action-button add-to-wishlist" data-id="${product.id}" title="Thêm vào danh sách yêu thích">
                                <i class="fas fa-heart"></i>
                            </button>
                            <button class="action-button quick-view" data-id="${product.id}" title="Xem nhanh">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">
                            <a href="single-product.html?id=${product.id}" class="text-decoration-none">${product.name}</a>
                        </h3>
                        ${ratingDisplay}
                        ${priceDisplay}
                    </div>
                </div>
            `;
            
            container.appendChild(productEl);
        });
        
        // Add event listeners for the action buttons
        this.setupActionButtons();
    },

    /**
     * Set up action buttons for products
     */
    setupActionButtons: function() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                if (window.addToCart && productId) {
                    // Use existing addToCart function if available
                    window.addToCart(productId, 1);
                } else {
                    // Fallback implementation using productId
                    fetch(`/api/products/${productId}`)
                        .then(response => response.json())
                        .then(product => {
                            // Get or initialize cart
                            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
                            
                            // Check if product is already in cart
                            const existingItem = cart.find(item => item.id === productId);
                            if (existingItem) {
                                existingItem.quantity += 1;
                            } else {
                                // Add new item
                                cart.push({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    imageUrl: product.imageUrl || 'images/placeholder.jpg',
                                    quantity: 1
                                });
                            }
                            
                            // Save cart and update UI
                            localStorage.setItem('cart', JSON.stringify(cart));
                            
                            // Show success message
                            if (window.showToast) {
                                window.showToast('Đã thêm sản phẩm vào giỏ hàng', 'success');
                            } else {
                                alert('Đã thêm sản phẩm vào giỏ hàng');
                            }
                            
                            // Update cart count badge if exists
                            const cartCountBadges = document.querySelectorAll('.cart-count');
                            if (cartCountBadges) {
                                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                                cartCountBadges.forEach(badge => {
                                    badge.textContent = totalItems;
                                });
                            }
                        })
                        .catch(error => {
                            console.error('Error adding to cart:', error);
                            if (window.showToast) {
                                window.showToast('Có lỗi xảy ra khi thêm vào giỏ hàng', 'error');
                            } else {
                                alert('Có lỗi xảy ra khi thêm vào giỏ hàng');
                            }
                        });
                }
            });
        });
        
        // Add to wishlist buttons
        document.querySelectorAll('.add-to-wishlist').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                
                // Check if product is already in wishlist
                const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                const existingItemIndex = wishlist.findIndex(item => item.id === productId);
                
                if (existingItemIndex >= 0) {
                    // Show message that item is already in wishlist
                    if (window.showToast) {
                        window.showToast('Sản phẩm đã có trong danh sách yêu thích', 'info');
                    } else {
                        alert('Sản phẩm đã có trong danh sách yêu thích');
                    }
                } else {
                    // Add to wishlist
                    fetch(`/api/products/${productId}`)
                        .then(response => response.json())
                        .then(product => {
                            wishlist.push({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                imageUrl: product.imageUrl || 'images/placeholder.jpg',
                                inStock: product.inStock
                            });
                            localStorage.setItem('wishlist', JSON.stringify(wishlist));
                            
                            // Update wishlist count badge
                            document.querySelectorAll('.wishlist-count').forEach(el => {
                                el.textContent = wishlist.length;
                            });
                            
                            // Show success toast
                            if (window.showToast) {
                                window.showToast('Đã thêm sản phẩm vào danh sách yêu thích', 'success');
                            } else {
                                alert('Đã thêm sản phẩm vào danh sách yêu thích');
                            }
                        })
                        .catch(error => {
                            console.error('Error adding to wishlist:', error);
                            if (window.showToast) {
                                window.showToast('Có lỗi xảy ra khi thêm vào danh sách yêu thích', 'error');
                            } else {
                                alert('Có lỗi xảy ra khi thêm vào danh sách yêu thích');
                            }
                        });
                }
            });
        });
        
        // Quick view buttons
        document.querySelectorAll('.quick-view').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                // Redirect to product detail page for now
                window.location.href = `single-product.html?id=${productId}`;
            });
        });
    },
    
    /**
     * Update pagination controls
     */
    updatePagination: function(container, loadingElement) {
        if (!container) return;
        
        // Hide loading
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Clear container
        container.innerHTML = '';
        
        // If no pages or only one page, don't show pagination
        if (this.state.totalPages <= 1) return;
        
        // Create previous page button
        const prevBtn = document.createElement('a');
        prevBtn.className = 'pagination-arrow d-flex align-items-center mx-3';
        prevBtn.innerHTML = '<iconify-icon icon="ic:baseline-keyboard-arrow-left" class="pagination-arrow fs-1"></iconify-icon>';
        
        if (this.state.currentPage > 1) {
            prevBtn.href = `shop.html?page=${this.state.currentPage - 1}${this.getFilterQueryString()}`;
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.state.currentPage > 1) {
                    this.state.currentPage--;
                    this.updateUrl();
                    this.loadProducts();
                }
            });
        } else {
            prevBtn.classList.add('disabled');
            prevBtn.style.opacity = '0.5';
            prevBtn.style.pointerEvents = 'none';
        }
        
        container.appendChild(prevBtn);
        
        // Create page numbers
        let startPage = Math.max(1, this.state.currentPage - 2);
        let endPage = Math.min(this.state.totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            if (i === this.state.currentPage) {
                // Current page
                const currentPage = document.createElement('span');
                currentPage.className = 'page-numbers mt-2 fs-3 mx-3 current';
                currentPage.textContent = i;
                currentPage.setAttribute('aria-current', 'page');
                container.appendChild(currentPage);
            } else {
                // Other pages
                const pageLink = document.createElement('a');
                pageLink.className = 'page-numbers mt-2 fs-3 mx-3';
                pageLink.href = `shop.html?page=${i}${this.getFilterQueryString()}`;
                pageLink.textContent = i;
                
                pageLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.state.currentPage = i;
                    this.updateUrl();
                    this.loadProducts();
                });
                
                container.appendChild(pageLink);
            }
        }
        
        // Create next page button
        const nextBtn = document.createElement('a');
        nextBtn.className = 'pagination-arrow d-flex align-items-center mx-3';
        nextBtn.innerHTML = '<iconify-icon icon="ic:baseline-keyboard-arrow-right" class="pagination-arrow fs-1"></iconify-icon>';
        
        if (this.state.currentPage < this.state.totalPages) {
            nextBtn.href = `shop.html?page=${this.state.currentPage + 1}${this.getFilterQueryString()}`;
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.state.currentPage < this.state.totalPages) {
                    this.state.currentPage++;
                    this.updateUrl();
                    this.loadProducts();
                }
            });
        } else {
            nextBtn.classList.add('disabled');
            nextBtn.style.opacity = '0.5';
            nextBtn.style.pointerEvents = 'none';
        }
        
        container.appendChild(nextBtn);
    },
    
    /**
     * Update URL with current filters and page
     */
    updateUrl: function() {
        const url = new URL(window.location);
        
        // Set page
        url.searchParams.set('page', this.state.currentPage);
        
        // Add other filters
        if (this.state.filter.category) {
            url.searchParams.set('cat', this.state.filter.category);
        }
        
        if (this.state.filter.tag) {
            url.searchParams.set('tag', this.state.filter.tag);
        }
        
        if (this.state.filter.search) {
            url.searchParams.set('keyword', this.state.filter.search);
        }
        
        if (this.state.filter.sortBy) {
            url.searchParams.set('sort', this.state.filter.sortBy);
        }
        
        if (this.state.filter.priceRange) {
            url.searchParams.set('min', this.state.filter.priceRange.min);
            url.searchParams.set('max', this.state.filter.priceRange.max);
        }
        
        // Update URL without reloading
        window.history.pushState({}, '', url);
    },
    
    /**
     * Get query string for filters (excluding page)
     */
    getFilterQueryString: function() {
        const params = [];
        
        if (this.state.filter.category) {
            params.push(`cat=${this.state.filter.category}`);
        }
        
        if (this.state.filter.tag) {
            params.push(`tag=${this.state.filter.tag}`);
        }
        
        if (this.state.filter.search) {
            params.push(`keyword=${encodeURIComponent(this.state.filter.search)}`);
        }
        
        if (this.state.filter.sortBy) {
            params.push(`sort=${this.state.filter.sortBy}`);
        }
        
        if (this.state.filter.priceRange) {
            params.push(`min=${this.state.filter.priceRange.min}`);
            params.push(`max=${this.state.filter.priceRange.max}`);
        }
        
        return params.length ? `&${params.join('&')}` : '';
    },
    
    /**
     * Load Instagram feed
     */
    loadInstagramFeed: async function() {
        const container = document.getElementById('instagram-container');
        const loadingElement = document.getElementById('instagram-loading');
        
        if (!container) return;
        
        try {
            // Show loading indicator
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }
            
            // Get Instagram posts (if API available)
            let instaPosts = [];
            if (window.SocialMediaService && typeof window.SocialMediaService.getInstagramFeed === 'function') {
                instaPosts = await window.SocialMediaService.getInstagramFeed(6);
            } else if (window.apiService && typeof window.apiService.getInstagramPosts === 'function') {
                instaPosts = await window.apiService.getInstagramPosts({ limit: 6 });
            } else {
                console.warn('No social media service available, using placeholders');
                // Use placeholder data
                instaPosts = [
                    { imageUrl: 'images/insta1.jpg', link: '#' },
                    { imageUrl: 'images/insta2.jpg', link: '#' },
                    { imageUrl: 'images/insta3.jpg', link: '#' },
                    { imageUrl: 'images/insta4.jpg', link: '#' },
                    { imageUrl: 'images/insta5.jpg', link: '#' },
                    { imageUrl: 'images/insta6.jpg', link: '#' }
                ];
            }
            
            // Clear container and remove loading
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            container.innerHTML = '';
            
            // Render Instagram posts
            instaPosts.forEach(post => {
                const instaCol = document.createElement('div');
                instaCol.className = 'col instagram-item text-center position-relative';
                
                instaCol.innerHTML = `
                    <div class="icon-overlay d-flex justify-content-center position-absolute">
                        <iconify-icon class="text-white" icon="la:instagram"></iconify-icon>
                    </div>
                    <a href="${post.link || '#'}" target="_blank">
                        <img src="${post.imageUrl}" alt="Instagram image" class="img-fluid rounded-3">
                    </a>
                `;
                
                container.appendChild(instaCol);
            });
        } catch (error) {
            console.error('Error loading Instagram feed:', error);
            
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            container.innerHTML = `
                <div class="col-12 text-center">
                    <p>Connect with us on Instagram!</p>
                </div>
            `;
        }
    },
    
    /**
     * Format currency
     */
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    }
};

// Initialize shop handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ShopHandler.initialize();
});