/**
 * Product Detail Page Controller
 * Handles the functionality of the single product page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');
    
    // Initialize variables for the swiper instances
    let mainProductSlider;
    let thumbnailSlider;
    
    // Initialize cart button event listeners
    const initCartButtons = (product) => {
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        const buyNowBtn = document.getElementById('buy-now-btn');
        const quantityInput = document.getElementById('quantity');
        const quantityMinus = document.getElementById('quantity-minus');
        const quantityPlus = document.getElementById('quantity-plus');
        const wishlistBtn = document.getElementById('add-to-wishlist-btn');
        
        // Set max quantity based on stock
        if (quantityInput && product.stock) {
            quantityInput.setAttribute('max', product.stock);
        }
        
        // Disable add to cart and buy now buttons if out of stock
        if (product.stock <= 0) {
            if (addToCartBtn) {
                addToCartBtn.disabled = true;
                addToCartBtn.innerHTML = '<i class="fas fa-times me-2"></i>Hết hàng';
            }
            if (buyNowBtn) {
                buyNowBtn.disabled = true;
                buyNowBtn.innerHTML = '<i class="fas fa-times me-2"></i>Hết hàng';
            }
        }
        
        // Add to cart button click event
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
                
                // Get selected variant/size options if any
                const variantOption = document.querySelector('.color-toggle .select-item a.active');
                const sizeOption = document.querySelector('.swatch .select-item a.active');
                
                let variant = '';
                if (variantOption) {
                    variant += variantOption.closest('.select-item').getAttribute('data-val') || '';
                }
                if (sizeOption) {
                    variant += variant ? `, ${sizeOption.closest('.select-item').getAttribute('data-value')}` : sizeOption.closest('.select-item').getAttribute('data-value') || '';
                }
                
                // Add to cart
                window.addToCart(
                    product.id, 
                    product.name, 
                    product.price, 
                    product.imageUrl || '/images/placeholder.jpg',
                    quantity,
                    variant
                );
            });
        }
        
        // Buy now button click event
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
                
                // Get selected variant/size options
                const variantOption = document.querySelector('.color-toggle .select-item a.active');
                const sizeOption = document.querySelector('.swatch .select-item a.active');
                
                let variant = '';
                if (variantOption) {
                    variant += variantOption.closest('.select-item').getAttribute('data-val') || '';
                }
                if (sizeOption) {
                    variant += variant ? `, ${sizeOption.closest('.select-item').getAttribute('data-value')}` : sizeOption.closest('.select-item').getAttribute('data-value') || '';
                }
                
                // Add to cart
                window.addToCart(
                    product.id, 
                    product.name, 
                    product.price, 
                    product.imageUrl || '/images/placeholder.jpg',
                    quantity,
                    variant
                );
                
                // Redirect to checkout
                window.location.href = 'cart.html';
            });
        }
        
        // Quantity input controls
        if (quantityMinus) {
            quantityMinus.addEventListener('click', function() {
                if (quantityInput) {
                    let value = parseInt(quantityInput.value);
                    if (value > 1) {
                        quantityInput.value = value - 1;
                    }
                }
            });
        }
        
        if (quantityPlus) {
            quantityPlus.addEventListener('click', function() {
                if (quantityInput) {
                    let value = parseInt(quantityInput.value);
                    let max = parseInt(quantityInput.getAttribute('max')) || 10;
                    if (value < max) {
                        quantityInput.value = value + 1;
                    }
                }
            });
        }
        
        // Add to wishlist button
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Add to wishlist logic here
                console.log('Added to wishlist:', product.id);
                
                // Show success message
                if (window.ToastService) {
                    window.ToastService.showToast('Thành công', `Đã thêm ${product.name} vào danh sách yêu thích`, 'success');
                } else {
                    alert(`Đã thêm ${product.name} vào danh sách yêu thích`);
                }
            });
        }
    };
    
    // Initialize variant and size selection
    const initProductOptions = () => {
        // Variant selection
        const variantItems = document.querySelectorAll('.color-toggle .select-item a');
        variantItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all items
                variantItems.forEach(i => i.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');
            });
        });
        
        // Size selection
        const sizeItems = document.querySelectorAll('.swatch .select-item a');
        sizeItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all items
                sizeItems.forEach(i => i.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');
            });
        });
    };
    
    // Initialize product gallery
    const initProductGallery = () => {
        // Initialize thumbnail slider
        if (document.querySelector('.product-thumbnail-slider')) {
            thumbnailSlider = new Swiper('.product-thumbnail-slider', {
                slidesPerView: 4,
                spaceBetween: 10,
                freeMode: true,
                watchSlidesProgress: true,
            });
        }
        
        // Initialize main product slider
        if (document.querySelector('.product-large-slider')) {
            mainProductSlider = new Swiper('.product-large-slider', {
                slidesPerView: 1,
                spaceBetween: 10,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                thumbs: {
                    swiper: thumbnailSlider,
                },
            });
        }
    };
    
    // Load related products
    const loadRelatedProducts = async (product) => {
        const container = document.getElementById('related-products-container');
        if (!container) return;
        
        try {
            // Show loading state
            container.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Đang tải sản phẩm tương tự...</p></div>';
            
            // Get related products
            const relatedProducts = await ProductService.getRelatedProducts(product.id, 4);
            
            if (!relatedProducts || relatedProducts.length === 0) {
                container.innerHTML = '<div class="text-center py-4"><p>Không có sản phẩm tương tự.</p></div>';
                return;
            }
            
            // Clear container
            container.innerHTML = '';
            
            // Display related products
            relatedProducts.forEach(relatedProduct => {
                // Format price
                const formattedPrice = new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0
                }).format(relatedProduct.price);
                
                // Get product image
                let imageUrl = '/images/placeholder.jpg';
                if (relatedProduct.imageUrl) {
                    if (relatedProduct.imageUrl.startsWith('http')) {
                        imageUrl = relatedProduct.imageUrl;
                    } else {
                        imageUrl = `/uploads/${relatedProduct.imageUrl}`;
                    }
                }
                
                // Create product card
                const productCard = document.createElement('div');
                productCard.className = 'col-md-6 col-lg-3 mb-4';
                productCard.innerHTML = `
                    <div class="card product-card h-100 border-0 shadow-sm hover-effect">
                        <div class="position-relative">
                            <img src="${imageUrl}" class="card-img-top product-img" alt="${relatedProduct.name}" onerror="this.onerror=null; this.src='/images/placeholder.jpg';">
                            <div class="product-overlay d-flex justify-content-center">
                                <button class="btn btn-sm btn-primary rounded-circle quick-view-btn me-2" 
                                    data-product-id="${relatedProduct.id}" 
                                    data-bs-toggle="tooltip" 
                                    title="Xem nhanh">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-primary rounded-circle add-to-cart-btn"
                                    data-product-id="${relatedProduct.id}"
                                    data-product-name="${relatedProduct.name}"
                                    data-product-price="${relatedProduct.price}"
                                    data-product-image="${imageUrl}"
                                    data-bs-toggle="tooltip" 
                                    title="Thêm vào giỏ hàng"
                                    ${relatedProduct.stock <= 0 ? 'disabled' : ''}>
                                    <i class="fas fa-cart-plus"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger rounded-circle add-to-wishlist-btn"
                                    data-product-id="${relatedProduct.id}"
                                    data-bs-toggle="tooltip" 
                                    title="Yêu thích">
                                    <i class="far fa-heart"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body p-3">
                            <h3 class="card-title h5 mb-2">
                                <a href="single-product.html?productId=${relatedProduct.id}" class="text-decoration-none text-dark">
                                    ${relatedProduct.name}
                                </a>
                            </h3>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="fw-bold text-primary">${formattedPrice}</span>
                                <small class="stock-status ${relatedProduct.stock > 0 ? 'text-success' : 'text-danger'}">
                                    ${relatedProduct.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                                </small>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(productCard);
            });
            
            // Initialize tooltips
            if (typeof bootstrap !== 'undefined') {
                const tooltips = container.querySelectorAll('[data-bs-toggle="tooltip"]');
                tooltips.forEach(tooltip => {
                    new bootstrap.Tooltip(tooltip);
                });
            }
            
        } catch (error) {
            console.error('Error loading related products:', error);
            container.innerHTML = '<div class="text-center py-4"><p class="text-danger">Lỗi khi tải sản phẩm tương tự. Vui lòng thử lại sau.</p></div>';
        }
    };
    
    // Load recently viewed products
    const loadRecentlyViewed = () => {
        const container = document.getElementById('recently-viewed-container');
        if (!container) return;
        
        // Get recently viewed products from localStorage
        const recentlyViewedStr = localStorage.getItem('recentlyViewed');
        let recentlyViewed = recentlyViewedStr ? JSON.parse(recentlyViewedStr) : [];
        
        // Filter out current product
        recentlyViewed = recentlyViewed.filter(id => id != productId);
        
        if (recentlyViewed.length === 0) {
            // Hide section if no recently viewed products
            const section = container.closest('section');
            if (section) section.style.display = 'none';
            return;
        }
        
        // Limit to 4 products
        recentlyViewed = recentlyViewed.slice(0, 4);
        
        // Clear container
        container.innerHTML = '';
        
        // Load products
        recentlyViewed.forEach(async (recentProductId) => {
            try {
                const product = await ProductService.getProductById(recentProductId);
                
                // Format price
                const formattedPrice = new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0
                }).format(product.price);
                
                // Get product image
                let imageUrl = '/images/placeholder.jpg';
                if (product.imageUrl) {
                    if (product.imageUrl.startsWith('http')) {
                        imageUrl = product.imageUrl;
                    } else {
                        imageUrl = `/uploads/${product.imageUrl}`;
                    }
                }
                
                // Create product card
                const productCard = document.createElement('div');
                productCard.className = 'swiper-slide';
                productCard.innerHTML = `
                    <div class="card product-card h-100 border-0 shadow-sm hover-effect">
                        <div class="position-relative">
                            <img src="${imageUrl}" class="card-img-top product-img" alt="${product.name}" onerror="this.onerror=null; this.src='/images/placeholder.jpg';">
                            <div class="product-overlay d-flex justify-content-center">
                                <button class="btn btn-sm btn-primary rounded-circle quick-view-btn me-2" 
                                    data-product-id="${product.id}" 
                                    data-bs-toggle="tooltip" 
                                    title="Xem nhanh">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-primary rounded-circle add-to-cart-btn"
                                    data-product-id="${product.id}"
                                    data-product-name="${product.name}"
                                    data-product-price="${product.price}"
                                    data-product-image="${imageUrl}"
                                    data-bs-toggle="tooltip" 
                                    title="Thêm vào giỏ hàng"
                                    ${product.stock <= 0 ? 'disabled' : ''}>
                                    <i class="fas fa-cart-plus"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger rounded-circle add-to-wishlist-btn"
                                    data-product-id="${product.id}"
                                    data-bs-toggle="tooltip" 
                                    title="Yêu thích">
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
                                <small class="stock-status ${product.stock > 0 ? 'text-success' : 'text-danger'}">
                                    ${product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                                </small>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(productCard);
                
                // Initialize tooltips
                if (typeof bootstrap !== 'undefined') {
                    const tooltips = productCard.querySelectorAll('[data-bs-toggle="tooltip"]');
                    tooltips.forEach(tooltip => {
                        new bootstrap.Tooltip(tooltip);
                    });
                }
                
            } catch (error) {
                console.error(`Error loading recently viewed product ${recentProductId}:`, error);
            }
        });
        
        // Initialize recently viewed swiper
        setTimeout(() => {
            new Swiper('.recently-viewed-swiper', {
                slidesPerView: 1,
                spaceBetween: 20,
                pagination: {
                    el: '.recently-viewed-swiper .swiper-pagination',
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
        }, 500);
    };
    
    // Add product to recently viewed
    const addToRecentlyViewed = (productId) => {
        // Get current recently viewed products
        const recentlyViewedStr = localStorage.getItem('recentlyViewed');
        let recentlyViewed = recentlyViewedStr ? JSON.parse(recentlyViewedStr) : [];
        
        // Remove product if already in the list
        recentlyViewed = recentlyViewed.filter(id => id != productId);
        
        // Add product to the beginning of the list
        recentlyViewed.unshift(productId);
        
        // Limit to 8 products
        recentlyViewed = recentlyViewed.slice(0, 8);
        
        // Save to localStorage
        localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    };
    
    // Main function to load product details
    const loadProductDetails = async () => {
        if (!productId) {
            // Show error message if no productId provided
            const productContainer = document.querySelector('.container');
            if (productContainer) {
                productContainer.innerHTML = `
                    <div class="alert alert-warning my-5 text-center">
                        <h4 class="alert-heading">Không tìm thấy sản phẩm!</h4>
                        <p>Vui lòng kiểm tra lại đường dẫn hoặc trở về trang sản phẩm để chọn sản phẩm khác.</p>
                        <hr>
                        <a href="shop.html" class="btn btn-primary">Xem tất cả sản phẩm</a>
                    </div>
                `;
            }
            return;
        }
        
        try {
            // Get product details
            const product = await ProductService.getProductById(productId);
            
            // Handle image URL
            let imageUrl = '/images/placeholder.jpg';
            if (product.imageUrl) {
                if (product.imageUrl.startsWith('http')) {
                    imageUrl = product.imageUrl;
                } else {
                    imageUrl = `/uploads/${product.imageUrl}`;
                }
            }
            
            // Format price
            const formattedPrice = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0
            }).format(product.price);
            
            // Update page title
            document.title = `${product.name} - JanyPet`;
            
            // Update breadcrumb
            const breadcrumbProductName = document.getElementById('breadcrumb-product-name');
            const breadcrumbCategory = document.getElementById('breadcrumb-category');
            if (breadcrumbProductName) {
                breadcrumbProductName.textContent = product.name;
            }
            if (breadcrumbCategory && product.categoryName) {
                breadcrumbCategory.innerHTML = `<a href="shop.html?cat=${product.categoryId}" class="text-decoration-none">${product.categoryName}</a>`;
            }
            
            // Update product details
            const productNameTop = document.getElementById('product-name-top');
            const productPriceTop = document.getElementById('product-price-top');
            const productShortDescTop = document.getElementById('product-short-description-top');
            const stockInfo = document.getElementById('stock-info');
            const productImage = document.querySelector('.product-large-slider .swiper-slide img');
            
            if (productNameTop) productNameTop.textContent = product.name;
            if (productPriceTop) productPriceTop.textContent = formattedPrice;
            if (productShortDescTop) productShortDescTop.textContent = product.description;
            if (stockInfo) stockInfo.textContent = `Còn ${product.stock} sản phẩm`;
            if (productImage) {
                productImage.src = imageUrl;
                productImage.alt = product.name;
            }
            
            // Initialize product gallery
            initProductGallery();
            
            // Initialize product options
            initProductOptions();
            
            // Initialize cart buttons
            initCartButtons(product);
            
            // Load related products
            await loadRelatedProducts(product);
            
            // Add product to recently viewed
            addToRecentlyViewed(productId);
            
            // Load recently viewed products
            loadRecentlyViewed();
            
        } catch (error) {
            console.error('Error loading product details:', error);
            const productContainer = document.querySelector('.container');
            if (productContainer) {
                productContainer.innerHTML = `
                    <div class="alert alert-danger my-5 text-center">
                        <h4 class="alert-heading">Lỗi khi tải thông tin sản phẩm!</h4>
                        <p>Đã xảy ra lỗi khi tải thông tin sản phẩm. Vui lòng thử lại sau.</p>
                        <hr>
                        <a href="shop.html" class="btn btn-primary">Xem tất cả sản phẩm</a>
                    </div>
                `;
            }
        }
    };
    
    // Load product details
    loadProductDetails();
});