/**
 * Event Handlers - Manages all event handlers for the admin dashboard
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("Event handlers initialized")

  // Initialize menu navigation
  initializeMenuNavigation()

  // Initialize product handlers via ProductHandlers object
  if (window.ProductHandlers) {
    window.ProductHandlers.initializeProductEvents()
  } else {
    console.error("ProductHandlers not available, falling back to legacy initialization")
    initializeProductHandlers() // Fallback to legacy method
  }

  // Initialize sidebar toggle
  initializeSidebar()

  // Load products on page load (via ProductHandlers if available)
  if (window.ProductHandlers) {
    window.ProductHandlers.loadProducts()
  } else if (typeof window.loadProducts === "function") {
    window.loadProducts()
  }
})

// Initialize menu navigation
function initializeMenuNavigation() {
  const menuItems = document.querySelectorAll(".menu-item")
  const contentSections = document.querySelectorAll(".content-section")

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      const sectionId = this.getAttribute("data-section")

      // Update active menu item
      menuItems.forEach((i) => i.classList.remove("active"))
      this.classList.add("active")

      // Show selected section
      contentSections.forEach((section) => {
        section.classList.remove("active")
        if (section.id === sectionId) {
          section.classList.add("active")

          // Load section data if needed
          if (sectionId === "products-section") {
            // Use ProductHandlers if available, otherwise fall back to legacy method
            if (window.ProductHandlers) {
              window.ProductHandlers.loadProducts()
            } else if (typeof window.loadProducts === "function") {
              window.loadProducts()
            } else {
              console.error("No product loading function available")
            }
          }
        }
      })
    })
  })
}

// Legacy product handlers initialization - will be used only if ProductHandlers is not available
function initializeProductHandlers() {
  // Add product button
  const addProductBtn = document.getElementById("add-product-btn")
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      openProductModal()
    })
  }

  // Save product button
  const saveProductBtn = document.getElementById("save-product-btn")
  if (saveProductBtn) {
    saveProductBtn.addEventListener("click", (e) => {
      e.preventDefault()
      console.log("Save product button clicked")
      saveProduct()
    })
  }

  // Delete buttons (will be attached when products are loaded)
  document.addEventListener("click", (e) => {
    if (e.target.closest(".delete-btn")) {
      const productId = e.target.closest(".delete-btn").getAttribute("data-id")
      openDeleteModal(productId)
    }

    if (e.target.closest(".edit-btn")) {
      const productId = e.target.closest(".edit-btn").getAttribute("data-id")
      openProductModal("edit", productId)
    }
  })

  // Confirm delete button
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn")
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      const productId = document.getElementById("delete-product-id").value
      deleteProduct(productId)
    })
  }

  // Cancel buttons
  const cancelButtons = document.querySelectorAll("#cancel-btn, #delete-cancel-btn")
  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllModals()
    })
  })

  // Close buttons
  const closeButtons = document.querySelectorAll(".modal .close")
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllModals()
    })
  })

  // Initialize image preview
  const productImage = document.getElementById("product-image")
  if (productImage) {
    productImage.addEventListener("change", handleImagePreview)
  }
}

// Initialize sidebar
function initializeSidebar() {
  const sidebar = document.getElementById("sidebar")
  const toggleSidebar = document.getElementById("toggle-sidebar")
  const menuToggle = document.getElementById("menu-toggle")

  if (toggleSidebar) {
    toggleSidebar.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed")
    })
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })
  }
}

// Legacy product functions - these now delegate to ProductHandlers if available
// Open product modal
function openProductModal(mode = "add", productId = null) {
  if (window.ProductHandlers) {
    window.ProductHandlers.openProductModal(mode, productId)
  } else {
    console.log("Legacy openProductModal:", mode, productId)
    const modal = document.getElementById("product-modal")
    const modalTitle = document.getElementById("modal-title")
    const form = document.getElementById("product-form")

    // Reset form
    form.reset()
    if (window.quill) {
      window.quill.root.innerHTML = ""
    }
    document.getElementById("image-preview").innerHTML = ""

    if (mode === "edit" && productId) {
      modalTitle.textContent = "Edit Product"
      document.getElementById("product-id").value = productId
      loadProductData(productId)
    } else {
      modalTitle.textContent = "Thêm sản phẩm mới"
      document.getElementById("product-id").value = ""
    }

    modal.style.display = "block"
  }
}

// Load product data for editing - delegates to ProductHandlers if available
async function loadProductData(productId) {
  if (window.ProductHandlers) {
    return window.ProductHandlers.loadProductData(productId)
  }
  
  try {
    const response = await fetch(`http://localhost:8080/api/products/${productId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const product = await response.json()

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
      const imagePreview = document.getElementById("image-preview")
      // Handle image URL which might be a JSON string or object
      let imageUrl = product.image
      try {
        // If it's a JSON string, parse it
        if (typeof product.image === "string" && product.image.startsWith("{")) {
          const imageData = JSON.parse(product.image)
          if (imageData && imageData.url) {
            imageUrl = imageData.url
          }
        } else if (typeof product.image === "object" && product.image.url) {
          // If it's already an object
          imageUrl = product.image.url
        }
      } catch (e) {
        console.error("Error parsing image data:", e)
      }

      imagePreview.innerHTML = `
        <div class="preview-container">
          <img src="${imageUrl}" alt="${product.name}" style="max-width: 100%; max-height: 200px;">
        </div>
      `
    }
  } catch (error) {
    console.error("Error loading product data:", error)
    showToast("Failed to load product data", "error")
  }
}

// Save product - delegates to ProductHandlers if available
async function saveProduct() {
  if (window.ProductHandlers) {
    return window.ProductHandlers.saveProduct()
  }
  
  try {
    console.log("Saving product...")
    const productId = document.getElementById("product-id").value
    const productName = document.getElementById("product-name").value
    const productPrice = document.getElementById("product-price").value
    const productStock = document.getElementById("product-stock").value

    // Log form values for debugging
    console.log("Product values:", {
      id: productId,
      name: productName,
      price: productPrice,
      stock: productStock,
    })

    // Validate form
    if (!productName || !productPrice || !productStock) {
      showToast("Please fill all required fields", "error")
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

    // Add image if selected
    const imageInput = document.getElementById("product-image")
    if (imageInput && imageInput.files && imageInput.files.length > 0) {
      formData.append("image", imageInput.files[0])
    }

    // Log FormData entries for debugging
    for (const pair of formData.entries()) {
      console.log(pair[0] + ": " + (pair[0] === "image" ? "File object" : pair[1]))
    }

    let url = "http://localhost:8080/api/products"
    let method = "POST"

    // If editing, use PUT method and include ID in URL
    if (productId) {
      url = `${url}/${productId}`
      method = "PUT"
    }

    console.log(`Sending ${method} request to ${url}`)

    // Send request to API with proper headers
    const response = await fetch(url, {
      method: method,
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API error response:", errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Show success message
    showToast(productId ? "Product updated successfully" : "Product added successfully", "success")

    // Close modal and reload products
    closeAllModals()
    loadProducts()
  } catch (error) {
    console.error("Error saving product:", error)
    showToast("Failed to save product: " + error.message, "error")
  }
}

// Load all products - delegates to ProductHandlers if available
async function loadProducts() {
  if (window.ProductHandlers) {
    return window.ProductHandlers.loadProducts()
  }
  
  try {
    const productsTableBody = document.getElementById("products-table-body")
    if (!productsTableBody) {
      console.error("Products table body not found")
      return
    }

    // Show loading state
    productsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading products...</td></tr>'

    const response = await fetch("http://localhost:8080/api/products")
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const products = await response.json()

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

      // Handle image URL which might be a JSON string or object
      let imageUrl = "/images/logo.png" // Default image URL
      try {
        if (product.image) {
          // If it's a JSON string, parse it
          if (typeof product.image === "string" && product.image.startsWith("{")) {
            const imageData = JSON.parse(product.image)
            if (imageData && imageData.url) {
              imageUrl = imageData.url
            }
          } else if (typeof product.image === "object" && product.image.url) {
            // If it's already an object
            imageUrl = product.image.url
          } else if (typeof product.image === "string") {
            // If it's a direct URL
            imageUrl = product.image
          }
        }
      } catch (e) {
        console.error("Error parsing image data:", e)
      }

      // Create row
      const row = document.createElement("tr")
      row.innerHTML = `
        <td><input type="checkbox" class="select-item"></td>
        <td><img src="${imageUrl}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
        <td>${product.name}</td>
        <td>${product.description ? product.description.substring(0, 50) + "..." : ""}</td>
        <td>${product.price ? product.price.toFixed(2) : "0.00"}</td>
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
        openProductModal("edit", productId)
      })
    })

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const productId = e.currentTarget.getAttribute("data-id")
        openDeleteModal(productId)
      })
    })
  } catch (error) {
    console.error("Error loading products:", error)
    const productsTableBody = document.getElementById("products-table-body")
    if (productsTableBody) {
      productsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Error loading products</td></tr>'
    }
  }
}

// Open delete confirmation modal - delegates to ProductHandlers if available
function openDeleteModal(productId) {
  if (window.ProductHandlers) {
    return window.ProductHandlers.openDeleteModal(productId)
  }
  
  const deleteModal = document.getElementById("delete-modal")
  document.getElementById("delete-product-id").value = productId
  deleteModal.style.display = "block"
}

// Delete product - delegates to ProductHandlers if available
async function deleteProduct(productId) {
  if (window.ProductHandlers) {
    return window.ProductHandlers.deleteProduct(productId)
  }
  
  try {
    const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Close modal and show success message
    closeAllModals()
    showToast("Product deleted successfully", "success")

    // Reload products
    loadProducts()
  } catch (error) {
    console.error("Error deleting product:", error)
    showToast("Failed to delete product", "error")
  }
}

// Close all modals - delegates to ProductHandlers.closeProductModal if available
function closeAllModals() {
  if (window.ProductHandlers) {
    window.ProductHandlers.closeProductModal()
    
    // Also close delete modal since that's not handled by closeProductModal
    const deleteModal = document.getElementById("delete-modal")
    if (deleteModal) {
      deleteModal.style.display = "none"
    }
    return
  }
  
  const modals = document.querySelectorAll(".modal")
  modals.forEach((modal) => {
    modal.style.display = "none"
  })
}

// Handle image preview - delegates to ProductHandlers if available
function handleImagePreview(e) {
  if (window.ProductHandlers && window.ProductHandlers.initializeImagePreview) {
    // Note: This isn't a direct delegation since the handlers are different
    // but ProductHandlers already sets up its own event listener
    return
  }
  
  const imagePreview = document.getElementById("image-preview")
  imagePreview.innerHTML = ""

  if (e.target.files && e.target.files[0]) {
    const reader = new FileReader()

    reader.onload = (e) => {
      imagePreview.innerHTML = `
        <div class="preview-container">
          <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;">
        </div>
      `
    }

    reader.readAsDataURL(e.target.files[0])
  }
}

// Show toast notification - delegates to ToastService or ProductHandlers if available
function showToast(message, type = "success") {
  if (window.ToastService) {
    return window.ToastService.showToast(message, type)
  } else if (window.ProductHandlers) {
    return window.ProductHandlers.showToast(message, type)
  }
  
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

// Export functions to global scope - but now they delegate to ProductHandlers
window.openProductModal = openProductModal
window.saveProduct = saveProduct
window.loadProducts = loadProducts
window.openDeleteModal = openDeleteModal
window.deleteProduct = deleteProduct
window.closeAllModals = closeAllModals
