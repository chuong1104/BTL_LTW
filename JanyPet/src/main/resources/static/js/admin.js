import { Chart } from "@/components/ui/chart"
// Global variables
let allBookings = []
let allServices = []
let allCustomers = []
let allStaff = []
let currentUser = null

// Declare API_BASE_URL
const API_BASE_URL = "http://localhost:8080/api" // Replace with your actual API base URL

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Hide preloader when page is loaded
  setTimeout(() => {
    document.querySelector(".preloader-wrapper").style.display = "none"
  }, 500)

  // Check authentication
  checkAuthState()

  // Initialize sidebar toggle
  document.getElementById("toggle-sidebar").addEventListener("click", toggleSidebar)

  // Initialize logout button
  document.getElementById("logout-btn").addEventListener("click", logout)

  // Load dashboard data
  loadDashboardData()

  // Initialize tab change event
  document.querySelectorAll('a[data-bs-toggle="tab"]').forEach((tab) => {
    tab.addEventListener("shown.bs.tab", (e) => {
      const targetId = e.target.getAttribute("href").substring(1)
      loadTabData(targetId)
    })
  })

  // Initialize booking filters
  document.getElementById("apply-booking-filters").addEventListener("click", applyBookingFilters)

  // Initialize report generation
  document.getElementById("generate-report").addEventListener("click", generateReport)
  document.getElementById("export-report").addEventListener("click", exportReport)

  // Initialize form submissions
  document.getElementById("general-settings-form").addEventListener("submit", saveGeneralSettings)
  document.getElementById("booking-settings-form").addEventListener("submit", saveBookingSettings)

  // Initialize modal save buttons
  document.getElementById("save-booking-btn").addEventListener("click", saveBooking)
  document.getElementById("save-service-btn").addEventListener("click", saveService)
  document.getElementById("save-staff-btn").addEventListener("click", saveStaff)

  // Initialize edit booking button
  document.getElementById("edit-booking-btn").addEventListener("click", () => {
    const bookingId = document.getElementById("view-booking-id").textContent
    openEditBookingModal(bookingId)
  })

  // Initialize customer selection change
  document.getElementById("booking-customer").addEventListener("change", loadCustomerPets)
})

// Check authentication state
function checkAuthState() {
  const token = localStorage.getItem("token")
  const userData = localStorage.getItem("user")

  if (token && userData) {
    currentUser = JSON.parse(userData)

    // Check if user is admin
    if (currentUser.role !== "ADMIN") {
      // Redirect to login page if not admin
      window.location.href = "index.html"
      return
    }

    // Update UI
    document.getElementById("admin-name").textContent = currentUser.username || currentUser.email
  } else {
    // Redirect to login page
    window.location.href = "index.html"
  }
}

// Toggle sidebar
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed")
  document.querySelector(".main-content").classList.toggle("expanded")
}

// Logout function
function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  window.location.href = "index.html"
}

// Load dashboard data
function loadDashboardData() {
  // Load dashboard stats
  fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("total-bookings").textContent = data.totalBookings
      document.getElementById("pending-bookings").textContent = data.pendingBookings
      document.getElementById("total-customers").textContent = data.totalCustomers
      document.getElementById("total-revenue").textContent = formatCurrency(data.totalRevenue)

      // Initialize charts
      initializeBookingTrendsChart()
      initializePopularServicesChart()
    })
    .catch((error) => {
      console.error("Error loading dashboard stats:", error)
      showToast("Error loading dashboard statistics", "error")
    })

  // Load recent bookings
  fetch(`${API_BASE_URL}/admin/bookings?limit=5`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayRecentBookings(data)
    })
    .catch((error) => {
      console.error("Error loading recent bookings:", error)
      showToast("Error loading recent bookings", "error")
    })
}

// Display recent bookings
function displayRecentBookings(bookings) {
  const tableBody = document.getElementById("recent-bookings-table")
  tableBody.innerHTML = ""

  if (bookings.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">No bookings found</td>
      </tr>
    `
    return
  }

  bookings.forEach((booking) => {
    const row = document.createElement("tr")

    // Format services list
    const servicesList = booking.services.map((service) => service.name).join(", ")

    // Format date and time
    const bookingDate = new Date(booking.bookingDate + "T" + booking.startTime)
    const formattedDate = bookingDate.toLocaleDateString()
    const formattedTime = bookingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    // Determine status class
    let statusClass = ""
    switch (booking.status) {
      case "CONFIRMED":
        statusClass = "bg-success"
        break
      case "PENDING":
        statusClass = "bg-warning"
        break
      case "CANCELLED":
        statusClass = "bg-danger"
        break
      case "COMPLETED":
        statusClass = "bg-info"
        break
      default:
        statusClass = "bg-secondary"
    }

    row.innerHTML = `
      <td>${booking.id.substring(0, 8)}...</td>
      <td>${booking.customer ? booking.customer.username : "N/A"}</td>
      <td>${booking.pet ? booking.pet.name : "N/A"}</td>
      <td>${servicesList}</td>
      <td>${formattedDate} ${formattedTime}</td>
      <td><span class="badge ${statusClass}">${booking.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary view-booking-btn" data-id="${booking.id}">
          <iconify-icon icon="mdi:eye"></iconify-icon>
        </button>
      </td>
    `

    tableBody.appendChild(row)
  })

  // Add event listeners to view buttons
  document.querySelectorAll(".view-booking-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const bookingId = this.getAttribute("data-id")
      openViewBookingModal(bookingId)
    })
  })
}

// Initialize booking trends chart
function initializeBookingTrendsChart() {
  const ctx = document.getElementById("bookingTrendsChart").getContext("2d")

  // Get the last 7 days
  const dates = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    dates.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }))
  }

  // Sample data - in a real application, this would come from the API
  const bookingData = [5, 8, 12, 7, 10, 15, 9]
  const revenueData = [250000, 400000, 600000, 350000, 500000, 750000, 450000]

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: "Bookings",
          data: bookingData,
          borderColor: "#DEAD6F",
          backgroundColor: "rgba(222, 173, 111, 0.1)",
          borderWidth: 2,
          tension: 0.3,
          yAxisID: "y",
        },
        {
          label: "Revenue (VND)",
          data: revenueData,
          borderColor: "#198754",
          backgroundColor: "rgba(25, 135, 84, 0.1)",
          borderWidth: 2,
          tension: 0.3,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      interaction: {
        mode: "index",
        intersect: false,
      },
      scales: {
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "Bookings",
          },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          grid: {
            drawOnChartArea: false,
          },
          title: {
            display: true,
            text: "Revenue (VND)",
          },
          ticks: {
            callback: (value) => formatCurrency(value).replace("₫", ""),
          },
        },
      },
    },
  })
}

// Initialize popular services chart
function initializePopularServicesChart() {
  const ctx = document.getElementById("popularServicesChart").getContext("2d")

  // Sample data - in a real application, this would come from the API
  const serviceNames = ["Tắm cho thú cưng", "Khám sức khỏe định kỳ", "Cắt tỉa lông", "Spa thư giãn", "Vệ sinh tai"]
  const serviceData = [35, 25, 20, 15, 5]

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: serviceNames,
      datasets: [
        {
          data: serviceData,
          backgroundColor: ["#DEAD6F", "#0D6EFD", "#198754", "#FFC107", "#DC3545"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  })
}

// Load tab data
function loadTabData(tabId) {
  switch (tabId) {
    case "bookings":
      loadBookings()
      break
    case "services":
      loadServices()
      break
    case "customers":
      loadCustomers()
      break
    case "staff":
      loadStaff()
      break
    default:
      break
  }
}

// Load bookings
function loadBookings() {
  const statusFilter = document.getElementById("booking-status-filter").value
  const dateFrom = document.getElementById("booking-date-from").value
  const dateTo = document.getElementById("booking-date-to").value

  // Construct query parameters
  const params = new URLSearchParams()
  if (statusFilter) params.append("status", statusFilter)
  if (dateFrom) params.append("startDate", dateFrom)
  if (dateTo) params.append("endDate", dateTo)

  // Show loading state
  document.getElementById("bookings-table").innerHTML = `
    <tr>
      <td colspan="8" class="text-center">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        Loading bookings...
      </td>
    </tr>
  `

  // Fetch bookings
  fetch(`${API_BASE_URL}/admin/bookings?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      allBookings = data
      displayBookings(data)
    })
    .catch((error) => {
      console.error("Error loading bookings:", error)
      document.getElementById("bookings-table").innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-danger">
            Error loading bookings. Please try again.
          </td>
        </tr>
      `
    })
}

// Display bookings
function displayBookings(bookings) {
  const tableBody = document.getElementById("bookings-table")
  tableBody.innerHTML = ""

  if (bookings.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">No bookings found</td>
      </tr>
    `
    return
  }

  bookings.forEach((booking) => {
    const row = document.createElement("tr")

    // Format services list
    const servicesList = booking.services.map((service) => service.name).join(", ")

    // Format date and time
    const bookingDate = new Date(booking.bookingDate + "T" + booking.startTime)
    const formattedDate = bookingDate.toLocaleDateString()
    const formattedTime = bookingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    // Determine status class
    let statusClass = ""
    switch (booking.status) {
      case "CONFIRMED":
        statusClass = "bg-success"
        break
      case "PENDING":
        statusClass = "bg-warning"
        break
      case "CANCELLED":
        statusClass = "bg-danger"
        break
      case "COMPLETED":
        statusClass = "bg-info"
        break
      default:
        statusClass = "bg-secondary"
    }

    row.innerHTML = `
      <td>${booking.id.substring(0, 8)}...</td>
      <td>${booking.customer ? booking.customer.username : "N/A"}</td>
      <td>${booking.pet ? booking.pet.name : "N/A"}</td>
      <td>${servicesList}</td>
      <td>${formattedDate} ${formattedTime}</td>
      <td>${booking.assignedStaff ? booking.assignedStaff.username : "Not assigned"}</td>
      <td><span class="badge ${statusClass}">${booking.status}</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-primary view-booking-btn" data-id="${booking.id}">
            <iconify-icon icon="mdi:eye"></iconify-icon>
          </button>
          <button class="btn btn-sm btn-outline-secondary edit-booking-btn" data-id="${booking.id}">
            <iconify-icon icon="mdi:pencil"></iconify-icon>
          </button>
          ${
            booking.status !== "CANCELLED" && booking.status !== "COMPLETED"
              ? `<button class="btn btn-sm btn-outline-success confirm-booking-btn" data-id="${booking.id}" title="Confirm">
                  <iconify-icon icon="mdi:check"></iconify-icon>
                </button>`
              : ""
          }
          ${
            booking.status === "CONFIRMED"
              ? `<button class="btn btn-sm btn-outline-info complete-booking-btn" data-id="${booking.id}" title="Mark as Completed">
                  <iconify-icon icon="mdi:check-all"></iconify-icon>
                </button>`
              : ""
          }
          ${
            booking.status !== "CANCELLED" && booking.status !== "COMPLETED"
              ? `<button class="btn btn-sm btn-outline-danger cancel-booking-btn" data-id="${booking.id}" title="Cancel">
                  <iconify-icon icon="mdi:close"></iconify-icon>
                </button>`
              : ""
          }
        </div>
      </td>
    `

    tableBody.appendChild(row)
  })

  // Add event listeners to action buttons
  document.querySelectorAll(".view-booking-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const bookingId = this.getAttribute("data-id")
      openViewBookingModal(bookingId)
    })
  })

  document.querySelectorAll(".edit-booking-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const bookingId = this.getAttribute("data-id")
      openEditBookingModal(bookingId)
    })
  })

  document.querySelectorAll(".confirm-booking-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const bookingId = this.getAttribute("data-id")
      updateBookingStatus(bookingId, "CONFIRMED")
    })
  })

  document.querySelectorAll(".complete-booking-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const bookingId = this.getAttribute("data-id")
      updateBookingStatus(bookingId, "COMPLETED")
    })
  })

  document.querySelectorAll(".cancel-booking-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const bookingId = this.getAttribute("data-id")
      if (confirm("Are you sure you want to cancel this booking?")) {
        updateBookingStatus(bookingId, "CANCELLED")
      }
    })
  })
}

// Apply booking filters
function applyBookingFilters() {
  loadBookings()
}

// Update booking status
function updateBookingStatus(bookingId, newStatus) {
  fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ status: newStatus }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Update booking in the list
      const index = allBookings.findIndex((b) => b.id === bookingId)
      if (index !== -1) {
        allBookings[index] = data
      }

      // Update UI
      displayBookings(allBookings)

      // Show success message
      showToast(`Booking status updated to ${newStatus}`, "success")
    })
    .catch((error) => {
      console.error("Error updating booking status:", error)
      showToast("Error updating booking status", "error")
    })
}

// Open view booking modal
function openViewBookingModal(bookingId) {
  const booking = allBookings.find((b) => b.id === bookingId)

  if (!booking) {
    showToast("Booking not found", "error")
    return
  }

  // Format date and time
  const bookingDate = new Date(booking.bookingDate + "T" + booking.startTime)
  const formattedDate = bookingDate.toLocaleDateString()
  const formattedTime = bookingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  // Set modal content
  document.getElementById("view-booking-id").textContent = booking.id
  document.getElementById("view-booking-date").textContent = formattedDate
  document.getElementById("view-booking-time").textContent = formattedTime
  document.getElementById("view-booking-status").textContent = booking.status
  document.getElementById("view-booking-notes").textContent = booking.notes || "None"

  document.getElementById("view-booking-customer").textContent = booking.customer ? booking.customer.username : "N/A"
  document.getElementById("view-booking-email").textContent = booking.customer ? booking.customer.email : "N/A"
  document.getElementById("view-booking-phone").textContent = booking.customer ? booking.customer.phoneNumber : "N/A"
  document.getElementById("view-booking-pet").textContent = booking.pet
    ? `${booking.pet.name} (${booking.pet.species})`
    : "N/A"
  document.getElementById("view-booking-staff").textContent = booking.assignedStaff
    ? booking.assignedStaff.username
    : "Not assigned"

  // Set services
  const servicesList = document.getElementById("view-booking-services")
  servicesList.innerHTML = ""

  let total = 0

  booking.services.forEach((service) => {
    const listItem = document.createElement("li")
    listItem.className = "list-group-item d-flex justify-content-between align-items-center"
    listItem.innerHTML = `
      ${service.name}
      <span class="badge bg-primary rounded-pill">${formatCurrency(service.price)}</span>
    `
    servicesList.appendChild(listItem)

    total += service.price
  })

  document.getElementById("view-booking-total").textContent = formatCurrency(total)

  // Show modal
  const viewBookingModal = new bootstrap.Modal(document.getElementById("viewBookingModal"))
  viewBookingModal.show()
}

// Open edit booking modal
function openEditBookingModal(bookingId) {
  // Close view modal if open
  const viewBookingModalElement = document.getElementById("viewBookingModal")
  const viewBookingModal = bootstrap.Modal.getInstance(viewBookingModalElement)
  if (viewBookingModal) {
    viewBookingModal.hide()
  }

  // Load booking data
  const booking = allBookings.find((b) => b.id === bookingId)

  if (!booking) {
    showToast("Booking not found", "error")
    return
  }

  // Load customers and staff for dropdowns
  loadCustomersForDropdown()
  loadStaffForDropdown()

  // Set form values
  document.getElementById("booking-customer").value = booking.customer ? booking.customer.id : ""

  // Load pets for selected customer
  loadCustomerPets(booking.customer ? booking.customer.id : "")

  // Set pet value after pets are loaded
  setTimeout(() => {
    document.getElementById("booking-pet").value = booking.pet ? booking.pet.id : ""
  }, 500)

  document.getElementById("booking-date").value = booking.bookingDate
  document.getElementById("booking-time").value = booking.startTime
  document.getElementById("booking-status").value = booking.status
  document.getElementById("booking-notes").value = booking.notes || ""

  // Load services
  loadServicesForBooking(booking.services)

  // Set staff value
  setTimeout(() => {
    document.getElementById("booking-staff").value = booking.assignedStaff ? booking.assignedStaff.id : ""
  }, 500)

  // Update modal title
  document.getElementById("addBookingModalLabel").textContent = "Edit Booking"

  // Set booking ID as data attribute on save button
  document.getElementById("save-booking-btn").setAttribute("data-id", bookingId)

  // Show modal
  const addBookingModal = new bootstrap.Modal(document.getElementById("addBookingModal"))
  addBookingModal.show()
}

// Open add booking modal
function openAddBookingModal() {
  // Load customers and staff for dropdowns
  loadCustomersForDropdown()
  loadStaffForDropdown()

  // Reset form
  document.getElementById("add-booking-form").reset()

  // Load services
  loadServicesForBooking()

  // Update modal title
  document.getElementById("addBookingModalLabel").textContent = "Add Booking"

  // Remove booking ID from save button
  document.getElementById("save-booking-btn").removeAttribute("data-id")

  // Show modal
  const addBookingModal = new bootstrap.Modal(document.getElementById("addBookingModal"))
  addBookingModal.show()
}

// Open edit service modal
function openEditServiceModal(serviceId) {
  // Load service data
  const service = allServices.find((s) => s.id === serviceId)

  if (!service) {
    showToast("Service not found", "error")
    return
  }

  // Set form values
  document.getElementById("service-name").value = service.name
  document.getElementById("service-description").value = service.description
  document.getElementById("service-price").value = service.price
  document.getElementById("service-category").value = service.category
  document.getElementById("service-image").value = service.images || ""
  document.getElementById("service-max-pets").value = service.maxPetsPerSlot
  document.getElementById("service-requires-vaccination").checked = service.requiresVaccination
  document.getElementById("service-active").checked = service.active

  // Update modal title
  document.getElementById("addServiceModalLabel").textContent = "Edit Service"

  // Set service ID as data attribute on save button
  document.getElementById("save-service-btn").setAttribute("data-id", serviceId)

  // Show modal
  const addServiceModal = new bootstrap.Modal(document.getElementById("addServiceModal"))
  addServiceModal.show()
}

// Open add service modal
function openAddServiceModal() {
  // Reset form
  document.getElementById("add-service-form").reset()

  // Update modal title
  document.getElementById("addServiceModalLabel").textContent = "Add Service"

  // Remove service ID from save button
  document.getElementById("save-service-btn").removeAttribute("data-id")

  // Show modal
  const addServiceModal = new bootstrap.Modal(document.getElementById("addServiceModal"))
  addServiceModal.show()
}

// Open add staff modal
function openAddStaffModal() {
  // Reset form
  document.getElementById("add-staff-form").reset()

  // Show modal
  const addStaffModal = new bootstrap.Modal(document.getElementById("addStaffModal"))
  addStaffModal.show()
}

// Save booking
function saveBooking() {
  const bookingId = this.getAttribute("data-id")
  const isEdit = !!bookingId

  // Get form values
  const customerId = document.getElementById("booking-customer").value
  const petId = document.getElementById("booking-pet").value
  const bookingDate = document.getElementById("booking-date").value
  const bookingTime = document.getElementById("booking-time").value
  const status = document.getElementById("booking-status").value
  const notes = document.getElementById("booking-notes").value
  const staffId = document.getElementById("booking-staff").value

  // Get selected services
  const selectedServices = []
  document.querySelectorAll('input[name="booking-service"]:checked').forEach((checkbox) => {
    selectedServices.push({ id: checkbox.value })
  })

  // Validate form
  if (!customerId || !petId || !bookingDate || !bookingTime || selectedServices.length === 0) {
    showToast("Please fill in all required fields", "error")
    return
  }

  // Create booking object
  const bookingData = {
    customer: { id: customerId },
    pet: { id: petId },
    bookingDate,
    startTime: bookingTime,
    status,
    notes,
    services: selectedServices,
  }

  if (staffId) {
    bookingData.assignedStaff = { id: staffId }
  }

  // Save booking
  const url = isEdit ? `${API_BASE_URL}/admin/bookings/${bookingId}` : `${API_BASE_URL}/bookings`
  const method = isEdit ? "PUT" : "POST"

  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(bookingData),
  })
    .then((response) => response.json())
    .then((data) => {
      // Close modal
      const addBookingModalElement = document.getElementById("addBookingModal")
      const addBookingModal = bootstrap.Modal.getInstance(addBookingModalElement)
      addBookingModal.hide()

      // Show success message
      showToast(`Booking ${isEdit ? "updated" : "created"} successfully`, "success")

      // Reload bookings
      loadBookings()

      // Reset form
      document.getElementById("add-booking-form").reset()
    })
    .catch((error) => {
      console.error("Error saving booking:", error)
      showToast("Error saving booking", "error")
    })
}

// Load services
function loadServices() {
  // Show loading state
  document.getElementById("services-table").innerHTML = `
    <tr>
      <td colspan="8" class="text-center">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        Loading services...
      </td>
    </tr>
  `

  // Fetch services
  fetch(`${API_BASE_URL}/services`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      allServices = data
      displayServices(data)
    })
    .catch((error) => {
      console.error("Error loading services:", error)
      document.getElementById("services-table").innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-danger">
            Error loading services. Please try again.
          </td>
        </tr>
      `
    })
}

// Display services
function displayServices(services) {
  const tableBody = document.getElementById("services-table")
  tableBody.innerHTML = ""

  if (services.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">No services found</td>
      </tr>
    `
    return
  }

  services.forEach((service) => {
    const row = document.createElement("tr")

    row.innerHTML = `
      <td>
        <img src="${service.images || "https://via.placeholder.com/50x50?text=Service"}" alt="${service.name}" width="50" height="50" class="rounded">
      </td>
      <td>${service.name}</td>
      <td>${service.category}</td>
      <td>${formatCurrency(service.price)}</td>
      <td>${service.maxPetsPerSlot}</td>
      <td>${service.requiresVaccination ? "Yes" : "No"}</td>
      <td><span class="badge ${service.active ? "bg-success" : "bg-danger"}">${service.active ? "Active" : "Inactive"}</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-secondary edit-service-btn" data-id="${service.id}">
            <iconify-icon icon="mdi:pencil"></iconify-icon>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-service-btn" data-id="${service.id}">
            <iconify-icon icon="mdi:delete"></iconify-icon>
          </button>
        </div>
      </td>
    `

    tableBody.appendChild(row)
  })

  // Add event listeners to action buttons
  document.querySelectorAll(".edit-service-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const serviceId = this.getAttribute("data-id")
      openEditServiceModal(serviceId)
    })
  })

  document.querySelectorAll(".delete-service-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const serviceId = this.getAttribute("data-id")
      if (confirm("Are you sure you want to delete this service?")) {
        deleteService(serviceId)
      }
    })
  })
}

// Load customers
function loadCustomers() {
  // Show loading state
  document.getElementById("customers-table").innerHTML = `
    <tr>
      <td colspan="7" class="text-center">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        Loading customers...
      </td>
    </tr>
  `

  // Fetch customers
  fetch(`${API_BASE_URL}/admin/users?role=CUSTOMER`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      allCustomers = data
      displayCustomers(data)
    })
    .catch((error) => {
      console.error("Error loading customers:", error)
      document.getElementById("customers-table").innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-danger">
            Error loading customers. Please try again.
          </td>
        </tr>
      `
    })
}

// Display customers
function displayCustomers(customers) {
  const tableBody = document.getElementById("customers-table")
  tableBody.innerHTML = ""

  if (customers.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">No customers found</td>
      </tr>
    `
    return
  }

  customers.forEach((customer) => {
    const row = document.createElement("tr")

    row.innerHTML = `
      <td>${customer.username}</td>
      <td>${customer.email}</td>
      <td>${customer.phoneNumber || "N/A"}</td>
      <td>${customer.petCount || 0}</td>
      <td>${customer.bookingCount || 0}</td>
      <td><span class="badge ${customer.verified ? "bg-success" : "bg-warning"}">${customer.verified ? "Verified" : "Unverified"}</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-primary view-customer-btn" data-id="${customer.id}">
            <iconify-icon icon="mdi:eye"></iconify-icon>
          </button>
          <button class="btn btn-sm btn-outline-secondary edit-customer-btn" data-id="${customer.id}">
            <iconify-icon icon="mdi:pencil"></iconify-icon>
          </button>
        </div>
      </td>
    `

    tableBody.appendChild(row)
  })

  // Add event listeners to action buttons
  document.querySelectorAll(".view-customer-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const customerId = this.getAttribute("data-id")
      // Implement view customer functionality
    })
  })

  document.querySelectorAll(".edit-customer-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const customerId = this.getAttribute("data-id")
      // Implement edit customer functionality
    })
  })
}

// Load staff
function loadStaff() {
  // Show loading state
  document.getElementById("staff-table").innerHTML = `
    <tr>
      <td colspan="7" class="text-center">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        Loading staff...
      </td>
    </tr>
  `

  // Fetch staff
  fetch(`${API_BASE_URL}/admin/users?role=EMPLOYEE`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      allStaff = data
      displayStaff(data)
    })
    .catch((error) => {
      console.error("Error loading staff:", error)
      document.getElementById("staff-table").innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-danger">
            Error loading staff. Please try again.
          </td>
        </tr>
      `
    })
}

// Display staff
function displayStaff(staff) {
  const tableBody = document.getElementById("staff-table")
  tableBody.innerHTML = ""

  if (staff.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">No staff found</td>
      </tr>
    `
    return
  }

  staff.forEach((employee) => {
    const row = document.createElement("tr")

    row.innerHTML = `
      <td>${employee.username}</td>
      <td>${employee.email}</td>
      <td>${employee.phoneNumber || "N/A"}</td>
      <td>${employee.role}</td>
      <td>${employee.assignedBookingsCount || 0}</td>
      <td><span class="badge ${employee.active ? "bg-success" : "bg-danger"}">${employee.active ? "Active" : "Inactive"}</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-secondary edit-staff-btn" data-id="${employee.id}">
            <iconify-icon icon="mdi:pencil"></iconify-icon>
          </button>
          <button class="btn btn-sm btn-outline-danger ${employee.active ? "deactivate-staff-btn" : "activate-staff-btn"}" data-id="${employee.id}">
            <iconify-icon icon="${employee.active ? "mdi:account-off" : "mdi:account-check"}"></iconify-icon>
          </button>
        </div>
      </td>
    `

    tableBody.appendChild(row)
  })

  // Add event listeners to action buttons
  document.querySelectorAll(".edit-staff-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const staffId = this.getAttribute("data-id")
      // Implement edit staff functionality
    })
  })

  document.querySelectorAll(".deactivate-staff-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const staffId = this.getAttribute("data-id")
      if (confirm("Are you sure you want to deactivate this staff member?")) {
        // Implement deactivate staff functionality
      }
    })
  })

  document.querySelectorAll(".activate-staff-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const staffId = this.getAttribute("data-id")
      if (confirm("Are you sure you want to activate this staff member?")) {
        // Implement activate staff functionality
      }
    })
  })
}

// Generate report
function generateReport() {
  const reportType = document.getElementById("report-type").value
  const dateFrom = document.getElementById("report-date-from").value
  const dateTo = document.getElementById("report-date-to").value

  // Update report title
  let reportTitle = ""
  switch (reportType) {
    case "revenue":
      reportTitle = "Revenue Report"
      break
    case "bookings":
      reportTitle = "Bookings Report"
      break
    case "services":
      reportTitle = "Services Report"
      break
  }

  if (dateFrom && dateTo) {
    reportTitle += ` (${dateFrom} to ${dateTo})`
  }

  document.getElementById("report-title").textContent = reportTitle

  // Show loading state
  document.getElementById("report-content").innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Generating report...</p>
    </div>
  `

  // Fetch report data
  let endpoint = ""
  switch (reportType) {
    case "revenue":
      endpoint = `${API_BASE_URL}/admin/stats/revenue`
      break
    case "bookings":
      endpoint = `${API_BASE_URL}/admin/bookings`
      break
    case "services":
      endpoint = `${API_BASE_URL}/admin/stats/services`
      break
  }

  // Add date parameters if provided
  const params = new URLSearchParams()
  if (dateFrom) params.append("startDate", dateFrom)
  if (dateTo) params.append("endDate", dateTo)

  if (params.toString()) {
    endpoint += `?${params.toString()}`
  }

  fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      displayReport(reportType, data)
    })
    .catch((error) => {
      console.error("Error generating report:", error)
      document.getElementById("report-content").innerHTML = `
        <div class="alert alert-danger">
          Error generating report. Please try again.
        </div>
      `
    })
}

// Display report
function displayReport(reportType, data) {
  const reportContent = document.getElementById("report-content")

  switch (reportType) {
    case "revenue":
      displayRevenueReport(data)
      break
    case "bookings":
      displayBookingsReport(data)
      break
    case "services":
      displayServicesReport(data)
      break
  }
}

// Display revenue report
function displayRevenueReport(data) {
  const reportContent = document.getElementById("report-content")

  // Create report content
  let html = `
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <h6 class="card-subtitle mb-2 text-muted">Total Revenue</h6>
            <h2 class="card-title">${formatCurrency(data.totalRevenue)}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <h6 class="card-subtitle mb-2 text-muted">Total Bookings</h6>
            <h2 class="card-title">${data.bookingCount}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <h6 class="card-subtitle mb-2 text-muted">Average Revenue</h6>
            <h2 class="card-title">${formatCurrency(data.totalRevenue / (data.bookingCount || 1))}</h2>
          </div>
        </div>
      </div>
    </div>
    
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <canvas id="revenueChart" height="300"></canvas>
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Date</th>
            <th>Bookings</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
  `

  // Add rows for each date
  const dates = Object.keys(data.revenueByDate).sort()

  dates.forEach((date) => {
    const revenue = data.revenueByDate[date]
    const bookingCount = data.bookingCountByDate ? data.bookingCountByDate[date] || 0 : 0

    html += `
      <tr>
        <td>${new Date(date).toLocaleDateString()}</td>
        <td>${bookingCount}</td>
        <td>${formatCurrency(revenue)}</td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
    </div>
  `

  reportContent.innerHTML = html

  // Initialize revenue chart
  const ctx = document.getElementById("revenueChart").getContext("2d")

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: dates.map((date) => new Date(date).toLocaleDateString()),
      datasets: [
        {
          label: "Revenue",
          data: dates.map((date) => data.revenueByDate[date]),
          backgroundColor: "rgba(222, 173, 111, 0.7)",
          borderColor: "#DEAD6F",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatCurrency(value).replace("₫", ""),
          },
        },
      },
    },
  })
}

// Display bookings report
function displayBookingsReport(data) {
  const reportContent = document.getElementById("report-content")

  // Group bookings by status
  const statusCounts = {
    PENDING: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  }

  data.forEach((booking) => {
    if (statusCounts[booking.status] !== undefined) {
      statusCounts[booking.status]++
    }
  })

  // Create report content
  let html = `
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <h6 class="card-subtitle mb-2 text-muted">Pending</h6>
            <h2 class="card-title">${statusCounts.PENDING}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <h6 class="card-subtitle mb-2 text-muted">Confirmed</h6>
            <h2 class="card-title">${statusCounts.CONFIRMED}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <h6 class="card-subtitle mb-2 text-muted">Completed</h6>
            <h2 class="card-title">${statusCounts.COMPLETED}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <h6 class="card-subtitle mb-2 text-muted">Cancelled</h6>
            <h2 class="card-title">${statusCounts.CANCELLED}</h2>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <canvas id="bookingStatusChart" height="300"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <canvas id="bookingTimeChart" height="300"></canvas>
          </div>
        </div>
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Pet</th>
            <th>Services</th>
            <th>Date & Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
  `

  // Add rows for each booking
  data.forEach((booking) => {
    // Format services list
    const servicesList = booking.services.map((service) => service.name).join(", ")

    // Format date and time
    const bookingDate = new Date(booking.bookingDate + "T" + booking.startTime)
    const formattedDate = bookingDate.toLocaleDateString()
    const formattedTime = bookingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    // Determine status class
    let statusClass = ""
    switch (booking.status) {
      case "CONFIRMED":
        statusClass = "bg-success"
        break
      case "PENDING":
        statusClass = "bg-warning"
        break
      case "CANCELLED":
        statusClass = "bg-danger"
        break
      case "COMPLETED":
        statusClass = "bg-info"
        break
      default:
        statusClass = "bg-secondary"
    }

    html += `
      <tr>
        <td>${booking.id.substring(0, 8)}...</td>
        <td>${booking.customer ? booking.customer.username : "N/A"}</td>
        <td>${booking.pet ? booking.pet.name : "N/A"}</td>
        <td>${servicesList}</td>
        <td>${formattedDate} ${formattedTime}</td>
        <td><span class="badge ${statusClass}">${booking.status}</span></td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
    </div>
  `

  reportContent.innerHTML = html

  // Initialize booking status chart
  const statusCtx = document.getElementById("bookingStatusChart").getContext("2d")

  new Chart(statusCtx, {
    type: "pie",
    data: {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: [
            "#FFC107", // PENDING
            "#198754", // CONFIRMED
            "#0D6EFD", // COMPLETED
            "#DC3545", // CANCELLED
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: "Booking Status Distribution",
        },
      },
    },
  })

  // Group bookings by time of day
  const timeSlots = {
    "Morning (9AM-12PM)": 0,
    "Afternoon (12PM-3PM)": 0,
    "Evening (3PM-6PM)": 0,
  }

  data.forEach((booking) => {
    const hour = Number.parseInt(booking.startTime.split(":")[0])

    if (hour >= 9 && hour < 12) {
      timeSlots["Morning (9AM-12PM)"]++
    } else if (hour >= 12 && hour < 15) {
      timeSlots["Afternoon (12PM-3PM)"]++
    } else if (hour >= 15 && hour < 18) {
      timeSlots["Evening (3PM-6PM)"]++
    }
  })

  // Initialize booking time chart
  const timeCtx = document.getElementById("bookingTimeChart").getContext("2d")

  new Chart(timeCtx, {
    type: "doughnut",
    data: {
      labels: Object.keys(timeSlots),
      datasets: [
        {
          data: Object.values(timeSlots),
          backgroundColor: ["#DEAD6F", "#6995B1", "#41403E"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: "Booking Time Distribution",
        },
      },
    },
  })
}

// Display services report
function displayServicesReport(data) {
  const reportContent = document.getElementById("report-content")

  // Create report content
  let html = `
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">Most Popular Services</h5>
          </div>
          <div class="card-body">
            <canvas id="popularServicesChart" height="300"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">Revenue by Service</h5>
          </div>
          <div class="card-body">
            <canvas id="serviceRevenueChart" height="300"></canvas>
          </div>
        </div>
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Service</th>
            <th>Category</th>
            <th>Price</th>
            <th>Bookings</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
  `

  // Get service usage and revenue data
  const serviceNames = Object.keys(data.serviceUsage)

  serviceNames.forEach((serviceName) => {
    const usage = data.serviceUsage[serviceName]
    const revenue = data.serviceRevenue[serviceName]
    const service = allServices.find((s) => s.name === serviceName) || {}

    html += `
      <tr>
        <td>${serviceName}</td>
        <td>${service.category || "N/A"}</td>
        <td>${formatCurrency(service.price || 0)}</td>
        <td>${usage}</td>
        <td>${formatCurrency(revenue)}</td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
    </div>
  `

  reportContent.innerHTML = html

  // Initialize popular services chart
  const popularCtx = document.getElementById("popularServicesChart").getContext("2d")

  new Chart(popularCtx, {
    type: "bar",
    data: {
      labels: serviceNames,
      datasets: [
        {
          label: "Number of Bookings",
          data: serviceNames.map((name) => data.serviceUsage[name]),
          backgroundColor: "rgba(222, 173, 111, 0.7)",
          borderColor: "#DEAD6F",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of Bookings",
          },
        },
      },
    },
  })

  // Initialize service revenue chart
  const revenueCtx = document.getElementById("serviceRevenueChart").getContext("2d")

  new Chart(revenueCtx, {
    type: "bar",
    data: {
      labels: serviceNames,
      datasets: [
        {
          label: "Revenue",
          data: serviceNames.map((name) => data.serviceRevenue[name]),
          backgroundColor: "rgba(105, 149, 177, 0.7)",
          borderColor: "#6995B1",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Revenue (VND)",
          },
          ticks: {
            callback: (value) => formatCurrency(value).replace("₫", ""),
          },
        },
      },
    },
  })
}

// Export report
function exportReport() {
  // In a real application, this would generate a PDF or Excel file
  alert("Export functionality would be implemented here")
}

// Save general settings
function saveGeneralSettings(event) {
  event.preventDefault()

  // In a real application, this would save the settings to the server
  showToast("General settings saved successfully", "success")
}

// Save booking settings
function saveBookingSettings(event) {
  event.preventDefault()

  // In a real application, this would save the settings to the server
  showToast("Booking settings saved successfully", "success")
}

// // Save booking
// function saveBooking() {
//   const bookingId = this.getAttribute("data-id")
//   const isEdit = !!bookingId

//   // Get form values
//   const customerId = document.getElementById("booking-customer").value
//   const petId = document.getElementById("booking-pet").value
//   const bookingDate = document.getElementById("booking-date").value
//   const bookingTime = document.getElementById("booking-time").value
//   const status = document.getElementById("booking-status").value
//   const notes = document.getElementById("booking-notes").value
//   const staffId = document.getElementById("booking-staff").value

//   // Get selected services
//   const selectedServices = []
//   document.querySelectorAll('input[name="booking-service"]:checked').forEach((checkbox) => {
//     selectedServices.push({ id: checkbox.value })
//   })

//   // Validate form
//   if (!customerId || !petId || !bookingDate || !bookingTime || selectedServices.length === 0) {
//     showToast("Please fill in all required fields", "error")
//     return
//   }

//   // Create booking object
//   const bookingData = {
//     customer: { id: customerId },
//     pet: { id: petId },
//     bookingDate,
//     startTime: bookingTime,
//     status,
//     notes,
//     services: selectedServices,
//   }

//   if (staffId) {
//     bookingData.assignedStaff = { id: staffId }
//   }

//   // Save booking
//   const url = isEdit ? `${API_BASE_URL}/admin/bookings/${bookingId}` : `${API_BASE_URL}/bookings`
//   const method = isEdit ? "PUT" : "POST"

//   fetch(url, {
//     method,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//     body: JSON.stringify(bookingData),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       // Close modal
//       const addBookingModalElement = document.getElementById("addBookingModal")
//       const addBookingModal = bootstrap.Modal.getInstance(addBookingModalElement)
//       addBookingModal.hide()

//       // Show success message
//       showToast(`Booking ${isEdit ? "updated" : "created"} successfully`, "success")

//       // Reload bookings
//       loadBookings()

//       // Reset form
//       document.getElementById("add-booking-form").reset()
//     })
//     .catch((error) => {
//       console.error("Error saving booking:", error)
//       showToast("Error saving booking", "error")
//     })
// }

// Save service
function saveService() {
  const serviceId = this.getAttribute("data-id")
  const isEdit = !!serviceId

  // Get form values
  const name = document.getElementById("service-name").value
  const description = document.getElementById("service-description").value
  const price = document.getElementById("service-price").value
  const category = document.getElementById("service-category").value
  const images = document.getElementById("service-image").value
  const maxPetsPerSlot = document.getElementById("service-max-pets").value
  const requiresVaccination = document.getElementById("service-requires-vaccination").checked
  const active = document.getElementById("service-active").checked

  // Validate form
  if (!name || !description || !price || !category || !maxPetsPerSlot) {
    showToast("Please fill in all required fields", "error")
    return
  }

  // Create service object
  const serviceData = {
    name,
    description,
    price: Number.parseFloat(price),
    category,
    images,
    maxPetsPerSlot: Number.parseInt(maxPetsPerSlot),
    requiresVaccination,
    active,
  }

  // Save service
  const url = isEdit ? `${API_BASE_URL}/admin/services/${serviceId}` : `${API_BASE_URL}/admin/services`
  const method = isEdit ? "PUT" : "POST"

  fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(serviceData),
  })
    .then((response) => response.json())
    .then((data) => {
      // Close modal
      const addServiceModalElement = document.getElementById("addServiceModal")
      const addServiceModal = bootstrap.Modal.getInstance(addServiceModalElement)
      addServiceModal.hide()

      // Show success message
      showToast(`Service ${isEdit ? "updated" : "created"} successfully`, "success")

      // Reload services
      loadServices()

      // Reset form
      document.getElementById("add-service-form").reset()
    })
    .catch((error) => {
      console.error("Error saving service:", error)
      showToast("Error saving service", "error")
    })
}

// Save staff
function saveStaff() {
  // Get form values
  const email = document.getElementById("staff-email").value
  const password = document.getElementById("staff-password").value
  const phone = document.getElementById("staff-phone").value
  const address = document.getElementById("staff-address").value
  const gender = document.getElementById("staff-gender").value

  // Validate form
  if (!email || !password || !phone) {
    showToast("Please fill in all required fields", "error")
    return
  }

  // Create staff object
  const staffData = {
    email,
    password,
    phoneNumber: phone,
    address,
    gender,
    role: "EMPLOYEE",
  }

  // Save staff
  fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(staffData),
  })
    .then((response) => response.json())
    .then((data) => {
      // Update role to EMPLOYEE
      return fetch(`${API_BASE_URL}/admin/users/${data.id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ role: "EMPLOYEE" }),
      })
    })
    .then((response) => response.json())
    .then((data) => {
      // Close modal
      const addStaffModalElement = document.getElementById("addStaffModal")
      const addStaffModal = bootstrap.Modal.getInstance(addStaffModalElement)
      addStaffModal.hide()

      // Show success message
      showToast("Staff created successfully", "success")

      // Reload staff
      loadStaff()

      // Reset form
      document.getElementById("add-staff-form").reset()
    })
    .catch((error) => {
      console.error("Error saving staff:", error)
      showToast("Error saving staff", "error")
    })
}

// Delete service
function deleteService(serviceId) {
  fetch(`${API_BASE_URL}/admin/services/${serviceId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then(() => {
      // Show success message
      showToast("Service deleted successfully", "success")

      // Reload services
      loadServices()
    })
    .catch((error) => {
      console.error("Error deleting service:", error)
      showToast("Error deleting service", "error")
    })
}

// Load customers for dropdown
function loadCustomersForDropdown() {
  const customerSelect = document.getElementById("booking-customer")
  customerSelect.innerHTML = '<option value="">Select Customer</option>'

  // Fetch customers if not already loaded
  if (allCustomers.length === 0) {
    fetch(`${API_BASE_URL}/admin/users?role=CUSTOMER`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        allCustomers = data
        populateCustomerDropdown(data)
      })
      .catch((error) => {
        console.error("Error loading customers:", error)
        showToast("Error loading customers", "error")
      })
  } else {
    populateCustomerDropdown(allCustomers)
  }
}

// Populate customer dropdown
function populateCustomerDropdown(customers) {
  const customerSelect = document.getElementById("booking-customer")

  customers.forEach((customer) => {
    const option = document.createElement("option")
    option.value = customer.id
    option.textContent = `${customer.username} (${customer.email})`
    customerSelect.appendChild(option)
  })
}

// Load customer pets
function loadCustomerPets(customerId) {
  if (!customerId) {
    customerId = this.value
  }

  if (!customerId) {
    return
  }

  const petSelect = document.getElementById("booking-pet")
  petSelect.innerHTML = '<option value="">Select Pet</option>'

  // Fetch customer pets
  fetch(`${API_BASE_URL}/pets/user/${customerId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      data.forEach((pet) => {
        const option = document.createElement("option")
        option.value = pet.id
        option.textContent = `${pet.name} (${pet.species})`
        petSelect.appendChild(option)
      })
    })
    .catch((error) => {
      console.error("Error loading customer pets:", error)
      showToast("Error loading customer pets", "error")
    })
}

// Load staff for dropdown
function loadStaffForDropdown() {
  const staffSelect = document.getElementById("booking-staff")
  staffSelect.innerHTML = '<option value="">Select Staff (Optional)</option>'

  // Fetch staff if not already loaded
  if (allStaff.length === 0) {
    fetch(`${API_BASE_URL}/admin/users?role=EMPLOYEE`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        allStaff = data
        populateStaffDropdown(data)
      })
      .catch((error) => {
        console.error("Error loading staff:", error)
        showToast("Error loading staff", "error")
      })
  } else {
    populateStaffDropdown(allStaff)
  }
}

// Populate staff dropdown
function populateStaffDropdown(staff) {
  const staffSelect = document.getElementById("booking-staff")

  staff.forEach((employee) => {
    const option = document.createElement("option")
    option.value = employee.id
    option.textContent = `${employee.username} (${employee.email})`
    staffSelect.appendChild(option)
  })
}

// Load services for booking
function loadServicesForBooking(selectedServices = []) {
  const servicesList = document.getElementById("booking-services-list")
  servicesList.innerHTML = ""

  // Fetch services if not already loaded
  if (allServices.length === 0) {
    fetch(`${API_BASE_URL}/services`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        allServices = data
        populateServicesList(data, selectedServices)
      })
      .catch((error) => {
        console.error("Error loading services:", error)
        showToast("Error loading services", "error")
      })
  } else {
    populateServicesList(allServices, selectedServices)
  }
}

// Populate services list
function populateServicesList(services, selectedServices = []) {
  const servicesList = document.getElementById("booking-services-list")

  services.forEach((service) => {
    const isSelected = selectedServices.some((s) => s.id === service.id)

    const serviceItem = document.createElement("div")
    serviceItem.className = "form-check mb-2"
    serviceItem.innerHTML = `
      <input class="form-check-input" type="checkbox" name="booking-service" value="${service.id}" id="service-${service.id}" ${isSelected ? "checked" : ""}>
      <label class="form-check-label" for="service-${service.id}">
        ${service.name} - ${formatCurrency(service.price)}
      </label>
    `

    servicesList.appendChild(serviceItem)
  })
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

// Show toast notification
function showToast(message, type = "info") {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container")
  if (!toastContainer) {
    toastContainer = document.createElement("div")
    toastContainer.className = "toast-container position-fixed bottom-0 end-0 p-3"
    document.body.appendChild(toastContainer)
  }

  // Create toast element
  const toastId = "toast-" + Date.now()
  const toast = document.createElement("div")
  toast.className = `toast align-items-center text-white bg-${type === "error" ? "danger" : type}`
  toast.setAttribute("role", "alert")
  toast.setAttribute("aria-live", "assertive")
  toast.setAttribute("aria-atomic", "true")
  toast.setAttribute("id", toastId)

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `

  toastContainer.appendChild(toast)

  // Initialize and show toast
  const toastInstance = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 5000,
  })
  toastInstance.show()

  // Remove toast after it's hidden
  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove()
  })
}
