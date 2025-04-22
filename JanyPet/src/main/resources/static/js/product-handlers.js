/**
 * Product Handlers - Manages all product-related operations
 */
const ProductHandlers = {
  // Initialize all product-related event handlers
  initializeProductEvents() {
    console.log("Initializing product event handlers")

    // Add product button
    const addProductBtn = document.getElementById("add-product-btn")
    if (addProductBtn) {
      addProductBtn.addEventListener("click", () => this.openProductModal())
    }

    // Save product button - DIRECT EVENT BINDING
    const saveProductBtn = document.getElementById("save-product-btn")
    if (saveProductBtn) {
      saveProductBtn.addEventListener("click", (e) => {
        e.preventDefault()
        console.log("Save button clicked")
        this.saveProduct()
      })
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

    // Load products on initialization
    this.loadProducts()

    // Initialize image preview handler
    this.initializeImagePreview()

    // Xử lý click vào ảnh để xem lớn
    document.querySelector('#products-table-body').addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            const modal = document.getElementById('image-preview-modal');
            const modalImg = document.getElementById('preview-image');
            modal.style.display = "block";
            modalImg.src = e.target.src;
        }
    });
  },

  // Open product modal for add/edit
  openProductModal(mode = "add", productId = null) {
    console.log(`Opening product modal in ${mode} mode`, productId)
    const modal = document.getElementById("product-modal")
    const modalTitle = document.getElementById("modal-title")
    const productForm = document.getElementById("product-form")
    const productIdInput = document.getElementById("product-id")

    // Reset form
    productForm.reset()
    if (window.quill) {
      window.quill.root.innerHTML = ""
    }
    document.getElementById("image-preview").innerHTML = ""

    if (mode === "edit" && productId) {
      modalTitle.textContent = "Edit Product"
      productIdInput.value = productId
      this.loadProductData(productId)
    } else {
      modalTitle.textContent = "Add New Product"
      productIdInput.value = ""
    }

    modal.style.display = "block"
  },

  // Close product modal
  closeProductModal() {
    const modal = document.getElementById("product-modal")
    modal.style.display = "none"
  },

  // Get image URL from filename
  getImageUrl(filename) {
    if (!filename) {
        return 'https://via.placeholder.com/50?text=No+Image';
    }

    // Nếu là URL đầy đủ
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
    }

    // Tạo URL từ tên file
    return `/api/upload/files/${encodeURIComponent(filename)}`;
  },

  // Load product data for editing
  async loadProductData(productId) {
    try {
      if (window.ApiService) {
        const product = await ApiService.getProduct(productId)
        console.log("Loaded product data:", product)

        // Populate form fields
        document.getElementById("product-name").value = product.name || ""
        document.getElementById("product-price").value = product.price || ""
        document.getElementById("product-stock").value = product.stock || ""

        // Set description in Quill editor
        if (window.quill && product.description) {
          window.quill.root.innerHTML = product.description
        }

        // Show image preview if available
        if (product.image) {
          const imageUrl = this.getImageUrl(product.image)
          if (imageUrl) {
            const imagePreview = document.getElementById("image-preview")
            imagePreview.innerHTML = `
              <div class="preview-container">
                <img src="${imageUrl}" alt="${product.name}" style="max-width: 100%; max-height: 200px;">
                <p class="mt-2 text-sm text-gray-500">Current image: ${product.image}</p>
              </div>
            `
          }
        }
      } else {
        const response = await fetch(`http://localhost:8080/api/products/${productId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const product = await response.json()
        console.log("Loaded product data:", product)

        // Populate form fields
        document.getElementById("product-name").value = product.name || ""
        document.getElementById("product-price").value = product.price || ""
        document.getElementById("product-stock").value = product.stock || ""

        // Set description in Quill editor
        if (window.quill && product.description) {
          window.quill.root.innerHTML = product.description
        }

        // Show image preview if available
        if (product.image) {
          const imageUrl = this.getImageUrl(product.image)
          if (imageUrl) {
            const imagePreview = document.getElementById("image-preview")
            imagePreview.innerHTML = `
              <div class="preview-container">
                <img src="${imageUrl}" alt="${product.name}" style="max-width: 100%; max-height: 200px;">
                <p class="mt-2 text-sm text-gray-500">Current image: ${product.image}</p>
              </div>
            `
          }
        }
      }
    } catch (error) {
      console.error("Error loading product data:", error)
      if (window.ToastService) {
        ToastService.error("Failed to load product data")
      } else {
        this.showToast("Failed to load product data", "error")
      }
    }
  },

  // Save product (create or update)
  async saveProduct() {
    try {
      console.log("Saving product...")
      const productId = document.getElementById("product-id").value
      const productName = document.getElementById("product-name").value
      const productPrice = document.getElementById("product-price").value
      const productStock = document.getElementById("product-stock").value

      // Validate form
      if (!productName || !productPrice || !productStock) {
        if (window.ToastService) {
          ToastService.error("Please fill all required fields")
        } else {
          this.showToast("Please fill all required fields", "error")
        }
        return
      }

      // Get description from Quill editor
      let description = ""
      if (window.quill) {
        description = window.quill.root.innerHTML
      }

      // Create FormData object for file upload
      const formData = new FormData()
      formData.append("name", productName)
      formData.append("price", productPrice)
      formData.append("stock", productStock)
      formData.append("description", description)

      // Handle file upload
      const imageInput = document.getElementById("product-image")
      if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0]
        
        // First upload the file
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)
        
        const uploadResponse = await fetch("/api/upload/file", {
          method: "POST",
          body: uploadFormData
        })
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image")
        }
        
        const uploadResult = await uploadResponse.json()
        // Add the filename to the product form data
        formData.append("image", uploadResult.fileName)
      }

      // Log FormData entries for debugging
      for (const pair of formData.entries()) {
        console.log(pair[0] + ": " + (pair[0] === "image" ? "File object" : pair[1]))
      }

      // Use ApiService if available, otherwise use fetch directly
      if (window.ApiService) {
        if (productId) {
          await ApiService.updateProduct(productId, formData)
        } else {
          await ApiService.createProduct(formData)
        }
      } else {
        let url = "http://localhost:8080/api/products"
        let method = "POST"

        // If editing, use PUT method and include ID in URL
        if (productId) {
          url = `${url}/${productId}`
          method = "PUT"
        }

        console.log(`Sending ${method} request to ${url}`)

        // Send request to API
        const response = await fetch(url, {
          method: method,
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API error response:", errorText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      // Show success message
      if (window.ToastService) {
        ToastService.success(productId ? "Product updated successfully" : "Product added successfully")
      } else {
        this.showToast(productId ? "Product updated successfully" : "Product added successfully", "success")
      }

      // Close modal and reload products
      this.closeProductModal()
      this.loadProducts()
    } catch (error) {
      console.error("Error saving product:", error)
      if (window.ToastService) {
        ToastService.error("Failed to save product: " + error.message)
      } else {
        this.showToast("Failed to save product: " + error.message, "error")
      }
    }
  },

  // Load all products
  async loadProducts() {
    try {
      const productsTableBody = document.getElementById("products-table-body")
      if (!productsTableBody) {
        console.error("Products table body not found")
        return
      }

      // Show loading state
      productsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading products...</td></tr>'

      let products = []

      // Use ApiService if available, otherwise use fetch directly
      if (window.ApiService) {
        products = await ApiService.getAllProducts()
      } else {
        const response = await fetch("http://localhost:8080/api/products")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        products = await response.json()
      }

      console.log("Loaded products:", products)

      if (!Array.isArray(products) || products.length === 0) {
        productsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>'
        return
      }

      // Render products
      productsTableBody.innerHTML = ""
      products.forEach((product) => {
        // Determine status based on stock
        let status = "In Stock"
        let statusClass = "active"

        if (product.stock <= 0) {
          status = "Out of Stock"
          statusClass = "inactive"
        } else if (product.stock <= 5) {
          status = "Low Stock"
          statusClass = "pending"
        }

        // Get image URL from filename
        const imageUrl = this.getImageUrl(product.image)

        // Create row
        const row = document.createElement("tr")
        row.innerHTML = `
          <td><input type="checkbox" class="select-item"></td>
          <td>
            <img src="${imageUrl}" 
                 alt="${product.name}" 
                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;"
                
          </td>
          <td>${product.name}</td>
          <td>${product.description ? product.description.substring(0, 100): ""}</td>
          <td>$${product.price ? product.price.toFixed(2) : "0.00"}</td>
          <td>${product.stock}</td>
          <td><span class="status ${statusClass}">${status}</span></td>
          <td class="actions">
            <button class="icon-btn edit-btn" data-id="${product.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="icon-btn delete-btn" data-id="${product.id}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        `

        productsTableBody.appendChild(row)
      })

      // Add event listeners to edit and delete buttons
      document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const productId = e.currentTarget.getAttribute("data-id")
          this.openProductModal("edit", productId)
        })
      })

      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const productId = e.currentTarget.getAttribute("data-id")
          this.openDeleteModal(productId)
        })
      })
    } catch (error) {
      console.error("Error loading products:", error)
      const productsTableBody = document.getElementById("products-table-body")
      if (productsTableBody) {
        productsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Error loading products</td></tr>'
      }
    }
  },

  // Open delete confirmation modal
  openDeleteModal(productId) {
    const deleteModal = document.getElementById("delete-modal")
    document.getElementById("delete-product-id").value = productId
    deleteModal.style.display = "block"
  },

  // Delete product
  async deleteProduct(productId) {
    try {
      if (window.ApiService) {
        await ApiService.deleteProduct(productId)
      } else {
        const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      // Close modal and show success message
      document.getElementById("delete-modal").style.display = "none"
      if (window.ToastService) {
        ToastService.success("Product deleted successfully")
      } else {
        this.showToast("Product deleted successfully", "success")
      }

      // Reload products
      this.loadProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      if (window.ToastService) {
        ToastService.error("Failed to delete product")
      } else {
        this.showToast("Failed to delete product", "error")
      }
    }
  },

  // Initialize image preview handler
  initializeImagePreview() {
    const imageInput = document.getElementById("product-image")
    const imagePreview = document.getElementById("image-preview")

    if (imageInput && imagePreview) {
      imageInput.addEventListener("change", function () {
        imagePreview.innerHTML = ""

        if (this.files && this.files[0]) {
          const reader = new FileReader()

          reader.onload = (e) => {
            imagePreview.innerHTML = `
              <div class="preview-container">
                <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;">
                <p class="mt-2 text-sm text-gray-500">Selected file: ${this.files[0].name}</p>
              </div>
            `
          }

          reader.readAsDataURL(this.files[0])
        }
      })
    }
  },

  // Show toast notification
  showToast(message, type = "success") {
    if (window.ToastService) {
      window.ToastService.showToast(message, type)
    } else {
      const toast = document.getElementById("toast")
      if (!toast) {
        console.error("Toast element not found")
        return
      }

      const toastContent = toast.querySelector(".toast-content i")
      const toastMessage = toast.querySelector(".toast-message")
      const toastProgress = toast.querySelector(".toast-progress")

      if (!toastContent || !toastMessage || !toastProgress) {
        console.error("Toast child elements not found")
        return
      }

      // Set icon and color based on type
      if (type === "success") {
        toastContent.className = "fas fa-check-circle"
        toastContent.style.color = "var(--success-color, #10b981)"
        toastProgress.style.backgroundColor = "var(--success-color, #10b981)"
      } else if (type === "error") {
        toastContent.className = "fas fa-times-circle"
        toastContent.style.color = "var(--danger-color, #ef4444)"
        toastProgress.style.backgroundColor = "var(--danger-color, #ef4444)"
      }

      // Set message
      toastMessage.textContent = message

      // Show toast
      toast.style.display = "block"

      // Hide after 3 seconds
      setTimeout(() => {
        toast.style.display = "none"
      }, 3000)
    }
  },
}

// Optionally declare ApiService and ToastService if they are not globally available
// For example, if they are defined in separate modules:
// const ApiService = window.ApiService || {};
// const ToastService = window.ToastService || {};

// Export to global scope
window.ProductHandlers = ProductHandlers

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (ProductHandlers && typeof ProductHandlers.initializeProductEvents === "function") {
    ProductHandlers.initializeProductEvents()
  }
})
