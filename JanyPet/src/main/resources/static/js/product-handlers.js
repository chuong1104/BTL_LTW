/**
 * Xử lý các thao tác với sản phẩm trong trang admin
 */
const ProductHandlers = {
    // Lưu trữ dữ liệu sản phẩm hiện tại
    productData: [],
    
    /**
     * Khởi tạo các sự kiện cho quản lý sản phẩm
     */
    initializeProductEvents: function() {
        // Load sản phẩm khi vào trang
        this.loadProducts();
        
        // Các sự kiện cho modal thêm/sửa sản phẩm
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.openProductModal());
        }
        
        const saveProductBtn = document.getElementById('save-product-btn');
        if (saveProductBtn) {
            saveProductBtn.addEventListener('click', () => this.saveProduct());
        }
        
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeProductModal());
        }
        
        // Xử lý đóng modal
        const closeButtons = document.querySelectorAll('.modal .close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const modalId = this.closest('.modal').id;
                if (modalId === 'product-modal') {
                    ProductHandlers.closeProductModal();
                } else if (modalId === 'delete-modal') {
                    ProductHandlers.closeDeleteModal();
                }
            });
        });
        
        // Xử lý xác nhận xóa sản phẩm
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.deleteProduct());
        }
        
        // Xử lý hủy xóa sản phẩm
        const deleteCancelBtn = document.getElementById('delete-cancel-btn');
        if (deleteCancelBtn) {
            deleteCancelBtn.addEventListener('click', () => this.closeDeleteModal());
        }
        
        // Khởi tạo trình soạn thảo mô tả sản phẩm
        if (typeof Quill !== 'undefined' && document.getElementById('editor-container')) {
            this.setupProductEditor();
        }
    },
    
    /**
     * Tải danh sách sản phẩm
     */
    loadProducts: async function() {
        try {
            const tableBody = document.getElementById('products-table-body');
            if (!tableBody) return;
            
            // Hiển thị loading
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center">Loading products...</td></tr>';
            
            // Đối với admin, lấy tất cả sản phẩm bao gồm cả không hoạt động
            const products = await ProductService.getAllProductsIncludingInactive();
            this.productData = products;
            
            // Xóa loading
            tableBody.innerHTML = '';
            
            // Hiển thị thông báo nếu không có sản phẩm
            if (!products || products.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No products found</td></tr>';
                return;
            }
            
            // Hiển thị danh sách sản phẩm
            products.forEach(product => {
                const row = document.createElement('tr');
                
                // Format giá sản phẩm
                const formattedPrice = new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0
                }).format(product.price);
                
                // Xác định trạng thái sản phẩm dựa trên số lượng tồn kho
                let stockStatus = 'In Stock';
                let statusClass = 'status-instock';
                
                if (product.stock <= 0) {
                    stockStatus = 'Out of Stock';
                    statusClass = 'status-outofstock';
                } else if (product.stock <= 10) {
                    stockStatus = 'Low Stock';
                    statusClass = 'status-lowstock';
                }

                // Thêm hiển thị trạng thái kích hoạt
                const activeStatus = product.active !== false; // Xử lý undefined là true
                const activeStatusClass = activeStatus ? 'status-active' : 'status-inactive';
                const activeStatusText = activeStatus ? 'Active' : 'Inactive';

                const displayImageUrl = ProductService.getImageUrl(product.imageUrl);
                
                row.innerHTML = `
                    <td><input type="checkbox" class="product-select" value="${product.id}"></td>
                    <td>
                        <div class="product-image">
                            <img src="${displayImageUrl}" alt="${product.name}" onclick="ProductHandlers.openAdminImagePreviewModal('${displayImageUrl}')">
                        </div>
                    </td>
                    <td>${product.name}</td>
                    <td class="description-cell">${product.description ? this.truncateDescription(product.description, 50) : 'No description'}</td>
                    <td>${formattedPrice}</td>
                    <td>${product.stock}</td>
                    <td><span class="status-badge ${statusClass}">${stockStatus}</span></td>
                    <td><span class="status-badge ${activeStatusClass}">${activeStatusText}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="icon-btn edit-product" data-id="${product.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="icon-btn toggle-product-status" data-id="${product.id}" data-active="${!activeStatus}">
                                <i class="fas fa-${activeStatus ? 'ban' : 'check-circle'}"></i>
                            </button>
                            <button class="icon-btn delete-product" data-id="${product.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                // Thêm kiểu dáng trực quan cho sản phẩm không hoạt động
                if (!activeStatus) {
                    row.classList.add('inactive-product');
                }
                
                tableBody.appendChild(row);
            });
            
            // Thiết lập các sự kiện cho nút sửa/xóa
            this.setupProductActionButtons();
            
        } catch (error) {
            console.error('Error loading products:', error);
            const tableBody = document.getElementById('products-table-body');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Error loading products. Please try again later.</td></tr>';
            }
        }
    },
    
    /**
     * Thiết lập các sự kiện cho nút sửa và xóa sản phẩm
     */
    setupProductActionButtons: function() {
        // Thiết lập các sự kiện cho nút sửa
        const editButtons = document.querySelectorAll('.edit-product');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                this.openProductModal(productId);
            });
        });
        
        // Thiết lập các sự kiện cho nút xóa
        const deleteButtons = document.querySelectorAll('.delete-product');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                this.openDeleteModal(productId);
            });
        });

        // Thiết lập các sự kiện cho nút chuyển đổi trạng thái
        const toggleStatusButtons = document.querySelectorAll('.toggle-product-status');
        toggleStatusButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                const newStatus = button.getAttribute('data-active') === 'true';
                ProductHandlers.toggleProductStatus(productId, newStatus);
            });
        });
    },
    
    /**
     * Mở modal thêm/sửa sản phẩm
     * @param {string} productId - ID của sản phẩm cần sửa (nếu không có thì là thêm mới)
     */
    openProductModal: async function(productId = null) {
        const modal = document.getElementById('product-modal');
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('product-form');
        const productIdInput = document.getElementById('product-id');
        const productNameInput = document.getElementById('product-name');
        const productPriceInput = document.getElementById('product-price');
        const productStockInput = document.getElementById('product-stock');
        const productCategorySelect = document.getElementById('product-category-modal');
        const productImageInput = document.getElementById('product-image'); // Get the file input
        const imagePreview = document.getElementById('image-preview');
        
        if (!modal || !form) return;
        
        // Reset form
        form.reset();
        if (imagePreview) imagePreview.innerHTML = ''; // Clear previous image preview
        if (productImageInput) productImageInput.value = ''; // Clear file input
        if (window.quill) window.quill.root.innerHTML = '';
        
        // Tải danh mục sản phẩm cho dropdown
        try {
            const categories = await CategoryService.getAllCategories();
            if (productCategorySelect) {
                productCategorySelect.innerHTML = '<option value="">Select Category</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    productCategorySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }

        // Add event listener for image preview
        if (productImageInput && imagePreview) {
            productImageInput.onchange = evt => {
                const [file] = productImageInput.files;
                if (file) {
                    const imageUrl = URL.createObjectURL(file);
                    imagePreview.innerHTML = `<img src="${imageUrl}" alt="Image preview" style="max-width: 100px; max-height: 100px; margin-top: 10px; cursor: pointer; border: 1px solid #ddd;" onclick="ProductHandlers.openAdminImagePreviewModal('${imageUrl}')" />`;
                } else {
                    imagePreview.innerHTML = ''; // Clear preview if no file is selected
                }
            };
        }
        
        if (productId) {
            // Chế độ sửa sản phẩm
            modalTitle.textContent = 'Edit Product';
            
            try {
                const product = await ProductService.getProductById(productId);
                
                // Điền dữ liệu vào form
                if (productIdInput) productIdInput.value = product.id;
                if (productNameInput) productNameInput.value = product.name;
                if (productPriceInput) productPriceInput.value = product.price;
                if (productStockInput) productStockInput.value = product.stock;
                if (productCategorySelect) productCategorySelect.value = product.categoryId;
                
                // Hiển thị mô tả trong trình soạn thảo
                if (window.quill && product.description) {
                    window.quill.root.innerHTML = product.description;
                }
                
                // Hiển thị hình ảnh sản phẩm hiện tại
                if (imagePreview && product.imageUrl) {
                    const currentImageUrl = ProductService.getImageUrl(product.imageUrl);
                    imagePreview.innerHTML = `
                        <div class="img-wrapper current-image">
                            <img src="${currentImageUrl}" alt="${product.name}" style="max-width: 100px; max-height: 100px; margin-top: 10px; cursor: pointer; border: 1px solid #ddd;" onclick="ProductHandlers.openAdminImagePreviewModal('${currentImageUrl}')">
                            <p class="text-muted small">Current image. Choose a new file to replace it.</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error loading product for edit:', error);
                // Hiển thị thông báo lỗi
                window.ToastService?.error('Error loading product. Please try again.');
            }
        } else {
            // Chế độ thêm mới sản phẩm
            modalTitle.textContent = 'Add New Product';
            if (productIdInput) productIdInput.value = '';
            if (imagePreview) imagePreview.innerHTML = ''; // Ensure preview is clear for new product
        }
        
        // Hiển thị modal
        modal.style.display = 'block';
    },
    
    /**
     * Đóng modal thêm/sửa sản phẩm
     */
    closeProductModal: function() {
        const modal = document.getElementById('product-modal');
        if (modal) modal.style.display = 'none';
        // Also close image preview modal if it's open from here
        const adminImagePreviewModal = document.getElementById('image-preview-modal');
        if (adminImagePreviewModal && adminImagePreviewModal.style.display === 'block') {
            adminImagePreviewModal.style.display = 'none';
        }
    },

    /**
     * Mở modal xác nhận xóa sản phẩm
     * @param {string} productId - ID của sản phẩm cần xóa
     */
    openDeleteModal: function(productId) {
        const modal = document.getElementById('delete-modal');
        const idInput = document.getElementById('delete-product-id');
        
        if (!modal || !idInput) return;
        
        // Lưu ID sản phẩm cần xóa
        idInput.value = productId;
        
        // Hiển thị modal
        modal.style.display = 'block';
    },
    
    /**
     * Đóng modal xác nhận xóa sản phẩm
     */
    closeDeleteModal: function() {
        const modal = document.getElementById('delete-modal');
        if (modal) modal.style.display = 'none';
    },
    
    /**
     * Lưu sản phẩm (thêm mới hoặc cập nhật)
     */
    saveProduct: async function() {
        try {
            const form = document.getElementById('product-form');
            const productIdInput = document.getElementById('product-id');
            const productNameInput = document.getElementById('product-name');
            const productPriceInput = document.getElementById('product-price');
            const productStockInput = document.getElementById('product-stock');
            const productCategorySelect = document.getElementById('product-category-modal');
            const productImageInput = document.getElementById('product-image'); // Get the file input
            
            if (!form || !productNameInput || !productPriceInput || !productStockInput || !productCategorySelect) {
                throw new Error('Required form elements not found');
            }
            
            // Validate form
            if (!productNameInput.value.trim()) {
                window.ToastService?.error('Product name is required');
                return;
            }
            
            if (!productPriceInput.value || isNaN(productPriceInput.value) || Number(productPriceInput.value) <= 0) {
                window.ToastService?.error('Valid product price is required');
                return;
            }
            
            if (!productStockInput.value || isNaN(productStockInput.value) || Number(productStockInput.value) < 0) {
                 window.ToastService?.error('Valid stock quantity is required');
                return;
            }
            
            if (!productCategorySelect.value) {
                window.ToastService?.error('Please select a category');
                return;
            }
            
            // Chuẩn bị dữ liệu FormData
            const formData = new FormData();
            formData.append('name', productNameInput.value.trim());
            formData.append('price', productPriceInput.value);
            formData.append('stock', productStockInput.value);
            formData.append('categoryId', productCategorySelect.value);
            
            // Lấy mô tả từ trình soạn thảo
            if (window.quill) {
                formData.append('description', quill.root.innerHTML);
            }
            
            // Thêm file hình ảnh nếu người dùng đã chọn file mới
            if (productImageInput && productImageInput.files && productImageInput.files[0]) {
                formData.append('imageFile', productImageInput.files[0]); // Use 'imageFile' to match backend
            }
            
            let response;
            const productId = productIdInput ? productIdInput.value : null;

            if (productId) {
                // Cập nhật sản phẩm
                // If you need to send ID in FormData for PUT:
                // formData.append('id', productId); // Or ensure your backend gets ID from URL
                response = await ProductService.updateProduct(productId, formData);
            } else {
                // Thêm mới sản phẩm
                response = await ProductService.createProduct(formData);
            }
            
            // Đóng modal và reload sản phẩm
            this.closeProductModal();
            this.loadProducts();
            
            // Hiển thị thông báo thành công
            window.ToastService?.success(`Product ${productId ? 'updated' : 'created'} successfully!`);
            
            // Notify the shop to update product display
            if (window.ShopProductService) {
                window.ShopProductService.notifyProductChange();
            }
        } catch (error) {
            console.error('Error saving product:', error);
            window.ToastService?.error(`Error saving product: ${error.message || 'Please try again.'}`);
        }
    },
    
    /**
     * Xóa sản phẩm
     */
    deleteProduct: async function() {
        try {
            const idInput = document.getElementById('delete-product-id');
            if (!idInput || !idInput.value) return;
            
            const productId = idInput.value;
            
            await ProductService.deleteProduct(productId);
            
            this.closeDeleteModal();
            this.loadProducts();
            
            window.ToastService?.success('Product removed successfully!');
            
            if (window.ShopProductService) {
                window.ShopProductService.notifyProductChange();
            }
        } catch (error) {
            console.error('Error removing product:', error);
            window.ToastService?.error(`Failed to remove product: ${error.message}`);
        }
    },
    
    /**
     * Thiết lập trình soạn thảo mô tả sản phẩm
     */
    setupProductEditor: function() {
        // Đã được thiết lập trong admin.html
        if (!window.quill) {
            console.warn('Quill editor not found');
        }
    },
    
    /**
     * Rút gọn mô tả sản phẩm cho hiển thị trong bảng
     * @param {string} description - Mô tả sản phẩm
     * @param {number} maxLength - Độ dài tối đa
     * @returns {string} Mô tả đã rút gọn
     */
    truncateDescription: function(description, maxLength) {
        // Nếu description là HTML, loại bỏ các thẻ HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Mở modal xem trước ảnh lớn cho trang Admin
     * @param {string} imageUrl - URL của ảnh cần xem
     */
    openAdminImagePreviewModal: function(imageUrl) {
        const modal = document.getElementById('image-preview-modal'); // Uses existing modal in admin.html
        const modalImg = document.getElementById('preview-image');    // Uses existing img in admin.html
        if (modal && modalImg) {
            modalImg.src = imageUrl;
            modal.style.display = "flex"; // Changed to flex for better centering with CSS
        }
    },

    /**
     * Toggle product active status
     * @param {string} productId - ID of product to toggle status
     * @param {boolean} active - New status (true for active, false for inactive)
     */
    toggleProductStatus: async function(productId, active) {
        try {
            await ProductService.toggleProductStatus(productId, active);
            
            // Refresh product list
            this.loadProducts();
            
            // Show success message
            const statusText = active ? 'activated' : 'deactivated';
            window.ToastService?.success(`Product ${statusText} successfully!`);
            
            // Update shop product display if that service exists
            if (window.ShopProductService) {
                window.ShopProductService.refreshProducts();
            }
        } catch (error) {
            console.error('Error toggling product status:', error);
            window.ToastService?.error(`Error changing product status: ${error.message}`);
        }
    },
};

// Add this line at the end of the file to ensure it's globally available
window.ProductHandlers = ProductHandlers;
