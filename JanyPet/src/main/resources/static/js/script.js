// DOM Elements
const sidebar = document.getElementById("sidebar")
const menuToggle = document.getElementById("menu-toggle")
const toggleSidebar = document.getElementById("toggle-sidebar")
const contentSections = document.querySelectorAll(".content-section")
const menuItems = document.querySelectorAll(".menu-item")
const productModal = document.getElementById("product-modal")
const deleteModal = document.getElementById("delete-modal")
const toast = document.getElementById("toast")
const productsTableBody = document.getElementById("products-table-body")

// Modal Elements
const modalTitle = document.getElementById("modal-title")
const productBasicForm = document.getElementById("product-basic-form")
const productIdInput = document.getElementById("product-id")
const productNameInput = document.getElementById("product-name")
const productCategoryInput = document.getElementById("product-category")
const productPriceInput = document.getElementById("product-price")
const productStockInput = document.getElementById("product-stock")
const productSkuInput = document.getElementById("product-sku")
const addProductBtn = document.getElementById("add-product-btn")
const cancelBtn = document.getElementById("cancel-btn")
const nextBtn = document.getElementById("next-btn")
const backBtn = document.getElementById("back-btn")
const deleteProductBtn = document.querySelectorAll(".delete-btn")
const deleteCancelBtn = document.getElementById("delete-cancel-btn")
const confirmDeleteBtn = document.getElementById("confirm-delete-btn")
const deleteProductIdInput = document.getElementById("delete-product-id")

// Tab Elements
const tabs = document.querySelectorAll(".tab")
const tabPanes = document.querySelectorAll(".tab-pane")

// Description Tab Elements
const optionBtns = document.querySelectorAll(".option-btn")
const descriptionOptions = document.querySelectorAll(".description-option")
const previewToggle = document.getElementById("preview-toggle")
const descriptionPreview = document.getElementById("description-preview")
const previewTitle = document.getElementById("preview-title")
const previewContent = document.getElementById("preview-content")
const generateBtn = document.getElementById("generate-btn")
const aiPrompt = document.getElementById("ai-prompt")
const aiResult = document.getElementById("ai-result")
const templateSelect = document.getElementById("template-select")
const templatePreview = document.getElementById("template-preview")

// Image Upload Elements
const productImages = document.getElementById("product-images")
const uploadBtn = document.querySelector(".upload-btn")
const imagePreviewContainer = document.getElementById("image-preview-container")

// Rich Text Editor Initialization
let quill
// Product Service
const productService = {
  getAllProducts: async () => {
    // Replace with your actual API endpoint
    const response = await fetch("http://localhost:8080/api/products?limit=5")
    const data = await response.json()
    return data.map((product) => ({
      id: product.id,
      name: product.title,
      category: product.category,
      sku: `SKU-${product.id}`,
      price: product.price,
      stock: Math.floor(Math.random() * 100), // Mock stock
      status: product.rating.rate > 3 ? "In Stock" : "Low Stock",
      image: product.image,
      description: product.description,
    }))
  },
  createProduct: async (productData) => {
    // Replace with your actual API endpoint
    const response = await fetch("http://localhost:8080/api/products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
    return await response.json()
  },
  updateProduct: async (productId, productData) => {
    // Replace with your actual API endpoint
    const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    })
    return await response.json()
  },
  deleteProduct: async (productId) => {
    // Replace with your actual API endpoint
    const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
      method: "DELETE",
    })
    return await response.json()
  },
  getProductById: async (productId) => {
    const response = await fetch(`http://localhost:8080/api/products/${productId}`)
    return await response.json()
  },
}

document.addEventListener("DOMContentLoaded", () => {
  // Validate DOM elements existence
  const requiredElements = [
    "sidebar",
    "menu-toggle", 
    "toggle-sidebar",
    "products-table-body",
    "product-modal",
    "toast"
  ];
  
  const missingElements = requiredElements.filter(id => !document.getElementById(id));
  
  if(missingElements.length > 0) {
    console.error("Missing required DOM elements:", missingElements);
    return;
  }

  // Initialize
  renderProducts();
  setupEventListeners();
})

// Sample Templates
const productTemplates = {
  food: `<h2>Premium Quality Pet Food</h2>
<p>Our high-quality pet food is specially formulated to meet the nutritional needs of your pet. Made with real ingredients, this food provides a balanced diet that promotes health and vitality.</p>
<h3>Key Benefits:</h3>
<ul>
    <li>Made with real, high-quality ingredients</li>
    <li>No artificial preservatives or fillers</li>
    <li>Balanced nutrition for optimal health</li>
    <li>Supports healthy digestion</li>
    <li>Enhances coat health and shine</li>
</ul>
<h3>Feeding Guidelines:</h3>
<p>For adult pets, feed [amount] per [weight] of body weight daily, divided into two meals. Adjust amounts as needed to maintain ideal body condition.</p>`,
  toy: `<h2>Interactive Pet Toy</h2>
<p>Keep your pet entertained for hours with this engaging interactive toy. Designed to stimulate your pet's natural instincts and encourage active play.</p>
<h3>Features:</h3>
<ul>
    <li>Durable construction for long-lasting play</li>
    <li>Interactive design to keep your pet engaged</li>
    <li>Safe materials, free from harmful chemicals</li>
    <li>Suitable for [size/type] pets</li>
    <li>Easy to clean and maintain</li>
</ul>
<h3>Why Interactive Play Matters:</h3>
<p>Regular play helps reduce stress and anxiety in pets, prevents boredom-related behaviors, and provides essential mental and physical exercise.</p>`,
  accessory: `<h2>Premium Pet Accessory</h2>
<p>Enhance your pet's comfort and style with our premium quality accessory. Designed for durability and comfort, this is an essential item for every pet owner.</p>
<h3>Product Features:</h3>
<ul>
    <li>Made from high-quality, durable materials</li>
    <li>Comfortable fit for your pet</li>
    <li>Stylish design available in multiple colors</li>
    <li>Adjustable for the perfect fit</li>
    <li>Easy to clean and maintain</li>
</ul>
<h3>Size Guide:</h3>
<p>Please measure your pet carefully before selecting a size. [Size guide details]</p>`,
  medicine: `<h2>Pet Health Supplement</h2>
<p>Support your pet's health and wellbeing with our specially formulated supplement. Developed by veterinarians to address specific health needs and enhance overall vitality.</p>
<h3>Health Benefits:</h3>
<ul>
    <li>Supports [specific health aspect]</li>
    <li>Contains essential vitamins and minerals</li>
    <li>Palatable formula that pets enjoy</li>
    <li>No artificial colors or flavors</li>
    <li>Manufactured in certified facilities</li>
</ul>
<h3>Dosage and Administration:</h3>
<p>For pets weighing [weight range], administer [dosage] daily. Can be given directly or mixed with food. Always consult with your veterinarian before starting any supplement regimen.</p>`,
}

// Initial Loading
document.addEventListener("DOMContentLoaded", () => {
  // Load products
  renderProducts()

  // Set event listeners
  setupEventListeners()
})

// Functions
function setupEventListeners() {
  // Sidebar toggle
  toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed")
  })

  // Mobile menu toggle
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open")
  })

  // Menu navigation
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
        }
      })

      // Close sidebar on mobile after selection
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("open")
      }
    })
  })

  // Tab navigation
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab")

      // Update active tab
      tabs.forEach((t) => t.classList.remove("active"))
      this.classList.add("active")

      // Show selected tab pane
      tabPanes.forEach((pane) => {
        pane.classList.remove("active")
        if (pane.id === tabId) {
          pane.classList.add("active")
        }
      })

      // Update navigation buttons
      updateNavigationButtons()
    })
  })

  // Description option buttons
  optionBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const optionId = this.getAttribute("data-option")

      // Update active option button
      optionBtns.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")

      // Show selected description option
      descriptionOptions.forEach((option) => {
        option.classList.remove("active")
        if (
          option.id === optionId + "-entry" ||
          option.id === optionId + "-generated" ||
          option.id === optionId + "-option"
        ) {
          option.classList.add("active")
        }
      })
    })
  })

  // Preview toggle
  previewToggle.addEventListener("click", function () {
    if (descriptionPreview.style.display === "block") {
      descriptionPreview.style.display = "none"
      this.innerHTML = '<i class="fas fa-eye"></i> Preview'
    } else {
      // Update preview content
      previewTitle.textContent = productNameInput.value || "Product Name"

      // Get content based on active option
      let content = ""
      if (document.getElementById("manual-entry").classList.contains("active")) {
        content = quill.root.innerHTML
      } else if (document.getElementById("ai-generated").classList.contains("active")) {
        content = document.querySelector(".generated-text").innerHTML
      } else if (document.getElementById("template-option").classList.contains("active")) {
        content = document.querySelector(".template-text").innerHTML
      }

      previewContent.innerHTML = content
      descriptionPreview.style.display = "block"
      this.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Preview'
    }
  })

  // Generate AI description
  generateBtn.addEventListener("click", () => {
    const prompt = aiPrompt.value.trim()
    if (prompt) {
      // Simulate AI generation (in a real app, this would call an API)
      simulateAIGeneration(prompt)
    }
  })

  // Template selection
  templateSelect.addEventListener("change", function () {
    const templateId = this.value
    if (templateId) {
      document.querySelector(".template-text").innerHTML = productTemplates[templateId]
      templatePreview.style.display = "block"
    } else {
      templatePreview.style.display = "none"
    }
  })

  // Add Product button
  addProductBtn.addEventListener("click", () => {
    openProductModal("add")
  })

  // Save Product button
  // saveBtn.addEventListener("click", () => {
  //   saveProduct()
  // })

  // Next button in modal
  nextBtn.addEventListener("click", () => {
    const activeTab = document.querySelector(".tab.active")
    const nextTabIndex = Array.from(tabs).indexOf(activeTab) + 1

    if (nextTabIndex < tabs.length) {
      tabs[nextTabIndex].click()
    }
  })

  // Back button in modal
  backBtn.addEventListener("click", () => {
    const activeTab = document.querySelector(".tab.active")
    const prevTabIndex = Array.from(tabs).indexOf(activeTab) - 1

    if (prevTabIndex >= 0) {
      tabs[prevTabIndex].click()
    }
  })

  // Cancel button
  cancelBtn.addEventListener("click", () => {
    closeProductModal()
  })

  // Modal close button
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      closeProductModal()
      closeDeleteModal()
    })
  })

  // Delete cancel button
  deleteCancelBtn.addEventListener("click", () => {
    closeDeleteModal()
  })

  // Confirm delete button
  confirmDeleteBtn.addEventListener("click", () => {
    const productId = Number.parseInt(deleteProductIdInput.value)
    deleteProduct(productId)
    closeDeleteModal()
  })

  // Image upload button
  uploadBtn.addEventListener("click", () => {
    productImages.click()
  })

  // File input change
  productImages.addEventListener("change", (e) => {
    handleImageUpload(e.target.files)
  })
}

// Cập nhật các hàm xử lý sản phẩm trong script.js

// Thay thế hàm renderProducts hiện tại
async function renderProducts() {
  try {
    // Lấy sản phẩm từ API
    products = await productService.getAllProducts()

    productsTableBody.innerHTML = ""

    products.forEach((product) => {
      // Xác định trạng thái dựa trên số lượng tồn kho
      let status = "In Stock"
      if (product.stock <= 0) {
        status = "Out of Stock"
      } else if (product.stock <= 5) {
        status = "Low Stock"
      }

      // Xử lý hình ảnh
      let imageUrl = "https://via.placeholder.com/50?text=No+Image"
      if (product.image) {
        try {
          // Nếu image là chuỗi JSON, parse nó
          const imageData = JSON.parse(product.image)
          if (imageData && imageData.url) {
            imageUrl = imageData.url
          } else if (typeof imageData === "string") {
            imageUrl = imageData
          }
        } catch (e) {
          // Nếu không phải JSON, sử dụng trực tiếp
          imageUrl = product.image
        }
      }

      const row = document.createElement("tr")
      row.innerHTML = `
        <td><input type="checkbox" class="select-item"></td>
        <td><img src="${imageUrl}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
        <td>${product.name}</td>
        <td>${product.description ? product.description.substring(0, 50) + "..." : ""}</td>
        <td>${product.price ? product.price.toFixed(2) : "0.00"}</td>
        <td>${product.stock}</td>
        <td><span class="status ${getStatusClass(status)}">${status}</span></td>
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
      btn.addEventListener("click", function () {
        const productId = this.getAttribute("data-id")
        openProductModal("edit", productId)
      })
    })

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const productId = this.getAttribute("data-id")
        openDeleteModal(productId)
      })
    })
  } catch (error) {
    showToast("Error loading products: " + error.message, "error")
  }
}

// Thay thế hàm deleteProduct hiện tại
async function deleteProduct(productId) {
  try {
    await productService.deleteProduct(productId)
    await renderProducts() // Reload products from server
    showToast("Product deleted successfully")
  } catch (error) {
    showToast("Error deleting product: " + error.message, "error")
  }
}

// Thêm hàm này để tải sản phẩm khi trang được tải
document.addEventListener("DOMContentLoaded", async () => {
  // Load products from API
  await renderProducts()

  // Set event listeners
  setupEventListeners()
})

function getStatusClass(status) {
  switch (status) {
    case "In Stock":
      return "active"
    case "Low Stock":
      return "pending"
    case "Out of Stock":
      return "inactive"
    default:
      return ""
  }
}

// Thay thế hàm openProductModal để hiển thị đúng dữ liệu sản phẩm
async function openProductModal(mode, productId = null) {
  const modal = document.getElementById("product-modal");
  const title = document.getElementById("modal-title");
  const productIdInput = document.getElementById("product-id");
  
  // Reset form
  document.getElementById("product-form").reset();
  if (window.quill) {
    window.quill.root.innerHTML = "";
  }
  
  if (mode === "edit" && productId) {
    // Logic for editing existing product
    title.textContent = "Chỉnh sửa sản phẩm";
    productIdInput.value = productId;
    
    // Fetch and fill product details
    fetchProductDetails(productId);
  } else {
    // Logic for adding new product
    title.textContent = "Thêm sản phẩm mới";
    productIdInput.value = "";
  }
  
  modal.style.display = "block";
}

// Helper method to fetch product details
async function fetchProductDetails(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const product = await response.json();
    
    document.getElementById("product-name").value = product.name || "";
    document.getElementById("product-category").value = product.category || "";
    document.getElementById("product-purchase-price").value = product.purchasePrice || "";
    document.getElementById("product-selling-price").value = product.price || "";
    
    if (window.quill && product.description) {
      window.quill.root.innerHTML = product.description;
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    window.ToastService?.error("Lỗi khi tải thông tin sản phẩm") || 
      this.showToast("Lỗi khi tải thông tin sản phẩm", "error");
  }
}

function closeProductModal() {
  productModal.style.display = "none"
}

function openDeleteModal(productId) {
  deleteProductIdInput.value = productId
  deleteModal.style.display = "block"
}

function closeDeleteModal() {
  deleteModal.style.display = "none"
}

function updateNavigationButtons() {
  const activeTab = document.querySelector(".tab.active")
  const activeTabIndex = Array.from(tabs).indexOf(activeTab)

  // Show/hide back button
  if (activeTabIndex > 0) {
    backBtn.style.display = "block"
  } else {
    backBtn.style.display = "none"
  }

  // Show/hide next and save buttons
  if (activeTabIndex === tabs.length - 1) {
    nextBtn.style.display = "none"
    saveBtn.style.display = "block"
  } else {
    nextBtn.style.display = "block"
    saveBtn.style.display = "none"
  }
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) {
    console.warn("Toast element not found");
    return;
  }

  const toastContent = toast.querySelector(".toast-content i");
  const toastMessage = toast.querySelector(".toast-message");
  const toastProgress = toast.querySelector(".toast-progress");

  if (!toastContent || !toastMessage || !toastProgress) {
    console.warn("Toast child elements not found"); 
    return;
  }

  // Set icon and color based on type
  if (type === "success") {
    toastContent.className = "fas fa-check-circle"
    toastContent.style.color = "var(--success-color)"
    toastProgress.style.backgroundColor = "var(--success-color)"
  } else if (type === "error") {
    toastContent.className = "fas fa-times-circle"
    toastContent.style.color = "var(--danger-color)"
    toastProgress.style.backgroundColor = "var(--danger-color)"
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

function simulateAIGeneration(prompt) {
  // Show loading state
  generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...'
  generateBtn.disabled = true

  // Simulate API delay
  setTimeout(() => {
    // Generate description based on product category
    const category = productCategoryInput.value.toLowerCase()
    let generatedText = ""

    if (category.includes("food")) {
      generatedText = productTemplates.food
    } else if (category.includes("toy")) {
      generatedText = productTemplates.toy
    } else if (category.includes("accessories")) {
      generatedText = productTemplates.accessory
    } else if (category.includes("medicine")) {
      generatedText = productTemplates.medicine
    } else {
      // Default template
      generatedText = `<h2>${productNameInput.value || "Product"}</h2>
<p>${prompt}</p>
<h3>Features:</h3>
<ul>
    <li>High-quality materials</li>
    <li>Durable and long-lasting</li>
    <li>Perfect for all pets</li>
    <li>Easy to use and maintain</li>
</ul>
<p>This product is designed to enhance your pet's life and provide convenience for pet owners.</p>`
    }

    // Show result
    document.querySelector(".generated-text").innerHTML = generatedText
    aiResult.style.display = "block"

    // Reset button
    generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Description'
    generateBtn.disabled = false
  }, 1500)
}

function handleImageUpload(files) {
  if (!files || files.length === 0) return

  // Clear existing previews
  imagePreviewContainer.innerHTML = ""

  // Create preview for each file
  Array.from(files).forEach((file, index) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const preview = document.createElement("div")
      preview.className = "image-preview"
      preview.innerHTML = `
                <img src="${e.target.result}" alt="Product Image">
                <button class="remove-image"><i class="fas fa-times"></i></button>
                ${index === 0 ? '<span class="main-image">Main</span>' : ""}
            `

      // Add remove button functionality
      preview.querySelector(".remove-image").addEventListener("click", () => {
        preview.remove()

        // Update main image tag if needed
        if (index === 0 && imagePreviewContainer.children.length > 0) {
          const firstPreview = imagePreviewContainer.children[0]
          if (!firstPreview.querySelector(".main-image")) {
            const mainTag = document.createElement("span")
            mainTag.className = "main-image"
            mainTag.textContent = "Main"
            firstPreview.appendChild(mainTag)
          }
        }
      })

      imagePreviewContainer.appendChild(preview)
    }

    reader.readAsDataURL(file)
  })
}

// Responsive initialization for mobile
window.addEventListener("resize", () => {
  if (window.innerWidth <= 768) {
    sidebar.classList.add("collapsed")
  }
})

// Initialize first menu item as active
if (menuItems.length > 0) {
  menuItems[0].classList.add("active")
}
// Settings Section JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Settings menu navigation
  const settingsMenuItems = document.querySelectorAll(".settings-menu-item")
  const settingsPanels = document.querySelectorAll(".settings-panel")

  settingsMenuItems.forEach((item) => {
    item.addEventListener("click", function () {
      const settingsId = this.getAttribute("data-settings")

      // Update active menu item
      settingsMenuItems.forEach((i) => i.classList.remove("active"))
      this.classList.add("active")

      // Show selected settings panel
      settingsPanels.forEach((panel) => {
        panel.classList.remove("active")
        if (panel.id === settingsId + "-settings") {
          panel.classList.add("active")
        }
      })
    })
  })

  // Theme selection
  const themeOptions = document.querySelectorAll(".theme-option")

  themeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      themeOptions.forEach((o) => o.classList.remove("active"))
      this.classList.add("active")

      // In a real implementation, this would apply the selected theme
      const themeName = this.querySelector("span").textContent.toLowerCase()
      console.log("Theme selected:", themeName)
    })
  })

  // Save settings button
  const saveSettingsBtn = document.getElementById("save-settings-btn")

  // Mock showToast function for demonstration purposes
  function showToast(message) {
    alert(message) // Replace with a proper toast notification implementation
  }

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", () => {
      // Simulate saving settings
      showToast("Settings saved successfully")
    })
  }

  // Custom date range toggle for reports
  const reportPeriod = document.getElementById("report-period")
  const customDateRange = document.getElementById("custom-date-range")

  if (reportPeriod && customDateRange) {
    reportPeriod.addEventListener("change", function () {
      if (this.value === "custom") {
        customDateRange.style.display = "block"
      } else {
        customDateRange.style.display = "none"
      }
    })
  }
})


  // Global search functionality
  const globalSearch = document.querySelector(".search-container input")
  globalSearch.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
      const searchTerm = this.value.toLowerCase().trim()
      if (searchTerm) {
        // Determine which section is active and search accordingly
        const activeSection = document.querySelector(".content-section.active").id

        if (activeSection === "products-section") {
          searchProducts(searchTerm)
        } else if (activeSection === "customers-section") {
          searchCustomers(searchTerm)
        } else if (activeSection === "orders-section") {
          searchOrders(searchTerm)
        }

        showToast(`Searching for "${searchTerm}"...`)
      }
    }
  })

  function searchProducts(term) {
    const filteredProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term),
    )
    renderProductsTable(filteredProducts)
  }

  function searchCustomers(term) {
    // Implementation would be similar to searchProducts
    console.log(`Searching customers for: ${term}`)
  }

  function searchOrders(term) {
    // Implementation would be similar to searchProducts
    console.log(`Searching orders for: ${term}`)
  }

  // Sample product data
  let products = [
    {
      id: 1,
      name: "Premium Dog Food",
      category: "Pet Food",
      sku: "PF-001",
      price: 29.99,
      stock: 42,
      status: "In Stock",
      description: "<p>High-quality dog food made with premium ingredients. Suitable for all breeds and ages.</p>",
      images: ["https://via.placeholder.com/100"],
    },
    {
      id: 2,
      name: "Interactive Cat Toy",
      category: "Toys",
      sku: "PT-034",
      price: 15.95,
      stock: 28,
      status: "In Stock",
      description:
        "<p>Engaging toy that keeps cats entertained for hours. Battery operated with multiple settings.</p>",
      images: ["https://via.placeholder.com/100"],
    },
    {
      id: 3,
      name: "Dog Collar (Large)",
      category: "Accessories",
      sku: "PA-102",
      price: 12.5,
      stock: 5,
      status: "Low Stock",
      description: "<p>Durable collar for large dogs. Adjustable size with secure buckle.</p>",
      images: ["https://via.placeholder.com/100"],
    },
    {
      id: 4,
      name: "Cat Flea Medicine",
      category: "Medicine",
      sku: "PM-056",
      price: 35.0,
      stock: 0,
      status: "Out of Stock",
      description: "<p>Effective flea treatment for cats. Easy to apply and long-lasting protection.</p>",
      images: ["https://via.placeholder.com/100"],
    },
    {
      id: 5,
      name: "Bird Cage (Medium)",
      category: "Accessories",
      sku: "PA-205",
      price: 64.99,
      stock: 12,
      status: "In Stock",
      description: "<p>Spacious cage for medium-sized birds. Includes perches, feeding bowls, and easy-clean tray.</p>",
      images: ["https://via.placeholder.com/100"],
    },
  ]

  // Sample appointments data
  const appointments = [
    {
      id: 1001,
      customer: "John Smith",
      email: "john@example.com",
      pet: "Max",
      petType: "Dog",
      breed: "Golden Retriever",
      service: "Grooming",
      date: "2025-04-02",
      time: "10:00",
      status: "Scheduled",
    },
    {
      id: 1002,
      customer: "Sarah Johnson",
      email: "sarah@example.com",
      pet: "Luna",
      petType: "Cat",
      breed: "Domestic Shorthair",
      service: "Vaccination",
      date: "2025-04-02",
      time: "14:30",
      status: "Confirmed",
    },
    {
      id: 1003,
      customer: "Michael Davis",
      email: "michael@example.com",
      pet: "Rocky",
      petType: "Dog",
      breed: "Bulldog",
      service: "Checkup",
      date: "2025-04-03",
      time: "09:15",
      status: "Pending",
    },
  ]

  // Sample orders data
  let orders = [
    {
      id: "ORD-1001",
      customer: "John Smith",
      email: "john@example.com",
      date: "2025-04-01",
      items: [
        { product: "Premium Dog Food", quantity: 2, price: 29.99 },
        { product: "Dog Collar (Large)", quantity: 1, price: 12.5 },
      ],
      total: 72.48,
      status: "Processing",
    },
    {
      id: "ORD-1002",
      customer: "Sarah Johnson",
      email: "sarah@example.com",
      date: "2025-04-01",
      items: [
        { product: "Interactive Cat Toy", quantity: 1, price: 15.95 },
        { product: "Cat Flea Medicine", quantity: 3, price: 35.0 },
      ],
      total: 120.95,
      status: "Delivered",
    },
  ]

  // Sample customers data
  let customers = [
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      phone: "(123) 456-7890",
      address: "123 Main St, Anytown, USA",
      orders: 5,
      appointments: 3,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "(234) 567-8901",
      address: "456 Oak Ave, Somewhere, USA",
      orders: 2,
      appointments: 1,
    },
  ]

  // Load products into table
  function renderProductsTable(productsToRender = products) {
    const tableBody = document.getElementById("products-table-body")
    tableBody.innerHTML = ""

    productsToRender.forEach((product) => {
      const row = document.createElement("tr")

      // Status class based on stock level
      let statusClass = ""
      if (product.status === "In Stock") statusClass = "in-stock"
      else if (product.status === "Low Stock") statusClass = "low-stock"
      else if (product.status === "Out of Stock") statusClass = "out-of-stock"

      row.innerHTML = `
                <td><input type="checkbox" class="select-item" data-id="${product.id}"></td>
                <td><img src="${product.images[0]}" alt="${product.name}" class="product-thumbnail" style="width: 40px; height: 40px; object-fit: cover;"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.sku}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td><span class="status ${statusClass}">${product.status}</span></td>
                <td class="actions">
                    <button class="icon-btn edit-btn" data-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete-btn" data-id="${product.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `
      tableBody.appendChild(row)
    })

    // Add event listeners to edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const productId = Number.parseInt(this.getAttribute("data-id"))
        editProduct(productId)
      })
    })

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const productId = Number.parseInt(this.getAttribute("data-id"))
        openDeleteModal(productId)
      })
    })
  }

  // Load appointments into table
  function loadAppointments() {
    const tableBody = document.querySelector("#appointments-section .data-table tbody")
    tableBody.innerHTML = ""

    appointments.forEach((appointment) => {
      const row = document.createElement("tr")

      let statusClass = ""
      if (appointment.status === "Confirmed") statusClass = "confirmed"
      else if (appointment.status === "Pending") statusClass = "pending"
      else statusClass = "scheduled"

      row.innerHTML = `
                <td class="text-sm font-medium">#APT-${appointment.id}</td>
                <td>
                    <div>
                        <p class="font-medium">${appointment.customer}</p>
                        <p class="text-xs text-gray-500">${appointment.email}</p>
                    </div>
                </td>
                <td>
                    <div>
                        <p>${appointment.pet} (${appointment.petType})</p>
                        <p class="text-xs text-gray-500">${appointment.breed}</p>
                    </div>
                </td>
                <td class="text-sm">${appointment.service}</td>
                <td class="text-sm">${formatDate(appointment.date)}</td>
                <td class="text-sm">${formatTime(appointment.time)}</td>
                <td><span class="status ${statusClass}">${appointment.status}</span></td>
                <td class="actions">
                    <button class="icon-btn edit-appointment-btn" data-id="${appointment.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn cancel-appointment-btn" data-id="${appointment.id}">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="icon-btn confirm-appointment-btn" data-id="${appointment.id}">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
            `
      tableBody.appendChild(row)
    })

    // Add event listeners to appointment buttons
    document.querySelectorAll(".edit-appointment-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const appointmentId = Number.parseInt(this.getAttribute("data-id"))
        editAppointment(appointmentId)
      })
    })

    document.querySelectorAll(".cancel-appointment-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const appointmentId = Number.parseInt(this.getAttribute("data-id"))
        cancelAppointment(appointmentId)
      })
    })

    document.querySelectorAll(".confirm-appointment-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const appointmentId = Number.parseInt(this.getAttribute("data-id"))
        confirmAppointment(appointmentId)
      })
    })
  }

  // Load orders into table
  function loadOrders() {
    const tableBody = document.querySelector("#orders-section .data-table tbody")
    tableBody.innerHTML = ""

    orders.forEach((order) => {
      const row = document.createElement("tr")

      let statusClass = ""
      if (order.status === "Delivered") statusClass = "completed"
      else if (order.status === "Shipping") statusClass = "shipping"
      else statusClass = "processing"

      row.innerHTML = `
                <td class="text-sm font-medium">${order.id}</td>
                <td class="text-sm">${order.customer}</td>
                <td class="text-sm">${formatDate(order.date)}</td>
                <td class="text-sm font-medium">$${order.total.toFixed(2)}</td>
                <td><span class="status ${statusClass}">${order.status}</span></td>
                <td class="actions">
                    <button class="icon-btn view-order-btn" data-id="${order.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="icon-btn edit-order-btn" data-id="${order.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete-order-btn" data-id="${order.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `
      tableBody.appendChild(row)
    })

    // Add event listeners to order buttons
    document.querySelectorAll(".view-order-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const orderId = this.getAttribute("data-id")
        viewOrder(orderId)
      })
    })

    document.querySelectorAll(".edit-order-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const orderId = this.getAttribute("data-id")
        editOrder(orderId)
      })
    })

    document.querySelectorAll(".delete-order-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const orderId = this.getAttribute("data-id")
        deleteOrder(orderId)
      })
    })
  }

  // Load customers into table
  function loadCustomers() {
    const tableBody = document.querySelector("#customers-section .data-table tbody")
    tableBody.innerHTML = ""

    customers.forEach((customer) => {
      const row = document.createElement("tr")

      row.innerHTML = `
                <td class="font-medium">${customer.name}</td>
                <td class="text-sm">${customer.email}</td>
                <td class="text-sm">${customer.phone}</td>
                <td class="text-sm">${customer.orders}</td>
                <td class="text-sm">${customer.appointments}</td>
                <td class="actions">
                    <button class="icon-btn view-customer-btn" data-id="${customer.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="icon-btn edit-customer-btn" data-id="${customer.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete-customer-btn" data-id="${customer.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `
      tableBody.appendChild(row)
    })

    // Add event listeners to customer buttons
    document.querySelectorAll(".view-customer-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const customerId = Number.parseInt(this.getAttribute("data-id"))
        viewCustomer(customerId)
      })
    })

    document.querySelectorAll(".edit-customer-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const customerId = Number.parseInt(this.getAttribute("data-id"))
        editCustomer(customerId)
      })
    })

    document.querySelectorAll(".delete-customer-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const customerId = Number.parseInt(this.getAttribute("data-id"))
        deleteCustomer(customerId)
      })
    })
  }

  // Helper functions for date and time formatting
  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours))
    date.setMinutes(Number.parseInt(minutes))
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  }

  // Load data on page load
  renderProductsTable()

  // Navigation between sections
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all menu items
      document.querySelectorAll(".menu-item").forEach((i) => i.classList.remove("active"))
      // Add active class to clicked menu item
      this.classList.add("active")

      // Hide all content sections
      document.querySelectorAll(".content-section").forEach((section) => {
        section.classList.remove("active")
      })

      // Show the selected content section
      const sectionId = this.getAttribute("data-section")
      document.getElementById(sectionId).classList.add("active")

      // Load data for the selected section
      if (sectionId === "appointments-section") {
        loadAppointments()
      } else if (sectionId === "orders-section") {
        loadOrders()
      } else if (sectionId === "customers-section") {
        loadCustomers()
      }
    })
  })

  // Toggle sidebar collapse
  document.getElementById("toggle-sidebar").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("collapsed")
  })

  // Mobile menu toggle
  document.getElementById("menu-toggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("show")
  })

  // Add Product Button
  document.getElementById("add-product-btn").addEventListener("click", () => {
    openProductModal()
  })

  // Batch operations for products
  document.getElementById("batch-delete-btn").addEventListener("click", () => {
    const selectedIds = []
    document.querySelectorAll(".select-item:checked").forEach((checkbox) => {
      selectedIds.push(Number.parseInt(checkbox.getAttribute("data-id")))
    })

    if (selectedIds.length === 0) {
      showToast("No products selected", "error")
      return
    }

    if (confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
      // Remove products from array
      products = products.filter((p) => !selectedIds.includes(p.id))

      // Reload products table
      renderProductsTable()

      // Show success message
      showToast(`${selectedIds.length} products deleted successfully`)
    }
  })

  // Product Modal Functions
  function openProductModal(productId = null) {
    // Reset form
    document.getElementById("product-basic-form").reset()
    document.getElementById("product-id").value = ""
    quill.root.innerHTML = ""
    document.getElementById("ai-prompt").value = ""
    document.getElementById("ai-result").style.display = "none"
    document.getElementById("template-select").value = ""
    document.getElementById("template-preview").style.display = "none"
    document.getElementById("image-preview-container").innerHTML = ""

    // Reset tabs
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"))
    document.querySelector('.tab[data-tab="basic-details"]').classList.add("active")

    document.querySelectorAll(".tab-pane").forEach((pane) => pane.classList.remove("active"))
    document.getElementById("basic-details").classList.add("active")

    // Reset description options
    document.querySelectorAll(".option-btn").forEach((btn) => btn.classList.remove("active"))
    document.querySelector('.option-btn[data-option="manual"]').classList.add("active")

    document.querySelectorAll(".description-option").forEach((option) => option.classList.remove("active"))
    document.getElementById("manual-entry").classList.add("active")

    document.getElementById("description-preview").style.display = "none"

    // Reset buttons
    document.getElementById("back-btn").style.display = "none"
    document.getElementById("next-btn").style.display = "inline-block"


    // Set modal title
    document.getElementById("modal-title").textContent = productId ? "Edit Product" : "Thêm sản phẩm mới"

    // If editing, populate form with product data
    if (productId) {
      const product = products.find((p) => p.id === productId)
      if (product) {
        document.getElementById("product-id").value = product.id
        document.getElementById("product-name").value = product.name
        document.getElementById("product-category").value = product.category
        document.getElementById("product-price").value = product.price
        document.getElementById("product-stock").value = product.stock
        document.getElementById("product-sku").value = product.sku
        quill.root.innerHTML = product.description

        // Load images
        if (product.images && product.images.length > 0) {
          product.images.forEach((imgSrc) => {
            addImagePreview(imgSrc)
          })
        }
      }
    }

    // Show modal
    document.getElementById("product-modal").style.display = "block"
  }

  function closeProductModal() {
    document.getElementById("product-modal").style.display = "none"
  }

  // Tab Navigation
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab")

      // Update active tab
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"))
      this.classList.add("active")

      // Show corresponding tab pane
      document.querySelectorAll(".tab-pane").forEach((pane) => pane.classList.remove("active"))
      document.getElementById(tabId).classList.add("active")

      // Update buttons
      if (tabId === "basic-details") {
        document.getElementById("back-btn").style.display = "none"
        document.getElementById("next-btn").style.display = "inline-block"

      } else if (tabId === "description") {
        document.getElementById("back-btn").style.display = "inline-block"
        document.getElementById("next-btn").style.display = "inline-block"
       // document.getElementById("save-btn").style.display = "none"
      } else if (tabId === "images") {
        document.getElementById("back-btn").style.display = "inline-block"
        document.getElementById("next-btn").style.display = "none"
       // document.getElementById("save-btn").style.display = "inline-block"
      }
    })
  })

  // Description Options
  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const option = this.getAttribute("data-option")

      // Update active option
      document.querySelectorAll(".option-btn").forEach((b) => b.classList.remove("active"))
      this.classList.add("active")

      // Show corresponding option content
      document.querySelectorAll(".description-option").forEach((opt) => opt.classList.remove("active"))
      document.getElementById(`${option}-${option === "template" ? "option" : "entry"}`).classList.add("active")

      // Hide preview
      document.getElementById("description-preview").style.display = "none"
      document.getElementById("preview-toggle").innerHTML = '<i class="fas fa-eye"></i> Preview'
    })
  })

  // Preview Toggle
  document.getElementById("preview-toggle").addEventListener("click", function () {
    const previewSection = document.getElementById("description-preview")
    const isPreviewVisible = previewSection.style.display === "block"

    if (isPreviewVisible) {
      // Hide preview
      previewSection.style.display = "none"
      this.innerHTML = '<i class="fas fa-eye"></i> Preview'

      // Show active option
      const activeOption = document.querySelector(".option-btn.active").getAttribute("data-option")
      document.getElementById(`${activeOption}-${activeOption === "template" ? "option" : "entry"}`).style.display =
        "block"
    } else {
      // Show preview
      previewSection.style.display = "block"
      this.innerHTML = '<i class="fas fa-edit"></i> Edit'

      // Hide all options
      document.querySelectorAll(".description-option").forEach((opt) => (opt.style.display = "none"))

      // Update preview content
      updatePreview()
    }
  })

  function updatePreview() {
    const productName = document.getElementById("product-name").value || "Product Name"
    document.getElementById("preview-title").textContent = productName

    const activeOption = document.querySelector(".option-btn.active").getAttribute("data-option")
    let content = ""

    if (activeOption === "manual") {
      content = quill.root.innerHTML
    } else if (activeOption === "ai") {
      const aiResult = document.querySelector("#ai-result .generated-text").innerHTML
      content = aiResult || "<p>No AI description generated yet</p>"
    } else if (activeOption === "template") {
      const templateText = document.querySelector("#template-preview .template-text").innerHTML
      content = templateText || "<p>No template selected</p>"
    }

    document.getElementById("preview-content").innerHTML = content
  }

  // AI Generation
  document.getElementById("generate-btn").addEventListener("click", function () {
    const prompt = document.getElementById("ai-prompt").value
    const productName = document.getElementById("product-name").value
    const category = document.getElementById("product-category").value

    if (!prompt || !productName) {
      showToast("Please provide product name and description details", "error")
      return
    }

    // Show loading state
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...'
    this.disabled = true

    // Simulate AI generation (in a real app, this would be an API call)
    setTimeout(() => {
      const generatedText = `<p>${productName} is a premium quality product designed for pet owners who value both functionality and aesthetics. This product features durable construction, pet-safe materials, and an ergonomic design that makes it easy to use. Perfect for daily use, this ${category.toLowerCase()} product will enhance your pet care routine while providing excellent value for money.</p>`

      document.querySelector("#ai-result .generated-text").innerHTML = generatedText
      document.getElementById("ai-result").style.display = "block"

      // Reset button
      this.innerHTML = '<i class="fas fa-magic"></i> Generate Description'
      this.disabled = false
    }, 2000)
  })

  // Template Selection
  document.getElementById("template-select").addEventListener("change", function () {
    const template = this.value
    const productName = document.getElementById("product-name").value || "Product Name"

    if (template) {
      let templateText = ""

      switch (template) {
        case "food":
          templateText = `<p>${productName} is a nutritious and delicious pet food option that provides balanced nutrition for your pet's health and wellbeing. Made with high-quality ingredients and formulated by pet nutrition experts.</p>`
          break
        case "toy":
          templateText = `<p>${productName} is an engaging and durable toy designed to keep your pet entertained for hours. Made with pet-safe materials and built to withstand rough play.</p>`
          break
        case "accessory":
          templateText = `<p>${productName} is a stylish and practical accessory for your pet. Designed with both comfort and functionality in mind, it's perfect for everyday use.</p>`
          break
        case "medicine":
          templateText = `<p>${productName} is a veterinarian-recommended health product designed to support your pet's wellbeing. Always consult with your vet before starting any new medication.</p>`
          break
      }

      document.querySelector("#template-preview .template-text").innerHTML = templateText
      document.getElementById("template-preview").style.display = "block"
    } else {
      document.getElementById("template-preview").style.display = "none"
    }
  })

  // Image Upload
  document.querySelector(".upload-btn").addEventListener("click", () => {
    document.getElementById("product-images").click()
  })

  document.getElementById("product-images").addEventListener("change", (e) => {
    const files = e.target.files

    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const reader = new FileReader()

        reader.onload = (e) => {
          addImagePreview(e.target.result)
        }

        reader.readAsDataURL(file)
      }
    }
  })

  // Drag and drop for images
  const uploadArea = document.querySelector(".upload-area")

  uploadArea.addEventListener("dragover", function (e) {
    e.preventDefault()
    this.classList.add("dragover")
  })

  uploadArea.addEventListener("dragleave", function () {
    this.classList.remove("dragover")
  })

  uploadArea.addEventListener("drop", function (e) {
    e.preventDefault()
    this.classList.remove("dragover")

    const files = e.dataTransfer.files
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith("image/")) {
          const reader = new FileReader()

          reader.onload = (e) => {
            addImagePreview(e.target.result)
          }

          reader.readAsDataURL(file)
        }
      }
    }
  })

  function addImagePreview(src) {
    const container = document.getElementById("image-preview-container")
    const preview = document.createElement("div")
    preview.className = "image-preview"
    preview.innerHTML = `
            <img src="${src}" alt="Product Image">
            <span class="remove-image">&times;</span>
        `
    container.appendChild(preview)

    // Add event listener to remove button
    preview.querySelector(".remove-image").addEventListener("click", () => {
      preview.remove()
    })
  }

  // Modal Navigation Buttons
  document.getElementById("next-btn").addEventListener("click", () => {
    const activeTab = document.querySelector(".tab.active").getAttribute("data-tab")

    if (activeTab === "basic-details") {
      // Validate basic details
      const name = document.getElementById("product-name").value
      const category = document.getElementById("product-category").value
      const price = document.getElementById("product-price").value

      if (!name || !category || !price) {
        showToast("Please fill in all required fields", "error")
        return
      }

      // Switch to description tab
      document.querySelector('.tab[data-tab="description"]').click()
    } else if (activeTab === "description") {
      // Switch to images tab
      document.querySelector('.tab[data-tab="images"]').click()
    }
  })

  document.getElementById("back-btn").addEventListener("click", () => {
    const activeTab = document.querySelector(".tab.active").getAttribute("data-tab")

    if (activeTab === "description") {
      // Switch to basic details tab
      document.querySelector('.tab[data-tab="basic-details"]').click()
    } else if (activeTab === "images") {
      // Switch to description tab
      document.querySelector('.tab[data-tab="description"]').click()
    }
  })

  document.getElementById("cancel-btn").addEventListener("click", () => {
    closeProductModal()
  })

  // Save Product
  // document.getElementById("save-btn").addEventListener("click", () => {
  //   // Get form data
  //   const productId = document.getElementById("product-id").value
  //   const name = document.getElementById("product-name").value
  //   const category = document.getElementById("product-category").value
  //   const price = Number.parseFloat(document.getElementById("product-price").value)
  //   const stock = Number.parseInt(document.getElementById("product-stock").value) || 0
  //   const sku = document.getElementById("product-sku").value

  //   // Get description based on active option
  //   const activeOption = document.querySelector(".option-btn.active").getAttribute("data-option")
  //   let description = ""

  //   if (activeOption === "manual") {
  //     description = quill.root.innerHTML
  //   } else if (activeOption === "ai") {
  //     description = document.querySelector("#ai-result .generated-text").innerHTML
  //   } else if (activeOption === "template") {
  //     description = document.querySelector("#template-preview .template-text").innerHTML
  //   }

  //   // Get images
  //   const images = []
  //   document.querySelectorAll("#image-preview-container img").forEach((img) => {
  //     images.push(img.src)
  //   })

  //   // Validate required fields
  //   if (!name || !category || isNaN(price)) {
  //     showToast("Please fill in all required fields", "error")
  //     return
  //   }

  //   // Determine status based on stock
  //   let status = "In Stock"
  //   if (stock === 0) {
  //     status = "Out of Stock"
  //   } else if (stock <= 5) {
  //     status = "Low Stock"
  //   }

  //   // Create product object
  //   const product = {
  //     id: productId ? Number.parseInt(productId) : Date.now(),
  //     name,
  //     category,
  //     sku,
  //     price,
  //     stock,
  //     status,
  //     description,
  //     images: images.length > 0 ? images : ["https://via.placeholder.com/100"],
  //   }

  //   // Add or update product
  //   if (productId) {
  //     // Update existing product
  //     const index = products.findIndex((p) => p.id === Number.parseInt(productId))
  //     if (index !== -1) {
  //       products[index] = product
  //     }
  //   } else {
  //     // Thêm sản phẩm mới
  //     products.push(product)
  //   }

  //   // Reload products table
  //   renderProductsTable()

  //   // Close modal
  //   closeProductModal()

  //   // Show success message
  //   showToast(productId ? "Product updated successfully" : "Product added successfully")
  // })

  // Delete Product
  function openDeleteModal(productId) {
    document.getElementById("delete-product-id").value = productId
    document.getElementById("delete-modal").style.display = "block"
  }

  function closeDeleteModal() {
    document.getElementById("delete-modal").style.display = "none"
  }

  document.getElementById("delete-cancel-btn").addEventListener("click", () => {
    closeDeleteModal()
  })

  document.getElementById("confirm-delete-btn").addEventListener("click", () => {
    const productId = Number.parseInt(document.getElementById("delete-product-id").value)

    // Remove product from array
    products = products.filter((p) => p.id !== productId)

    // Reload products table
    renderProductsTable()

    // Close modal
    closeDeleteModal()

    // Show success message
    showToast("Product deleted successfully")
  })

  // Appointment functions
  function editAppointment(appointmentId) {
    const appointment = appointments.find((a) => a.id === appointmentId)
    if (appointment) {
      // In a real app, you would open a modal to edit the appointment
      console.log("Editing appointment:", appointment)
      showToast("Appointment edit functionality will be implemented soon")
    }
  }

  function cancelAppointment(appointmentId) {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      const index = appointments.findIndex((a) => a.id === appointmentId)
      if (index !== -1) {
        appointments[index].status = "Cancelled"
        loadAppointments()
        showToast("Appointment cancelled successfully")
      }
    }
  }

  function confirmAppointment(appointmentId) {
    const index = appointments.findIndex((a) => a.id === appointmentId)
    if (index !== -1) {
      appointments[index].status = "Confirmed"
      loadAppointments()
      showToast("Appointment confirmed successfully")
    }
  }

  // Order functions
  function viewOrder(orderId) {
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      // In a real app, you would open a modal to view the order details
      console.log("Viewing order:", order)
      showToast("Order view functionality will be implemented soon")
    }
  }

  function editOrder(orderId) {
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      // In a real app, you would open a modal to edit the order
      console.log("Editing order:", order)
      showToast("Order edit functionality will be implemented soon")
    }
  }

  function deleteOrder(orderId) {
    if (confirm("Are you sure you want to delete this order?")) {
      orders = orders.filter((o) => o.id !== orderId)
      loadOrders()
      showToast("Order deleted successfully")
    }
  }

  // Customer functions
  function viewCustomer(customerId) {
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      // In a real app, you would open a modal to view the customer details
      console.log("Viewing customer:", customer)
      showToast("Customer view functionality will be implemented soon")
    }
  }

  function editCustomer(customerId) {
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      // In a real app, you would open a modal to edit the customer
      console.log("Editing customer:", customer)
      showToast("Customer edit functionality will be implemented soon")
    }
  }

  function deleteCustomer(customerId) {
    if (confirm("Are you sure you want to delete this customer?")) {
      customers = customers.filter((c) => c.id !== customerId)
      loadCustomers()
      showToast("Customer deleted successfully")
    }
  }

  // Close modals when clicking on X or outside
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.style.display = "none"
      })
    })
  })

  window.addEventListener("click", (event) => {
    document.querySelectorAll(".modal").forEach((modal) => {
      if (event.target === modal) {
        modal.style.display = "none"
      }
    })
  })

  // Toast notification
  function showToast(message, type = "success") {
    const toast = document.getElementById("toast")
    const icon = toast.querySelector("i")
    const messageEl = toast.querySelector(".toast-message")
    const progress = toast.querySelector(".toast-progress")

    // Set message
    messageEl.textContent = message

    // Set icon and color based on type
    if (type === "success") {
      icon.className = "fas fa-check-circle"
      icon.style.color = "#10b981"
      progress.style.backgroundColor = "#10b981"
    } else if (type === "error") {
      icon.className = "fas fa-exclamation-circle"
      icon.style.color = "#f43f5e"
      progress.style.backgroundColor = "#f43f5e"
    }

    // Show toast
    toast.classList.add("show")

    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show")
    }, 3000)
  }
  // Filter and sort products
  document.getElementById("filter-category").addEventListener("change", filterProducts)
  document.getElementById("filter-status").addEventListener("change", filterProducts)
  document.getElementById("sort-by").addEventListener("change", filterProducts)

  function filterProducts() {
    const categoryFilter = document.getElementById("filter-category");
    const statusFilter = document.getElementById("filter-status"); 
    const sortBy = document.getElementById("sort-by");

    if (!categoryFilter || !statusFilter || !sortBy) {
      console.warn("Filter elements not found");
      return;
    }

    // Get filter values
    const categoryValue = categoryFilter.value;
    const statusValue = statusFilter.value;
    const sortByValue = sortBy.value;

    // Filter products
    let filteredProducts = [...products];

    if (categoryValue) {
      filteredProducts = filteredProducts.filter((p) => p.category === categoryValue);
    }

    if (statusValue) {
      filteredProducts = filteredProducts.filter((p) => p.status === statusValue); 
    }

    // Sort products...
    renderProductsTable(filteredProducts);
  }

  // Edit product function
  function editProduct(productId) {
    openProductModal(productId)
  }

  // Select all checkbox
  document.addEventListener("DOMContentLoaded", () => {
    const selectAll = document.querySelector(".select-all");
    if (selectAll) {
      selectAll.addEventListener("change", function() {
        const selectItems = document.querySelectorAll(".select-item");
        if (selectItems.length) {
          const isChecked = this.checked;
          selectItems.forEach((checkbox) => {
            checkbox.checked = isChecked;
          });
        }
      });
    }
  });

 
// Thêm xử lý cho phương thức nhập mô tả từ file hoặc URL
document.addEventListener("DOMContentLoaded", () => {
  // Xử lý nhập mô tả từ file
  const descriptionFileInput = document.getElementById("description-file");
  if (descriptionFileInput) {
    descriptionFileInput.addEventListener("change", handleDescriptionFileUpload);
  }

  // Xử lý nhập mô tả từ URL
  const fetchUrlBtn = document.getElementById("fetch-url-btn");
  if (fetchUrlBtn) {
    fetchUrlBtn.addEventListener("click", fetchDescriptionFromUrl);
  }

  // Ẩn container mô tả đã nhập ban đầu
  const importedDescriptionContainer = document.getElementById("imported-description-container");
  if (importedDescriptionContainer) {
    importedDescriptionContainer.style.display = "none";
  }
});

// Hàm xử lý tải lên file mô tả
function handleDescriptionFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  const importedDescriptionContainer = document.getElementById("imported-description-container");
  const importedDescription = document.getElementById("imported-description");

  reader.onload = (e) => {
    let content = e.target.result;

    // Xử lý nội dung dựa trên loại file
    const fileType = file.name.split(".").pop().toLowerCase();

    if (fileType === "html") {
      // Đã là HTML, không cần xử lý thêm
    } else if (fileType === "md") {
      // Chuyển đổi Markdown sang HTML đơn giản
      content = convertMarkdownToHtml(content);
    } else {
      // Đối với file text, bọc mỗi dòng trong thẻ <p>
      content = "<p>" + content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>") + "</p>";
    }

    importedDescription.innerHTML = content;
    importedDescriptionContainer.style.display = "block";

    showToast("Đã tải mô tả từ file thành công", "success");
  };

  reader.onerror = () => {
    showToast("Lỗi khi đọc file", "error");
  };

  reader.readAsText(file);
}

// Hàm chuyển đổi Markdown sang HTML đơn giản
function convertMarkdownToHtml(markdown) {
  // Chuyển đổi tiêu đề
  let html = markdown
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Chuyển đổi định dạng văn bản
  html = html
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/~~(.*?)~~/gim, "<del>$1</del>");

  // Chuyển đổi danh sách
  html = html
    .replace(/^\s*\n\* (.*)/gim, "<ul>\n<li>$1</li>")
    .replace(/^\* (.*)/gim, "<li>$1</li>")
    .replace(/^\s*\n- (.*)/gim, "<ul>\n<li>$1</li>")
    .replace(/^- (.*)/gim, "<li>$1</li>")
    .replace(/^\s*\n\d+\. (.*)/gim, "<ol>\n<li>$1</li>")
    .replace(/^\d+\. (.*)/gim, "<li>$1</li>");

  // Chuyển đổi đoạn văn
  html = html
    .replace(/^\s*\n\s*\n/gim, "</ul>\n\n")
    .replace(/^\s*\n\s*\n/gim, "</ol>\n\n")
    .replace(/^\s*\n/gim, "<br />");

  // Bọc nội dung trong thẻ <p>
  html = "<p>" + html.replace(/\n\n/g, "</p><p>") + "</p>";

  return html;
}

// Hàm tải mô tả từ URL
async function fetchDescriptionFromUrl() {
  const urlInput = document.getElementById("description-url");
  const url = urlInput.value.trim();

  if (!url) {
    showToast("Vui lòng nhập URL hợp lệ", "error");
    return;
  }

  const importedDescriptionContainer = document.getElementById("imported-description-container");
  const importedDescription = document.getElementById("imported-description");

  try {
    // Hiển thị trạng thái đang tải
    importedDescription.innerHTML = '<div class="loading-spinner"></div>';
    importedDescriptionContainer.style.display = "block";

    // Trong thực tế, bạn cần một proxy server để tránh vấn đề CORS
    // Đây là mô phỏng
    setTimeout(() => {
      // Mô phỏng nội dung tải về
      const sampleContent = `
        <h2>Mô tả sản phẩm từ URL</h2>
        <p>Đây là mô tả sản phẩm được tải từ URL. Trong môi trường thực tế, nội dung này sẽ được tải từ URL bạn đã cung cấp.</p>
        <p>Lưu ý: Để tải nội dung từ URL khác domain, bạn cần một proxy server để tránh vấn đề CORS.</p>
        <ul>
          <li>Tính năng 1</li>
          <li>Tính năng 2</li>
          <li>Tính năng 3</li>
        </ul>
      `;

      importedDescription.innerHTML = sampleContent;
      showToast("Đã tải mô tả từ URL thành công", "success");
    }, 1500);
  } catch (error) {
    importedDescription.innerHTML = '<p class="error-text">Không thể tải nội dung từ URL này.</p>';
    showToast("Lỗi khi tải nội dung từ URL", "error");
  }
}

// Cập nhật hàm updatePreview để hỗ trợ phương thức nhập mới
function updatePreview() {
  const productName = document.getElementById("product-name").value || "Tên sản phẩm";
  document.getElementById("preview-title").textContent = productName;

  const activeOption = document.querySelector(".option-btn.active").getAttribute("data-option");
  let content = "";

  if (activeOption === "manual") {
    content = quill.root.innerHTML;
  } else if (activeOption === "ai") {
    const aiResult = document.querySelector("#ai-result .generated-text").innerHTML;
    content = aiResult || "<p>Chưa có mô tả được tạo bởi AI</p>";
  } else if (activeOption === "template") {
    const templateText = document.querySelector("#template-preview .template-text").innerHTML;
    content = templateText || "<p>Chưa chọn mẫu</p>";
  } else if (activeOption === "import") {
    const importedText = document.getElementById("imported-description").innerHTML;
    content = importedText || "<p>Chưa nhập mô tả từ file hoặc URL</p>";
  }

  document.getElementById("preview-content").innerHTML = content;
}

// Cập nhật CSS cho phần nhập mô tả từ file/URL
document.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style");
  style.textContent = `
    .input-with-button {
      display: flex;
      gap: 10px;
    }

    .input-with-button input {
      flex: 1;
    }

    .help-text {
      font-size: 0.8rem;
      color: #666;
      margin-top: 5px;
    }

    .loading-spinner {
      width: 30px;
      height: 30px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-text {
      color: var(--danger-color);
    }

    #imported-description-container {
      margin-top: 20px;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      padding: 15px;
    }

    #imported-description {
      margin-top: 10px;
      max-height: 300px;
      overflow-y: auto;
    }
  `;
  document.head.appendChild(style);
});

// Check if user is logged in
const authToken = localStorage.getItem('token');
if (!authToken && window.location.pathname !== '/login.html') {
    // Redirect to login page if not logged in
    window.location.href = 'login.html';
    return;
}
