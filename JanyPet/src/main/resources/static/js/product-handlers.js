/**
 * Product Handlers - Manages all product-related operations
 */
const ProductHandlers = {
  // Initialize all product-related event handlers
  initializeProductEvents() {
    console.log("Initializing product event handlers")

    // Add product button
    const addProductBtn = document.getElementById("add-product-btn");
    if (addProductBtn) {
      addProductBtn.addEventListener("click", () => {
        this.loadCategories(); // Gọi loadCategories trước
        this.openProductModal("add");
      });
    }

    // Save product button - DIRECT EVENT BINDING - Add a check to prevent duplicate event binding
    const saveProductBtn = document.getElementById("save-product-btn")
    if (saveProductBtn && !saveProductBtn.hasEventListener) {
      saveProductBtn.addEventListener("click", (e) => {
        e.preventDefault()
        console.log("Save button clicked")
        this.saveProduct()
      })
      saveProductBtn.hasEventListener = true // Flag to prevent duplicate event binding
    }

    // Close modal buttons
    const closeButtons = document.querySelectorAll(".modal .close")
    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("product-modal").style.display = "none"
        document.getElementById("delete-modal").style.display = "none"
      })
    })

    // Cancel button
    const cancelBtn = document.getElementById("cancel-btn")
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.closeProductModal()
      })
    }

    // Confirm delete button
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn")
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", () => {
        const productId = document.getElementById("delete-product-id").value
        this.deleteProduct(productId)
      })
    }

    // Delete cancel button
    const deleteCancelBtn = document.getElementById("delete-cancel-btn")
    if (deleteCancelBtn) {
      deleteCancelBtn.addEventListener("click", () => {
        document.getElementById("delete-modal").style.display = "none"
      })
    }

    // Load products on initialization
    this.loadProducts()

    // REMOVED: Initialize image preview handler
    // REMOVED: Xử lý click vào ảnh để xem lớn
  },

  // Open product modal for add/edit
  openProductModal(mode = "add", productId = null) {
    console.log(`Opening product modal in ${mode} mode`, productId)
    const modal = document.getElementById("product-modal")
    const modalTitle = document.getElementById("modal-title")
    const productForm = document.getElementById("product-form")
    const productIdInput = document.getElementById("product-id")

    // Reset form
    if (productForm) {
      productForm.reset()
    }
    
    if (window.quill) {
      window.quill.root.innerHTML = ""
    }
    
    // REMOVED: document.getElementById("image-preview").innerHTML = ""

    if (mode === "edit" && productId) {
      modalTitle.textContent = "Edit Product"
      productIdInput.value = productId
      this.loadProductData(productId)
    } else {
      modalTitle.textContent = "Thêm sản phẩm mới"
      productIdInput.value = ""
    }

    modal.style.display = "block"
  },

  // Close product modal
  closeProductModal() {
    const modal = document.getElementById("product-modal")
    modal.style.display = "none"
  },

  // REMOVED: getImageUrl function

  // Load product data for editing
  async loadProductData(productId) {
    try {
      let product;
      
      if (window.ApiService) {
        product = await window.ApiService.getProduct(productId);
      } else {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        product = await response.json();
      }
      
      console.log("Loaded product data:", product);
  
      // Populate form fields
      document.getElementById("product-name").value = product.name || "";
      
      // Thiết lập danh mục
      const categorySelect = document.getElementById("product-category");
      if (categorySelect && product.category) {
        // Tìm option phù hợp với danh mục sản phẩm
        const options = Array.from(categorySelect.options);
        const matchingOption = options.find(option => option.value === product.category);
        
        if (matchingOption) {
          categorySelect.value = product.category;
        } else if (product.category) {
          // Nếu không tìm thấy, tạo option mới
          const newOption = document.createElement("option");
          newOption.value = product.category;
          newOption.textContent = product.category;
          categorySelect.appendChild(newOption);
          categorySelect.value = product.category;
        }
      }
      
      document.getElementById("product-purchase-price").value = product.purchasePrice || "";
      document.getElementById("product-selling-price").value = product.price || "";
  
      // Set description in Quill editor
      if (window.quill && product.description) {
        window.quill.root.innerHTML = product.description;
      }
  
    } catch (error) {
      console.error("Error loading product data:", error);
      if (window.ToastService) {
        window.ToastService.error("Failed to load product data");
      } else {
        this.showToast("Failed to load product data", "error");
      }
    }
  },

  // Load categories for the select element
  async loadCategories() {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const categories = await response.json();
      const categorySelect = document.getElementById("product-category");
      
      if (!categorySelect) {
        console.error("Category select element not found");
        return;
      }
      
      // Clear existing options except the first one
      while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
      }
      
      // Add options from API
      categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
      
      // Thêm các danh mục mặc định nếu API không trả về đủ danh mục
      const defaultCategories = ["Pet Food", "Toys", "Accessories", "Medicine"];
      const existingCategories = Array.from(categorySelect.options).map(opt => opt.value);
      
      defaultCategories.forEach(cat => {
        if (!existingCategories.includes(cat)) {
          const option = document.createElement("option");
          option.value = cat;
          option.textContent = cat;
          categorySelect.appendChild(option);
        }
      });
    } catch (error) {
      console.error("Error loading categories:", error);
      
      // Fallback to default categories if API fails
      const categorySelect = document.getElementById("product-category");
      if (categorySelect) {
        const defaultCategories = ["Pet Food", "Toys", "Accessories", "Medicine"];
        
        // Clear existing options except the first one
        while (categorySelect.options.length > 1) {
          categorySelect.remove(1);
        }
        
        defaultCategories.forEach(cat => {
          const option = document.createElement("option");
          option.value = cat;
          option.textContent = cat;
          categorySelect.appendChild(option);
        });
      }
    }
  },

  // Save product (create or update)
  async saveProduct() {
    try {
      console.log("Saving product...");
      
      // Get form elements with null checks
      const productIdElement = document.getElementById("product-id");
      const productNameElement = document.getElementById("product-name");
      const productCategoryElement = document.getElementById("product-category");
      const productPurchasePriceElement = document.getElementById("product-purchase-price");
      const productSellingPriceElement = document.getElementById("product-selling-price");
      
      // Check if all required elements exist
      if (!productNameElement || !productCategoryElement || 
          !productPurchasePriceElement || !productSellingPriceElement) {
        console.error("Required form fields not found:", {
          name: !!productNameElement,
          category: !!productCategoryElement,
          purchasePrice: !!productPurchasePriceElement,
          sellingPrice: !!productSellingPriceElement
        });
        if (window.ToastService) {
          window.ToastService.error("Form fields not found. Please check the form structure.");
        } else {
          this.showToast("Form fields not found. Please check the form structure.", "error");
        }
        return;
      }
      
      // Get values safely
      const productId = productIdElement ? productIdElement.value : "";
      const productName = productNameElement.value;
      const productCategory = productCategoryElement.value;
      const purchasePrice = productPurchasePriceElement.value;
      const sellingPrice = productSellingPriceElement.value;
  
      // Get description from Quill editor
      let description = "";
      if (window.quill) {
        description = window.quill.root.innerHTML;
      }
  
      // Create product data object - sửa tên các trường theo yêu cầu của backend
      const productData = {
        name: productName,
        category: productCategory,
        purchasePrice: parseFloat(purchasePrice),
        price: parseFloat(sellingPrice),
        stock: 0, // Đảm bảo stock có giá trị
        description: description,
        isActive: true // Thêm trường isActive nếu backend cần
      };
  
      console.log("Sending product data:", productData);
  
      // Make API request
      let url = "/api/products";
      let method = "POST";
      
      // If editing, use PUT method and include ID in URL
      if (productId) {
        url = `${url}/${productId}`;
        method = "PUT";
      }
      
      console.log(`Sending ${method} request to ${url}`);
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
  
      // Show success message
      if (window.ToastService) {
        window.ToastService.success(productId ? "Product updated successfully" : "Product added successfully");
      } else {
        this.showToast(productId ? "Product updated successfully" : "Product added successfully", "success");
      }
  
      // Close modal and reload products
      this.closeProductModal();
      this.loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      if (window.ToastService) {
        window.ToastService.error("Failed to save product: " + error.message);
      } else {
        this.showToast("Failed to save product: " + error.message, "error");
      }
    }
  },

  // Load all products
  async loadProducts() {
    try {
      const productsTableBody = document.getElementById("products-table-body");
      if (!productsTableBody) {
        console.error("Products table body not found");
        return;
      }
  
      // Show loading state
      productsTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Loading products...</td></tr>';
  
      let products = [];
  
      // Use ApiService if available, otherwise use fetch directly
      if (window.ApiService) {
        products = await window.ApiService.getAllProducts();
      } else {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        products = await response.json();
      }
  
      console.log("Loaded products:", products);
  
      if (!Array.isArray(products) || products.length === 0) {
        productsTableBody.innerHTML = '<tr><td colspan="10" class="text-center">No products found</td></tr>';
        return;
      }
  
      // Create content for the table body
      let tableBodyHTML = '';
      
      // Render products
      products.forEach((product) => {
        // Determine status based on stock
        let status = "In Stock";
        let statusClass = "active";
  
        if (product.stock <= 0) {
          status = "Out of Stock";
          statusClass = "inactive";
        } else if (product.stock <= 5) {
          status = "Low Stock";
          statusClass = "pending";
        }
  
        // Create row HTML với cột ID và giá nhập mới
        tableBodyHTML += `
          <tr>
            <td><input type="checkbox" class="select-item"></td>
            <td title="${product.id}">${product.id || ""}</td>
            <td>${product.name || ""}</td>
            <td>${product.category || "Chưa phân loại"}</td>
            <td>${product.description ? product.description.substring(0, 100) + "..." : ""}</td>
            <td>${product.purchasePrice ? parseFloat(product.purchasePrice).toFixed(2) : "0.00"}</td>
            <td>${product.price ? parseFloat(product.price).toFixed(2) : "0.00"}</td>
            <td>${product.stock || 0}</td>
            <td><span class="status ${statusClass}">${status}</span></td>
            <td class="actions">
              <button class="icon-btn edit-btn" data-id="${product.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="icon-btn delete-btn" data-id="${product.id}">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        `;
      });
  
      // Update the table body with new HTML
      productsTableBody.innerHTML = tableBodyHTML;
      
      // Add event listeners to new elements
      document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const productId = e.currentTarget.getAttribute("data-id");
          this.loadCategories(); // Thêm dòng này
          this.openProductModal("edit", productId);
        });
      });
  
      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const productId = e.currentTarget.getAttribute("data-id");
          this.openDeleteModal(productId);
        });
      });
    } catch (error) {
      console.error("Error loading products:", error);
      const productsTableBody = document.getElementById("products-table-body");
      if (productsTableBody) {
        productsTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Error loading products: ' + error.message + '</td></tr>';
      }
    }
  },

  // Open delete confirmation modal
  openDeleteModal(productId) {
    const deleteModal = document.getElementById("delete-modal");
    document.getElementById("delete-product-id").value = productId;
    deleteModal.style.display = "block";
  },

  // Delete product
  async deleteProduct(productId) {
    try {
      if (window.ApiService) {
        await window.ApiService.deleteProduct(productId);
      } else {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // Close modal and show success message
      document.getElementById("delete-modal").style.display = "none";
      if (window.ToastService) {
        window.ToastService.success("Product deleted successfully");
      } else {
        this.showToast("Product deleted successfully", "success");
      }

      // Reload products
      this.loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      if (window.ToastService) {
        window.ToastService.error("Failed to delete product");
      } else {
        this.showToast("Failed to delete product", "error");
      }
    }
  },

  // REMOVED: initializeImagePreview method

  // Show toast notification
  showToast(message, type = "success") {
    if (window.ToastService) {
      window.ToastService.showToast(message, type);
    } else {
      const toast = document.getElementById("toast");
      if (!toast) {
        console.error("Toast element not found");
        return;
      }

      const toastContent = toast.querySelector(".toast-content i");
      const toastMessage = toast.querySelector(".toast-message");
      const toastProgress = toast.querySelector(".toast-progress");

      if (!toastContent || !toastMessage || !toastProgress) {
        console.error("Toast child elements not found");
        return;
      }

      // Set icon and color based on type
      if (type === "success") {
        toastContent.className = "fas fa-check-circle";
        toastContent.style.color = "var(--success-color, #10b981)";
        toastProgress.style.backgroundColor = "var(--success-color, #10b981)";
      } else if (type === "error") {
        toastContent.className = "fas fa-times-circle";
        toastContent.style.color = "var(--danger-color, #ef4444)";
        toastProgress.style.backgroundColor = "var(--danger-color, #ef4444)";
      }

      // Set message
      toastMessage.textContent = message;

      // Show toast
      toast.style.display = "block";

      // Hide after 3 seconds
      setTimeout(() => {
        toast.style.display = "none";
      }, 3000);
    }
  },
};

// Export to global scope only once
window.ProductHandlers = ProductHandlers;