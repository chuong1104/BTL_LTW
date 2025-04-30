/**
 * Quick View functionality for product preview
 */
document.addEventListener('DOMContentLoaded', function() {
    // Mảng dữ liệu sản phẩm mẫu (trong thực tế, dữ liệu này sẽ đến từ backend)
    const sampleProducts = {
        '1': {
            title: 'Áo hoodie cho thú cưng',
            price: '180.000₫',
            description: 'Áo hoodie cho thú cưng với chất liệu mềm mại, giữ ấm tốt cho mèo và chó cỡ nhỏ. Phù hợp cho mùa thu và đông, bảo vệ thú cưng của bạn khỏi thời tiết lạnh.',
            image: 'images/item5.jpg'
        },
        '2': {
            title: 'Đồ chơi cho mèo',
            price: '120.000₫',
            description: 'Đồ chơi tương tác giúp mèo vận động và giải trí. Được làm từ chất liệu an toàn, không độc hại cho thú cưng.',
            image: 'images/item6.jpg'
        },
        '3': {
            title: 'Thức ăn hạt cho chó',
            price: '250.000₫',
            description: 'Thức ăn hạt cao cấp cho chó với thành phần dinh dưỡng đầy đủ, giúp thú cưng phát triển khỏe mạnh.',
            image: 'images/item7.jpg'
        },
        '4': {
            title: 'Dây dắt thú cưng',
            price: '150.000₫',
            description: 'Dây dắt chất lượng cao, chắc chắn và thoải mái cho cả người dùng và thú cưng khi đi dạo.',
            image: 'images/item8.jpg'
        }
    };

    // Xử lý sự kiện click cho nút Quick View
    document.querySelectorAll('.btn-quickview').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Lấy ID sản phẩm từ thuộc tính data
            const productId = this.getAttribute('data-product-id');
            
            // Lấy thông tin sản phẩm từ dữ liệu mẫu
            const product = sampleProducts[productId] || {
                title: 'Sản phẩm cho thú cưng',
                price: '199.000₫',
                description: 'Thông tin chi tiết về sản phẩm sẽ được cập nhật sau.',
                image: 'images/item5.jpg'
            };
            
            // Cập nhật dữ liệu vào modal
            document.getElementById('quickview-product-title').textContent = product.title;
            document.getElementById('quickview-product-price').textContent = product.price;
            document.getElementById('quickview-product-description').textContent = product.description;
            document.getElementById('quickview-product-image').src = product.image;
            
            // Cập nhật ID sản phẩm cho nút thêm vào giỏ hàng và yêu thích
            document.querySelector('.add-to-cart-btn').setAttribute('data-product-id', productId);
            document.querySelector('.wishlist-btn').setAttribute('data-product-id', productId);
            
            // Hiển thị modal
            const quickViewModal = new bootstrap.Modal(document.getElementById('quickViewModal'));
            quickViewModal.show();
        });
    });
    
    // Xử lý nút tăng/giảm số lượng
    document.querySelector('.quantity-btn.plus').addEventListener('click', function() {
        const input = document.getElementById('product-quantity');
        const currentValue = parseInt(input.value);
        input.value = Math.min(currentValue + 1, parseInt(input.max || 10));
    });
    
    document.querySelector('.quantity-btn.minus').addEventListener('click', function() {
        const input = document.getElementById('product-quantity');
        const currentValue = parseInt(input.value);
        input.value = Math.max(currentValue - 1, parseInt(input.min || 1));
    });
    
    // Xử lý nút thêm vào giỏ hàng trong modal
    document.querySelector('.add-to-cart-btn').addEventListener('click', function() {
        const productId = this.getAttribute('data-product-id');
        const quantity = document.getElementById('product-quantity').value;
        
        // Thực hiện thêm vào giỏ hàng
        console.log(`Đã thêm sản phẩm ID ${productId}, số lượng ${quantity} vào giỏ hàng`);
        
        // Đóng modal
        const quickViewModal = bootstrap.Modal.getInstance(document.getElementById('quickViewModal'));
        quickViewModal.hide();
    });
    
    // Thay đổi cách hiển thị các nút Add to Cart
    function updateProductCards() {
        // Sửa lại cấu trúc sản phẩm để thêm vùng chứa các nút hành động
        document.querySelectorAll('.card.position-relative').forEach((card, index) => {
            // Kiểm tra xem đã có container cho các nút chưa
            if (!card.querySelector('.product-actions')) {
                // Lấy ID sản phẩm (hoặc dùng index nếu không có)
                const productId = index + 1;
                
                // Tạo container cho các nút
                const actionsContainer = document.createElement('div');
                actionsContainer.className = 'product-actions';
                
                // Lấy nút Add to Cart và Wishlist hiện tại
                const addToCartBtn = card.querySelector('.btn-cart');
                const wishlistBtn = card.querySelector('.btn-wishlist');
                
                // Xóa class và style không cần thiết từ nút hiện tại
                if (addToCartBtn) {
                    addToCartBtn.className = 'btn-cart me-2 rounded-circle btn-outline-primary d-inline-flex align-items-center justify-content-center';
                    addToCartBtn.setAttribute('data-product-id', productId);
                    addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i>';
                    actionsContainer.appendChild(addToCartBtn);
                }
                
                if (wishlistBtn) {
                    wishlistBtn.className = 'btn-wishlist me-2 rounded-circle btn-outline-danger d-inline-flex align-items-center justify-content-center';
                    wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
                    actionsContainer.appendChild(wishlistBtn);
                }
                
                // Tạo nút Quick View
                const quickViewBtn = document.createElement('a');
                quickViewBtn.href = '#';
                quickViewBtn.className = 'btn-quickview rounded-circle btn-outline-secondary d-inline-flex align-items-center justify-content-center';
                quickViewBtn.setAttribute('data-bs-toggle', 'modal');
                quickViewBtn.setAttribute('data-bs-target', '#quickViewModal');
                quickViewBtn.setAttribute('data-product-id', productId);
                quickViewBtn.innerHTML = '<i class="fas fa-eye"></i>';
                
                actionsContainer.appendChild(quickViewBtn);
                
                // Thêm container vào card
                const imgContainer = card.querySelector('a') || card;
                imgContainer.classList.add('image-container');
                imgContainer.appendChild(actionsContainer);
            }
        });
    }
    
    // Chạy hàm cập nhật sản phẩm
    updateProductCards();
    
    
});