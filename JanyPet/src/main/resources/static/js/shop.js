/**
 * Xử lý hiển thị sản phẩm trên trang shop.html
 */
const ShopManager = {
    /**
     * Khởi tạo các sự kiện và tải dữ liệu ban đầu
     */
    init: async function() {
        try {
            console.log('Initializing Shop Manager...');
            
            // Tải danh mục và cập nhật sidebar
            await this.loadCategories();
            
            // Tải tất cả sản phẩm hoặc theo filter nếu có
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get('cat');
            const tagParam = urlParams.get('tag');
            const searchParam = urlParams.get('search');
            
            if (categoryParam) {
                // Lọc theo danh mục từ URL
                await this.loadProductsByTag('category', categoryParam);
            } else if (tagParam) {
                // Lọc theo tag từ URL
                await this.loadProductsByTag('tag', tagParam);
            } else if (searchParam) {
                // Lọc theo search từ URL
                await this.searchProducts(searchParam);
            } else {
                // Tải tất cả sản phẩm
                await this.loadAllProducts();
            }
            
            // Thiết lập các sự kiện cho filter
            this.setupEventListeners();
            
            // Listen for shop data updates
            window.addEventListener('product-updated', () => {
                console.log('Product update detected, refreshing products display');
                this.refreshCurrentView();
            });
            
            window.addEventListener('category-updated', () => {
                console.log('Category update detected, refreshing categories');
                this.loadCategories();
            });
        } catch (error) {
            console.error('Error initializing shop page:', error);
            this.showErrorMessage('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
        }
    },
    
    /**
     * Refresh the current view based on URL parameters
     */
    refreshCurrentView: async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('cat');
        const tagParam = urlParams.get('tag');
        const searchParam = urlParams.get('search');
        
        if (categoryParam) {
            await this.loadProductsByTag('category', categoryParam);
        } else if (tagParam) {
            await this.loadProductsByTag('tag', tagParam);
        } else if (searchParam) {
            await this.searchProducts(searchParam);
        } else {
            await this.loadAllProducts();
        }
    },
    
    /**
     * Tải danh sách danh mục và cập nhật sidebar
     */
    loadCategories: async function() {
        try {
            let categories;
            
            // Use ShopProductService if available, otherwise fallback to direct API call
            if (window.ShopProductService) {
                categories = await window.ShopProductService.getAllCategories();
            } else {
                categories = await window.CategoryService.getAllCategories();
            }
            
            // Cập nhật danh mục trong sidebar
            const categoryList = document.querySelector('.product-categories');
            
            if (categoryList) {
                // Xóa danh mục hiện tại trừ "Tất cả"
                while (categoryList.children.length > 0) {
                    categoryList.removeChild(categoryList.lastChild);
                }
                
                // Add "All Products" category first
                const allLi = document.createElement('li');
                allLi.className = 'cat-item';
                
                const allLink = document.createElement('a');
                allLink.href = 'shop.html';
                allLink.className = 'nav-link';
                allLink.textContent = 'Tất cả sản phẩm';
                
                allLi.appendChild(allLink);
                categoryList.appendChild(allLi);
                
                // Thêm danh mục từ API
                categories.forEach(category => {
                    const li = document.createElement('li');
                    li.className = 'cat-item';
                    
                    const a = document.createElement('a');
                    a.href = `shop.html?cat=${category.id}`;
                    a.className = 'nav-link';
                    a.textContent = category.name;
                    
                    li.appendChild(a);
                    categoryList.appendChild(li);
                });
            }
            
            // Cập nhật dropdown menu trong navbar
            const navDropdown = document.querySelector('.dropdown-menu');
            if (navDropdown) {
                // Xóa các mục hiện tại trừ "Tất cả sản phẩm"
                while (navDropdown.children.length > 1) {
                    navDropdown.removeChild(navDropdown.firstChild);
                }
                
                // Thêm danh mục từ API
                categories.forEach(category => {
                    const li = document.createElement('li');
                    
                    const a = document.createElement('a');
                    a.href = `shop.html?cat=${category.id}`;
                    a.className = 'dropdown-item';
                    a.textContent = category.name;
                    
                    li.appendChild(a);
                    // Chèn vào đầu danh sách, trước divider
                    navDropdown.insertBefore(li, navDropdown.lastChild.previousSibling);
                });
            }
            
            // Update sort dropdown to include categories
            const sortSelect = document.querySelector('.filter-categories');
            if (sortSelect) {
                // Keep only the sorting options
                const sortOptions = Array.from(sortSelect.options).filter(
                    option => option.value.includes('-')
                );
                
                sortSelect.innerHTML = '';
                
                // Add back the sorting options
                sortOptions.forEach(option => {
                    sortSelect.appendChild(option);
                });
                
                // Add separator
                const separator = document.createElement('option');
                separator.disabled = true;
                separator.textContent = '─────────────';
                sortSelect.appendChild(separator);
                
                // Add category options
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = `category-${category.id}`;
                    option.textContent = `Category: ${category.name}`;
                    sortSelect.appendChild(option);
                });
            }
            
            return categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            throw error;
        }
    },
    
    /**
     * Tải tất cả sản phẩm và hiển thị
     */
    loadAllProducts: async function() {
        try {
            let products;
            
            // Use ShopProductService if available, otherwise fallback to direct API call
            if (window.ShopProductService) {
                products = await window.ShopProductService.getAllProducts();
            } else {
                products = await window.ProductService.getAllProducts();
            }
            
            // Fetch categories to associate names with products
            let categories;
            if (window.ShopProductService) {
                categories = await window.ShopProductService.getAllCategories();
            } else {
                categories = await window.CategoryService.getAllCategories();
            }
            
            // Create a map of category IDs to names
            const categoryMap = {};
            categories.forEach(category => {
                categoryMap[category.id] = category.name;
            });
            
            // Add category names to products
            products.forEach(product => {
                product.categoryName = categoryMap[product.categoryId] || 'Uncategorized';
            });
            
            this.displayProducts(products);
            
            // Update page title
            document.title = "JanyPet - Tất cả sản phẩm";
            const pageTitle = document.querySelector('#banner .display-1');
            if (pageTitle) pageTitle.textContent = "Tất cả sản phẩm";
        } catch (error) {
            console.error('Error loading all products:', error);
            throw error;
        }
    },
    
    /**
     * Tải sản phẩm theo tag hoặc danh mục
     * @param {string} type - Loại filter ('category' hoặc 'tag')
     * @param {string} value - Giá trị của filter
     */
    loadProductsByTag: async function(type, value) {
        try {
            let products;
            let filteredProducts;
            
            // Use ShopProductService if available
            if (window.ShopProductService) {
                if (type === 'category') {
                    // Get products directly by category if the service supports it
                    products = await window.ShopProductService.getProductsByCategory(value);
                    filteredProducts = products;
                } else {
                    // For tags, we need to filter all products
                    products = await window.ShopProductService.getAllProducts();
                    filteredProducts = products.filter(product => {
                        return product.description && product.description.toLowerCase().includes(value.toLowerCase());
                    });
                }
            } else {
                // Fallback to direct API calls
                products = await window.ProductService.getAllProducts();
                
                if (type === 'category') {
                    filteredProducts = products.filter(product => product.categoryId === value);
                } else {
                    filteredProducts = products.filter(product => {
                        return product.description && product.description.toLowerCase().includes(value.toLowerCase());
                    });
                }
            }
            
            // Fetch categories for category names
            let categories;
            if (window.ShopProductService) {
                categories = await window.ShopProductService.getAllCategories();
            } else {
                categories = await window.CategoryService.getAllCategories();
            }
            
            // Create a map of category IDs to names
            const categoryMap = {};
            categories.forEach(category => {
                categoryMap[category.id] = category.name;
            });
            
            // Add category names to products
            filteredProducts.forEach(product => {
                product.categoryName = categoryMap[product.categoryId] || 'Uncategorized';
            });
            
            if (type === 'category') {
                // Cập nhật tiêu đề trang nếu có
                const category = categories.find(cat => cat.id === value);
                if (category) {
                    document.title = `JanyPet - ${category.name}`;
                    const pageTitle = document.querySelector('#banner .display-1');
                    if (pageTitle) pageTitle.textContent = category.name;
                }
            } else if (type === 'tag') {
                // Cập nhật tiêu đề trang
                document.title = `JanyPet - Tag: ${value}`;
                const pageTitle = document.querySelector('#banner .display-1');
                if (pageTitle) pageTitle.textContent = `Tag: ${value}`;
            }
            
            this.displayProducts(filteredProducts || []);
        } catch (error) {
            console.error(`Error loading products by ${type}:`, error);
            throw error;
        }
    },
    
    /**
     * Search products by name or description
     * @param {string} searchTerm - Search keyword
     */
    searchProducts: async function(searchTerm) {
        try {
            let products;
            
            // Use ShopProductService if available, otherwise fallback to direct API call
            if (window.ShopProductService) {
                products = await window.ShopProductService.getAllProducts();
            } else {
                products = await window.ProductService.getAllProducts();
            }
            
            const filteredProducts = products.filter(product => {
                return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
            });
            
            // Fetch categories for category names
            let categories;
            if (window.ShopProductService) {
                categories = await window.ShopProductService.getAllCategories();
            } else {
                categories = await window.CategoryService.getAllCategories();
            }
            
            // Create a map of category IDs to names
            const categoryMap = {};
            categories.forEach(category => {
                categoryMap[category.id] = category.name;
            });
            
            // Add category names to products
            filteredProducts.forEach(product => {
                product.categoryName = categoryMap[product.categoryId] || 'Uncategorized';
            });
            
            // Update page title
            document.title = `JanyPet - Search: ${searchTerm}`;
            const pageTitle = document.querySelector('#banner .display-1');
            if (pageTitle) pageTitle.textContent = `Search: ${searchTerm}`;
            
            this.displayProducts(filteredProducts);
        } catch (error) {
            console.error('Error searching products:', error);
            this.showErrorMessage('Có lỗi xảy ra khi tìm kiếm sản phẩm.');
        }
    },
    
    /**
     * Hiển thị danh sách sản phẩm lên giao diện
     * @param {Array} products - Mảng các sản phẩm cần hiển thị
     */
    displayProducts: function(products) {
        const productGrid = document.querySelector('.product-grid');
        
        if (!productGrid) {
            console.error('Product grid element not found');
            return;
        }
        
        // Xóa tất cả sản phẩm hiện có
        productGrid.innerHTML = '';
        
        // Hiển thị thông báo nếu không có sản phẩm
        if (!products || products.length === 0) {
            productGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <h3>Không tìm thấy sản phẩm nào</h3>
                    <p>Vui lòng thử tìm kiếm khác hoặc xem tất cả sản phẩm của chúng tôi.</p>
                    <a href="shop.html" class="btn btn-primary mt-3">Xem tất cả sản phẩm</a>
                </div>
            `;
            return;
        }
        
        // Cập nhật số lượng sản phẩm hiển thị
        const showingProduct = document.querySelector('.showing-product p');
        if (showingProduct) {
            showingProduct.textContent = `Showing 1–${products.length} of ${products.length} results`;
        }
        
        // Tạo HTML cho từng sản phẩm
        products.forEach(product => {
            // Format giá sản phẩm
            const formattedPrice = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0
            }).format(product.price);
            
            // Tạo element cho sản phẩm
            const productEl = document.createElement('div');
            productEl.className = 'col-md-4 my-4';
            productEl.innerHTML = `
                <div class="card position-relative" data-category="${product.categoryId}" data-tags="${product.categoryName?.toLowerCase() || ''}">
                    <a href="single-product.html?id=${product.id}">
                        <img src="${product.imageUrl}" class="img-fluid rounded-4" alt="${product.name}">
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
                                5.0
                            </span>
                            <h3 class="secondary-font text-primary">${formattedPrice}</h3>
                            <div class="d-flex flex-wrap mt-3">
                                <a href="#" class="btn-cart me-3 px-4 pt-3 pb-3" 
                                   onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.imageUrl}', 1); return false;">
                                    <h5 class="text-uppercase m-0">Thêm vào giỏ hàng</h5>
                                </a>
                                <a href="wishlist.html" class="btn-wishlist px-4 pt-3">
                                    <iconify-icon icon="fluent:heart-28-filled" class="fs-5"></iconify-icon>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            productGrid.appendChild(productEl);
        });
    },
    
    /**
     * Thiết lập các sự kiện cho trang shop
     */
    setupEventListeners: function() {
        // Xử lý tìm kiếm
        const searchForms = document.querySelectorAll('#search-form');
        searchForms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const searchInput = form.querySelector('input');
                if (searchInput && searchInput.value.trim()) {
                    const searchTerm = searchInput.value.trim();
                    
                    try {
                        const products = await ProductService.getAllProducts();
                        const filteredProducts = products.filter(product => {
                            return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
                        });
                        
                        this.displayProducts(filteredProducts);
                        
                        // Cập nhật URL không làm mới trang
                        const url = new URL(window.location);
                        url.searchParams.set('search', searchTerm);
                        window.history.pushState({}, '', url);
                        
                        // Cập nhật tiêu đề
                        const pageTitle = document.querySelector('#banner .display-1');
                        if (pageTitle) pageTitle.textContent = `Search: ${searchTerm}`;
                    } catch (error) {
                        console.error('Error searching products:', error);
                        this.showErrorMessage('Có lỗi xảy ra khi tìm kiếm sản phẩm.');
                    }
                }
            });
        });
        
        // Xử lý sắp xếp sản phẩm
        const sortSelect = document.querySelector('.filter-categories');
        if (sortSelect) {
            sortSelect.addEventListener('change', async () => {
                try {
                    const products = await ProductService.getAllProducts();
                    const sortValue = sortSelect.value;
                    
                    let sortedProducts = [...products];
                    
                    switch (sortValue) {
                        case 'name-asc':
                            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                            break;
                        case 'name-desc':
                            sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
                            break;
                        case 'price-asc':
                            sortedProducts.sort((a, b) => a.price - b.price);
                            break;
                        case 'price-desc':
                            sortedProducts.sort((a, b) => b.price - a.price);
                            break;
                        default:
                            // Giữ nguyên thứ tự mặc định
                            break;
                    }
                    
                    this.displayProducts(sortedProducts);
                } catch (error) {
                    console.error('Error sorting products:', error);
                    this.showErrorMessage('Có lỗi xảy ra khi sắp xếp sản phẩm.');
                }
            });
        }
    },
    
    /**
     * Hiển thị thông báo lỗi cho người dùng
     * @param {string} message - Nội dung thông báo lỗi
     */
    showErrorMessage: function(message) {
        const productGrid = document.querySelector('.product-grid');
        
        if (productGrid) {
            const errorMessage = document.createElement('div');
            errorMessage.className = 'col-12 alert alert-danger';
            errorMessage.textContent = message;
            
            productGrid.innerHTML = '';
            productGrid.appendChild(errorMessage);
        } else {
            alert(message);
        }
    }
};

// Khởi tạo khi document ready
document.addEventListener('DOMContentLoaded', function() {
    ShopManager.init();
});