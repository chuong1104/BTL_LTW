const InventoryService = {    // Get all inventory movements
    getAllMovements: async function() {
        try {
            const response = await fetch('/api/inventory-movements');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching inventory movements:', error);
            // Return empty array for now to prevent UI errors
            return [];
        }
    },    // Get movement by ID
    getMovementById: async function(id) {
        try {
            const response = await fetch(`/api/inventory-movements/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching movement with id ${id}:`, error);
            throw error;
        }
    },    // Create new movement
    createMovement: async function(movementData) {
        try {
            const response = await fetch('/api/inventory-movements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movementData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating movement:', error);
            throw error;
        }
    },    // Update movement
    updateMovement: async function(id, movementData) {
        try {
            const response = await fetch(`/api/inventory-movements/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movementData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error updating movement with id ${id}:`, error);
            throw error;
        }
    },    // Delete movement
    deleteMovement: async function(id) {
        try {
            const response = await fetch(`/api/inventory-movements/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error deleting movement with id ${id}:`, error);
            throw error;
        }
    },    
    handleMovementSave: async function() {
        console.log('Saving movement...');
        
        try {
            // Get form data
            const movementData = {
                movementType,
                movementDate,
                quantity,
                branchId,
                productId,
                notes
            };

            console.log('Sending movement data:', movementData);

            const result = await InventoryService.createMovement(movementData);
            console.log('Movement saved successfully:', result);
            
            alert('Thêm giao dịch thành công');
            this.hideMovementModal();
            this.loadMovementsData();
            
        } catch (error) {
            console.error('Error saving movement:', error);
            alert(error.message || 'Lỗi khi lưu giao dịch');
        }
    },
    // Get current stock by product and branch
    getCurrentStock: async function(productId, branchId) {
        try {
            const response = await fetch(`/api/inventory-movements/stock/${productId}/${branchId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching current stock:`, error);
            return { quantity: 0 }; // Return default value
        }
    },// Get products by category
    getProductsByCategory: async function(categoryName) {
        try {
            const response = await fetch(`/api/products/category/${categoryName}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching products by category:`, error);
            return []; // Return empty array
        }
    },    // Get movements by branch
    getMovementsByBranch: async function(branchId) {
        try {
            const response = await fetch(`/api/inventory-movements/branch/${branchId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();        } catch (error) {
            console.error(`Error fetching movements by branch:`, error);
            return []; // Return empty array
        }
    },

    // Get total stock for a product across all branches
    getTotalStock: async function(productId) {
        try {
            const response = await fetch(`/api/inventory-movements/total-stock/${productId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching total stock:`, error);
            return { totalQuantity: 0 }; // Return default value
        }
    }
};

const InventoryHandlers = {
    // Flag to prevent multiple initialization
    _initialized: false,
    
    // Initialization
    initializeInventoryEvents: function() {
        // Prevent multiple initialization
        if (this._initialized) {
            console.log('Inventory events already initialized, skipping...');
            return;
        }
        
        console.log('Initializing inventory events...');
        this._initialized = true;
        
        // Add movement button
        const addMovementBtn = document.getElementById('add-inventory-movement-btn');
        if (addMovementBtn) {
            console.log('Found add movement button, attaching event...');
            addMovementBtn.addEventListener('click', this.showAddMovementModal.bind(this));
        } else {
            console.error('Add movement button not found!');
        }        // Movement form submission
        const movementForm = document.getElementById('inventory-movement-form');
        if (movementForm) {
            console.log('Attaching form submit event listener');
            movementForm.addEventListener('submit', this.handleMovementFormSubmit.bind(this));
        } else {
            console.error('Movement form not found!');
        }

        // Save button click handler (needed because button is type="button", not "submit")
        const saveMovementBtn = document.getElementById('save-movement-btn');
        if (saveMovementBtn) {
            console.log('Attaching save button click event listener');
            saveMovementBtn.addEventListener('click', this.handleMovementSave.bind(this));
        } else {
            console.error('Save movement button not found!');
        }

        // Cancel button
        const cancelMovementBtn = document.getElementById('cancel-movement-btn');
        if (cancelMovementBtn) {
            cancelMovementBtn.addEventListener('click', this.hideMovementModal.bind(this));
        }

        // Close modal X button
        const closeButtons = document.querySelectorAll('#inventory-movement-modal .close');
        closeButtons.forEach(button => {
            button.addEventListener('click', this.hideMovementModal.bind(this));
        });

        // Movement type change
        const movementTypeSelect = document.getElementById('movement-type');
        if (movementTypeSelect) {
            movementTypeSelect.addEventListener('change', this.handleMovementTypeChange.bind(this));
        }

        // Branch change
        const branchSelect = document.getElementById('movement-branch');
        if (branchSelect) {
            branchSelect.addEventListener('change', this.handleBranchChange.bind(this));
        }

        // Category change
        const categorySelect = document.getElementById('movement-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', this.handleCategoryChange.bind(this));
        }

        // Product change
        const productSelect = document.getElementById('movement-product');
        if (productSelect) {
            productSelect.addEventListener('change', this.handleProductChange.bind(this));
        }

        // Branch filter
        const branchFilter = document.getElementById('filter-branch');
        if (branchFilter) {
            branchFilter.addEventListener('change', this.handleBranchFilter.bind(this));
        }

        // Load movements data when on inventory section
        if (document.querySelector('#inventory-section.active')) {
            this.loadMovementsData();
        }

        // Add event listener to menu item for inventory section
        const inventoryMenuItem = document.querySelector('.menu-item[data-section="inventory-section"]');
        if (inventoryMenuItem) {
            inventoryMenuItem.addEventListener('click', () => {
                console.log('Inventory section clicked, loading data...');
                this.loadMovementsData();
            });
        }
        
        // Load initial data
        this.loadMovementsData();
    },

    // Load all movements data
    loadMovementsData: async function() {
        console.log('Loading inventory movements data...');
        try {
            const movements = await InventoryService.getAllMovements();
            console.log('Loaded movements list:', movements);
            this.renderMovementsTable(movements);
        } catch (error) {
            console.error('Failed to load movements data:', error);
            // Show empty table instead of error
            this.renderMovementsTable([]);
        }
    },

    // Render movements table
    renderMovementsTable: function(movements) {
        console.log('Rendering movements table with data:', movements);
        const tableBody = document.querySelector('#inventory-table tbody');
        if (!tableBody) {
            console.error('Inventory table body not found!');
            return;
        }

        tableBody.innerHTML = '';

        if (!movements || movements.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Chưa có giao dịch nhập xuất nào</td></tr>';
            return;
        }

        movements.forEach(movement => {
            const row = document.createElement('tr');
            
            const movementTypeText = movement.movementType === 'IMPORT' ? 'Nhập kho' : 'Xuất kho';
            const movementTypeClass = movement.movementType === 'IMPORT' ? 'status active' : 'status pending';
            const date = new Date(movement.movementDate).toLocaleDateString('vi-VN');

            row.innerHTML = `
                <td><input type="checkbox" class="select-item" /></td>
                <td>${movement.id}</td>
                <td><span class="${movementTypeClass}">${movementTypeText}</span></td>
                <td>${date}</td>
                <td>${movement.quantity}</td>
                <td>${movement.branchName || 'N/A'}</td>
                <td>${movement.productName || 'N/A'}</td>
                <td>${movement.notes || ''}</td>
                <td class="actions">
                    <button class="icon-btn edit-btn" data-id="${movement.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete-btn" data-id="${movement.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Add event listeners for edit and delete buttons
        this.addMovementRowEventListeners();
    },

    // Add event listeners to movement table rows
    addMovementRowEventListeners: function() {
        // Edit buttons
        const editButtons = document.querySelectorAll('#inventory-table .edit-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const movementId = e.currentTarget.dataset.id;
                this.editMovement(movementId);
            });
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('#inventory-table .delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const movementId = e.currentTarget.dataset.id;
                this.confirmDeleteMovement(movementId);
            });
        });
    },

    // Show add movement modal
    showAddMovementModal: function() {
        console.log('Showing add movement modal...');
        
        const modal = document.getElementById('inventory-movement-modal');
        const modalTitle = document.getElementById('inventory-movement-title');
        const movementForm = document.getElementById('inventory-movement-form');

        if (!modal) {
            console.error('Modal not found!');
            return;
        }

        // Clear form
        if (movementForm) {
            movementForm.reset();
        }
        
        const movementIdField = document.getElementById('movement-id');
        if (movementIdField) {
            movementIdField.value = '';
        }
        
        const currentQuantityField = document.getElementById('current-quantity');
        if (currentQuantityField) {
            currentQuantityField.value = '';
        }
        
        // Set current date
        const today = new Date().toISOString().split('T')[0];
        const dateField = document.getElementById('movement-date');
        if (dateField) {
            dateField.value = today;
        }

        // Set modal title
        if (modalTitle) {
            modalTitle.textContent = 'Thêm nhập/xuất hàng hóa';
        }

        // Load data for dropdowns
        this.loadBranchesForMovement();
        this.loadCategoriesForMovement();

        // Show modal
        modal.style.display = 'block';
        console.log('Modal should be visible now');
    },    // Hide movement modal
    hideMovementModal: function() {
        const modal = document.getElementById('inventory-movement-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Reset form when hiding modal
        const form = document.getElementById('inventory-movement-form');
        if (form) {
            form.reset();
        }
        
        // Clear all specific fields to ensure clean state
        const fieldsToReset = [
            'movement-id',
            'movement-type', 
            'movement-date',
            'movement-branch',
            'movement-category',
            'movement-product',
            'movement-quantity',
            'movement-notes',
            'current-quantity'
        ];
        
        fieldsToReset.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'select-one') {
                    field.selectedIndex = 0;
                } else {
                    field.value = '';
                }
            }
        });
        
        // Reset save button state
        const saveBtn = document.getElementById('save-movement-btn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu giao dịch';
        }
        
        // Reset product dropdown to disabled state
        const productSelect = document.getElementById('movement-product');
        if (productSelect) {
            productSelect.innerHTML = '<option value="">Chọn sản phẩm</option>';
            productSelect.disabled = true;
        }
    },

    // Handle movement type change
    handleMovementTypeChange: function() {
        const movementType = document.getElementById('movement-type').value;
        const movementLabel = document.getElementById('movement-label');
        
        if (movementLabel) {
            if (movementType === 'IMPORT') {
                movementLabel.textContent = 'nhập';
            } else if (movementType === 'EXPORT') {
                movementLabel.textContent = 'xuất';
            } else {
                movementLabel.textContent = 'nhập/xuất';
            }
        }
    },

    // Handle branch change
    handleBranchChange: async function() {
        // Update current stock when branch changes
        await this.handleProductChange();
    },    // Handle category change
    handleCategoryChange: async function() {
        const categoryName = document.getElementById('movement-category').value;
        const productSelect = document.getElementById('movement-product');
        
        // Clear current quantity when category changes
        const currentQuantityField = document.getElementById('current-quantity');
        if (currentQuantityField) {
            currentQuantityField.value = '';
        }
        
        if (!categoryName) {
            if (productSelect) {
                productSelect.innerHTML = '<option value="">Chọn sản phẩm</option>';
                productSelect.disabled = true;
            }
            return;
        }

        try {
            const products = await InventoryService.getProductsByCategory(categoryName);
            this.populateProductDropdown(products);
            if (productSelect) {
                productSelect.disabled = false;
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            alert('Lỗi khi tải danh sách sản phẩm');
        }
    },

    // Handle product change
    handleProductChange: async function() {
        const productSelect = document.getElementById('movement-product');
        const branchSelect = document.getElementById('movement-branch');
        const currentQuantityField = document.getElementById('current-quantity');
        
        if (!productSelect || !branchSelect || !currentQuantityField) {
            return;
        }
        
        const productId = productSelect.value;
        const branchId = branchSelect.value;
        
        if (!productId || !branchId) {
            currentQuantityField.value = '';
            return;
        }

        try {
            const stock = await InventoryService.getCurrentStock(productId, branchId);
            currentQuantityField.value = stock.quantity || 0;
        } catch (error) {
            console.error('Failed to load current stock:', error);
            currentQuantityField.value = '0';
        }
    },    // Handle movement form submission
    handleMovementFormSubmit: function(event) {
        event.preventDefault();
        this.handleMovementSave();
    },    // Handle save movement
    handleMovementSave: async function() {
        console.log('=== handleMovementSave called ===');
        console.log('Saving movement...');
        
        // Prevent double submission
        const saveBtn = document.getElementById('save-movement-btn');
        console.log('Save button found:', !!saveBtn);
        
        if (saveBtn && saveBtn.disabled) {
            console.log('Save already in progress, ignoring...');
            return;
        }
        
        // Disable save button to prevent double submission
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        }
        
        try {
            // Get form data
            const movementId = document.getElementById('movement-id')?.value;
            const movementType = document.getElementById('movement-type')?.value;
            const movementDate = document.getElementById('movement-date')?.value;
            const branchId = document.getElementById('movement-branch')?.value;
            const productId = document.getElementById('movement-product')?.value;
            const quantityValue = document.getElementById('movement-quantity')?.value;
            const quantity = parseInt(quantityValue);
            const notes = document.getElementById('movement-notes')?.value;

            console.log('Form data:', { movementType, movementDate, branchId, productId, quantity, notes });            // Validate required fields
            if (!movementType || !movementDate || !branchId || !productId || !quantity) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc');
                // Re-enable save button
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu giao dịch';
                }
                return;
            }

            // Additional validation for export
            if (movementType === 'EXPORT') {
                const currentQuantityField = document.getElementById('current-quantity');
                const currentQuantity = parseInt(currentQuantityField?.value) || 0;
                if (quantity > currentQuantity) {
                    alert(`Số lượng xuất (${quantity}) không thể lớn hơn số lượng hiện có (${currentQuantity})`);
                    // Re-enable save button
                    if (saveBtn) {
                        saveBtn.disabled = false;
                        saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu giao dịch';
                    }
                    return;
                }
            }

            const movementData = {
                movementType,
                movementDate,
                quantity,
                branchId,
                productId,
                notes
            };

            console.log('Sending movement data:', movementData);

            if (movementId) {
                // Update existing movement
                await InventoryService.updateMovement(movementId, movementData);
                alert('Cập nhật giao dịch thành công');
            } else {
                // Create new movement
                await InventoryService.createMovement(movementData);
                alert('Thêm giao dịch thành công');
            }

            // Hide modal and reload data
            this.hideMovementModal();
            this.loadMovementsData();
        } catch (error) {
            console.error('Error saving movement:', error);
            alert(error.message || 'Lỗi khi lưu giao dịch');
        } finally {
            // Re-enable save button
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu giao dịch';
            }
        }
    },

    // Edit movement
    editMovement: async function(movementId) {
        try {
            const movement = await InventoryService.getMovementById(movementId);

            // Fill form with movement data
            document.getElementById('movement-id').value = movement.id;
            document.getElementById('movement-type').value = movement.movementType;
            document.getElementById('movement-date').value = movement.movementDate;
            document.getElementById('movement-branch').value = movement.branchId;
            document.getElementById('movement-category').value = movement.categoryId;
            document.getElementById('movement-product').value = movement.productId;
            document.getElementById('movement-quantity').value = movement.quantity;
            document.getElementById('movement-notes').value = movement.notes || '';

            // Load related data
            await this.handleCategoryChange();
            await this.handleProductChange();

            // Update modal title
            document.getElementById('inventory-movement-title').textContent = 'Chỉnh sửa giao dịch';

            // Show modal
            document.getElementById('inventory-movement-modal').style.display = 'block';
        } catch (error) {
            console.error('Error fetching movement for edit:', error);
            alert('Lỗi khi lấy thông tin giao dịch');
        }
    },

    // Confirm delete movement
    confirmDeleteMovement: function(movementId) {
        if (confirm('Bạn có chắc chắn muốn xóa giao dịch này? Hành động này không thể hoàn tác.')) {
            this.deleteMovement(movementId);
        }
    },

    // Delete movement
    deleteMovement: async function(movementId) {
        try {
            await InventoryService.deleteMovement(movementId);
            alert('Xóa giao dịch thành công');
            this.loadMovementsData();
        } catch (error) {
            console.error('Error deleting movement:', error);
            alert(error.message || 'Lỗi khi xóa giao dịch');
        }
    },

    // Handle branch filter
    handleBranchFilter: async function(event) {
        const branchId = event.target.value;
        
        try {
            let movements;
            if (branchId) {
                movements = await InventoryService.getMovementsByBranch(branchId);
            } else {
                movements = await InventoryService.getAllMovements();
            }
            
            this.renderMovementsTable(movements);
        } catch (error) {
            console.error('Error filtering movements by branch:', error);
            alert('Lỗi khi lọc giao dịch theo chi nhánh');
        }
    },

    // Load branches for movement dropdown
    loadBranchesForMovement: async function() {
        try {
            console.log('Loading branches for movement...');
            const response = await fetch('/api/branches');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const branches = await response.json();
            console.log('Loaded branches:', branches);
            this.populateBranchDropdown(branches);
            this.populateBranchFilter(branches);
        } catch (error) {
            console.error('Failed to load branches for movement:', error);
        }
    },

    // Populate branch dropdown
    populateBranchDropdown: function(branches) {
        const branchSelect = document.getElementById('movement-branch');
        if (!branchSelect) {
            console.error('Branch select element not found!');
            return;
        }

        // Clear existing options except placeholder
        branchSelect.innerHTML = '<option value="">Chọn chi nhánh</option>';

        // Add branch options
        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch.id;
            option.textContent = branch.name;
            branchSelect.appendChild(option);
        });

        console.log('Populated branch dropdown with', branches.length, 'branches');
    },

    // Populate branch filter
    populateBranchFilter: function(branches) {
        const branchFilter = document.getElementById('filter-branch');
        if (!branchFilter) {
            console.error('Branch filter element not found!');
            return;
        }

        // Save current selection
        const currentValue = branchFilter.value;

        // Clear existing options except placeholder
        branchFilter.innerHTML = '<option value="">Tất cả chi nhánh</option>';

        // Add branch options
        branches.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch.id;
            option.textContent = branch.name;
            branchFilter.appendChild(option);
        });

        // Restore selection
        branchFilter.value = currentValue;

        console.log('Populated branch filter with', branches.length, 'branches');
    },

    // Load categories for movement dropdown
    loadCategoriesForMovement: async function() {
        try {
            console.log('Loading categories for movement...');
            const response = await fetch('/api/categories');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const categories = await response.json();
            console.log('Loaded categories:', categories);
            this.populateCategoryDropdown(categories);
        } catch (error) {
            console.error('Failed to load categories for movement:', error);
        }
    },

    // Populate category dropdown
    populateCategoryDropdown: function(categories) {
        const categorySelect = document.getElementById('movement-category');
        if (!categorySelect) {
            console.error('Category select element not found!');
            return;
        }

        // Clear existing options except placeholder
        categorySelect.innerHTML = '<option value="">Chọn danh mục</option>';        // Add category options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name; // Use category name instead of ID
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        console.log('Populated category dropdown with', categories.length, 'categories');
    },

    // Populate product dropdown
    populateProductDropdown: function(products) {
        const productSelect = document.getElementById('movement-product');
        if (!productSelect) {
            console.error('Product select element not found!');
            return;
        }

        // Clear existing options except placeholder
        productSelect.innerHTML = '<option value="">Chọn sản phẩm</option>';

        // Add product options
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (${product.sku || product.id})`;
            productSelect.appendChild(option);
        });

        console.log('Populated product dropdown with', products.length, 'products');
    },    // Method to reset initialization (for testing/debugging)
    resetInitialization: function() {
        this._initialized = false;
        console.log('Inventory handlers initialization reset');
    },

    // Method to force reinitialize (for debugging)
    forceReinitialize: function() {
        this.resetInitialization();
        this.initializeInventoryEvents();
        console.log('Inventory handlers force reinitialized');
    },
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing inventory handlers...');
    InventoryHandlers.initializeInventoryEvents();
});

// Export for use in other scripts
window.InventoryService = InventoryService;
window.InventoryHandlers = InventoryHandlers;
