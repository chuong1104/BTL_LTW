// Product Service - Handles all product-related operations
class ProductService {
  constructor() {
    this.apiUrl = "http://localhost:8080/api/products"
    this.products = []
    this.quillEditor = null
  }

  // Initialize the service
  async init() {
    // Initialize Quill editor
    this.initQuillEditor()

    // Load products
    await this.loadProducts()

    // Set up event listeners
    this.setupEventListeners()
  }

  // Initialize Quill rich text editor
  initQuillEditor() {
    if (document.getElementById("editor-container")) {
      this.quillEditor = new Quill("#editor-container", {
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ color: [] }, { background: [] }],
            ["link", "image"],
            ["clean"],
          ],
        },
        placeholder: "Enter product description...",
        theme: "snow",
      })
    }
  }

  // Set up event listeners for product-related actions
  setupEventListeners() {
    // Add product button
    const addProductBtn = document.getElementById("add-product-btn")
    if (addProductBtn) {
      addProductBtn.addEventListener("click", () => this.openProductModal())
    }

    // Save product button
    const saveBtn = document.getElementById("save-btn")
    if (saveBtn) {
      saveBtn.addEventListener("click", (e) => this.saveProduct(e))
    }

    // Tab navigation
    const tabs = document.querySelectorAll(".tab")
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => this.switchTab(tab.dataset.tab))
    })

    // Next and Back buttons for tab navigation
    const nextBtn = document.getElementById("next-btn")
    const backBtn = document.getElementById("back-btn")

    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextTab())
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => this.previousTab())
    }

    // Description option buttons
    const optionBtns = document.querySelectorAll(".option-btn")
    optionBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.switchDescriptionOption(btn.dataset.option))
    })

    // Preview toggle
    const previewToggle = document.getElementById("preview-toggle")
    if (previewToggle) {
      previewToggle.addEventListener("click", () => this.togglePreview())
    }

    // Delete product confirmation
    const confirmDeleteBtn = document.getElementById("confirm-delete-btn")
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", () => this.deleteProduct())
    }

    // Modal close buttons
    const closeButtons = document.querySelectorAll(".close, #cancel-btn, #delete-cancel-btn")
    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.closeModals())
    })

    // Template select
    const templateSelect = document.getElementById("template-select")
    if (templateSelect) {
      templateSelect.addEventListener("change", () => this.loadTemplate(templateSelect.value))
    }

    // AI generate button
    const generateBtn = document.getElementById("generate-btn")
    if (generateBtn) {
      generateBtn.addEventListener("click", () => this.generateAIDescription())
    }

    // File input for description
    const descriptionFile = document.getElementById("description-file")
    if (descriptionFile) {
      descriptionFile.addEventListener("change", (e) => this.handleFileUpload(e))
    }

    // Remove URL fetch functionality
    // The fetch-url-btn is intentionally not set up with an event listener
  }

  // Load products from the API
  async loadProducts() {
    try {
      const response = await fetch(this.apiUrl)
      const result = await response.json()

      if (result.success) {
        this.products = result.data
        this.renderProductsTable()
      } else {
        this.showToast("Error loading products", "error")
      }
    } catch (error) {
      console.error("Error loading products:", error)
      this.showToast("Failed to load products", "error")
    }
  }

  // Render products table
  renderProductsTable() {
    const tableBody = document.getElementById("products-table-body")
    if (!tableBody) return

    tableBody.innerHTML = ""

    this.products.forEach((product) => {
      const row = document.createElement("tr")

      // Parse images if stored as JSON string
      let images = []
      try {
        images = typeof product.images === "string" ? JSON.parse(product.images) : product.images || []
      } catch (e) {
        images = []
      }

      const imageUrl = images.length > 0 ? images[0] : "/images/default-product.png"

      row.innerHTML = `
        <td><input type="checkbox" class="select-item" data-id="${product.id}"></td>
        <td><img src="${imageUrl}" alt="${product.name}" width="50" height="50"></td>
        <td>${product.name}</td>
        <td>${this.truncateDescription(product.description)}</td>
        <td>$${Number.parseFloat(product.price).toFixed(2)}</td>
        <td>${product.stock}</td>
        <td><span class="status ${product.stock > 0 ? "active" : "inactive"}">${product.stock > 0 ? "In Stock" : "Out of Stock"}</span></td>
        <td class="actions">
          <button class="icon-btn edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i></button>
          <button class="icon-btn delete-btn" data-id="${product.id}"><i class="fas fa-trash-alt"></i></button>
        </td>
      `

      tableBody.appendChild(row)
    })

    // Add event listeners to edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.editProduct(btn.dataset.id))
    })

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.confirmDelete(btn.dataset.id))
    })
  }

  // Truncate description for table display
  truncateDescription(description) {
    if (!description) return ""

    // Remove HTML tags
    const plainText = description.replace(/<[^>]*>/g, "")

    // Truncate to 50 characters
    return plainText.length > 50 ? plainText.substring(0, 50) + "..." : plainText
  }

  // Open product modal for adding a new product
  openProductModal(productId = null) {
    const modal = document.getElementById("product-modal")
    const modalTitle = document.getElementById("modal-title")

    if (modal && modalTitle) {
      modalTitle.textContent = productId ? "Edit Product" : "Add New Product"

      // Reset form
      document.getElementById("product-id").value = productId || ""
      document.getElementById("product-name").value = ""
      document.getElementById("product-price").value = ""
      document.getElementById("product-stock").value = ""

      if (this.quillEditor) {
        this.quillEditor.root.innerHTML = ""
      }

      // Reset tabs
      this.switchTab("basic-details")
      document.getElementById("next-btn").style.display = "block"
      document.getElementById("save-btn").style.display = "none"
      document.getElementById("back-btn").style.display = "none"

      // If editing, load product data
      if (productId) {
        this.loadProductData(productId)
      }

      modal.style.display = "block"
    }
  }

  // Load product data for editing
  async loadProductData(productId) {
    try {
      const response = await fetch(`${this.apiUrl}/${productId}`)
      const result = await response.json()

      if (result.success) {
        const product = result.data

        document.getElementById("product-name").value = product.name
        document.getElementById("product-price").value = product.price
        document.getElementById("product-stock").value = product.stock

        if (this.quillEditor) {
          this.quillEditor.root.innerHTML = product.description || ""
        }

        // Load images if available
        // This would be implemented in a real application
      } else {
        this.showToast("Error loading product data", "error")
      }
    } catch (error) {
      console.error("Error loading product data:", error)
      this.showToast("Failed to load product data", "error")
    }
  }

  // Save product (create or update)
  async saveProduct(e) {
    e.preventDefault()

    try {
      const productId = document.getElementById("product-id").value
      const name = document.getElementById("product-name").value
      const price = Number.parseFloat(document.getElementById("product-price").value)
      const stock = Number.parseInt(document.getElementById("product-stock").value) || 0

      // Get description from Quill editor
      const description = this.quillEditor ? this.quillEditor.root.innerHTML : ""

      // Validate required fields
      if (!name || isNaN(price)) {
        this.showToast("Please fill in all required fields", "error")
        return
      }

      const productData = {
        name,
        price,
        stock,
        description,
        images: [], // In a real app, this would contain image URLs
      }

      let response

      if (productId) {
        // Update existing product
        response = await fetch(`${this.apiUrl}/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: productId,
            ...productData,
          }),
        })
      } else {
        // Create new product
        response = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        })
      }

      const result = await response.json()

      if (result.success) {
        this.showToast(productId ? "Product updated successfully" : "Product created successfully", "success")
        this.closeModals()
        this.loadProducts() // Refresh product list
      } else {
        this.showToast(result.message || "Error saving product", "error")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      this.showToast("Failed to save product", "error")
    }
  }

  // Confirm product deletion
  confirmDelete(productId) {
    const modal = document.getElementById("delete-modal")
    if (modal) {
      document.getElementById("delete-product-id").value = productId
      modal.style.display = "block"
    }
  }

  // Delete product
  async deleteProduct() {
    const productId = document.getElementById("delete-product-id").value

    if (!productId) return

    try {
      const response = await fetch(`${this.apiUrl}/${productId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        this.showToast("Product deleted successfully", "success")
        this.closeModals()
        this.loadProducts() // Refresh product list
      } else {
        this.showToast(result.message || "Error deleting product", "error")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      this.showToast("Failed to delete product", "error")
    }
  }

  // Switch between tabs in the product modal
  switchTab(tabId) {
    // Hide all tab panes
    document.querySelectorAll(".tab-pane").forEach((pane) => {
      pane.classList.remove("active")
    })

    // Deactivate all tabs
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.remove("active")
    })

    // Activate selected tab and pane
    document.getElementById(tabId).classList.add("active")
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add("active")

    // Update buttons based on current tab
    this.updateTabButtons(tabId)
  }

  // Update buttons based on current tab
  updateTabButtons(currentTab) {
    const nextBtn = document.getElementById("next-btn")
    const backBtn = document.getElementById("back-btn")
    const saveBtn = document.getElementById("save-btn")

    const tabs = ["basic-details", "description", "images"]
    const currentIndex = tabs.indexOf(currentTab)

    if (currentIndex === 0) {
      // First tab
      backBtn.style.display = "none"
      nextBtn.style.display = "block"
      saveBtn.style.display = "none"
    } else if (currentIndex === tabs.length - 1) {
      // Last tab
      backBtn.style.display = "block"
      nextBtn.style.display = "none"
      saveBtn.style.display = "block"
    } else {
      // Middle tab
      backBtn.style.display = "block"
      nextBtn.style.display = "block"
      saveBtn.style.display = "none"
    }
  }

  // Navigate to next tab
  nextTab() {
    const tabs = ["basic-details", "description", "images"]
    const activeTab = document.querySelector(".tab-pane.active").id
    const currentIndex = tabs.indexOf(activeTab)

    if (currentIndex < tabs.length - 1) {
      this.switchTab(tabs[currentIndex + 1])
    }
  }

  // Navigate to previous tab
  previousTab() {
    const tabs = ["basic-details", "description", "images"]
    const activeTab = document.querySelector(".tab-pane.active").id
    const currentIndex = tabs.indexOf(activeTab)

    if (currentIndex > 0) {
      this.switchTab(tabs[currentIndex - 1])
    }
  }

  // Switch between description options
  switchDescriptionOption(option) {
    // Hide all options
    document.querySelectorAll(".description-option").forEach((opt) => {
      opt.classList.remove("active")
    })

    // Deactivate all option buttons
    document.querySelectorAll(".option-btn").forEach((btn) => {
      btn.classList.remove("active")
    })

    // Activate selected option and button
    document.getElementById(`${option}-option`).classList.add("active")
    document.querySelector(`.option-btn[data-option="${option}"]`).classList.add("active")

    // Hide preview when switching options
    document.getElementById("description-preview").style.display = "none"
  }

  // Toggle description preview
  togglePreview() {
    const preview = document.getElementById("description-preview")
    const previewContent = document.getElementById("preview-content")
    const previewTitle = document.getElementById("preview-title")

    if (preview.style.display === "block") {
      preview.style.display = "none"
    } else {
      // Get product name
      const productName = document.getElementById("product-name").value || "Product Name"
      previewTitle.textContent = productName

      // Get description based on active option
      let description = ""

      const activeOption = document.querySelector(".description-option.active").id

      if (activeOption === "manual-entry") {
        description = this.quillEditor ? this.quillEditor.root.innerHTML : ""
      } else if (activeOption === "ai-generated") {
        description = document.querySelector("#ai-result .generated-text").innerHTML
      } else if (activeOption === "template-option") {
        description = document.querySelector("#template-preview .template-text").innerHTML
      } else if (activeOption === "import-option") {
        description = document.getElementById("imported-description").innerHTML
      }

      previewContent.innerHTML = description
      preview.style.display = "block"
    }
  }

  // Load template
  loadTemplate(templateId) {
    if (!templateId) return

    const templatePreview = document.querySelector("#template-preview .template-text")

    // Template content based on selected template
    const templates = {
      food: `<h3>Premium Pet Food</h3>
             <p>Our premium pet food is made with high-quality ingredients to provide your pet with the nutrition they need.</p>
             <ul>
               <li>Made with real meat</li>
               <li>No artificial preservatives</li>
               <li>Balanced nutrition for all life stages</li>
               <li>Supports healthy digestion</li>
             </ul>`,
      toy: `<h3>Durable Pet Toy</h3>
            <p>This durable pet toy is designed to withstand even the most enthusiastic play sessions.</p>
            <ul>
              <li>Made from non-toxic materials</li>
              <li>Durable construction</li>
              <li>Interactive design to keep pets engaged</li>
              <li>Easy to clean</li>
            </ul>`,
      accessory: `<h3>Stylish Pet Accessory</h3>
                  <p>This stylish pet accessory combines fashion and function to keep your pet looking and feeling great.</p>
                  <ul>
                    <li>Comfortable fit</li>
                    <li>Adjustable size</li>
                    <li>Durable materials</li>
                    <li>Easy to clean</li>
                  </ul>`,
      medicine: `<h3>Pet Health Supplement</h3>
                 <p>This health supplement is formulated to support your pet's overall health and wellbeing.</p>
                 <ul>
                   <li>Supports immune system</li>
                   <li>Promotes healthy joints</li>
                   <li>Improves coat and skin health</li>
                   <li>Easy to administer</li>
                 </ul>`,
    }

    templatePreview.innerHTML = templates[templateId] || ""
    document.getElementById("template-preview").style.display = templateId ? "block" : "none"
  }

  // Generate AI description (simulated)
  generateAIDescription() {
    const prompt = document.getElementById("ai-prompt").value

    if (!prompt) {
      this.showToast("Please enter a product description", "error")
      return
    }

    // In a real application, this would call an AI service
    // For demonstration, we'll simulate an AI response

    const aiResult = document.querySelector("#ai-result .generated-text")

    // Simulate loading
    aiResult.innerHTML = "<p>Generating description...</p>"
    document.getElementById("ai-result").style.display = "block"

    setTimeout(() => {
      // Generate a simple description based on the prompt
      const keywords = prompt.split(" ").filter((word) => word.length > 3)

      let description = `<h3>Product Description</h3>
                         <p>This premium product is designed to meet all your pet's needs. `

      if (keywords.length > 0) {
        description += `Featuring ${keywords.join(", ")}, this product provides exceptional quality and value.</p>
                        <ul>
                          <li>High-quality materials</li>
                          <li>Durable construction</li>
                          <li>Perfect for daily use</li>
                          <li>Designed with your pet's comfort in mind</li>
                        </ul>`
      } else {
        description += `This product provides exceptional quality and value.</p>
                        <ul>
                          <li>High-quality materials</li>
                          <li>Durable construction</li>
                          <li>Perfect for daily use</li>
                          <li>Designed with your pet's comfort in mind</li>
                        </ul>`
      }

      aiResult.innerHTML = description
    }, 1500)
  }

  // Handle file upload for description
  handleFileUpload(event) {
    const file = event.target.files[0]

    if (!file) return

    const reader = new FileReader()

    reader.onload = (e) => {
      const content = e.target.result
      document.getElementById("imported-description").innerHTML = content
      document.getElementById("imported-description-container").style.display = "block"
    }

    reader.readAsText(file)
  }

  // Close all modals
  closeModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.style.display = "none"
    })
  }

  // Show toast notification
  showToast(message, type = "success") {
    const toast = document.getElementById("toast")
    const toastMessage = document.querySelector(".toast-message")
    const toastIcon = document.querySelector(".toast-content i")
    const toastProgress = document.querySelector(".toast-progress")

    if (toast && toastMessage) {
      // Set message
      toastMessage.textContent = message

      // Set icon and color based on type
      if (type === "success") {
        toastIcon.className = "fas fa-check-circle"
        toastIcon.style.color = "var(--success-color)"
        toastProgress.style.backgroundColor = "var(--success-color)"
      } else if (type === "error") {
        toastIcon.className = "fas fa-exclamation-circle"
        toastIcon.style.color = "var(--danger-color)"
        toastProgress.style.backgroundColor = "var(--danger-color)"
      } else if (type === "warning") {
        toastIcon.className = "fas fa-exclamation-triangle"
        toastIcon.style.color = "var(--warning-color)"
        toastProgress.style.backgroundColor = "var(--warning-color)"
      } else if (type === "info") {
        toastIcon.className = "fas fa-info-circle"
        toastIcon.style.color = "var(--info-color)"
        toastProgress.style.backgroundColor = "var(--info-color)"
      }

      // Show toast
      toast.style.display = "block"

      // Auto-hide after 3 seconds
      setTimeout(() => {
        toast.style.display = "none"
      }, 3000)
    }
  }
}

// Initialize the product service when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const productService = new ProductService()
  productService.init()

  // Make it globally accessible for debugging
  window.productService = productService
})
