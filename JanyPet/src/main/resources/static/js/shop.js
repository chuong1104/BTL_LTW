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
                loadingElement.remove();
            }
            
            // Render categories
            if (categories && categories.length > 0) {
                // Keep the "All" category at the top
                const allItem = categoryList.querySelector('.cat-item');
                categoryList.innerHTML = '';
                categoryList.appendChild(allItem);
                
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
                
                // Highlight "All" if no category selected
                if (!this.state.filter.category) {
                    allItem.querySelector('a').classList.add('active');
                }
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
        
        if (!productContainer) return;
        
        try {
            // Show loading indicators
            if (loadingElement) {
                loadingElement.style.display = 'block';
            }
            if (paginationLoading) {
                paginationLoading.style.display = 'inline-block';
            }
            
            // Update product count info
            document.querySelector('.showing-product p').textContent = 'Loading products...';
            
            // Get products from API
            let products = [];
            if (window.ShopProductService) {
                // Use appropriate method based on filters
                if (this.state.filter.category) {
                    products = await window.ShopProductService.getProductsByCategory(this.state.filter.category);
                } else if (this.state.filter.search) {
                    products = await window.ShopProductService.searchProducts(this.state.filter.search);
                } else {
                    products = await window.ShopProductService.getAllProducts();
                }
            } else if (window.apiService) {
                // Fallback to general API
                const params = {};
                if (this.state.filter.category) params.category = this.state.filter.category;
                if (this.state.filter.tag) params.tag = this.state.filter.tag;
                if (this.state.filter.search) params.search = this.state.filter.search;
                products = await window.apiService.getProducts(params);
            } else {
                console.error('No product service available');
                throw new Error('Product service not available');
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
            document.querySelector('.showing-product p').textContent = 
                `Showing ${startIndex + 1}–${Math.min(endIndex, totalItems)} of ${totalItems} results`;
            
            // Hide loading indicator
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            // Clear container
            productContainer.innerHTML = '';
            
            // If no products, show message
            if (!productsToShow || productsToShow.length === 0) {
                productContainer.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h4>Không tìm thấy sản phẩm</h4>
                        <p class="text-muted">Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm.</p>
                        <a href="shop.html" class="btn btn-outline-primary mt-3">Xem tất cả sản phẩm</a>
                    </div>
                `;
            } else {
                // Render products
                this.renderProducts(productsToShow, productContainer);
            }
            
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
                        <button class="btn btn-outline-primary" onclick="ShopHandler.loadProducts()">
                            <i class="fas fa-sync-alt me-1"></i> Thử lại
                        </button>
                    </div>
                `;
            }
            
            if (paginationLoading) {
                paginationLoading.style.display = 'none';
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
        products.forEach(product => {
            const productCol = document.createElement('div');
            productCol.className = 'col-md-4 my-4';
            productCol.dataset.productId = product.id;
            
            // Create rating stars
            const ratingStars = Array(5).fill('').map((_, i) => 
                `<iconify-icon icon="clarity:star-solid" class="text-primary"></iconify-icon>`
            ).join('');
            
            // Format price
            const formattedPrice = this.formatCurrency(product.price);
            
            productCol.innerHTML = `
                <div class="card position-relative" data-category="${product.categoryId || ''}" data-tags="${product.tags || ''}">
                    <a href="single-product.html?id=${product.id}">
                        <img src="${product.imageUrl || 'images/placeholder.jpg'}" class="img-fluid rounded-4" alt="${product.name}">
                    </a>
                    <div class="card-body p-0">
                        <a href="single-product.html?id=${product.id}">
                            <h3 class="card-title pt-4 m-0">${product.name}</h3>
                        </a>
                        <div class="card-text">
                            <span class="rating secondary-font">
                                ${ratingStars}
                                ${product.rating || '5.0'}
                            </span>
                            <h3 class="secondary-font text-primary">${formattedPrice}</h3>
                            <div class="d-flex flex-wrap mt-3">
                                <a href="#" class="btn-cart me-3 px-4 pt-3 pb-3"
                                   onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.imageUrl || 'images/placeholder.jpg'}', 1); return false;">
                                    <h5 class="text-uppercase m-0">Thêm vào giỏ hàng</h5>
                                </a>
                                <a href="#" class="btn-wishlist px-4 pt-3" 
                                   onclick="addToWishlist('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.imageUrl || 'images/placeholder.jpg'}'); return false;">
                                    <iconify-icon icon="fluent:heart-28-filled" class="fs-5"></iconify-icon>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(productCol);
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