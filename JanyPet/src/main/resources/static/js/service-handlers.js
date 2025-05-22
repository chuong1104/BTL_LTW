window.ServiceHandlers = (() => {
  const API_URL = "/api/services"

  // DOM elements
  const servicesTableBody = document.getElementById("services-table-body")
  const serviceForm = document.getElementById("service-form")
  const serviceFormTitle = document.getElementById("service-modal-title")
  const serviceIdInput = document.getElementById("service-id")
  const serviceNameInput = document.getElementById("service-name")
  const serviceDescriptionEditor = document.getElementById("service-description-editor-container")
  const serviceDescriptionInput = document.getElementById("service-description")
  const serviceCategorySelect = document.getElementById("service-category")
  const serviceDurationInput = document.getElementById("service-duration")
  const serviceBasePriceInput = document.getElementById("service-base-price")
  const serviceSmallPriceInput = document.getElementById("service-small-pet-price")
  const serviceMediumPriceInput = document.getElementById("service-medium-pet-price")
  const serviceLargePriceInput = document.getElementById("service-large-pet-price")
  const serviceXlargePriceInput = document.getElementById("service-xlarge-pet-price")
  const serviceMaxPetsInput = document.getElementById("service-max-pets")
  const serviceActiveCheckbox = document.getElementById("service-active")
  const saveServiceBtn = document.getElementById("save-service-btn")
  const cancelServiceBtn = document.getElementById("cancel-service-btn")
  const addServiceMainBtn = document.getElementById("add-service-btn")
  const serviceModal = document.getElementById("service-modal")
  const serviceItemsContainer = document.getElementById("service-items-container")

  // Service verification
  const verifyServices = () => {
    // Check if apiService exists
    if (!window.apiService) {
      console.error("apiService is not defined. Make sure api-service.js is loaded.")
      return false
    }

    // Check if fetchData method exists on apiService
    if (typeof window.apiService.fetchData !== "function") {
      console.error("apiService.fetchData is not a function. Check api-service.js implementation.")
      return false
    }

    // Fixed: Use correct ToastService reference
    if (!window.ToastService) {
      console.warn("ToastService is not defined. Using fallback notification system.")
      // Create a minimal fallback for ToastService
      window.ToastService = {
        success: (msg) => {
          console.log("Success:", msg)
          if (window.toast && typeof window.toast.show === "function") {
            window.toast.show("success", msg)
          } else {
            alert("Success: " + msg)
          }
        },
        error: (msg) => {
          console.error("Error:", msg)
          if (window.toast && typeof window.toast.show === "function") {
            window.toast.show("error", msg)
          } else {
            alert("Error: " + msg)
          }
        },
        warning: (msg) => {
          console.warn("Warning:", msg)
          if (window.toast && typeof window.toast.show === "function") {
            window.toast.show("warning", msg)
          } else {
            alert("Warning: " + msg)
          }
        },
        info: (msg) => {
          console.info("Info:", msg)
          if (window.toast && typeof window.toast.show === "function") {
            window.toast.show("info", msg)
          } else {
            alert("Info: " + msg)
          }
        },
      }
    }

    return true
  }

  // Form operations
  const resetForm = () => {
    if (serviceForm) serviceForm.reset()
    if (serviceIdInput) serviceIdInput.value = ""
    if (serviceFormTitle) serviceFormTitle.textContent = "Add New Service"
    if (serviceItemsContainer) serviceItemsContainer.innerHTML = ""

    // Reset Quill editor if exists
    if (window.serviceQuill) {
      window.serviceQuill.setContents([])
    }

    // Reset category dropdown
    if (serviceCategorySelect) {
      setupServiceCategories()
    }
  }

  // Setup service categories dropdown
  const setupServiceCategories = () => {
    if (!serviceCategorySelect) return

    // Clear existing options
    serviceCategorySelect.innerHTML = ""

    // Add service categories
    const categories = [
      { value: "", text: "Select Category" },
      { value: "GROOMING", text: "Grooming" },
      { value: "BOARDING", text: "Boarding" },
      { value: "HEALTHCARE", text: "Healthcare" },
      { value: "PACKAGE", text: "Package" },
    ]

    categories.forEach((category) => {
      const option = document.createElement("option")
      option.value = category.value
      option.textContent = category.text
      serviceCategorySelect.appendChild(option)
    })
  }

  // Add service item field
  const addServiceItemField = (item = null) => {
    if (!serviceItemsContainer) return

    // Create new service item from template
    const template = document.getElementById("service-item-template")
    if (!template) {
      console.error("Service item template not found")
      return
    }

    const serviceItem = document.importNode(template.content, true)

    // Fill with data if provided
    if (item) {
      serviceItem.querySelector(".service-item-name").value = item.name || ""
      serviceItem.querySelector(".service-item-small-price").value = item.smallPetPrice || ""
      serviceItem.querySelector(".service-item-medium-price").value = item.mediumPetPrice || ""
      serviceItem.querySelector(".service-item-large-price").value = item.largePetPrice || ""
      serviceItem.querySelector(".service-item-xlarge-price").value = item.xlargePetPrice || ""
      serviceItem.querySelector(".service-item-duration").value = item.duration || ""
    }

    // Add delete button handler
    serviceItem.querySelector(".delete-service-item").addEventListener("click", function (e) {
      e.preventDefault()
      if (confirm("Remove this service item?")) {
        this.closest(".service-item").remove()
      }
    })

    // Add to container
    serviceItemsContainer.appendChild(serviceItem)
  }

  // API interactions
  const loadServices = async () => {
    if (!servicesTableBody) {
      console.warn("Services table body element not found")
      return
    }

    verifyServices()

    try {
      servicesTableBody.innerHTML = '<tr><td colspan="7">Loading services...</td></tr>'

      // Check if ServiceService exists, otherwise use apiService directly
      let services = []
      if (window.ServiceService && typeof window.ServiceService.getAllServices === "function") {
        services = await window.ServiceService.getAllServices()
      } else {
        console.warn("ServiceService not available, falling back to direct API call")
        services = await window.apiService.fetchData(API_URL, "GET")
      }

      servicesTableBody.innerHTML = "" // Clear existing rows

      if (services && services.length > 0) {
        services.forEach((service) => {
          const row = servicesTableBody.insertRow()
          row.innerHTML = `
                    <td>${service.id || "–"}</td>
                    <td>${service.name || "–"}</td>
                    <td>${formatServiceCategory(service.category) || "–"}</td>
                    <td>${formatCurrency(service.basePrice) || "–"}</td>
                    <td>${service.duration ? service.duration + " min" : "–"}</td>
                    <td>
                        <span class="status-badge ${service.active ? "active" : "inactive"}">
                            ${service.active ? "Active" : "Inactive"}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="icon-btn view-service-btn" data-id="${service.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="icon-btn edit-service-btn" data-id="${service.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn delete-service-btn" data-id="${service.id}" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `
        })

        // Store current services for filtering
        window.currentServices = services
      } else {
        servicesTableBody.innerHTML = '<tr><td colspan="7">No services found.</td></tr>'
      }

      // Setup event delegation for service action buttons
      if (!servicesTableBody._hasClickListener) {
        servicesTableBody.addEventListener("click", (e) => {
          const target = e.target
          const actionButton = target.closest(".view-service-btn, .edit-service-btn, .delete-service-btn")

          if (!actionButton) return

          const serviceId = actionButton.dataset.id

          if (actionButton.classList.contains("view-service-btn")) {
            window.ServiceHandlers.viewServiceDetails(serviceId)
          } else if (actionButton.classList.contains("edit-service-btn")) {
            window.ServiceHandlers.handleEditService(serviceId)
          } else if (actionButton.classList.contains("delete-service-btn")) {
            window.ServiceHandlers.handleDeleteService(serviceId)
          }
        })
        servicesTableBody._hasClickListener = true
      }
    } catch (error) {
      console.error("Error loading services:", error)
      // Use ToastService safely
      if (window.ToastService && typeof window.ToastService.error === "function") {
        window.ToastService.error("Failed to load services.")
      } else {
        console.error("Failed to load services.")
      }
      servicesTableBody.innerHTML = '<tr><td colspan="7">Error loading services.</td></tr>'
    }
  }

  const formatServiceCategory = (category) => {
    if (!category) return "N/A"

    const categories = {
      GROOMING: "Grooming",
      BOARDING: "Boarding",
      HEALTHCARE: "Healthcare",
      PACKAGE: "Package",
    }

    return categories[category] || category
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-"

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleFormSubmit = async (event) => {
    if (event) event.preventDefault()

    if (!verifyServices()) {
      alert("Cannot save service: Required services are not available. Please refresh the page and try again.")
      return
    }

    const id = serviceIdInput.value
    const name = serviceNameInput.value.trim()
    const category = serviceCategorySelect.value

    // Get description from Quill if available
    let description = ""
    if (window.serviceQuill) {
      const quillContent = window.serviceQuill.root.innerHTML
      if (quillContent.trim() !== "<p><br></p>") {
        description = quillContent
      }
    } else if (serviceDescriptionInput) {
      description = serviceDescriptionInput.value.trim()
    }

    // Basic validation
    if (!name) {
      window.ToastService.error("Service name is required.")
      return
    }

    if (!category) {
      window.ToastService.error("Service category is required.")
      return
    }

    const basePrice = Number.parseFloat(serviceBasePriceInput.value)
    if (isNaN(basePrice) || basePrice <= 0) {
      window.ToastService.error("Valid base price is required.")
      return
    }

    // Gather service data
    const serviceData = {
      name: name,
      category: category,
      description: description,
      basePrice: basePrice,
      duration: Number.parseInt(serviceDurationInput.value) || null,
      smallPetPrice: Number.parseFloat(serviceSmallPriceInput.value) || basePrice,
      mediumPetPrice: Number.parseFloat(serviceMediumPriceInput.value) || basePrice * 1.5,
      largePetPrice: Number.parseFloat(serviceLargePriceInput.value) || basePrice * 2,
      xlargePetPrice: Number.parseFloat(serviceXlargePriceInput.value) || basePrice * 2.5,
      maxPetsPerSlot: Number.parseInt(serviceMaxPetsInput.value) || 1,
      active: serviceActiveCheckbox.checked,
    }

    // Collect service items if any
    if (serviceItemsContainer) {
      serviceData.serviceItems = []
      const items = serviceItemsContainer.querySelectorAll(".service-item")

      items.forEach((item) => {
        const itemName = item.querySelector(".service-item-name").value.trim()
        if (itemName) {
          serviceData.serviceItems.push({
            name: itemName,
            smallPetPrice: Number.parseFloat(item.querySelector(".service-item-small-price").value) || null,
            mediumPetPrice: Number.parseFloat(item.querySelector(".service-item-medium-price").value) || null,
            largePetPrice: Number.parseFloat(item.querySelector(".service-item-large-price").value) || null,
            xlargePetPrice: Number.parseFloat(item.querySelector(".service-item-xlarge-price").value) || null,
            duration: Number.parseInt(item.querySelector(".service-item-duration").value) || null,
          })
        }
      })
    }

    try {
      // Use the ServiceService instead of direct API calls
      if (id) {
        // Update existing service
        let updatedService
        if (window.ServiceService && typeof window.ServiceService.updateService === "function") {
          updatedService = await window.ServiceService.updateService(id, serviceData)
        } else {
          updatedService = await window.apiService.fetchData(`${API_URL}/${id}`, "PUT", serviceData)
        }
      } else {
        // Create new service
        let newService
        if (window.ServiceService && typeof window.ServiceService.createService === "function") {
          newService = await window.ServiceService.createService(serviceData)
        } else {
          newService = await window.apiService.fetchData(API_URL, "POST", serviceData)
        }
      }

      // Close modal
      closeServiceModal()

      // Reload services
      loadServices()
    } catch (error) {
      console.error("Error saving service:", error)
      window.ToastService.error(id ? "Failed to update service." : "Failed to add service.")
    }
  }

  const handleEditService = async (id) => {
    if (!verifyServices()) {
      alert("Cannot edit service: Required services are not available. Please refresh the page.")
      return
    }

    try {
      // Use ServiceService if available, otherwise use direct API call
      let service
      if (window.ServiceService && typeof window.ServiceService.getServiceById === "function") {
        service = await window.ServiceService.getServiceById(id)
      } else {
        service = await window.apiService.fetchData(`${API_URL}/${id}`, "GET")
      }

      // Fill the form with service data
      serviceIdInput.value = service.id
      serviceNameInput.value = service.name
      serviceCategorySelect.value = service.category

      // Reset and initialize Quill before setting content
      initializeQuillEditor()

      // Set description in Quill or textarea after a short delay to ensure Quill is ready
      setTimeout(() => {
        if (window.serviceQuill) {
          // Set content safely
          try {
            window.serviceQuill.root.innerHTML = service.description || ""
            if (serviceDescriptionInput) {
              serviceDescriptionInput.value = service.description || ""
            }
          } catch (e) {
            console.warn("Error setting Quill content:", e)
            if (serviceDescriptionInput) {
              serviceDescriptionInput.value = service.description || ""
            }
          }
        } else if (serviceDescriptionInput) {
          serviceDescriptionInput.value = service.description || ""
        }
      }, 100)

      // Set other fields
      serviceDurationInput.value = service.duration || ""
      serviceBasePriceInput.value = service.basePrice || ""
      serviceSmallPriceInput.value = service.smallPetPrice || ""
      serviceMediumPriceInput.value = service.mediumPetPrice || ""
      serviceLargePriceInput.value = service.largePetPrice || ""
      serviceXlargePriceInput.value = service.xlargePetPrice || ""
      serviceMaxPetsInput.value = service.maxPetsPerSlot || 1
      serviceActiveCheckbox.checked = service.active !== false

      // Update modal title
      if (serviceFormTitle) serviceFormTitle.textContent = "Edit Service"

      // Clear and populate service items if any
      if (serviceItemsContainer) {
        serviceItemsContainer.innerHTML = ""
        if (service.serviceItems && service.serviceItems.length > 0) {
          service.serviceItems.forEach((item) => addServiceItemField(item))
        }
      }

      // Show modal
      openServiceModal()
    } catch (error) {
      console.error("Error fetching service for edit:", error)
      window.ToastService.error("Failed to load service details for editing.")
    }
  }

  const handleDeleteService = async (id) => {
    if (!verifyServices()) return

    if (
      !confirm(
        "Are you sure you want to delete this service? This action cannot be undone and might affect bookings associated with it.",
      )
    ) {
      return
    }

    try {
      // Use ServiceService instead of direct API call
      if (window.ServiceService && typeof window.ServiceService.deleteService === "function") {
        await window.ServiceService.deleteService(id)
      } else {
        await window.apiService.fetchData(`${API_URL}/${id}`, "DELETE")
      }
      window.ToastService.success("Service deleted successfully!")
      loadServices()
    } catch (error) {
      console.error("Error deleting service:", error)
      window.ToastService.error("Failed to delete service. It might be in use by bookings.")
    }
  }

  // View service details function
  const viewServiceDetails = async (id) => {
    if (!verifyServices()) {
      alert("Cannot view service: Required services are not available. Please refresh the page.")
      return
    }

    try {
      // Use ServiceService instead of direct API call
      let service
      if (window.ServiceService && typeof window.ServiceService.getServiceById === "function") {
        service = await window.ServiceService.getServiceById(id)
      } else {
        service = await window.apiService.fetchData(`${API_URL}/${id}`, "GET")
      }
      if (!service) {
        window.ToastService.error("Service not found or has been removed.")
        return
      }

      // Create or get modal for displaying details
      let detailsModal = document.getElementById("service-details-modal")
      if (!detailsModal) {
        // Create the modal if it doesn't exist
        detailsModal = document.createElement("div")
        detailsModal.id = "service-details-modal"
        detailsModal.className = "modal"
        detailsModal.innerHTML = `
                <div class="modal-content service-details-modal-content">
                    <div class="modal-header">
                        <h2 id="service-details-title">Service Details</h2>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body" id="service-details-content"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary close-details-btn">Close</button>
                        <button type="button" class="btn btn-primary edit-service-from-details" data-id="${id}">Edit Service</button>
                    </div>
                </div>
            `
        document.body.appendChild(detailsModal)

        // Add event listeners to close the modal
        const closeButtons = detailsModal.querySelectorAll(".close, .close-details-btn")
        closeButtons.forEach((btn) => {
          btn.addEventListener("click", () => {
            detailsModal.style.display = "none"
          })
        })

        // Add event listener for edit button
        const editButton = detailsModal.querySelector(".edit-service-from-details")
        if (editButton) {
          editButton.addEventListener("click", () => {
            detailsModal.style.display = "none"
            handleEditService(editButton.dataset.id)
          })
        }

        // Close when clicking outside the modal
        window.addEventListener("click", (event) => {
          if (event.target === detailsModal) {
            detailsModal.style.display = "none"
          }
        })
      } else {
        // Update edit button data-id
        const editButton = detailsModal.querySelector(".edit-service-from-details")
        if (editButton) {
          editButton.dataset.id = id
        }
      }

      // Format the content
      const detailsContent = document.getElementById("service-details-content")
      if (detailsContent) {
        // Format service details with better presentation
        detailsContent.innerHTML = `
                <div class="service-details">
                    <div class="detail-section">
                        <h3>Basic Information</h3>
                        <table class="details-table">
                            <tr><td><strong>ID:</strong></td><td>${service.id || "N/A"}</td></tr>
                            <tr><td><strong>Name:</strong></td><td>${service.name || "N/A"}</td></tr>
                            <tr><td><strong>Category:</strong></td><td>${formatServiceCategory(service.category) || "N/A"}</td></tr>
                            <tr><td><strong>Status:</strong></td><td>
                                <span class="status-badge ${service.active ? "active" : "inactive"}">
                                    ${service.active ? "Active" : "Inactive"}
                                </span>
                            </td></tr>
                            <tr><td><strong>Duration:</strong></td><td>${service.duration ? `${service.duration} minutes` : "N/A"}</td></tr>
                            <tr><td><strong>Max Pets:</strong></td><td>${service.maxPetsPerSlot || "1"}</td></tr>
                        </table>
                    </div>
                    
                    <div class="detail-section">
                        <h3>Pricing</h3>
                        <table class="details-table">
                            <tr><td><strong>Base Price:</strong></td><td>${formatCurrency(service.basePrice)}</td></tr>
                            <tr><td><strong>Small Pet:</strong></td><td>${formatCurrency(service.smallPetPrice)}</td></tr>
                            <tr><td><strong>Medium Pet:</strong></td><td>${formatCurrency(service.mediumPetPrice)}</td></tr>
                            <tr><td><strong>Large Pet:</strong></td><td>${formatCurrency(service.largePetPrice)}</td></tr>
                            <tr><td><strong>X-Large Pet:</strong></td><td>${formatCurrency(service.xlargePetPrice)}</td></tr>
                        </table>
                    </div>
                    
                    ${
                      service.description
                        ? `
                        <div class="detail-section">
                            <h3>Description</h3>
                            <div class="service-description-content">${service.description}</div>
                        </div>
                    `
                        : ""
                    }
                    
                    ${
                      service.serviceItems && service.serviceItems.length > 0
                        ? `
                        <div class="detail-section">
                            <h3>Service Items (${service.serviceItems.length})</h3>
                            <table class="details-table items-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Small</th>
                                        <th>Medium</th>
                                        <th>Large</th>
                                        <th>X-Large</th>
                                        <th>Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${service.serviceItems
                                      .map(
                                        (item) => `
                                        <tr>
                                            <td>${item.name || "N/A"}</td>
                                            <td>${formatCurrency(item.smallPetPrice)}</td>
                                            <td>${formatCurrency(item.mediumPetPrice)}</td>
                                            <td>${formatCurrency(item.largePetPrice)}</td>
                                            <td>${formatCurrency(item.xlargePetPrice)}</td>
                                            <td>${item.duration ? `${item.duration} min` : "N/A"}</td>
                                        </tr>
                                    `,
                                      )
                                      .join("")}
                                </tbody>
                            </table>
                        </div>
                    `
                        : ""
                    }
                </div>
            `
      }

      // Show the modal
      if (detailsModal) {
        detailsModal.style.display = "block"
      }
    } catch (error) {
      console.error("Error fetching service details:", error)
      window.ToastService.error("Failed to load service details.")
    }
  }

  // Modal operations
  const openServiceModal = () => {
    if (!serviceModal) {
      console.error("Service modal not found")
      return
    }

    serviceModal.style.display = "block"
    if (serviceNameInput) serviceNameInput.focus()
  }

  const closeServiceModal = () => {
    if (!serviceModal) return

    try {
      serviceModal.style.display = "none"

      // Make sure the modal is hidden
      setTimeout(() => {
        if (serviceModal.style.display !== "none") {
          serviceModal.style.display = "none"
        }
      }, 100)

      resetForm()

      // Re-enable any close buttons
      const closeButtons = serviceModal.querySelectorAll(".close")
      closeButtons.forEach((btn) => {
        btn.style.pointerEvents = "auto"
      })
    } catch (error) {
      console.error("Error closing modal:", error)
    }
  }

  // Initialize Quill editor
  let Quill
  const initializeQuillEditor = () => {
    // Check if container exists
    if (!serviceDescriptionEditor) {
      console.warn("Service description editor container not found")
      return
    }

    // Destroy previous instance if it exists
    if (window.serviceQuill) {
      try {
        // Reset content only if the editor exists
        window.serviceQuill.setContents([])
        return // Keep using the existing instance
      } catch (e) {
        console.warn("Error resetting Quill editor:", e)
        // Continue to create a new instance
      }
    }

    // Check if Quill is available
    if (typeof window.Quill === "undefined") {
      console.warn("Quill library is not loaded")
      return
    }

    // Use the global Quill object
    const Quill = window.Quill

    try {
      // Create a new Quill instance
      window.serviceQuill = new Quill("#service-description-editor-container", {
        theme: "snow",
        modules: {
          toolbar: [["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["clean"]],
        },
        placeholder: "Enter service description...",
      })

      // Update hidden input on editor change
      window.serviceQuill.on("text-change", () => {
        if (!serviceDescriptionInput) return

        try {
          const html = window.serviceQuill.root.innerHTML
          serviceDescriptionInput.value = html
        } catch (e) {
          console.warn("Error updating service description from Quill:", e)
        }
      })

      console.log("Quill editor successfully initialized for services")
    } catch (error) {
      console.error("Error initializing Quill editor:", error)
    }
  }

  const filterServices = () => {
    if (!window.currentServices || !servicesTableBody) return

    const searchTerm = document.getElementById("service-search")?.value?.toLowerCase() || ""
    const categoryFilter = document.getElementById("service-category-filter")?.value || ""

    const filteredServices = window.currentServices.filter((service) => {
      const matchesSearch =
        !searchTerm ||
        service.name.toLowerCase().includes(searchTerm) ||
        (service.description && service.description.toLowerCase().includes(searchTerm))

      const matchesCategory = !categoryFilter || service.category === categoryFilter

      return matchesSearch && matchesCategory
    })

    // Update table with filtered services
    servicesTableBody.innerHTML = ""

    if (filteredServices.length > 0) {
      filteredServices.forEach((service) => {
        const row = servicesTableBody.insertRow()
        row.innerHTML = `
                <td>${service.id || "–"}</td>
                <td>${service.name || "–"}</td>
                <td>${formatServiceCategory(service.category) || "–"}</td>
                <td>${formatCurrency(service.basePrice) || "–"}</td>
                <td>${service.duration ? service.duration + " min" : "–"}</td>
                <td>
                    <span class="status-badge ${service.active ? "active" : "inactive"}">
                        ${service.active ? "Active" : "Inactive"}
                    </span>
                </td>
                <td class="actions">
                    <button class="icon-btn view-service-btn" data-id="${service.id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="icon-btn edit-service-btn" data-id="${service.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete-service-btn" data-id="${service.id}" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `
      })
    } else {
      servicesTableBody.innerHTML = '<tr><td colspan="7">No services found matching your filters.</td></tr>'
    }
  }

  // Event binding
  const initializeServiceEvents = () => {
    console.log("Initializing service events...")

    // Setup categories
    setupServiceCategories()

    // Initialize editor
    initializeQuillEditor()

    // Set up form submission
    if (serviceForm) {
      serviceForm.addEventListener("submit", (e) => {
        e.preventDefault()
        handleFormSubmit()
      })
    }

    // Set up save button
    if (saveServiceBtn) {
      saveServiceBtn.addEventListener("click", handleFormSubmit)
    }

    // Set up cancel button
    if (cancelServiceBtn) {
      cancelServiceBtn.addEventListener("click", closeServiceModal)
    }

    // Set up add service button
    if (addServiceMainBtn) {
      addServiceMainBtn.addEventListener("click", () => {
        resetForm()
        openServiceModal()
      })
    }

    // Set up add service item button
    const addServiceItemBtn = document.getElementById("add-service-item-btn")
    if (addServiceItemBtn) {
      addServiceItemBtn.addEventListener("click", () => {
        addServiceItemField()
      })
    }

    // Set up search and filter functionality
    const serviceSearch = document.getElementById("service-search")
    if (serviceSearch) {
      serviceSearch.addEventListener("input", filterServices)
    }

    const categoryFilter = document.getElementById("service-category-filter")
    if (categoryFilter) {
      categoryFilter.addEventListener("change", filterServices)
    }

    // Set up close button in modal
    const closeButtons = document.querySelectorAll("#service-modal .close")
    if (closeButtons.length > 0) {
      closeButtons.forEach((btn) => {
        btn.addEventListener("click", closeServiceModal)
      })
    }

    // Load services initially
    loadServices()
  }

  return {
    initializeServiceEvents,
    loadServices,
    addServiceItemField,
    verifyServices,
    openServiceModal,
    closeServiceModal,
    handleEditService,
    handleDeleteService,
    viewServiceDetails,
    filterServices,
  }
})()
