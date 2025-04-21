/**
 * Admin Dashboard Script
 * Handles admin dashboard functionality
 */

// Global variables
let allProducts = []
const allBookings = []
const allServices = []
const allCustomers = []
const allStaff = []
let currentUser = null

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Check if auth service is loaded
  if (!window.authService) {
    console.error("Auth service not loaded")
    window.location.href = "login_admin.html"
    return
  }

  // Check if user is authenticated and has admin role  
  if (!window.authService.isAuthenticated()) {
    window.location.href = "login_admin.html"
    return
  }

  // const currentUser = window.authService.getCurrentUser()
  // if (!currentUser || !window.authService.hasRole("ADMIN")) {
  //   window.location.href = "index.html"
  //   return
  // }

  // Update admin username
  const adminUsername = document.getElementById("admin-username") 
  if (adminUsername) {
    adminUsername.textContent = currentUser.sub || currentUser.username || "Admin User"
  }

  // Initialize admin dashboard components
  initializeSidebar()
  initializeNavigation() 
  initializeProductModal()
  loadDashboardData()
})

// Initialize sidebar functionality
function initializeSidebar() {
  const toggleSidebar = document.getElementById("toggle-sidebar")
  const sidebar = document.getElementById("sidebar")
  
  if (toggleSidebar && sidebar) {
    toggleSidebar.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed")
      document.querySelector(".main-content").classList.toggle("expanded")
    })
  }

  const menuToggle = document.getElementById("menu-toggle")
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })
  }

  // Add logout handler
  const logoutBtn = document.querySelector(".logout-btn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      window.authService.logout()
    })
  }
}

// Initialize navigation
function initializeNavigation() {
  const menuItems = document.querySelectorAll(".menu-item")
  const contentSections = document.querySelectorAll(".content-section")

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all menu items
      menuItems.forEach((i) => i.classList.remove("active"))

      // Add active class to clicked menu item
      this.classList.add("active")

      // Hide all content sections
      contentSections.forEach((section) => section.classList.remove("active"))

      // Show the corresponding content section
      const sectionId = this.dataset.section
      const section = document.getElementById(sectionId)
      if (section) {
        section.classList.add("active")
      }

      // Load data for the selected section
      loadSectionData(sectionId)

      // Close sidebar on mobile after navigation
      if (window.innerWidth < 768) {
        const sidebar = document.getElementById("sidebar")
        if (sidebar) {
          sidebar.classList.remove("open")
        }
      }
    })
  })

  // Initialize settings navigation
  const settingsMenuItems = document.querySelectorAll(".settings-menu-item")
  const settingsPanels = document.querySelectorAll(".settings-panel")

  settingsMenuItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all menu items
      settingsMenuItems.forEach((i) => i.classList.remove("active"))

      // Add active class to clicked menu item
      this.classList.add("active")

      // Hide all settings panels
      settingsPanels.forEach((panel) => panel.classList.remove("active"))

      // Show the corresponding settings panel
      const panelId = `${this.dataset.settings}-settings`
      const panel = document.getElementById(panelId)
      if (panel) {
        panel.classList.add("active")
      }
    })
  })
}

// Load section data based on section ID
function loadSectionData(sectionId) {
  switch (sectionId) {
    case "dashboard-section":
      loadDashboardData()
      break
    case "products-section":
      loadProducts()
      break
    case "appointments-section":
      loadAppointments()
      break
    case "services-section":
      loadServices()
      break
    case "customers-section":
      loadCustomers()
      break
    case "orders-section":
      loadOrders()
      break
    // Add other sections as needed
  }
}

// Load dashboard data
function loadDashboardData() {
  // This would typically fetch data from the API
  // For now, we'll use placeholder data

  // Initialize charts if needed
  initializeCharts()
}

// Initialize charts
function initializeCharts() {
  // This would initialize any charts on the dashboard
  // For now, we'll leave this empty
}

// Load products
async function loadProducts() {
  try {
    // Show loading state
    const productsTableBody = document.getElementById("products-table-body")
    if (productsTableBody) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            Loading products...
          </td>
        </tr>
      `
    }

    // Fetch products from API
    // In a real app, this would use the API service
    // For now, we'll use placeholder data
    const response = await fetch("https://fakestoreapi.com/products?limit=5")
    const data = await response.json()

    allProducts = data.map((product) => ({
      id: product.id,
      name: product.title,
      description: product.description,
      price: product.price,
      stock: Math.floor(Math.random() * 100), // Mock stock
      status: product.rating.rate > 3 ? "In Stock" : "Low Stock",
      image: product.image,
    }))

    // Render products
    renderProducts(allProducts)
  } catch (error) {
    console.error("Error loading products:", error)
    if (window.ToastService) {
      window.ToastService.error("Error loading products")
    }
  }
}

// Render products
function renderProducts(products) {
  const productsTableBody = document.getElementById("products-table-body")
  if (!productsTableBody) return

  productsTableBody.innerHTML = ""

  if (products.length === 0) {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">No products found</td>
      </tr>
    `
    return
  }

  products.forEach((product) => {
    // Determine status class
    let statusClass = ""
    if (product.status === "In Stock") statusClass = "active"
    else if (product.status === "Low Stock") statusClass = "pending"
    else if (product.status === "Out of Stock") statusClass = "inactive"

    const row = document.createElement("tr")
    row.innerHTML = `
      <td><input type="checkbox" class="select-item" data-id="${product.id}"></td>
      <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
      <td>${product.name}</td>
      <td>${product.description ? product.description.substring(0, 50) + "..." : ""}</td>
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
}

// Initialize product modal
function initializeProductModal() {
  const productModal = document.getElementById("product-modal")
  const addProductBtn = document.getElementById("add-product-btn")
  const closeBtn = productModal?.querySelector(".close")
  const cancelBtn = document.getElementById("cancel-btn")

  if (addProductBtn && productModal) {
    addProductBtn.addEventListener("click", () => {
      openProductModal("add")
    })
  }

  if (closeBtn && productModal) {
    closeBtn.addEventListener("click", () => {
      productModal.style.display = "none"
    })
  }

  if (cancelBtn && productModal) {
    cancelBtn.addEventListener("click", () => {
      productModal.style.display = "none"
    })
  }

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === productModal) {
      productModal.style.display = "none"
    }
  })

  // Initialize tab navigation
  const tabs = document.querySelectorAll(".tab")
  const tabPanes = document.querySelectorAll(".tab-pane")
  const nextBtn = document.getElementById("next-btn")
  const backBtn = document.getElementById("back-btn")
  const saveBtn = document.getElementById("save-btn")

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and panes
      tabs.forEach((t) => t.classList.remove("active"))
      tabPanes.forEach((p) => p.classList.remove("active"))

      // Add active class to clicked tab and corresponding pane
      tab.classList.add("active")
      const paneId = tab.dataset.tab
      const pane = document.getElementById(paneId)
      if (pane) {
        pane.classList.add("active")
      }

      // Update navigation buttons
      updateNavigationButtons()
    })
  })

  function updateNavigationButtons() {
    const activeTab = document.querySelector(".tab.active")
    if (!activeTab || !nextBtn || !backBtn || !saveBtn) return

    const isFirst = activeTab === tabs[0]
    const isLast = activeTab === tabs[tabs.length - 1]

    backBtn.style.display = isFirst ? "none" : "block"
    nextBtn.style.display = isLast ? "none" : "block"
    saveBtn.style.display = isLast ? "block" : "none"
  }

  // Handle next/back navigation
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const activeTab = document.querySelector(".tab.active")
      const nextTab = activeTab?.nextElementSibling
      if (nextTab) {
        activeTab.classList.remove("active")
        nextTab.classList.add("active")

        const activePaneId = nextTab.dataset.tab
        tabPanes.forEach((p) => p.classList.remove("active"))
        const pane = document.getElementById(activePaneId)
        if (pane) {
          pane.classList.add("active")
        }

        updateNavigationButtons()
      }
    })
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      const activeTab = document.querySelector(".tab.active")
      const prevTab = activeTab?.previousElementSibling
      if (prevTab) {
        activeTab.classList.remove("active")
        prevTab.classList.add("active")

        const activePaneId = prevTab.dataset.tab
        tabPanes.forEach((p) => p.classList.remove("active"))
        const pane = document.getElementById(activePaneId)
        if (pane) {
          pane.classList.add("active")
        }

        updateNavigationButtons()
      }
    })
  }

  // Initialize save button
  if (saveBtn) {
    saveBtn.addEventListener("click", saveProduct)
  }

  // Initialize navigation buttons
  updateNavigationButtons()
}

// Open product modal
function openProductModal(mode, productId = null) {
  const productModal = document.getElementById("product-modal")
  const modalTitle = document.getElementById("modal-title")
  const productBasicForm = document.getElementById("product-basic-form")
  const productIdInput = document.getElementById("product-id")
  const productNameInput = document.getElementById("product-name")
  const productPriceInput = document.getElementById("product-price")
  const productStockInput = document.getElementById("product-stock")
  const imagePreviewContainer = document.getElementById("image-preview-container")

  if (!productModal || !modalTitle || !productBasicForm) return

  // Reset form
  productBasicForm.reset()
  if (productIdInput) productIdInput.value = ""
  if (imagePreviewContainer) imagePreviewContainer.innerHTML = ""

  // Reset tabs
  const tabs = document.querySelectorAll(".tab")
  if (tabs.length > 0) {
    tabs.forEach((t) => t.classList.remove("active"))
    tabs[0].classList.add("active")
  }

  const tabPanes = document.querySelectorAll(".tab-pane")
  tabPanes.forEach((p) => p.classList.remove("active"))
  const firstPane = document.getElementById("basic-details")
  if (firstPane) firstPane.classList.add("active")

  if (mode === "edit" && productId) {
    // Find product by ID
    const product = allProducts.find((p) => p.id.toString() === productId.toString())

    if (product) {
      modalTitle.textContent = "Edit Product"

      // Set form values
      if (productIdInput) productIdInput.value = product.id
      if (productNameInput) productNameInput.value = product.name
      if (productPriceInput) productPriceInput.value = product.price
      if (productStockInput) productStockInput.value = product.stock

      // Add image preview if available
      if (imagePreviewContainer && product.image) {
        addImagePreview(product.image)
      }
    }
  } else {
    modalTitle.textContent = "Add New Product"
  }

  // Show modal
  productModal.style.display = "block"

  // Update navigation buttons
  const updateNavigationButtons = document.querySelector(".tab.active")
  if (updateNavigationButtons) {
    updateNavigationButtons.click()
  }
}

// Add image preview
function addImagePreview(src) {
  const container = document.getElementById("image-preview-container")
  if (!container) return

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

// Save product
function saveProduct() {
  // Get form values
  const productId = document.getElementById("product-id")?.value
  const productName = document.getElementById("product-name")?.value
  const productPrice = document.getElementById("product-price")?.value
  const productStock = document.getElementById("product-stock")?.value

  // Validate form
  if (!productName || !productPrice) {
    if (window.ToastService) {
      window.ToastService.error("Please fill in all required fields")
    }
    return
  }

  // Get images
  const images = []
  const imagePreviewContainer = document.getElementById("image-preview-container")
  if (imagePreviewContainer) {
    imagePreviewContainer.querySelectorAll("img").forEach((img) => {
      images.push(img.src)
    })
  }

  // Create product object
  const product = {
    id: productId ? Number.parseInt(productId) : Date.now(),
    name: productName,
    price: Number.parseFloat(productPrice),
    stock: Number.parseInt(productStock) || 0,
    status: Number.parseInt(productStock) > 0 ? "In Stock" : "Out of Stock",
    image: images.length > 0 ? images[0] : "https://via.placeholder.com/100",
  }

  // Add or update product
  if (productId) {
    // Update existing product
    const index = allProducts.findIndex((p) => p.id.toString() === productId.toString())
    if (index !== -1) {
      allProducts[index] = { ...allProducts[index], ...product }
    }
  } else {
    // Add new product
    allProducts.push(product)
  }

  // Close modal
  const productModal = document.getElementById("product-modal")
  if (productModal) {
    productModal.style.display = "none"
  }

  // Render products
  renderProducts(allProducts)

  // Show success message
  if (window.ToastService) {
    window.ToastService.success(productId ? "Product updated successfully" : "Product added successfully")
  }
}

// Open delete modal
function openDeleteModal(productId) {
  const deleteModal = document.getElementById("delete-modal")
  const deleteProductIdInput = document.getElementById("delete-product-id")

  if (!deleteModal || !deleteProductIdInput) return

  deleteProductIdInput.value = productId
  deleteModal.style.display = "block"

  // Add event listeners
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn")
  const deleteCancelBtn = document.getElementById("delete-cancel-btn")
  const closeBtn = deleteModal.querySelector(".close")

  if (confirmDeleteBtn) {
    confirmDeleteBtn.onclick = () => {
      deleteProduct(productId)
      deleteModal.style.display = "none"
    }
  }

  if (deleteCancelBtn) {
    deleteCancelBtn.onclick = () => {
      deleteModal.style.display = "none"
    }
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      deleteModal.style.display = "none"
    }
  }

  // Close when clicking outside
  window.onclick = (event) => {
    if (event.target === deleteModal) {
      deleteModal.style.display = "none"
    }
  }
}

// Delete product
function deleteProduct(productId) {
  // Remove product from array
  allProducts = allProducts.filter((p) => p.id.toString() !== productId.toString())

  // Render products
  renderProducts(allProducts)

  // Show success message
  if (window.ToastService) {
    window.ToastService.success("Product deleted successfully")
  }
}

// Load appointments
function loadAppointments() {
  // This would fetch appointments from the API
  // For now, we'll use placeholder data
}

// Load services
function loadServices() {
  // This would fetch services from the API
  // For now, we'll use placeholder data
}

// Load customers
function loadCustomers() {
  // This would fetch customers from the API
  // For now, we'll use placeholder data
}

// Load orders
function loadOrders() {
  // This would fetch orders from the API
  // For now, we'll use placeholder data
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Export admin dashboard functions
window.adminDashboard = {
  initializeSidebar,
  initializeNavigation,
  loadDashboardData,
  loadProducts,
  // Add other functions as needed
}
