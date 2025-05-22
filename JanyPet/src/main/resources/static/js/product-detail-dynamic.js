/**
 * JanyPet - Single Product Page Controller
 * This script handles the display of product details on the product page
 */
document.addEventListener('DOMContentLoaded', function () {
    const productId = new URLSearchParams(window.location.search).get('productId');

    let mainProductSlider;
    let productThumbnailsSlider;

    function initializeSwiper() {
        if (productThumbnailsSlider && typeof productThumbnailsSlider.destroy === 'function') {
            productThumbnailsSlider.destroy(true, true);
            productThumbnailsSlider = null; // Ensure it's fully cleared
        }
        if (mainProductSlider && typeof mainProductSlider.destroy === 'function') {
            mainProductSlider.destroy(true, true);
            mainProductSlider = null; // Ensure it's fully cleared
        }

        // Check if the slider elements exist before initializing
        if (document.querySelector(".product-thumbnails-slider")) {
            productThumbnailsSlider = new Swiper(".product-thumbnails-slider", {
                spaceBetween: 10,
                slidesPerView: 4,
                freeMode: true,
                watchSlidesProgress: true,
                observer: true, 
                observeParents: true, 
            });
        }

        if (document.querySelector(".main-product-slider")) {
            mainProductSlider = new Swiper(".main-product-slider", { // Corrected class name
                spaceBetween: 10,
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                thumbs: {
                    swiper: productThumbnailsSlider && !productThumbnailsSlider.destroyed ? productThumbnailsSlider : null,
                },
                observer: true, 
                observeParents: true, 
            });
        }
    }
    
    initializeSwiper(); // Initial call

    if (productId) {
        fetchProductDetails(productId);
    } else {
        displayErrorMessage('Không tìm thấy ID sản phẩm trong URL.');
        const productDetailsSection = document.querySelector('.product-details-section'); // Assuming this class exists for the main content area
        if (productDetailsSection) productDetailsSection.style.display = 'none';
        const productInfoTabs = document.querySelector('.product-info-tabs');
        if (productInfoTabs) productInfoTabs.style.display = 'none';
    }

    function fetchProductDetails(id) {
        fetch(`/api/products/${id}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Sản phẩm không tồn tại (mã lỗi 404).');
                    }
                    throw new Error(`Lỗi máy chủ: ${response.status}`);
                }
                return response.json();
            })
            .then(productData => {
                if (!productData || Object.keys(productData).length === 0) {
                    throw new Error('Không nhận được dữ liệu sản phẩm hợp lệ từ máy chủ.');
                }
                displayProductDetails(productData);
            })
            .catch(error => {
                console.error('Lỗi khi tải thông tin sản phẩm:', error);
                displayErrorMessage(error.message);
                const productDetailsSection = document.querySelector('.product-details-section');
                if (productDetailsSection) productDetailsSection.style.display = 'none';
                const productInfoTabs = document.querySelector('.product-info-tabs');
                if (productInfoTabs) productInfoTabs.style.display = 'none';
            });
    }

    function displayErrorMessage(message) {
        // Attempt to find a more specific container, fallback to body
        let container = document.querySelector('.product-details-section') || document.querySelector('.container') || document.body;
        
        let errorDiv = container.querySelector('.api-error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger text-center api-error-message mt-3 col-12'; // Ensure it takes full width if in a row
            errorDiv.setAttribute('role', 'alert');
            
            const breadcrumb = container.querySelector('.breadcrumb-section'); // Or any other logical preceding element
            if (breadcrumb && breadcrumb.parentNode) { // Check parentNode
                 breadcrumb.insertAdjacentElement('afterend', errorDiv);
            } else {
                const firstChild = container.firstChild;
                if (firstChild) {
                    container.insertBefore(errorDiv, firstChild);
                } else {
                    container.appendChild(errorDiv);
                }
            }
        }
        errorDiv.textContent = message;
    }

    function displayProductDetails(product) {
        const existingError = document.querySelector('.api-error-message');
        if (existingError) existingError.remove();

        document.title = product.name ? `${product.name} - JanyPet` : 'Chi tiết sản phẩm - JanyPet';

        // Top section product details
        const productNameTop = document.getElementById('product-name-top');
        if (productNameTop) productNameTop.textContent = product.name || 'Tên sản phẩm không có';
        
        // Product title
        const productTitle = document.getElementById('product-title');
        if (productTitle) productTitle.textContent = product.name || 'Tên sản phẩm không có';
        
        // Format and display price in VND
        const productPriceTop = document.getElementById('product-price-top');
        if (productPriceTop) {
            productPriceTop.textContent = product.price ? 
                parseFloat(product.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'Liên hệ';
        }
        
        // Clear or hide original price and discount if not provided by API yet
        const originalPriceTop = document.getElementById('product-original-price-top');
        if (originalPriceTop) originalPriceTop.style.display = 'none'; 
        const discountBadge = document.getElementById('product-discount-badge');
        if (discountBadge) discountBadge.style.display = 'none';

        // Short description in the top section
        const shortDescriptionTop = document.getElementById('product-short-description-top');
        if (shortDescriptionTop) {
            // Format the short description to be just 1-2 sentences
            const cleanShortDesc = cleanAndShortenText(product.description, 150);
            shortDescriptionTop.textContent = cleanShortDesc || 'Hiện chưa có mô tả cho sản phẩm này.';
        }
        
        // Process and clean the description, removing any HTML tags, error characters
        // Long description for the description tab - keep it to 3-5 lines
        const longDescDetailsTab = document.getElementById('product-long-description-details-tab');
        if (longDescDetailsTab) {
            const cleanDescription = cleanAndFormatDescription(product.description);
            longDescDetailsTab.textContent = cleanDescription || 'Hiện chưa có mô tả chi tiết cho sản phẩm này.';
        }
        
        // Update metadata
        const productSku = document.getElementById('product-sku');
        if (productSku) productSku.textContent = product.id || 'N/A';
        
        const productCategory = document.getElementById('product-category');
        if (productCategory) productCategory.innerHTML = product.categoryName ? 
            `<a href="shop.html?cat=${product.categoryId}" class="text-decoration-none">${product.categoryName}</a>` : 
            'Chưa phân loại';
        
        const productOrigin = document.getElementById('product-origin');
        if (productOrigin) productOrigin.textContent = product.origin || 'Không xác định';
        
        const productOriginTable = document.getElementById('product-origin-table');
        if (productOriginTable) productOriginTable.textContent = product.origin || 'Không xác định';
        
        const productBrand = document.getElementById('product-brand');
        if (productBrand) productBrand.textContent = product.brand || 'Không xác định';
        
        const productWeight = document.getElementById('product-weight');
        if (productWeight) productWeight.textContent = product.weight ? `${product.weight} kg` : 'Không xác định';
        
        const productExpiry = document.getElementById('product-expiry');
        if (productExpiry) productExpiry.textContent = product.expiryDate || 'Xem trên bao bì';

        const stockStatusText = document.getElementById('product-stock-status-text'); 
        if (stockStatusText) {
            if (product.stock !== null && product.stock > 0) {
                stockStatusText.textContent = 'Còn hàng';
                stockStatusText.className = 'badge bg-primary-subtle text-primary small';
            } else {
                stockStatusText.textContent = 'Hết hàng';
                stockStatusText.className = 'badge bg-danger-subtle text-danger small';
            }
        }

        // Process image URL to ensure we have a valid URL
        const imageUrl = processImageUrl(product.imageUrl);
        const altText = product.name || 'Hình ảnh sản phẩm';

        // Image sliders - main carousel
        const mainSwiperWrapper = document.getElementById('main-product-swiper-wrapper');
        const thumbSwiperWrapper = document.getElementById('product-thumbnails-swiper-wrapper'); 

        if (mainSwiperWrapper) mainSwiperWrapper.innerHTML = ''; 
        
        const thumbSwiperActualWrapper = thumbSwiperWrapper ? thumbSwiperWrapper.querySelector('.swiper-wrapper') : null;
        if (thumbSwiperActualWrapper) thumbSwiperActualWrapper.innerHTML = '';

        if (mainSwiperWrapper) {
            const mainSlideHTML = `
                <div class="swiper-slide">
                    <img src="${imageUrl}" alt="${altText}" class="img-fluid rounded product-main-image-dynamic" id="product-main-image" onerror="this.onerror=null;this.src='images/placeholder.jpg'; this.alt='Không thể tải hình ảnh';">
                </div>`;
            mainSwiperWrapper.innerHTML = mainSlideHTML;
        }

        if (thumbSwiperActualWrapper) {
            const thumbSlideHTML = `
                <div class="swiper-slide">
                    <img src="${imageUrl}" alt="${altText}" class="img-fluid rounded product-thumb-image-dynamic" onerror="this.onerror=null;this.src='images/placeholder.jpg'; this.alt='Không thể tải hình ảnh';">
                </div>`;
            thumbSwiperActualWrapper.innerHTML = thumbSlideHTML;
        }
        
        // Additional images section - gallery tab
        const galleryMainImage = document.getElementById('product-image-gallery-main');
        if (galleryMainImage) {
            galleryMainImage.src = imageUrl;
            galleryMainImage.alt = altText;
            galleryMainImage.onerror = function() { 
                this.onerror=null; 
                this.src='images/placeholder.jpg'; 
                this.alt='Không thể tải hình ảnh'; 
            };
        }
        
        const galleryTitle = document.getElementById('product-title-gallery');
        if (galleryTitle) galleryTitle.textContent = product.name || 'Tên sản phẩm';
        
        // Product gallery in "Additional Images" tab
        const galleryContainer = document.getElementById('product-gallery-container');
        if (galleryContainer) {
            galleryContainer.innerHTML = ''; 
            
            // Add main image as first in the gallery
            const galleryImageHTML = `
                <div class="col">
                    <div class="card h-100 border-0 shadow-sm overflow-hidden product-gallery-card">
                        <img src="${imageUrl}" class="card-img-top product-gallery-img" alt="${altText}" onerror="this.onerror=null;this.src='images/placeholder.jpg'; this.alt='Không thể tải hình ảnh';">
                        <div class="card-body text-center py-2">
                            <p class="card-text small mb-0">Hình ảnh chính</p>
                        </div>
                    </div>
                </div>`;
            galleryContainer.innerHTML = galleryImageHTML;
            
            // Check for additional images in description
            const imageLinkPattern = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi;
            const matches = product.description ? product.description.match(imageLinkPattern) : null;
            
            if (matches && matches.length > 0) {
                // Add each image found in description to the gallery
                matches.forEach((url, index) => {
                    const additionalImageHTML = `
                        <div class="col">
                            <div class="card h-100 border-0 shadow-sm overflow-hidden product-gallery-card">
                                <img src="${url}" class="card-img-top product-gallery-img" alt="Hình ảnh bổ sung ${index + 1}" onerror="this.onerror=null;this.src='images/placeholder.jpg'; this.alt='Không thể tải hình ảnh';">
                                <div class="card-body text-center py-2">
                                    <p class="card-text small mb-0">Hình ảnh bổ sung ${index + 1}</p>
                                </div>
                            </div>
                        </div>`;
                    galleryContainer.innerHTML += additionalImageHTML;
                });
            }
        }
        
        // Detailed features
        const detailedFeaturesList = document.getElementById('product-detailed-features-list');
        if (detailedFeaturesList) {
            // Clear default items first
            detailedFeaturesList.innerHTML = '';
            
            if (product.features && product.features.length > 0) {
                // Use API-provided features
                detailedFeaturesList.innerHTML = product.features.map(feature => `
                    <li class="list-group-item border-0 py-2">
                        <i class="fas fa-check-circle text-success me-2"></i> ${feature}
                    </li>
                `).join('');
            } else {
                // Generate generic features based on product type/category
                const genericFeatures = generateGenericFeatures(product);
                detailedFeaturesList.innerHTML = genericFeatures.map(feature => `
                    <li class="list-group-item border-0 py-2">
                        <i class="fas fa-check-circle text-success me-2"></i> ${feature}
                    </li>
                `).join('');
            }
        }
    }
    
    /**
     * Process image URL to ensure it's valid
     * @param {string} url - Image URL from API
     * @returns {string} Processed image URL
     */
    function processImageUrl(url) {
        if (!url) {
            return 'images/placeholder.jpg';
        }
        
        // If it already starts with http/https or a slash, use as is
        if (url.startsWith('http') || url.startsWith('/')) {
            return url;
        }
        
        // Otherwise, assume it's a relative path in the database and prefix with uploads
        return `/uploads/${url}`;
    }
    
    /**
     * Clean and shorten text to a specific length
     * @param {string} text - Original text
     * @param {number} maxLength - Maximum length
     * @returns {string} Cleaned and shortened text
     */
    function cleanAndShortenText(text, maxLength = 150) {
        if (!text) return '';
        
        // Remove HTML tags and clean up
        let cleanText = text.replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
            
        // Remove any strange characters
        cleanText = cleanText.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '');
        
        // Shorten to maxLength characters
        if (cleanText.length > maxLength) {
            cleanText = cleanText.substring(0, maxLength).trim() + '...';
        }
        
        return cleanText;
    }
    
    /**
     * Clean and format product description
     * @param {string} description - Original description
     * @returns {string} Cleaned and formatted description
     */
    function cleanAndFormatDescription(description) {
        if (!description) return '';
        
        // Remove HTML tags and clean up
        let cleanText = description.replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
            
        // Remove any strange characters
        cleanText = cleanText.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '');
        
        // Limit to 3-5 sentences or equivalent
        const sentences = cleanText.split(/\.\s+/);
        let shortDesc = sentences.slice(0, Math.min(5, sentences.length)).join('. ');
        if (sentences.length > 1) shortDesc += '.';
        
        return shortDesc;
    }
    
    /**
     * Generate generic features based on product type/category
     * @param {Object} product - Product data
     * @returns {Array} Array of feature strings
     */
    function generateGenericFeatures(product) {
        const features = [
            'Sản phẩm chất lượng cao',
            'An toàn cho thú cưng',
            'Thiết kế tiện lợi, dễ sử dụng'
        ];
        
        // Add category-specific features if category is available
        if (product.categoryName) {
            const categoryName = product.categoryName.toLowerCase();
            
            if (categoryName.includes('thức ăn') || categoryName.includes('food')) {
                features.push('Nguyên liệu tự nhiên, không chất bảo quản');
                features.push('Bổ sung dinh dưỡng cần thiết');
            } else if (categoryName.includes('đồ chơi') || categoryName.includes('toy')) {
                features.push('Chất liệu bền bỉ, không độc hại');
                features.push('Phù hợp cho mọi kích cỡ thú cưng');
            } else if (categoryName.includes('phụ kiện') || categoryName.includes('access')) {
                features.push('Thiết kế hiện đại, kiểu dáng đẹp');
                features.push('Phù hợp với nhiều loại thú cưng');
            }
        }
        
        return features;
    }
});
