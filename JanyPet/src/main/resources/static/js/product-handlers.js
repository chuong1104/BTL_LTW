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
        console.log('Initializing product events');
        
        // Load sản phẩm khi vào trang
        this.loadProducts();
        
        // Các sự kiện cho modal thêm/sửa sản phẩm
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            // Remove existing listeners first to prevent duplicates
            addProductBtn.replaceWith(addProductBtn.cloneNode(true));
            const newAddBtn = document.getElementById('add-product-btn');
            newAddBtn.addEventListener('click', () => this.openProductModal());
        }
        
        const saveProductBtn = document.getElementById('save-product-btn');
        if (saveProductBtn) {
            // Remove existing listeners first to prevent duplicates
            saveProductBtn.replaceWith(saveProductBtn.cloneNode(true));
            const newSaveBtn = document.getElementById('save-product-btn');
            newSaveBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent form submission
                this.saveProduct();
            });
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
            confirmDeleteBtn.addEventListener('click', () => this.softDeleteProduct());
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

        // Add filter for active/inactive products
        const filterStatus = document.getElementById('filter-status');
        if (filterStatus) {
            // Add option for showing inactive products
            if (!Array.from(filterStatus.options).some(option => option.value === "Inactive")) {
                const inactiveOption = document.createElement('option');
                inactiveOption.value = "Inactive";
                inactiveOption.textContent = "Inactive (Hidden)";
                filterStatus.appendChild(inactiveOption);
            }

            filterStatus.addEventListener('change', () => this.filterProducts());
        }
    },
    
    /**
     * Tải danh sách sản phẩm
     */
    loadProducts: async function() {
        console.log('Loading products...');
        
        try {
            // Check if apiService exists
            if (!window.apiService) {
                console.error('API Service not available! Check if api-service.js is loaded.');
                return;
            }
            
            // Use getAllProductsIncludingInactive for admin panel to show all products
            this.productData = await window.apiService.getAllProductsIncludingInactive();
            console.log('Products loaded successfully:', this.productData.length, 'products');
            this.renderProductsTable();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showLoadingError(error.message || 'Failed to load products');
        }
    },
    
    /**
     * Show error when loading products fails
     */
    showLoadingError: function(message) {
        const tableBody = document.getElementById('products-table-body');
        if (!tableBody) return;
        
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    ${message}
                    <div class="mt-3">
                        <button class="btn btn-outline-primary btn-sm" onclick="ProductHandlers.loadProducts()">
                            <i class="fas fa-sync-alt me-1"></i> Try Again
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        // Show toast notification if available
        if (window.toastService && window.toastService.showErrorToast) {
            window.toastService.showErrorToast('Failed to load products: ' + message);
        } else if (window.showToast) {
            window.showToast('Failed to load products: ' + message, 'error');
        }
    },
    
    /**
     * Render products table with status indicator
     */
    renderProductsTable: function() {
        const tableBody = document.getElementById('products-table-body');
        if (!tableBody) return;
        
        if (!this.productData || this.productData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        No products found. <a href="#" onclick="ProductHandlers.openProductModal(); return false;">Add your first product</a>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = '';
        
        // Apply filters if elements exist, otherwise use all products
        let productsToShow;
        try {
            productsToShow = this.filterProducts();
            if (!productsToShow || !Array.isArray(productsToShow)) {
                console.warn('Filter function did not return an array, using all products instead');
                productsToShow = [...this.productData];
            }
        } catch (error) {
            console.error('Error filtering products:', error);
            productsToShow = [...this.productData];
        }
        
        productsToShow.forEach((product) => {
            const row = document.createElement('tr');
            row.className = product.isActive ? '' : 'inactive-product';
            
            // Create truncated description with proper HTML escaping
            const truncatedDescription = this.truncateDescription(product.description || '', 100);
            
            // Create status badge
            const statusBadge = product.isActive
              ? '<span class="status-badge active">Active</span>'
              : '<span class="status-badge inactive">Inactive</span>';
            
            const actions = `
                <div class="actions">
                  <button class="btn btn-sm btn-link view-product" title="View Details" data-id="${product.id}">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-link edit-product" title="Edit Product" data-id="${product.id}">
                    <i class="fas fa-edit"></i>
                  </button>
                  ${product.isActive 
                    ? `<button class="btn btn-sm btn-link delete-product" title="Deactivate Product" data-id="${product.id}">
                        <i class="fas fa-ban"></i>
                      </button>` 
                    : `<button class="btn btn-sm btn-link restore-product" title="Restore Product" data-id="${product.id}">
                        <i class="fas fa-undo-alt"></i>
                      </button>`
                  }
                  ${!product.isActive ? 
                    `<button class="permanent-delete-product btn btn-sm btn-outline-danger ms-1" 
                       data-product-id="${product.id}" title="Permanently Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>` : ''}
                </div>
            `;
            
            row.innerHTML = `
              <td><input type="checkbox" class="product-checkbox" value="${product.id}"></td>
              <td class="image-cell">
                <div class="image-preview-container">
                  <img src="${product.imageUrl || '/images/no-image.png'}" alt="${product.name}" class="product-image">
                  <div class="image-preview-overlay">
                    <button class="image-preview-button" title="View Image" onclick="ProductHandlers.openAdminImagePreviewModal('${product.imageUrl || '/images/no-image.png'}')">
                      <i class="fas fa-search-plus"></i>
                    </button>
                  </div>
                </div>
              </td>
              <td>
                <div class="product-name fw-medium">${product.name}</div>
                <div class="small text-muted">#${product.id.substring(0, 6)}</div>
              </td>
              <td><div class="product-description">${truncatedDescription}</div></td>
              <td>${this.formatCurrency(product.price)}</td>
              <td>${product.stock}</td>
              <td>${statusBadge}</td>
              <td>
                ${actions}
              </td>
            `;
            
            tableBody.appendChild(row);
          });
          
          this.setupProductActionButtons();
    },

    /**
     * Apply styles to product rows based on status
     */
    applyProductStyles: function() {
        document.querySelectorAll('.inactive-product').forEach(row => {
            row.style.opacity = '0.6';
            row.style.backgroundColor = '#f8f8f8';
        });
    },
    
    /**
     * Filter products based on status and category
     * @returns {Array} Filtered products array
     */
    filterProducts: function() {
        const filterStatus = document.getElementById('filter-status');
        const filterCategory = document.getElementById('filter-category');
        const sortBy = document.getElementById('sort-by');
        
        if (!this.productData) return [];
        
        let filteredProducts = [...this.productData]; // Create a copy of the array
        
        if (filterStatus && filterStatus.value) {
            const statusValue = filterStatus.value;
            if (statusValue === 'Inactive') {
                filteredProducts = filteredProducts.filter(product => product.isActive === false);
            } else if (statusValue === 'Active') {
                filteredProducts = filteredProducts.filter(product => product.isActive === true);
            }
            // If 'All', no filtering needed
        }
        
        if (filterCategory && filterCategory.value) {
            const categoryValue = filterCategory.value;
            if (categoryValue !== 'All') {
                filteredProducts = filteredProducts.filter(product => product.categoryId === categoryValue);
            }
        }
        
        if (sortBy && sortBy.value) {
            const sortValue = sortBy.value;
            switch (sortValue) {
                case 'name-asc':
                    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                case 'price-asc':
                    filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                    break;
                case 'price-desc':
                    filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                    break;
                case 'date-asc':
                    filteredProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    break;
                case 'date-desc':
                    filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
            }
        }
        
        return filteredProducts;
    },
    
    /**
     * Thiết lập các sự kiện cho nút sửa và xóa sản phẩm
     */
    setupProductActionButtons: function() {
        // View product buttons
        document.querySelectorAll('.view-product').forEach((btn) => {
            btn.addEventListener('click', (e) => {
              const productId = e.currentTarget.dataset.id;
              this.openProductDetails(productId);
            });
          });
        
        // Thiết lập các sự kiện cho nút sửa
        const editButtons = document.querySelectorAll('.edit-product');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                this.openProductModal(productId);
            });
        });
        
        // Thiết lập các sự kiện cho nút xóa
        const deleteButtons = document.querySelectorAll('.delete-product');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                this.openDeleteModal(productId);
            });
        });

        // Setup restore buttons
        const restoreButtons = document.querySelectorAll('.restore-product');
        restoreButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                this.restoreProduct(productId);
            });
        });
        
        // Add permanent delete buttons for inactive products
        const permanentDeleteButtons = document.querySelectorAll('.permanent-delete-product');
        permanentDeleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = button.getAttribute('data-product-id');
                if (productId) {
                    this.openPermanentDeleteModal(productId);
                }
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
    // Add flag to prevent duplicate submissions
    isSavingProduct: false,

    saveProduct: async function() {
        // Prevent multiple submissions
        if (this.isSavingProduct) {
            console.log('Save operation already in progress');
            return;
        }
        
        this.isSavingProduct = true;
        
        try {
            const form = document.getElementById('product-form');
            const productIdInput = document.getElementById('product-id');
            const productNameInput = document.getElementById('product-name');
            const productPriceInput = document.getElementById('product-price');
            const productStockInput = document.getElementById('product-stock');
            const productCategorySelect = document.getElementById('product-category-modal');
            const productImageInput = document.getElementById('product-image');
            
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
            if (window.ShopProductService && typeof window.ShopProductService.notifyProductChange === 'function') {
                window.ShopProductService.notifyProductChange();
            }
        } catch (error) {
            console.error('Error saving product:', error);
            window.ToastService?.error(`Error saving product: ${error.message || 'Please try again.'}`);
        } finally {
            // Always reset the saving flag when done
            this.isSavingProduct = false;
        }
    },
    
    /**
     * Soft delete a product (set isActive to false)
     */
    softDeleteProduct: async function() {
        try {
            const productId = document.getElementById('delete-product-id').value;
            if (!productId) {
                throw new Error('Product ID is missing');
            }
            
            // Call the API to soft delete the product
            await window.apiService.softDeleteProduct(productId);
            
            // Close the delete modal
            this.closeDeleteModal();
            
            // Update local data and UI
            const productIndex = this.productData.findIndex(p => p.id === productId);
            if (productIndex >= 0) {
                this.productData[productIndex].isActive = false;
                this.renderProductsTable(); // Re-render the table to reflect changes
            }
            
            // Show success toast
            if (window.toastService && window.toastService.showSuccessToast) {
                window.toastService.showSuccessToast('Product successfully deactivated');
            } else if (window.showToast) {
                window.showToast('Product successfully deactivated', 'success');
            }
        } catch (error) {
            console.error('Error deactivating product:', error);
            if (window.toastService && window.toastService.showErrorToast) {
                window.toastService.showErrorToast('Failed to deactivate product: ' + (error.message || 'Unknown error'));
            } else if (window.showToast) {
                window.showToast('Failed to deactivate product: ' + (error.message || 'Unknown error'), 'error');
            }
        }
    },

    /**
     * Restore a soft-deleted product
     */
    restoreProduct: async function(productId) {
        try {
            if (!productId) {
                throw new Error('Product ID is missing');
            }
            
            // Call the API to restore the product
            await window.apiService.restoreProduct(productId);
            
            // Update local data and UI
            const productIndex = this.productData.findIndex(p => p.id === productId);
            if (productIndex >= 0) {
                this.productData[productIndex].isActive = true;
                this.renderProductsTable(); // Re-render the table to reflect changes
            }
            
            // Show success toast
            if (window.toastService && window.toastService.showSuccessToast) {
                window.toastService.showSuccessToast('Product successfully restored');
            } else if (window.showToast) {
                window.showToast('Product successfully restored', 'success');
            }
        } catch (error) {
            console.error('Error restoring product:', error);
            if (window.toastService && window.toastService.showErrorToast) {
                window.toastService.showErrorToast('Failed to restore product: ' + (error.message || 'Unknown error'));
            } else if (window.showToast) {
                window.showToast('Failed to restore product: ' + (error.message || 'Unknown error'), 'error');
            }
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
     * Mở modal xem trước ảnh lớn cho trang Admin
     * @param {string} imageUrl - URL của ảnh cần xem
     */
    openAdminImagePreviewModal: function(imageUrl) {
        const modal = document.getElementById('image-preview-modal');
        const modalImg = document.getElementById('preview-image');
        
        if (!modal || !modalImg) {
            console.warn('Image preview modal elements not found');
            return;
        }
        
        modalImg.onerror = function() {
            this.src = 'images/placeholder.jpg';
        };
        
        modalImg.src = imageUrl;
        modal.style.display = "flex";
    },
    
    /**
     * Rút gọn mô tả sản phẩm cho hiển thị trong bảng
     * @param {string} description - Mô tả sản phẩm
     * @param {number} maxLength - Độ dài tối đa
     * @returns {string} Mô tả đã rút gọn
     */
    truncateDescription: function(description, maxLength) {
        if (!description) return 'No description available';
        
        // Nếu description là HTML, loại bỏ các thẻ HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Show enhanced product details when viewing a product
     * @param {string} productId - Product ID to view
     */
    openProductDetails: async function(productId) {
      try {
        // Create a loading indicator in the UI
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-overlay';
        loadingIndicator.innerHTML = `
          <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-3">Loading product details...</p>
          </div>
        `;
        document.body.appendChild(loadingIndicator);
        
        // Fetch product details
        const product = await window.apiService.getProductById(productId);
        
        // Remove loading indicator
        document.body.removeChild(loadingIndicator);
        
        // Show product details
        if (window.EnhancedDetailViews && typeof window.EnhancedDetailViews.showProductDetails === 'function') {
          // Use enhanced views if available
          window.EnhancedDetailViews.showProductDetails(product);
        } else if (window.ModalHandlers && typeof window.ModalHandlers.showDetailModal === 'function') {
          // Fall back to modal handlers if enhanced views not available
          this.createBasicDetailView(product);
        } else {
          // Basic fallback if neither is available
          this.showBasicProductDetail(product);
        }
      } catch (error) {
        console.error('Error loading product details:', error);
        if (window.toastService && window.toastService.showErrorToast) {
          window.toastService.showErrorToast('Failed to load product details: ' + error.message);
        } else {
          alert('Failed to load product details: ' + error.message);
        }
      }
    },
    
    /**
     * Create a basic detail modal for products when enhanced views are not available
     */
    createBasicDetailView: function(product) {
      // Create modal element
      const modalId = `product-detail-${Date.now()}`;
      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'modal';
      modal.style.display = 'none';
      
      // Create modal content
      const content = `
        <div class="modal-content medium">
          <div class="modal-header">
            <h2>Product: ${product.name}</h2>
            <span class="close">&times;</span>
          </div>
          <div class="modal-body">
            <div class="detail-section">
              <div class="d-flex align-items-center justify-content-between">
                <h3>${product.name}</h3>
                <span class="status-badge ${product.isActive ? 'active' : 'inactive'}">${product.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              
              <div style="margin: 20px 0;">
                ${product.imageUrl ? 
                  `<img src="${product.imageUrl}" alt="${product.name}" style="max-width: 100%; max-height: 200px; object-fit: contain;">` : 
                  `<div style="padding: 20px; background: #f8f9fa; text-align: center;">No image available</div>`
                }
              </div>
            </div>
            
            <div style="padding: 15px 0; border-top: 1px solid #dee2e6;">
              <h3>Product Details</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="width: 150px; padding: 8px 0; color: #6c757d;"><strong>ID</strong></td>
                  <td>${product.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d;"><strong>Category</strong></td>
                  <td>${product.categoryName || 'Uncategorized'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d;"><strong>Price</strong></td>
                  <td>${this.formatCurrency(product.price)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d;"><strong>Stock</strong></td>
                  <td>${product.stock} units</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d;"><strong>Description</strong></td>
                  <td>${product.description || 'No description provided'}</td>
                </tr>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="secondary-btn close-btn">Close</button>
          </div>
        </div>
      `;
      
      modal.innerHTML = content;
      document.body.appendChild(modal);
      
      // Add event listeners
      const closeBtn = modal.querySelector('.close');
      const closeModalBtn = modal.querySelector('.close-btn');
      
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
      });
      
      closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
      });
      
      // Show modal
      modal.style.display = 'block';
    },

    /**
     * Show a basic alert with product details as fallback
     */
    showBasicProductDetail: function(product) {
      const details = `
        Product: ${product.name}
        ID: ${product.id}
        Price: ${this.formatCurrency(product.price)}
        Stock: ${product.stock} units
        Category: ${product.categoryName || 'Uncategorized'}
        Status: ${product.isActive ? 'Active' : 'Inactive'}
      `;
      alert(details);
    },
    
    // Add currency formatter function
    formatCurrency: function(amount) {
      if (typeof amount !== 'number') amount = 0;
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        maximumFractionDigits: 0
      }).format(amount);
    },

    /**
     * Mở modal xác nhận xóa vĩnh viễn sản phẩm
     * @param {string} productId - ID của sản phẩm cần xóa vĩnh viễn
     */
    openPermanentDeleteModal: function(productId) {
        const product = this.productData.find(p => p.id === productId);
        if (!product) return;
        
        // Create modal if it doesn't exist
        let modal = document.getElementById('permanent-delete-modal');
        if (!modal) {
            const modalHtml = `
            <div id="permanent-delete-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">Permanently Delete Product</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Warning:</strong> This action cannot be undone!
                        </div>
                        <p>Are you sure you want to permanently delete the product: <strong id="permanent-delete-product-name"></strong>?</p>
                        <p>This will remove the product completely from the database.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="permanent-delete-cancel-btn">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirm-permanent-delete-btn">
                            <i class="fas fa-trash-alt me-1"></i> Permanently Delete
                        </button>
                    </div>
                </div>
            </div>`;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            modal = document.getElementById('permanent-delete-modal');
            
            // Add event listeners to the new modal
            document.getElementById('permanent-delete-cancel-btn').addEventListener('click', 
                () => this.closePermanentDeleteModal());
            
            document.getElementById('confirm-permanent-delete-btn').addEventListener('click', 
                () => this.permanentlyDeleteProduct());
                
            modal.querySelector('.close').addEventListener('click', 
                () => this.closePermanentDeleteModal());
        }
        
        // Set the product to delete
        document.getElementById('permanent-delete-product-name').textContent = product.name;
        document.getElementById('confirm-permanent-delete-btn').dataset.productId = productId;
        
        // Show the modal
        modal.style.display = 'block';
    },

    /**
     * Đóng modal xác nhận xóa vĩnh viễn sản phẩm
     */
    closePermanentDeleteModal: function() {
        const modal = document.getElementById('permanent-delete-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    /**
     * Xóa vĩnh viễn một sản phẩm
     */
    permanentlyDeleteProduct: async function() {
        const productId = document.getElementById('confirm-permanent-delete-btn').dataset.productId;
        if (!productId) return;
        
        try {
            await window.ProductService.permanentlyDeleteProduct(productId);
            this.closePermanentDeleteModal();
            this.loadProducts(); // Refresh the product list
            
            if (window.ToastService?.success) {
                window.ToastService.success('Product permanently deleted successfully');
            } else {
                alert('Product permanently deleted successfully');
            }
            
            // Notify shop if needed
            if (window.ShopProductService?.notifyProductChange) {
                window.ShopProductService.notifyProductChange();
            }
        } catch (error) {
            console.error('Error permanently deleting product:', error);
            if (window.ToastService?.error) {
                window.ToastService.error(`Error deleting product: ${error.message}`);
            } else {
                alert(`Error deleting product: ${error.message || 'Unknown error'}`);
            }
        }
    }
};

// Add this line at the end of the file to ensure it's globally available
window.ProductHandlers = ProductHandlers;

// Add this to the API service if it doesn't exist already
if (!window.ProductService) {
    window.ProductService = {};
}
if (!window.ProductService.permanentlyDeleteProduct) {
    window.ProductService.permanentlyDeleteProduct = function(productId) {
        return fetch(`/api/products/${productId}/permanent`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Failed to permanently delete product');
                });
            }
            return response.json();
        });
    };
}

