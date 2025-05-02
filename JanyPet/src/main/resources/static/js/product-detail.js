/**
 * JanyPet Product Detail Page JavaScript
 * Handles all interactive functionality for the single product view
 */

document.addEventListener("DOMContentLoaded", function() {
    // Initialize Product Components
    initProductGallery();
    initQuantityControls();
    initProductOptions();
    initReviewSystem();
    setupCartFunctions();
    setupWishlistFunctions();
    initStickyElements();
    setupImageZoom();
    setupTabNavigation();
    initRelatedProducts();
    initSocialSharing();
    checkAuthStatus();
    
    // Setup tooltips and popovers
    initTooltips();
});

/**
 * Product Image Gallery
 * Manages the product image slider and thumbnails
 */
function initProductGallery() {
    // Main image slider with fade effect
    const productLargeSlider = new Swiper(".product-large-slider", {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        loopedSlides: 4,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        effect: "fade",
        fadeEffect: {
            crossFade: true
        },
        lazy: {
            loadPrevNext: true,
        },
    });
    
    // Thumbnail slider
    const productThumbnailSlider = new Swiper(".product-thumbnail-slider", {
        slidesPerView: 4,
        spaceBetween: 10,
        loop: true,
        loopedSlides: 4,
        slideToClickedSlide: true,
        watchSlidesProgress: true,
        breakpoints: {
            768: {
                slidesPerView: 4,
            },
            480: {
                slidesPerView: 3,
            },
        },
        on: {
            // Highlight the active thumbnail with border
            slideChange: function() {
                const slides = document.querySelectorAll('.product-thumbnail-slider .swiper-slide');
                slides.forEach(slide => slide.classList.remove('border-primary'));
                slides[this.activeIndex].classList.add('border-primary');
            },
        }
    });
    
    // Link two sliders together
    productLargeSlider.controller.control = productThumbnailSlider;
    productThumbnailSlider.controller.control = productLargeSlider;
}

/**
 * Quantity Input Controls
 * Handles the +/- buttons for product quantity
 */
function initQuantityControls() {
    const quantityInput = document.getElementById('quantity');
    const minusBtn = document.querySelector('.quantity-left-minus');
    const plusBtn = document.querySelector('.quantity-right-plus');
    
    if(!minusBtn || !plusBtn || !quantityInput) return;
    
    // Get max available quantity from stock info
    let maxQuantity = 2; // Default
    const stockText = document.querySelector('.stock-number')?.textContent;
    if(stockText) {
        const match = stockText.match(/\d+/);
        if(match) maxQuantity = parseInt(match[0]);
    }
    
    minusBtn.addEventListener('click', function() {
        let val = parseInt(quantityInput.value);
        if(val > 1) {
            val--;
            quantityInput.value = val;
            // Animation effect
            quantityInput.classList.add('text-danger');
            setTimeout(() => {
                quantityInput.classList.remove('text-danger');
            }, 300);
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let val = parseInt(quantityInput.value);
        if(val < maxQuantity) {
            val++;
            quantityInput.value = val;
            // Animation effect
            quantityInput.classList.add('text-success');
            setTimeout(() => {
                quantityInput.classList.remove('text-success');
            }, 300);
        } else {
            showToast(`Chỉ còn ${maxQuantity} sản phẩm trong kho!`, 'warning');
        }
    });
    
    // Validate manual input
    quantityInput.addEventListener('change', function() {
        let val = parseInt(this.value);
        if(isNaN(val) || val < 1) {
            this.value = 1;
        } else if(val > maxQuantity) {
            this.value = maxQuantity;
            showToast(`Chỉ còn ${maxQuantity} sản phẩm trong kho!`, 'warning');
        }
    });
}

/**
 * Product Options Selection
 * Handles color and size selection with visual feedback
 */
function initProductOptions() {
    // Color selection
    const colorOptions = document.querySelectorAll('.color-options .select-item a');
    colorOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Get selected color
            const color = this.textContent.trim();
            
            // Update the product image based on color (if available)
            const colorImages = {
                'Xám': 'images/blog-lg4.jpg',
                'Đen': 'images/item7.jpg',
                'Xanh': 'images/item8.jpg',
                'Đỏ': 'images/item9.jpg'
            };
            
            if(colorImages[color]) {
                // Find the first slide and update its image
                const firstSlide = document.querySelector('.product-large-slider .swiper-slide-active img');
                if(firstSlide) {
                    // Fade effect for image change
                    firstSlide.style.opacity = '0';
                    setTimeout(() => {
                        firstSlide.src = colorImages[color];
                        firstSlide.style.opacity = '1';
                    }, 300);
                }
                
                // Also update the thumbnail
                const firstThumb = document.querySelector('.product-thumbnail-slider .swiper-slide-active img');
                if(firstThumb) {
                    firstThumb.src = colorImages[color];
                }
            }
            
            // Update price based on color variant (if needed)
            updateProductPrice();
            
            // Update the URL with the selected color parameter
            updateURLParameters('color', color);
        });
    });
    
    // Size selection
    const sizeOptions = document.querySelectorAll('.swatch .select-item a');
    sizeOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Get selected size
            const size = this.textContent.trim();
            
            // Update stock information based on size
            updateStockInfo(size);
            
            // Update price based on size variant (if needed)
            updateProductPrice();
            
            // Update the URL with the selected size parameter
            updateURLParameters('size', size);
        });
    });
    
    // Function to update stock information based on selected size
    function updateStockInfo(size) {
        const stockInfo = document.querySelector('.stock-number');
        if(!stockInfo) return;
        
        // Different inventory levels for different sizes
        const sizeInventory = {
            'XL': 1,
            'L': 2,
            'M': 5,
            'S': 8
        };
        
        const inventory = sizeInventory[size] || 0;
        stockInfo.innerHTML = `<em>Còn ${inventory} sản phẩm trong kho</em>`;
        
        // Update max quantity for the quantity input
        const quantityInput = document.getElementById('quantity');
        if(quantityInput && parseInt(quantityInput.value) > inventory) {
            quantityInput.value = inventory;
        }
        
        // Visual feedback
        stockInfo.classList.add('text-primary');
        setTimeout(() => {
            stockInfo.classList.remove('text-primary');
        }, 500);
        
        // Show low stock warning
        if(inventory <= 2) {
            showToast('Sản phẩm này sắp hết hàng!', 'warning');
        }
    }
    
    // Function to update product price based on selected options
    function updateProductPrice() {
        // Get current selections
        const selectedColor = document.querySelector('.color-options .select-item a.active')?.textContent.trim();
        const selectedSize = document.querySelector('.swatch .select-item a.active')?.textContent.trim();
        
        // In a real application, you would fetch price data from an API
        // For demo, we'll use a simple pricing model
        let basePrice = 170000;
        let priceAdjustment = 0;
        
        // Adjust for size
        if(selectedSize === 'XL') priceAdjustment += 50000;
        else if(selectedSize === 'L') priceAdjustment += 30000;
        else if(selectedSize === 'S') priceAdjustment -= 20000;
        
        // Adjust for color
        if(selectedColor === 'Đen') priceAdjustment += 10000;
        
        const finalPrice = basePrice + priceAdjustment;
        
        // Update displayed price
        const priceElement = document.querySelector('.product-price .text-primary');
        if(priceElement) {
            // Animate price change
            priceElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                priceElement.textContent = finalPrice.toLocaleString('vi-VN') + '₫';
                priceElement.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    // Function to update URL parameters without page refresh
    function updateURLParameters(key, value) {
        const url = new URL(window.location.href);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url);
    }
}

/**
 * Review System
 * Handles the star rating, review submission and display
 */
function initReviewSystem() {
    // Star rating selection
    const ratingStars = document.querySelectorAll('.rating-star');
    if(ratingStars.length) {
        const ratingInput = document.getElementById('selected-rating');
        const ratingText = document.querySelector('.rating-text');
        
        ratingStars.forEach(star => {
            // Hover effect
            star.addEventListener('mouseenter', function() {
                const value = parseInt(this.dataset.value);
                highlightStars(value);
            });
            
            // Click to select
            star.addEventListener('click', function() {
                const value = parseInt(this.dataset.value);
                ratingInput.value = value;
                
                // Update text description
                const descriptions = ['', '(Rất tệ)', '(Tệ)', '(Bình thường)', '(Tốt)', '(Rất tốt)'];
                ratingText.textContent = descriptions[value];
                
                // Add animation
                ratingText.classList.add('text-primary');
                setTimeout(() => {
                    ratingText.classList.remove('text-primary');
                }, 500);
            });
        });
        
        // Reset when mouse leaves the container
        document.querySelector('.stars').addEventListener('mouseleave', function() {
            const currentRating = parseInt(ratingInput.value) || 0;
            highlightStars(currentRating);
        });
        
        // Helper function to highlight stars
        function highlightStars(count) {
            ratingStars.forEach((s, index) => {
                if(index < count) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        }
        
        // Review form submission
        const reviewForm = document.querySelector('.write-review form');
        if(reviewForm) {
            reviewForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Form validation
                const rating = parseInt(ratingInput.value);
                const name = document.getElementById('reviewName').value;
                const email = document.getElementById('reviewEmail').value;
                const title = document.getElementById('reviewTitle').value;
                const content = document.getElementById('reviewContent').value;
                
                if(!rating) {
                    showToast('Vui lòng chọn đánh giá sao', 'error');
                    return;
                }
                
                if(!name || !email || !title || !content) {
                    showToast('Vui lòng điền đầy đủ thông tin', 'error');
                    return;
                }
                
                if(!validateEmail(email)) {
                    showToast('Email không hợp lệ', 'error');
                    return;
                }
                
                // For demo, we'll just show a success message
                // In a real app, you would send this data to the server
                showToast('Cảm ơn bạn đã gửi đánh giá!', 'success');
                
                // Reset form
                reviewForm.reset();
                ratingInput.value = 0;
                highlightStars(0);
                ratingText.textContent = '(Chọn đánh giá)';
                
                // Add a fake review to the list
                addFakeReview(name, title, content, rating);
            });
        }
        
        // Helper function to validate email format
        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        // Helper function to add a fake review for demo purposes
        function addFakeReview(name, title, content, rating) {
            const reviewsList = document.querySelector('.reviews-list');
            if(!reviewsList) return;
            
            // Create star HTML
            let starsHTML = '';
            for(let i = 1; i <= 5; i++) {
                starsHTML += `<i class="fas fa-star ${i <= rating ? 'text-warning' : 'text-muted'}"></i>`;
            }
            
            // Get current date
            const today = new Date();
            const date = today.toLocaleDateString('vi-VN');
            
            // Create review HTML
            const reviewHTML = `
                <div class="review-item border-bottom pb-4 mb-4">
                    <div class="d-flex mb-2">
                        <div class="flex-shrink-0">
                            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                                style="width: 50px; height: 50px; font-size: 20px;">
                                ${name.charAt(0)}
                            </div>
                        </div>
                        <div class="flex-grow-1 ms-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0 fw-bold">${name}</h6>
                                <span class="badge bg-success text-white rounded-pill">Đánh giá mới</span>
                            </div>
                            <div class="small text-muted">${date}</div>
                            <div class="rating my-1">
                                ${starsHTML}
                            </div>
                        </div>
                    </div>
                    <h6 class="fw-bold">${title}</h6>
                    <p>${content}</p>
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary me-2"><i class="fas fa-thumbs-up me-1"></i> Hữu ích (0)</button>
                        <button class="btn btn-sm btn-outline-secondary"><i class="fas fa-comment me-1"></i> Bình luận</button>
                    </div>
                </div>
            `;
            
            // Add to the top of the list
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = reviewHTML;
            const reviewElement = tempContainer.firstElementChild;
            
            // Add with animation
            reviewElement.style.opacity = '0';
            reviewElement.style.transform = 'translateY(20px)';
            
            if(reviewsList.firstElementChild) {
                reviewsList.insertBefore(reviewElement, reviewsList.firstElementChild);
            } else {
                reviewsList.appendChild(reviewElement);
            }
            
            // Trigger animation
            setTimeout(() => {
                reviewElement.style.transition = 'all 0.5s ease-out';
                reviewElement.style.opacity = '1';
                reviewElement.style.transform = 'translateY(0)';
            }, 10);
            
            // Update review count in tab
            const reviewTab = document.getElementById('v-pills-reviews-tab');
            if(reviewTab) {
                const countMatch = reviewTab.textContent.match(/\((\d+)\)/);
                if(countMatch) {
                    const newCount = parseInt(countMatch[1]) + 1;
                    reviewTab.textContent = reviewTab.textContent.replace(/\(\d+\)/, `(${newCount})`);
                }
            }
        }
    }
    
    // Image upload preview for review
    const reviewImagesInput = document.getElementById('reviewImages');
    if(reviewImagesInput) {
        reviewImagesInput.addEventListener('change', function() {
            // Check if preview container exists, create if not
            let previewContainer = document.querySelector('.review-images-preview');
            if(!previewContainer) {
                previewContainer = document.createElement('div');
                previewContainer.classList.add('review-images-preview', 'd-flex', 'flex-wrap', 'gap-2', 'mt-3');
                reviewImagesInput.parentNode.appendChild(previewContainer);
            } else {
                // Clear existing previews
                previewContainer.innerHTML = '';
            }
            
            // Create preview for each file
            const files = reviewImagesInput.files;
            if(files.length > 0) {
                for(let i = 0; i < Math.min(files.length, 5); i++) {
                    const file = files[i];
                    
                    // Only process images
                    if(!file.type.startsWith('image/')) continue;
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const previewDiv = document.createElement('div');
                        previewDiv.classList.add('position-relative');
                        previewDiv.innerHTML = `
                            <img src="${e.target.result}" class="img-thumbnail" 
                                style="width: 70px; height: 70px; object-fit: cover;" alt="Review image preview">
                            <button type="button" class="btn-close position-absolute top-0 end-0 bg-white rounded-circle p-1"
                                style="font-size: 0.5rem;"></button>
                        `;
                        previewContainer.appendChild(previewDiv);
                        
                        // Add remove button functionality
                        const closeBtn = previewDiv.querySelector('.btn-close');
                        closeBtn.addEventListener('click', function() {
                            previewDiv.remove();
                            // If all previews are removed, remove the container
                            if(previewContainer.children.length === 0) {
                                previewContainer.remove();
                            }
                        });
                    };
                    reader.readAsDataURL(file);
                }
                
                // Show warning if too many files selected
                if(files.length > 5) {
                    showToast('Chỉ có thể tải lên tối đa 5 hình ảnh', 'warning');
                }
            }
        });
    }
}

/**
 * Cart Functions
 * Handles adding items to cart and managing cart state
 */
function setupCartFunctions() {
    // Get cart from localStorage or initialize it
    let cart = JSON.parse(localStorage.getItem('janypet_cart')) || [];
    
    // Update cart badge count
    updateCartBadge();
    
    // Add to cart button click
    const addToCartButtons = document.querySelectorAll('[onclick*="addToCart"]');
    addToCartButtons.forEach(button => {
        // Replace inline onclick with proper event listener
        const onclickAttr = button.getAttribute('onclick');
        if(onclickAttr) {
            // Extract parameters from the inline onclick handler
            const match = onclickAttr.match(/addToCart\('([^']+)',\s*'([^']+)',\s*(\d+),\s*'([^']+)',\s*([^)]+)\)/);
            if(match) {
                const [_, id, name, price, image, quantityExpr] = match;
                
                // Remove the inline handler and add a proper event listener
                button.removeAttribute('onclick');
                
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Get the current quantity
                    const quantity = eval(quantityExpr); // This evaluates the expression like parseInt(document.getElementById('quantity').value)
                    
                    // Get selected options
                    const selectedColor = document.querySelector('.color-options .select-item a.active')?.textContent.trim() || 'Default';
                    const selectedSize = document.querySelector('.swatch .select-item a.active')?.textContent.trim() || 'Default';
                    
                    // Add to cart
                    addToCart(id, name, parseInt(price), image, quantity, selectedColor, selectedSize);
                    
                    // Add flying effect
                    createFlyingImage(this, '.fa-shopping-cart');
                });
            }
        }
    });
    
    // Quick add to cart buttons in product cards
    const quickAddButtons = document.querySelectorAll('[title="Thêm vào giỏ"]');
    quickAddButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product info from the card
            const card = this.closest('.card');
            if(!card) return;
            
            const name = card.querySelector('.card-title')?.textContent.trim() || 'Product';
            const priceText = card.querySelector('strong.text-primary')?.textContent.trim() || '0₫';
            const price = parseInt(priceText.replace(/[^\d]/g, ''));
            const image = card.querySelector('img')?.src || '';
            const id = 'quick-' + Math.random().toString(36).substr(2, 9); // Generate temp id
            
            // Add to cart
            addToCart(id, name, price, image, 1);
            
            // Add flying effect
            createFlyingImage(this, '.fa-shopping-cart');
        });
    });
    
    /**
     * Add an item to cart
     */
    function addToCart(id, name, price, image, quantity = 1, color = 'Default', size = 'Default') {
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item => 
            item.id === id && item.color === color && item.size === size);
        
        if(existingItemIndex > -1) {
            // Update quantity of existing item
            cart[existingItemIndex].quantity += quantity;
            showToast(`Đã cập nhật số lượng trong giỏ hàng!`, 'success');
        } else {
            // Add new item
            cart.push({
                id, 
                name, 
                price, 
                image, 
                quantity,
                color,
                size,
                addedAt: new Date().toISOString()
            });
            showToast(`Đã thêm ${name} vào giỏ hàng!`, 'success');
        }
        
        // Save to localStorage
        localStorage.setItem('janypet_cart', JSON.stringify(cart));
        
        // Update cart badge and offcanvas cart list
        updateCartBadge();
        updateOffcanvasCart();
    }
    
    /**
     * Update cart badge count
     */
    function updateCartBadge() {
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        const cartBadges = document.querySelectorAll('.fa-shopping-cart + .badge');
        
        cartBadges.forEach(badge => {
            badge.textContent = cartCount;
            
            // Add animation
            badge.classList.add('pulse-animation');
            setTimeout(() => {
                badge.classList.remove('pulse-animation');
            }, 1000);
        });
    }
    
    /**
     * Update offcanvas cart items
     */
    function updateOffcanvasCart() {
        const cartList = document.getElementById('offcanvas-cart-list');
        const cartTotal = document.getElementById('offcanvas-cart-total');
        
        if(!cartList || !cartTotal) return;
        
        // Clear current list
        cartList.innerHTML = '';
        
        if(cart.length === 0) {
            // Show empty cart message
            cartList.innerHTML = `
                <li class="list-group-item py-3 text-center">
                    <div class="text-center mb-3">
                        <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                        <p>Giỏ hàng của bạn đang trống</p>
                    </div>
                    <a href="shop.html" class="btn btn-outline-primary btn-sm">
                        <i class="fas fa-shopping-bag me-2"></i>Tiếp tục mua sắm
                    </a>
                </li>
            `;
        } else {
            // Add each item to the list
            cart.forEach((item, index) => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'py-3');
                li.innerHTML = `
                    <div class="d-flex">
                        <div class="flex-shrink-0">
                            <img src="${item.image}" alt="${item.name}" class="img-fluid rounded" 
                                style="width: 60px; height: 60px; object-fit: cover;">
                        </div>
                        <div class="flex-grow-1 ms-3">
                            <h6 class="my-0">${item.name}</h6>
                            <small class="text-muted">
                                ${item.color !== 'Default' ? item.color + ' / ' : ''}
                                ${item.size !== 'Default' ? item.size + ' / ' : ''}
                                ${item.quantity} x ${item.price.toLocaleString('vi-VN')}₫
                            </small>
                            <div class="mt-1">
                                <button type="button" class="btn btn-sm btn-outline-danger remove-cart-item" 
                                    data-index="${index}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div class="flex-shrink-0 text-end">
                            <span class="text-primary fw-bold">
                                ${(item.price * item.quantity).toLocaleString('vi-VN')}₫
                            </span>
                        </div>
                    </div>
                `;
                cartList.appendChild(li);
                
                // Add remove button event
                const removeBtn = li.querySelector('.remove-cart-item');
                if(removeBtn) {
                    removeBtn.addEventListener('click', function() {
                        const index = parseInt(this.dataset.index);
                        removeFromCart(index);
                    });
                }
            });
        }
        
        // Update total price
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `${total.toLocaleString('vi-VN')}₫`;
    }
    
    /**
     * Remove item from cart
     */
    function removeFromCart(index) {
        if(index >= 0 && index < cart.length) {
            const removedItem = cart[index];
            
            // Create fadeout effect
            const cartItem = document.querySelector(`#offcanvas-cart-list .remove-cart-item[data-index="${index}"]`).closest('.list-group-item');
            cartItem.style.transition = 'all 0.3s';
            cartItem.style.opacity = '0';
            cartItem.style.height = '0';
            cartItem.style.overflow = 'hidden';
            
            setTimeout(() => {
                // Remove item from cart array
                cart.splice(index, removedItem);
                
                // Save to localStorage
                localStorage.setItem('janypet_cart', JSON.stringify(cart));
                
                // Update UI
                updateCartBadge();
                updateOffcanvasCart();
                
                showToast(`Đã xóa ${removedItem.name} khỏi giỏ hàng!`, 'info');
            }, 300);
        }
    }
    
    /**
     * Create flying animation when adding to cart
     */
    function createFlyingImage(sourceElement, targetSelector) {
        // Find the image to clone
        let productImg;
        if(sourceElement.closest('.card')) {
            productImg = sourceElement.closest('.card').querySelector('img');
        } else {
            // For the main product page
            productImg = document.querySelector('.product-large-slider .swiper-slide-active img');
        }
        
        const cart = document.querySelector(targetSelector);
        
        if(productImg && cart) {
            // Create clone of product image
            const flyingImg = productImg.cloneNode();
            flyingImg.style.position = 'fixed'; // Use fixed to avoid scrolling issues
            flyingImg.style.height = '75px';
            flyingImg.style.width = 'auto';
            flyingImg.style.zIndex = '9999';
            flyingImg.style.borderRadius = '50%';
            flyingImg.style.objectFit = 'cover';
            flyingImg.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
            
            // Set initial position
            const rect = productImg.getBoundingClientRect();
            flyingImg.style.left = rect.left + 'px';
            flyingImg.style.top = rect.top + 'px';
            
            document.body.appendChild(flyingImg);
            
            // Get destination position
            const cartRect = cart.getBoundingClientRect();
            
            // Animate flying image with bezier curve path
            setTimeout(() => {
                flyingImg.style.transition = 'all 0.8s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
                flyingImg.style.left = cartRect.left + 'px';
                flyingImg.style.top = cartRect.top + 'px';
                flyingImg.style.height = '0px';
                flyingImg.style.width = '0px';
                flyingImg.style.opacity = '0.5';
                
                // Remove flying image
                setTimeout(() => {
                    flyingImg.remove();
                }, 800);
            }, 50);
        }
    }
    
    // Initialize offcanvas cart on page load
    updateOffcanvasCart();
}

/**
 * Wishlist Functions
 * Handles adding items to wishlist and managing wishlist state
 */
function setupWishlistFunctions() {
    // Get wishlist from localStorage or initialize it
    let wishlist = JSON.parse(localStorage.getItem('janypet_wishlist')) || [];
    
    // Update wishlist badge count
    updateWishlistBadge();
    
    // Add to wishlist buttons
    const wishlistButtons = document.querySelectorAll('.btn-outline-danger, [title="Yêu thích"]');
    wishlistButtons.forEach(button => {
        if(button.classList.contains('fa') || button.querySelector('.fa-heart')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                let productId, productName, productPrice, productImage;
                
                // Get product info
                if(this.closest('.card')) {
                    // From product card
                    const card = this.closest('.card');
                    productId = 'wish-' + Math.random().toString(36).substr(2, 9);
                    productName = card.querySelector('.card-title')?.textContent.trim() || 'Product';
                    const priceText = card.querySelector('strong.text-primary')?.textContent.trim() || '0₫';
                    productPrice = parseInt(priceText.replace(/[^\d]/g, ''));
                    productImage = card.querySelector('img')?.src || '';
                } else {
                    // From main product page
                    productId = 'p001'; // This should be dynamic in real app
                    productName = document.querySelector('.element-header h2')?.textContent.trim() || 'Product';
                    const priceText = document.querySelector('.product-price .text-primary')?.textContent.trim() || '0₫';
                    productPrice = parseInt(priceText.replace(/[^\d]/g, ''));
                    productImage = document.querySelector('.product-large-slider .swiper-slide-active img')?.src || '';
                }
                
                toggleWishlistItem(productId, productName, productPrice, productImage);
                
                // Add heart animation
                const heartIcon = this.querySelector('.fa-heart') || this;
                heartIcon.classList.add('text-danger');
                heartIcon.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    heartIcon.style.transform = 'scale(1)';
                }, 300);
            });
        }
    });
    
    /**
     * Toggle item in wishlist (add if not exists, remove if exists)
     */
    function toggleWishlistItem(id, name, price, image) {
        const existingIndex = wishlist.findIndex(item => item.id === id);
        
        if(existingIndex > -1) {
            // Remove item
            wishlist.splice(existingIndex, 1);
            showToast(`Đã xóa ${name} khỏi danh sách yêu thích!`, 'info');
        } else {
            // Add item
            wishlist.push({
                id, name, price, image,
                addedAt: new Date().toISOString()
            });
            showToast(`Đã thêm ${name} vào danh sách yêu thích!`, 'success');
        }
        
        // Save to localStorage
        localStorage.setItem('janypet_wishlist', JSON.stringify(wishlist));
        
        // Update badge
        updateWishlistBadge();
    }
    
    /**
     * Update wishlist badge count
     */
    function updateWishlistBadge() {
        const wishlistCount = wishlist.length;
        const wishlistBadges = document.querySelectorAll('.fa-heart + .badge');
        
        wishlistBadges.forEach(badge => {
            badge.textContent = wishlistCount;
            
            // Add animation
            badge.classList.add('pulse-animation');
            setTimeout(() => {
                badge.classList.remove('pulse-animation');
            }, 1000);
        });
    }
}

/**
 * Sticky Elements
 * Handles sticky behavior for elements like product info on scroll
 */
function initStickyElements() {
    const stickyProductInfo = () => {
        const productInfo = document.querySelector('.product-info');
        const productImage = document.querySelector('.product-large-slider');
        
        if(!productInfo || !productImage) return;
        
        if(window.innerWidth >= 992) {  // Only apply for large screens
            const scrollPosition = window.scrollY;
            const imageHeight = productImage.offsetHeight;
            const infoHeight = productInfo.offsetHeight;
            const imageTop = productImage.getBoundingClientRect().top + window.scrollY;
            
            if(infoHeight < imageHeight && scrollPosition > imageTop) {
                const maxTranslate = Math.min(scrollPosition - imageTop, imageHeight - infoHeight);
                if(maxTranslate > 0) {
                    productInfo.style.transform = `translateY(${maxTranslate}px)`;
                    productInfo.style.transition = 'transform 0.3s ease-out';
                } else {
                    productInfo.style.transform = 'translateY(0)';
                }
            } else {
                productInfo.style.transform = 'translateY(0)';
            }
        } else {
            productInfo.style.transform = 'none';
        }
    };
    
    window.addEventListener('scroll', stickyProductInfo);
    window.addEventListener('resize', stickyProductInfo);
}

/**
 * Image Zoom Effect
 * Adds zoom effect to product images on hover
 */
function setupImageZoom() {
    const productImage = document.querySelector('.product-large-slider');
    if(!productImage) return;
    
    productImage.addEventListener('mousemove', function(e) {
        const image = this.querySelector('.swiper-slide-active img');
        const bounds = this.getBoundingClientRect();
        
        // Calculate mouse position within the element
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        
        // Calculate position as percentage
        const xPercent = x / bounds.width * 100;
        const yPercent = y / bounds.height * 100;
        
        // Apply hover zoom effect with transform origin
        image.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    });
    
    productImage.addEventListener('mouseenter', function() {
        const image = this.querySelector('.swiper-slide-active img');
        image.style.transition = 'transform 0.3s ease';
        image.style.transform = 'scale(1.15)';
    });
    
    productImage.addEventListener('mouseleave', function() {
        const image = this.querySelector('.swiper-slide-active img');
        image.style.transition = 'transform 0.3s ease';
        image.style.transform = 'scale(1)';
    });
}

/**
 * Tab Navigation
 * Improves tab switching with smooth transitions
 */
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.nav-pills .nav-link');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Add fade-out effect to current active tab
            tabPanes.forEach(pane => {
                if(pane.classList.contains('active') && pane.classList.contains('show')) {
                    pane.classList.add('fade-out');
                    setTimeout(() => {
                        pane.classList.remove('fade-out');
                    }, 300);
                }
            });
            
            // Highlight the active tab button
            tabButtons.forEach(btn => {
                btn.classList.remove('active-tab-animation');
            });
            this.classList.add('active-tab-animation');
        });
    });
    
    // Add CSS for smooth tab transitions
    const style = document.createElement('style');
    style.textContent = `
        .fade-out {
            opacity: 0.7;
            transform: translateY(10px);
            transition: opacity 0.3s, transform 0.3s;
        }
        
        .tab-pane.active {
            animation: fadeInUp 0.5s ease forwards;
        }
        
        .active-tab-animation {
            position: relative;
        }
        
        .active-tab-animation::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: var(--bs-primary);
            animation: tabActivate 0.3s ease forwards;
        }
        
        @keyframes tabActivate {
            from { width: 0; left: 50%; }
            to { width: 100%; left: 0; }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0.7;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Related Products
 * Initializes and manages related product functionality
 */
function initRelatedProducts() {
    // If using a slider for related products
    if(document.querySelector('.related-products-slider')) {
        const relatedSlider = new Swiper(".related-products-slider", {
            slidesPerView: 1,
            spaceBetween: 20,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            breakpoints: {
                576: {
                    slidesPerView: 2,
                },
                768: {
                    slidesPerView: 3,
                },
                1024: {
                    slidesPerView: 4,
                },
            },
            autoplay: {
                delay: 5000,
            },
        });
    }
    
    // Filter related products based on current product
    function filterRelatedProducts() {
        // In a real app, you would fetch related products from an API
        // For this demo, we'll just simulate it
        
        // Get current product category
        const category = document.querySelector('.meta-item a')?.textContent.trim() || '';
        
        console.log(`Would load related products for category: ${category}`);
        
        // You could update the related products section with AJAX here
    }
    
    // Call filter function
    filterRelatedProducts();
}

/**
 * Social Sharing
 * Sets up social media sharing functionality
 */
function initSocialSharing() {
    const shareButtons = document.querySelectorAll('.social-sharing a');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product info
            const productName = document.querySelector('.element-header h2')?.textContent.trim() || 'Sản phẩm';
            const productUrl = window.location.href;
            const productImage = document.querySelector('.product-large-slider .swiper-slide-active img')?.src || '';
            
            // Determine which social platform
            let shareUrl = '';
            
            if(this.querySelector('.fa-facebook-f')) {
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
            } else if(this.querySelector('.fa-twitter')) {
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(productName)}&url=${encodeURIComponent(productUrl)}`;
            } else if(this.querySelector('.fa-pinterest-p')) {
                shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&media=${encodeURIComponent(productImage)}&description=${encodeURIComponent(productName)}`;
            } else if(this.querySelector('.fa-whatsapp')) {
                shareUrl = `https://wa.me/?text=${encodeURIComponent(productName + ' ' + productUrl)}`;
            }
            
            // Open share dialog
            if(shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
}

/**
 * Authentication Status Check
 * Checks if user is logged in and updates UI accordingly
 */
function checkAuthStatus() {
    // In a real app, you would check session/token
    // For this demo, we'll use localStorage
    const isLoggedIn = localStorage.getItem('janypet_user');
    
    const authContainer = document.querySelector('.auth-container');
    const authButtons = document.querySelector('.auth-buttons');
    const userInfo = document.querySelector('.user-info');
    
    if(!authContainer || !authButtons || !userInfo) return;
    
    if(isLoggedIn) {
        // User is logged in
        const user = JSON.parse(isLoggedIn);
        
        // Hide login buttons
        authButtons.style.display = 'none';
        
        // Show user info
        userInfo.style.display = 'flex';
        
        // Set user name
        const userName = document.getElementById('userName');
        if(userName) {
            userName.textContent = user.name || 'User';
        }
        
        // Setup logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if(logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                // Remove user data
                localStorage.removeItem('janypet_user');
                
                // Show login buttons
                authButtons.style.display = 'block';
                
                // Hide user info
                userInfo.style.display = 'none';
                
                // Show logout message
                showToast('Đã đăng xuất thành công!', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            });
        }
        
        // Show/hide admin link based on user role
        const adminLink = document.querySelector('.admin-link');
        if(adminLink && user.role !== 'admin') {
            adminLink.style.display = 'none';
        }
    } else {
        // User is not logged in
        
        // Show login buttons
        authButtons.style.display = 'block';
        
        // Hide user info
        userInfo.style.display = 'none';
    }
}

/**
 * Initialize tooltips and popovers
 */
function initTooltips() {
    // Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover',
            boundary: document.body
        });
    });
    
    // Bootstrap popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.forEach(popoverTriggerEl => {
        new bootstrap.Popover(popoverTriggerEl);
    });
}

/**
 * Shows toast notification
 * @param {string} message - Message to display
 * @param {string} type - Success, error, warning, info
 */
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if(!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.classList.add('toast-container', 'position-fixed', 'bottom-0', 'end-0', 'p-3');
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.classList.add('toast', 'align-items-center', 'border-0');
    
    // Set toast color based on type
    switch(type) {
        case 'success':
            toast.classList.add('bg-success', 'text-white');
            break;
        case 'error':
            toast.classList.add('bg-danger', 'text-white');
            break;
        case 'warning':
            toast.classList.add('bg-warning', 'text-dark');
            break;
        case 'info':
            toast.classList.add('bg-info', 'text-dark');
            break;
        default:
            toast.classList.add('bg-light', 'text-dark');
    }
    
    // Create toast content
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize and show toast
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    bsToast.show();
    
    // Remove from DOM after hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}