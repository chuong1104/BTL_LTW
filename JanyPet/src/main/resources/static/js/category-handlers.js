window.CategoryHandlers = {
  initializeCategoryEvents: function () {
    // Add event listeners for add/edit/delete category buttons and form submissions
    const addCategoryBtnMain = document.getElementById("add-category-btn-main");
    if (addCategoryBtnMain) {
      addCategoryBtnMain.addEventListener("click", () => {
        // Logic to show/prepare the add category form
        document.getElementById("category-form").reset();
        document.getElementById("category-id").value = ""; // Clear ID for new category
        document.querySelector(
          "#categories-section .section-header h1"
        ).textContent = "Add New Category"; // Or similar form title
      });
    }

    const categoryForm = document.getElementById("category-form"); // Assuming your form has id="category-form"
    if (categoryForm) {
      categoryForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await this.saveCategory();
      });
    }
    // Add more event listeners for edit/delete buttons on the table rows after they are rendered
  },

  populateCategoryDropdowns: async function () {
    try {
      const categories = await window.CategoryService.getAllCategories();

      const productCategorySelect = document.getElementById(
        "product-category-modal"
      );
      if (productCategorySelect) {
        productCategorySelect.innerHTML =
          '<option value="">Select Category</option>';
        categories.forEach((category) => {
          const option = document.createElement("option");
          option.value = category.id;
          option.textContent = category.name;
          productCategorySelect.appendChild(option);
        });
      }
      // Add logic for other dropdowns if necessary
    } catch (error) {
      console.error("Error populating category dropdowns:", error);
    }
  },

  loadCategories: async function () {
    try {
      // For admin, get all categories including inactive ones
      const categories =
        await window.CategoryService.getAllCategoriesIncludingInactive();
      const tableBody = document.getElementById("categories-table-body");

      if (!tableBody) {
        console.error("Categories table body not found!");
        return;
      }
      tableBody.innerHTML = ""; // Clear existing rows

      if (!categories || categories.length === 0) {
        tableBody.innerHTML =
          '<tr><td colspan="5" class="text-center">No categories found.</td></tr>';
        return;
      }

      categories.forEach((category) => {
        const row = tableBody.insertRow();

        // Add active status display
        const activeStatus = category.active !== false; // Handle undefined as true
        const activeStatusClass = activeStatus
          ? "status-active"
          : "status-inactive";
        const activeStatusText = activeStatus ? "Active" : "Inactive";
        row.innerHTML = `
                <td>${category.id || "N/A"}</td>
                <td>${category.name || "N/A"}</td>
                <td>${category.description || "N/A"}</td>
                <td><span class="status-badge ${activeStatusClass}">${activeStatusText}</span></td>
                <td>
                    <button class="icon-btn edit-category-btn" data-id="${
                      category.id
                    }" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn toggle-category-status" data-id="${
                      category.id
                    }" data-active="${!activeStatus}" title="${
          activeStatus ? "Deactivate" : "Activate"
        }">
                        <i class="fas fa-${
                          activeStatus ? "ban" : "check-circle"
                        }"></i>
                    </button>
                    <button class="icon-btn delete-category-btn" data-id="${
                      category.id
                    }" title="Delete"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;

        // Add visual style for inactive categories
        if (!activeStatus) {
          row.classList.add("inactive-category");
        }
      });
      this.setupActionButtons(); // Set up listeners for buttons
    } catch (error) {
      console.error("Error loading categories:", error);
      const tableBody = document.getElementById("categories-table-body");
      if (tableBody) {
        tableBody.innerHTML =
          '<tr><td colspan="5" class="text-center text-danger">Error loading categories.</td></tr>';
      }
    }
  },
  setupActionButtons: function () {
    document.querySelectorAll(".edit-category-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const categoryId = event.currentTarget.dataset.id;
        this.editCategory(categoryId);
      });
    });

    document.querySelectorAll(".delete-category-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const categoryId = event.currentTarget.dataset.id;
        this.confirmDeleteCategory(categoryId);
      });
    });

    document.querySelectorAll(".toggle-category-status").forEach((button) => {
      button.addEventListener("click", (event) => {
        const categoryId = event.currentTarget.dataset.id;
        const newStatus = event.currentTarget.dataset.active === "true";
        CategoryHandlers.toggleCategoryStatus(categoryId, newStatus);
      });
    });
  },

  editCategory: async function (categoryId) {
    // Logic to fetch category by ID and populate the form
    try {
      const category = await window.CategoryService.getCategoryById(categoryId); // Assuming this service method exists
      if (category) {
        document.getElementById("category-id").value = category.id; // Hidden input for ID
        document.getElementById("category-name").value = category.name; // Assuming form field with id="category-name"
        document.getElementById("category-description").value =
          category.description; // Assuming form field with id="category-description"
        document.querySelector(
          "#categories-section .section-header h1"
        ).textContent = "Edit Category"; // Or similar form title
      }
    } catch (error) {
      console.error("Error fetching category for edit:", error);
      window.ToastService?.error(
        "Could not load category details for editing."
      );
    }
  },

  confirmDeleteCategory: function (categoryId) {
    if (confirm("Are you sure you want to delete this category?")) {
      this.deleteCategory(categoryId);
    }
  },

  deleteCategory: async function(categoryId) {
    try {
        await window.CategoryService.deleteCategory(categoryId);
        window.ToastService?.success('Category removed successfully.');
        this.loadCategories(); // Refresh the list
        this.populateCategoryDropdowns(); // Refresh dropdowns
    } catch (error) {
        console.error('Error removing category:', error);
        window.ToastService?.error(`Error removing category: ${error.message}`);
    }
},
// ...existing code...

/**
 * Toggle category active status
 * @param {string} categoryId - ID of category to toggle status
 * @param {boolean} active - New status (true for active, false for inactive)
 */
toggleCategoryStatus: async function(categoryId, active) {
    try {
        await CategoryService.toggleCategoryStatus(categoryId, active);
        
        // Refresh category list
        this.loadCategories();
        
        // Show success message
        const statusText = active ? 'activated' : 'deactivated';
        window.ToastService?.success(`Category ${statusText} successfully!`);
        
        // Refresh dropdowns to reflect the updated category status
        this.populateCategoryDropdowns();
    } catch (error) {
        console.error('Error toggling category status:', error);
        window.ToastService?.error(`Error changing category status: ${error.message}`);
    }
},

// ...existing code...
  saveCategory: async function () {
    // Logic to save (add new or update existing) category
    const categoryId = document.getElementById("category-id").value;
    const categoryName = document.getElementById("category-name").value;
    const categoryDescription = document.getElementById(
      "category-description"
    ).value;

    if (!categoryName) {
      window.ToastService?.warning("Category name is required.");
      return;
    }

    const categoryData = {
      name: categoryName,
      description: categoryDescription,
    };

    try {
      if (categoryId) {
        await window.CategoryService.updateCategory(categoryId, categoryData);
        window.ToastService?.success("Category updated successfully.");
      } else {
        await window.CategoryService.createCategory(categoryData);
        window.ToastService?.success("Category created successfully.");
      }
      document.getElementById("category-form").reset();
      document.getElementById("category-id").value = "";
      this.loadCategories(); // Refresh list
      this.populateCategoryDropdowns(); // Refresh dropdowns
    } catch (error) {
      console.error("Error saving category:", error);
      window.ToastService?.error(`Error saving category: ${error.message}`);
    }
  },
  // Add other necessary methods like form handling, saving, deleting categories
};

// Ensure CategoryService and its methods (getAllCategories, createCategory, updateCategory, deleteCategory, getCategoryById)
// are defined, likely in js/category-service.js
