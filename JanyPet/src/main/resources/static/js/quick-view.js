/**
 * Quick View functionality for product preview
 */
document.addEventListener('DOMContentLoaded', function() {
    // Setup quick view modal functionality
    document.querySelectorAll('.btn-quickview').forEach(button => {
        button.addEventListener('click', async function(event) {
            event.preventDefault();
            
            // Get product ID from button
            const productId = this.getAttribute('data-product-id');
            if (!productId) {
                console.error('No product ID provided for quick view');
                return;
            }
            
            try {
                // Show loading state in modal
                const modalTitle = document.getElementById('quickview-product-title');
                const modalPrice = document.getElementById('quickview-product-price');
                const modalDescription = document.getElementById('quickview-product-description');
                const modalImage = document.getElementById('quickview-product-image');
                const addToCartBtn = document.querySelector('.add-to-cart-btn');
                const wishlistBtn = document.querySelector('.wishlist-btn');
                
                // Show loading state
                modalTitle.textContent = 'Loading...';
                modalPrice.textContent = '';
                modalDescription.textContent = 'Loading product details...';
                modalImage.src = '/images/placeholder.jpg';
                
                // Fetch product data from API
                let product;
                if (window.ShopProductService && typeof window.ShopProductService.getProductById === 'function') {
                    product = await window.ShopProductService.getProductById(productId);
                } else if (window.apiService && typeof window.apiService.getProduct === 'function') {
                    product = await window.apiService.getProduct(productId);
                } else {
                    throw new Error('Product service not available');
                }
                
                // Update modal with product data
                modalTitle.textContent = product.name;
                modalPrice.textContent = new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    maximumFractionDigits: 0
                }).format(product.price);
                
                modalDescription.textContent = product.description ? 
                    // Strip HTML if description contains HTML
                    product.description.replace(/<[^>]*>?/gm, '') : 
                    'No description available.';
                
                modalImage.src = product.imageUrl || '/images/placeholder.jpg';
                
                // Update buttons with product ID
                addToCartBtn.setAttribute('data-product-id', productId);
                addToCartBtn.onclick = function() {
                    addToCart(
                        product.id,
                        product.name,
                        product.price,
                        product.imageUrl || '/images/placeholder.jpg',
                        parseInt(document.getElementById('product-quantity').value)
                    );
                    
                    // Close modal after adding to cart
                    const quickViewModal = bootstrap.Modal.getInstance(document.getElementById('quickViewModal'));
                    quickViewModal.hide();
                    
                    return false;
                };
                
                wishlistBtn.setAttribute('data-product-id', productId);
                wishlistBtn.onclick = function() {
                    addToWishlist(
                        product.id,
                        product.name,
                        product.price,
                        product.imageUrl || '/images/placeholder.jpg'
                    );
                    return false;
                };
            } catch (error) {
                console.error('Error loading product for quick view:', error);
                
                // Show error in modal
                document.getElementById('quickview-product-title').textContent = 'Error';
                document.getElementById('quickview-product-price').textContent = '';
                document.getElementById('quickview-product-description').textContent = 
                    'Could not load product details. Please try again later.';
            }
        });
    });
    
    // Quantity buttons functionality
    document.querySelector('.quantity-btn.plus')?.addEventListener('click', function() {
        const input = document.getElementById('product-quantity');
        const currentValue = parseInt(input.value);
        if (currentValue < 10) { // Max quantity
            input.value = currentValue + 1;
        }
    });
    
    document.querySelector('.quantity-btn.minus')?.addEventListener('click', function() {
        const input = document.getElementById('product-quantity');
        const currentValue = parseInt(input.value);
        if (currentValue > 1) { // Min quantity is 1
            input.value = currentValue - 1;
        }
    });
    
    // Update product cards to show quick view buttons
    function updateProductCards() {
        document.querySelectorAll('.card.position-relative').forEach(card => {
            // Skip if already processed
            if (card.querySelector('.product-actions')) return;
            
            // Find product ID (if it exists in a link or data attribute)
            let productId = '';
            const productLink = card.querySelector('a[href^="single-product.html"]');
            if (productLink) {
                const url = new URL(productLink.href, window.location.origin);
                productId = url.searchParams.get('id');
            }
            
            if (!productId) {
                // Try to find product ID in other ways
                const addToCartBtn = card.querySelector('.btn-cart, button[onclick*="addToCart"]');
                if (addToCartBtn) {
                    const onclickAttr = addToCartBtn.getAttribute('onclick');
                    if (onclickAttr) {
                        const match = onclickAttr.match(/addToCart\(['"]([^'"]+)['"]/);
                        if (match && match[1]) {
                            productId = match[1];
                        }
                    }
                }
            }
            
            if (!productId) return; // Skip if no product ID found
            
            // Create quick view button if it doesn't exist
            if (!card.querySelector('.btn-quickview')) {
                // Create product actions container if it doesn't exist
                let actionsContainer = card.querySelector('.product-actions');
                if (!actionsContainer) {
                    actionsContainer = document.createElement('div');
                    actionsContainer.className = 'product-actions position-absolute start-50 bottom-0 translate-middle-x mb-3 d-flex gap-2';
                    
                    // Find image container or create one
                    const imgContainer = card.querySelector('.img-hover-zoom') || card.querySelector('a') || card;
                    imgContainer.style.position = 'relative';
                    imgContainer.appendChild(actionsContainer);
                }
                
                // Create quick view button
                const quickViewBtn = document.createElement('button');
                quickViewBtn.className = 'btn-quickview rounded-circle btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center';
                quickViewBtn.setAttribute('data-bs-toggle', 'modal');
                quickViewBtn.setAttribute('data-bs-target', '#quickViewModal');
                quickViewBtn.setAttribute('data-product-id', productId);
                quickViewBtn.innerHTML = '<i class="fas fa-eye"></i>';
                
                actionsContainer.appendChild(quickViewBtn);
            }
        });
    }
    
    // Call updateProductCards on page load
    updateProductCards();
    
    // Call it again after a delay to catch dynamically loaded products
    setTimeout(updateProductCards, 2000);
    
    // And again periodically to catch any new products loaded via AJAX
    setInterval(updateProductCards, 5000);
});