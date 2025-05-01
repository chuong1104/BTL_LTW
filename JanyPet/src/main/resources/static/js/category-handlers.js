// Category API Service
const CategoryService = {
    // Get all categories
    getAllCategories: async function() {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },
    
    // Get a category by ID
    getCategoryById: async function(id) {
        try {
            const response = await fetch(`/api/categories/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching category with id ${id}:`, error);
            throw error;
        }
    },
    
    // Create a new category
    createCategory: async function(categoryData) {
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },
    
    // Update a category
    updateCategory: async function(id, categoryData) {
        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error updating category with id ${id}:`, error);
            throw error;
        }
    },
    
    // Delete a category
    deleteCategory: async function(id) {
        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return true;
        } catch (error) {
            console.error(`Error deleting category with id ${id}:`, error);
            throw error;
        }
    }
};

// Category UI Handlers
const CategoryHandlers = {
    // Store current category ID when editing
    currentCategoryId: null,
    
    // Initialize category event listeners
    initializeCategoryEvents: function() {
        // Load categories when section becomes active
        document.querySelectorAll('.menu-item').forEach(item => {
            if (item.dataset.section === 'categories-section') {
                item.addEventListener('click', this.loadCategories.bind(this));
            }
        });
        
        // Form submission for new/edit category
        const categoryForm = document.getElementById('category-form');
        if (categoryForm) {
            categoryForm.addEventListener('submit', this.handleCategoryFormSubmit.bind(this));
        }
        
        // Add category button
        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', this.resetCategoryForm.bind(this));
        }
        
        // Initial load of categories
        if (document.querySelector('#categories-section.active')) {
            this.loadCategories();
        }
    },
    
    // Load all categories into the table
    loadCategories: async function() {
        try {
            const categories = await CategoryService.getAllCategories();
            const tableBody = document.querySelector('#categories-section .data-table tbody');
            
            if (!tableBody) {
                console.error('Category table body not found');
                return;
            }
            
            tableBody.innerHTML = '';
            
            categories.forEach(category => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${category.name}</td>
                    <td>${category.description || ''}</td>
                    <td><span class="status active">Active</span></td>
                    <td class="actions">
                        <button class="icon-btn edit-btn" data-id="${category.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn delete-btn" data-id="${category.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Add event listeners to the edit and delete buttons
            this.addButtonEventListeners();
            
        } catch (error) {
            console.error('Failed to load categories', error);
            window.toastService?.showError('Failed to load categories');
        }
    },
    
    // Handle category form submission (create or update)
    handleCategoryFormSubmit: async function(event) {
        event.preventDefault();
        
        const nameInput = document.getElementById('category-name');
        const descInput = document.getElementById('category-description');
        const statusSelect = document.getElementById('category-status');
        
        if (!nameInput || !nameInput.value.trim()) {
            window.toastService?.showError('Category name is required');
            return;
        }
        
        const categoryData = {
            name: nameInput.value.trim(),
            description: descInput.value.trim()
            // Note: status is not used in backend entity but can be added later
        };
        
        try {
            if (this.currentCategoryId) {
                // Update existing category
                await CategoryService.updateCategory(this.currentCategoryId, categoryData);
                window.toastService?.showSuccess('Category updated successfully');
            } else {
                // Create new category
                await CategoryService.createCategory(categoryData);
                window.toastService?.showSuccess('Category created successfully');
            }
            
            // Reset form and reload categories
            this.resetCategoryForm();
            this.loadCategories();
            
        } catch (error) {
            console.error('Error saving category:', error);
            window.toastService?.showError('Failed to save category');
        }
    },
    
    // Reset the category form for adding a new category
    resetCategoryForm: function() {
        const form = document.getElementById('category-form');
        const title = document.querySelector('.category-form-card h3');
        
        if (form) {
            form.reset();
            this.currentCategoryId = null;
        }
        
        if (title) {
            title.textContent = 'Add New Category';
        }
        
        // Change submit button text
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Save Category';
        }
    },
    
    // Populate form with category data for editing
    editCategory: async function(id) {
        try {
            const category = await CategoryService.getCategoryById(id);
            
            const nameInput = document.getElementById('category-name');
            const descInput = document.getElementById('category-description');
            const title = document.querySelector('.category-form-card h3');
            
            if (nameInput) nameInput.value = category.name;
            if (descInput) descInput.value = category.description || '';
            
            this.currentCategoryId = category.id;
            
            if (title) {
                title.textContent = 'Edit Category';
            }
            
            // Change submit button text
            const form = document.getElementById('category-form');
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Update Category';
            }
            
            // Scroll to the form for better UX
            document.querySelector('.category-form-card').scrollIntoView({
                behavior: 'smooth'
            });
            
        } catch (error) {
            console.error(`Failed to load category with ID ${id}`, error);
            window.toastService?.showError('Failed to load category for editing');
        }
    },
    
    // Delete a category
    deleteCategory: async function(id) {
        if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            try {
                await CategoryService.deleteCategory(id);
                window.toastService?.showSuccess('Category deleted successfully');
                this.loadCategories();
            } catch (error) {
                console.error(`Failed to delete category with ID ${id}`, error);
                window.toastService?.showError('Failed to delete category');
            }
        }
    },
    
    // Add event listeners to edit and delete buttons
    addButtonEventListeners: function() {
        const editButtons = document.querySelectorAll('#categories-section .edit-btn');
        const deleteButtons = document.querySelectorAll('#categories-section .delete-btn');
        
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const categoryId = button.dataset.id;
                this.editCategory(categoryId);
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const categoryId = button.dataset.id;
                this.deleteCategory(categoryId);
            });
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    CategoryHandlers.initializeCategoryEvents();
});

// Export for use in other scripts
window.CategoryHandlers = CategoryHandlers;
window.CategoryService = CategoryService;