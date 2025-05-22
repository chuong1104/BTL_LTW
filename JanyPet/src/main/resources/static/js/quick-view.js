/**
 * JanyPet - Quick View Functionality
 * Allows users to preview product details in a modal without navigating to the product page
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeQuickView();
});

/**
 * Initialize quick view functionality
 */
function initializeQuickView() {
    // Find all quick view buttons
    const quickViewButtons = document.querySelectorAll('.quick-view-btn');
    
    // Add event listeners to quick view buttons
    quickViewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product data from button attributes
            const productId = this.getAttribute('data-product-id');
            const productName = this.getAttribute('data-product-name');
            const productPrice = this.getAttribute('data-product-price');
            const productImage = this.getAttribute('data-product-image');
            const productDescription = this.getAttribute('data-product-description');
            
            // If we have the product ID but not other data, fetch from API
            if (productId && (!productName || !productPrice)) {
                fetchProductDetails(productId);
            } else {
                // Otherwise use the data from attributes
                displayQuickView({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    imageUrl: productImage,
                    description: productDescription
                });
            }
        });
    });
    
    // Add event listeners for quantity controls within quick view modal
    setupQuantityControls();
    
    // Add event listener for add to cart button within quick view modal
    const addToCartBtn = document.querySelector('#quickViewModal .add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const productName = document.getElementById('quickview-product-title').textContent;
            const productPrice = this.getAttribute('data-product-price');
            const productImage = document.getElementById('quickview-product-image').src;
            const quantity = parseInt(document.getElementById('product-quantity').value);
            
            // Add to cart using the cart.js functionality
            if (window.addToCart) {
                window.addToCart(productId, productName, productPrice, productImage, quantity);
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('quickViewModal'));
                if (modal) modal.hide();
                
                // Show success message
                if (window.ToastService) {
                    window.ToastService.success(`${productName} đã được thêm vào giỏ hàng!`);
                }
            }
        });
    }
    
    // Add event listener for view more button
    const viewMoreBtn = document.getElementById('view-more-btn');
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = document.querySelector('#quickViewModal .add-to-cart-btn').getAttribute('data-product-id');
            window.location.href = `single-product.html?productId=${productId}`;
        });
    }
}

/**
 * Set up quantity control buttons
 */
function setupQuantityControls() {
    const minusBtn = document.querySelector('#quickViewModal .quantity-btn.minus');
    const plusBtn = document.querySelector('#quickViewModal .quantity-btn.plus');
    const quantityInput = document.getElementById('product-quantity');
    
    if (minusBtn && plusBtn && quantityInput) {
        minusBtn.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
        
        plusBtn.addEventListener('click', function() {
            const currentValue = parseInt(quantityInput.value);
            const max = parseInt(quantityInput.getAttribute('max')) || 10;
            if (currentValue < max) {
                quantityInput.value = currentValue + 1;
            }
        });
        
        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            const min = parseInt(this.getAttribute('min')) || 1;
            const max = parseInt(this.getAttribute('max')) || 10;
            
            if (isNaN(value) || value < min) {
                value = min;
            } else if (value > max) {
                value = max;
            }
            
            this.value = value;
        });
    }
}

/**
 * Fetch product details from the API
 */
async function fetchProductDetails(productId) {
    try {
        // Show loading state in modal
        document.getElementById('quickview-product-title').textContent = 'Loading...';
        document.getElementById('quickview-product-price').textContent = '';
        document.getElementById('quickview-product-description').innerHTML = '<div class="text-center py-3"><i class="fas fa-spinner fa-spin"></i> Loading product details...</div>';
        
        // Show modal
        const quickViewModal = new bootstrap.Modal(document.getElementById('quickViewModal'));
        quickViewModal.show();
        
        // Fetch product data
        const product = await ProductService.getProductById(productId);
        
        // Display product details in modal
        displayQuickView(product);
        
    } catch (error) {
        console.error('Error fetching product details:', error);
        document.getElementById('quickview-product-description').innerHTML = '<div class="alert alert-danger">Failed to load product details. Please try again later.</div>';
    }
}

/**
 * Display product details in quick view modal
 */
function displayQuickView(product) {
    // Format price
    const formattedPrice = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(product.price);
    
    // Get image URL
    let imageUrl = product.imageUrl;
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
        imageUrl = `/uploads/${imageUrl}`;
    } else if (!imageUrl) {
        imageUrl = '/images/placeholder.jpg';
    }
    
    // Update modal content
    document.getElementById('quickview-product-image').src = imageUrl;
    document.getElementById('quickview-product-image').alt = product.name;
    document.getElementById('quickview-product-title').textContent = product.name;
    document.getElementById('quickview-product-price').textContent = formattedPrice;
    document.getElementById('quickview-product-description').innerHTML = product.description || 'No description available';
    
    // Update add to cart button with product data
    const addToCartBtn = document.querySelector('#quickViewModal .add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.setAttribute('data-product-id', product.id);
        addToCartBtn.setAttribute('data-product-price', product.price);
        
        // Disable button if out of stock
        if (product.stock <= 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="fas fa-times"></i> Out of Stock';
        } else {
            addToCartBtn.disabled = false;
            addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart me-2"></i> Thêm vào giỏ hàng';
        }
    }
    
    // Update view more button link
    const viewMoreBtn = document.getElementById('view-more-btn');
    if (viewMoreBtn) {
        viewMoreBtn.setAttribute('href', `single-product.html?productId=${product.id}`);
    }
    
    // Show modal if not already shown
    const quickViewModal = bootstrap.Modal.getInstance(document.getElementById('quickViewModal'));
    if (!quickViewModal) {
        const newModal = new bootstrap.Modal(document.getElementById('quickViewModal'));
        newModal.show();
    }
}
