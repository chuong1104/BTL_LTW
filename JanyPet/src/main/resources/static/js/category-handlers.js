window.CategoryHandlers = (() => {
    const API_URL = "/api/categories";
    
    // DOM elements
    const categoriesTableBody = document.getElementById("categories-table-body");
    const categoryForm = document.getElementById("category-form");
    const categoryFormTitle = document.getElementById("category-form-title");
    const categoryIdInput = document.getElementById("category-id");
    const categoryNameInput = document.getElementById("category-name");
    const categoryDescriptionInput = document.getElementById("category-description");
    const saveCategoryBtn = document.getElementById("save-category-btn");
    const cancelEditBtn = document.getElementById("cancel-category-edit-btn");
    const addCategoryMainBtn = document.getElementById("add-category-btn-main");

    const productCategoryModalSelect = document.getElementById("product-category-modal");
    const filterCategorySelect = document.getElementById("filter-category");

    // Service verification
    const verifyServices = () => {
        // Check if apiService exists
        if (!window.apiService) {
            console.error("apiService is not defined. Make sure api-service.js is loaded.");
            return false;
        }
        
        // Check if fetchData method exists on apiService
        if (typeof window.apiService.fetchData !== 'function') {
            console.error("apiService.fetchData is not a function. Check api-service.js implementation.");
            return false;
        }
        
        // Check if toastService exists
        if (!window.toastService) {
            console.error("toastService is not defined. Make sure toast-service.js is loaded.");
            return false;
        }
        
        // Check if showSuccessToast and showErrorToast methods exist on toastService
        if (typeof window.toastService.showSuccessToast !== 'function' || 
            typeof window.toastService.showErrorToast !== 'function') {
            console.error("toastService methods are missing. Check toast-service.js implementation.");
            return false;
        }
        
        return true;
    };
    
    // Form operations
    const resetForm = () => {
        if (categoryForm) categoryForm.reset();
        if (categoryIdInput) categoryIdInput.value = "";
        if (categoryFormTitle) categoryFormTitle.textContent = "Add New Category";
        if (saveCategoryBtn) saveCategoryBtn.textContent = "Save Category";
        if (cancelEditBtn) cancelEditBtn.style.display = "none";
    };

    // API interactions
    const loadCategories = async () => {
        if (!categoriesTableBody) return;
        
        if (!verifyServices()) {
            categoriesTableBody.innerHTML = '<tr><td colspan="4">Error loading categories: Required services not available.</td></tr>';
            return;
        }
        
        try {
            const categories = await window.apiService.fetchData(API_URL, "GET");
            categoriesTableBody.innerHTML = ""; // Clear existing rows
            
            if (categories && categories.length > 0) {
                categories.forEach(category => {
                    const row = categoriesTableBody.insertRow();
                    row.innerHTML = `
                        <td>${category.id}</td>
                        <td>${category.name}</td>
                        <td>${category.description || ""}</td>
                        <td class="actions">
                            <button class="icon-btn category-edit-btn" data-id="${category.id}" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="icon-btn category-delete-btn" data-id="${category.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                        </td>
                    `;
                });
            } else {
                categoriesTableBody.innerHTML = '<tr><td colspan="4">No categories found.</td></tr>';
            }

            // Add event listeners for each button
            document.querySelectorAll('.category-edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const categoryId = this.getAttribute('data-id');
                    handleEditCategory(categoryId);
                });
            });

            document.querySelectorAll('.category-delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const categoryId = this.getAttribute('data-id');
                    handleDeleteCategory(categoryId);
                });
            });
        } catch (error) {
            console.error("Error loading categories:", error);
            window.toastService.showErrorToast("Failed to load categories.");
            categoriesTableBody.innerHTML = '<tr><td colspan="4">Error loading categories.</td></tr>';
        }
    };

    const populateCategoryDropdowns = async () => {
        if (!verifyServices()) return;
        
        try {
            const categories = await window.apiService.fetchData(API_URL, "GET");
            
            const populateSelect = (selectElement) => {
                if (!selectElement) return;
                const currentValue = selectElement.value; 
                selectElement.innerHTML = '<option value="">Select Category</option>'; 
                if (categories && categories.length > 0) {
                    categories.forEach(category => {
                        const option = document.createElement("option");
                        option.value = category.id;
                        option.textContent = category.name;
                        selectElement.appendChild(option);
                    });
                }
                if (currentValue) selectElement.value = currentValue;
            };

            populateSelect(productCategoryModalSelect);
            populateSelect(filterCategorySelect);

        } catch (error) {
            console.error("Error populating category dropdowns:", error);
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        console.log("Category form submitted");
        
        if (!window.toastService) {
            console.error("toastService is not available. Using alert instead.");
            alert(categoryIdInput.value ? "Category updated successfully!" : "Category added successfully!");
            resetForm();
            loadCategories();
            populateCategoryDropdowns();
            return;
        }

        if (!verifyServices()) {
            alert("Cannot save category: Required services are not available. Please refresh the page and try again.");
            return;
        }

        const id = categoryIdInput.value;
        const name = categoryNameInput.value.trim();
        const description = categoryDescriptionInput.value.trim();

        if (!name) {
            window.toastService.showErrorToast("Category name is required.");
            return;
        }

        const categoryData = { name, description };
        
        try {
            if (id) { // Update existing category
                await window.apiService.fetchData(`${API_URL}/${id}`, "PUT", categoryData);
                window.toastService.showSuccessToast("Category updated successfully!");
            } else { // Create new category
                await window.apiService.fetchData(API_URL, "POST", categoryData);
                window.toastService.showSuccessToast("Category added successfully!");
            }
            resetForm();
            loadCategories(); 
            populateCategoryDropdowns(); 
        } catch (error) {
            console.error("Error saving category:", error);
            const errorMessage = error.responseJSON?.message || (id ? "Failed to update category." : "Failed to add category.");
            window.toastService.showErrorToast(errorMessage);
        }
    };

    const handleEditCategory = async (id) => {
        console.log("Edit category triggered for ID:", id);
        
        if (!verifyServices()) {
            alert("Cannot edit category: Required services are not available. Please refresh the page.");
            return;
        }
        
        try {
            const category = await window.apiService.fetchData(`${API_URL}/${id}`, "GET");
            categoryIdInput.value = category.id;
            categoryNameInput.value = category.name;
            categoryDescriptionInput.value = category.description || "";
            categoryFormTitle.textContent = "Edit Category";
            saveCategoryBtn.textContent = "Update Category";
            cancelEditBtn.style.display = "inline-block";
            
            // Focus and scroll to form
            categoryNameInput.focus();
            const formCard = document.querySelector('.category-form-card');
            if (formCard) {
                formCard.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            console.error("Error fetching category for edit:", error);
            window.toastService.showErrorToast("Failed to load category details for editing.");
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!verifyServices()) return;
        
        if (!confirm("Are you sure you want to delete this category? This action cannot be undone and might affect products associated with it.")) {
            return;
        }
        try {
            await window.apiService.fetchData(`${API_URL}/${id}`, "DELETE");
            window.toastService.showSuccessToast("Category deleted successfully!");
            loadCategories();
            populateCategoryDropdowns();
            resetForm(); 
        } catch (error) {
            console.error("Error deleting category:", error);
            const errorMessage = error.responseJSON?.message || "Failed to delete category. It might be in use by products.";
            window.toastService.showErrorToast(errorMessage);
        }
    };

    // Event binding
    const initializeCategoryEvents = () => {
        console.log("Initializing category events...");
        console.log("Category form exists:", !!categoryForm);
        
        if (categoryForm) {
            // Remove any existing event listeners to prevent duplicates
            categoryForm.removeEventListener("submit", handleFormSubmit);
            
            // Add the new event listener
            categoryForm.addEventListener("submit", handleFormSubmit);
        }

        if (addCategoryMainBtn) {
            addCategoryMainBtn.addEventListener("click", () => {
                resetForm();
                if(categoryNameInput) categoryNameInput.focus();
            });
        }
        
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener("click", (e) => {
                e.preventDefault();
                resetForm();
            });
        }

        // Load categories on initialization
        loadCategories();
    };

    return {
        initializeCategoryEvents,
        loadCategories,
        populateCategoryDropdowns,
        verifyServices
    };
})();