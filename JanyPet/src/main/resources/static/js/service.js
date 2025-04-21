// API Base URL - Change this to your actual API endpoint
const API_BASE_URL = "http://localhost:8080/api"

// Global variables to store selected data
let selectedServices = []
let selectedPet = null
let currentUser = null
let allServices = []
let userPets = []
let userBookings = []

// DOM Elements
const servicesContainer = document.getElementById("services-container")
const petList = document.getElementById("pet-list")
const selectedPetDetails = document.getElementById("selected-pet-details")
const summaryServices = document.getElementById("summary-services")
const summaryTotal = document.getElementById("summary-total")
const summaryPet = document.getElementById("summary-pet")
const summaryDate = document.getElementById("summary-date")
const summaryTime = document.getElementById("summary-time")
const summaryNotes = document.getElementById("summary-notes")
const bookingsTableBody = document.getElementById("bookings-table-body")
const loginButton = document.querySelector(".login-button")
const registerButton = document.querySelector(".register-button")
const userInfoElement = document.querySelector(".user-info")
const usernameElement = document.getElementById("username")
const logoutButton = document.querySelector(".logout-btn")
const adminLink = document.querySelector(".admin-link")

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Hide preloader when page is loaded
  setTimeout(() => {
    document.querySelector(".preloader-wrapper").style.display = "none"
  }, 500)

  // Set minimum date for booking to today
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("booking-date").min = today

  // Initialize authentication state
  checkAuthState()

  // Load services
  loadServices()

  // Event listeners for navigation between steps
  document.querySelectorAll(".next-step").forEach((button) => {
    button.addEventListener("click", function () {
      const nextTabId = this.getAttribute("data-next")
      const nextTab = document.getElementById(nextTabId)

      // Validate current step before proceeding
      const currentStepId = document.querySelector(".tab-pane.active").id
      if (validateStep(currentStepId)) {
        nextTab.click()
        updateSummary()
      }
    })
  })

  document.querySelectorAll(".prev-step").forEach((button) => {
    button.addEventListener("click", function () {
      const prevTabId = this.getAttribute("data-prev")
      document.getElementById(prevTabId).click()
    })
  })

  // Event listener for confirm booking button
  document.getElementById("confirm-booking-btn").addEventListener("click", confirmBooking)

  // Event listener for add new pet button
  document.getElementById("add-new-pet-btn").addEventListener("click", () => {
    const addPetModal = new bootstrap.Modal(document.getElementById("addPetModal"))
    addPetModal.show()
  })

  // Event listener for save pet button
  document.getElementById("save-pet-btn").addEventListener("click", savePet)

  // Event listener for my bookings link
  document.getElementById("my-bookings-link").addEventListener("click", (e) => {
    e.preventDefault()
    if (currentUser) {
      loadUserBookings()
      const myBookingsModal = new bootstrap.Modal(document.getElementById("myBookingsModal"))
      myBookingsModal.show()
    } else {
      showLoginModal()
    }
  })

  // Event listener for view bookings button in success modal
  document.getElementById("view-bookings-btn").addEventListener("click", () => {
    const successModalElement = document.getElementById("successModal")
    const successModal = bootstrap.Modal.getInstance(successModalElement)
    successModal.hide()

    loadUserBookings()
    const myBookingsModal = new bootstrap.Modal(document.getElementById("myBookingsModal"))
    myBookingsModal.show()
  })

  // Authentication event listeners
  loginButton.addEventListener("click", showLoginModal)
  registerButton.addEventListener("click", showRegisterModal)
  logoutButton.addEventListener("click", logout)

  document.getElementById("login-submit-btn").addEventListener("click", login)
  document.getElementById("register-submit-btn").addEventListener("click", register)

  document.getElementById("show-register-btn").addEventListener("click", () => {
    const loginModalElement = document.getElementById("loginModal")
    const loginModal = bootstrap.Modal.getInstance(loginModalElement)
    loginModal.hide()
    showRegisterModal()
  })

  document.getElementById("show-login-btn").addEventListener("click", () => {
    const registerModalElement = document.getElementById("registerModal")
    const registerModal = bootstrap.Modal.getInstance(registerModalElement)
    registerModal.hide()
    showLoginModal()
  })

  // Date and time change listeners for summary update
  document.getElementById("booking-date").addEventListener("change", updateSummary)
  document.getElementById("booking-time").addEventListener("change", updateSummary)
  document.getElementById("booking-notes").addEventListener("input", updateSummary)
})

// Check authentication state
function checkAuthState() {
  const token = localStorage.getItem("token")
  const userData = localStorage.getItem("user")

  if (token && userData) {
    currentUser = JSON.parse(userData)
    updateUIForLoggedInUser()
    loadUserPets()
  } else {
    updateUIForLoggedOutUser()
  }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
  loginButton.style.display = "none"
  registerButton.style.display = "none"
  userInfoElement.style.display = "block"
  logoutButton.style.display = "block"

  usernameElement.textContent = currentUser.username || currentUser.email

  // Show admin link if user is admin
  if (currentUser.role === "ADMIN") {
    adminLink.style.display = "block"
  } else {
    adminLink.style.display = "none"
  }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
  loginButton.style.display = "block"
  registerButton.style.display = "block"
  userInfoElement.style.display = "none"
  logoutButton.style.display = "none"
  adminLink.style.display = "none"
  currentUser = null
}

// Show login modal
function showLoginModal() {
  const loginModal = new bootstrap.Modal(document.getElementById("loginModal"))
  document.getElementById("login-error").classList.add("d-none")
  document.getElementById("login-form").reset()
  loginModal.show()
}

// Show register modal
function showRegisterModal() {
  const registerModal = new bootstrap.Modal(document.getElementById("registerModal"))
  document.getElementById("register-error").classList.add("d-none")
  document.getElementById("register-form").reset()
  registerModal.show()
}

// Login function
function login() {
  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value
  const errorElement = document.getElementById("login-error")

  // Simple validation
  if (!email || !password) {
    errorElement.textContent = "Please enter both email and password"
    errorElement.classList.remove("d-none")
    return
  }

  // Mock login for demonstration
  // In a real application, you would make an API call to your backend
  fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Login failed")
      }
      return response.json()
    })
    .then((data) => {
      // Store token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      currentUser = data.user

      // Update UI
      updateUIForLoggedInUser()

      // Close modal
      const loginModalElement = document.getElementById("loginModal")
      const loginModal = bootstrap.Modal.getInstance(loginModalElement)
      loginModal.hide()

      // Load user's pets
      loadUserPets()

      // Show success message
      showToast("Login successful!", "success")
    })
    .catch((error) => {
      console.error("Login error:", error)
      errorElement.textContent = "Invalid email or password"
      errorElement.classList.remove("d-none")
    })
}

// Register function
function register() {
  const email = document.getElementById("register-email").value
  const password = document.getElementById("register-password").value
  const confirmPassword = document.getElementById("register-confirm-password").value
  const phone = document.getElementById("register-phone").value
  const address = document.getElementById("register-address").value
  const gender = document.getElementById("register-gender").value
  const errorElement = document.getElementById("register-error")

  // Simple validation
  if (!email || !password || !confirmPassword || !phone) {
    errorElement.textContent = "Please fill in all required fields"
    errorElement.classList.remove("d-none")
    return
  }

  if (password !== confirmPassword) {
    errorElement.textContent = "Passwords do not match"
    errorElement.classList.remove("d-none")
    return
  }

  // Mock registration for demonstration
  // In a real application, you would make an API call to your backend
  fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      phoneNumber: phone,
      address,
      gender,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Registration failed")
      }
      return response.json()
    })
    .then((data) => {
      // Close modal
      const registerModalElement = document.getElementById("registerModal")
      const registerModal = bootstrap.Modal.getInstance(registerModalElement)
      registerModal.hide()

      // Show success message
      showToast("Registration successful! Please log in.", "success")

      // Show login modal
      showLoginModal()
    })
    .catch((error) => {
      console.error("Registration error:", error)
      errorElement.textContent = "Registration failed. Please try again."
      errorElement.classList.remove("d-none")
    })
}

// Logout function
function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  updateUIForLoggedOutUser()
  showToast("Logged out successfully", "info")

  // Reset booking form
  resetBookingForm()
}

// Load services from API
function loadServices() {
  // In a real application, you would fetch this data from your API
  fetch(`${API_BASE_URL}/services`)
    .then((response) => response.json())
    .then((data) => {
      allServices = data
      displayServices(data)
    })
    .catch((error) => {
      console.error("Error loading services:", error)
      servicesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-danger">Error loading services. Please try again later.</p>
                </div>
            `
    })
}

// Display services in the UI
function displayServices(services) {
  servicesContainer.innerHTML = ""

  if (services.length === 0) {
    servicesContainer.innerHTML = `
            <div class="col-12 text-center">
                <p>No services available at the moment.</p>
            </div>
        `
    return
  }

  services.forEach((service) => {
    const serviceCard = document.createElement("div")
    serviceCard.className = "col-md-6 col-lg-4 mb-4"
    serviceCard.innerHTML = `
            <div class="card h-100">
                <img src="${service.images || "https://via.placeholder.com/300x200?text=Pet+Service"}" class="card-img-top" alt="${service.name}">
                <div class="card-body">
                    <h5 class="card-title">${service.name}</h5>
                    <p class="card-text">${service.description}</p>
                    <p class="card-text">
                        <small class="text-muted">
                            <strong>Price:</strong> ${formatCurrency(service.price)}
                        </small>
                    </p>
                    <div class="form-check">
                        <input class="form-check-input service-checkbox" type="checkbox" value="${service.id}" id="service-${service.id}">
                        <label class="form-check-label" for="service-${service.id}">
                            Select this service
                        </label>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <small class="text-muted">
                        <iconify-icon icon="mdi:information-outline"></iconify-icon> 
                        ${service.requiresVaccination ? "Requires vaccination" : "No vaccination required"}
                    </small>
                </div>
            </div>
        `
    servicesContainer.appendChild(serviceCard)
  })

  // Add event listeners to service checkboxes
  document.querySelectorAll(".service-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const serviceId = this.value
      if (this.checked) {
        const service = allServices.find((s) => s.id === serviceId)
        if (service) {
          selectedServices.push(service)
        }
      } else {
        selectedServices = selectedServices.filter((s) => s.id !== serviceId)
      }
    })
  })
}

// Load user's pets
function loadUserPets() {
  if (!currentUser) return

  // In a real application, you would fetch this data from your API
  fetch(`${API_BASE_URL}/pets/user/${currentUser.id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      userPets = data
      displayPets(data)
    })
    .catch((error) => {
      console.error("Error loading pets:", error)
      petList.innerHTML = `
            <p class="text-danger">Error loading your pets. Please try again later.</p>
        `
    })
}

// Display pets in the UI
function displayPets(pets) {
  petList.innerHTML = ""

  if (pets.length === 0) {
    petList.innerHTML = `
            <p class="text-muted">You don't have any pets yet. Add a new pet to continue.</p>
        `
    return
  }

  pets.forEach((pet) => {
    const petItem = document.createElement("div")
    petItem.className = "form-check mb-2"
    petItem.innerHTML = `
            <input class="form-check-input pet-radio" type="radio" name="pet" value="${pet.id}" id="pet-${pet.id}">
            <label class="form-check-label" for="pet-${pet.id}">
                ${pet.name} (${pet.species})
            </label>
        `
    petList.appendChild(petItem)
  })

  // Add event listeners to pet radio buttons
  document.querySelectorAll(".pet-radio").forEach((radio) => {
    radio.addEventListener("change", function () {
      const petId = this.value
      selectedPet = userPets.find((p) => p.id === petId)
      displayPetDetails(selectedPet)
    })
  })
}

// Display pet details
function displayPetDetails(pet) {
  if (!pet) {
    selectedPetDetails.innerHTML = `
            <p class="text-muted">Please select a pet to see details</p>
        `
    return
  }

  selectedPetDetails.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Name:</strong> ${pet.name}</p>
                <p><strong>Species:</strong> ${pet.species}</p>
                <p><strong>Breed:</strong> ${pet.breed || "Not specified"}</p>
                <p><strong>Gender:</strong> ${pet.gender}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Age:</strong> ${calculateAge(pet.birthDate)}</p>
                <p><strong>Weight:</strong> ${pet.weight ? pet.weight + " kg" : "Not specified"}</p>
                <p><strong>Vaccinated:</strong> ${pet.vaccinated ? "Yes" : "No"}</p>
                <p><strong>Health Notes:</strong> ${pet.healthNotes || "None"}</p>
            </div>
        </div>
    `
}

// Save new pet
function savePet() {
  if (!currentUser) {
    showLoginModal()
    return
  }

  const name = document.getElementById("pet-name").value
  const species = document.getElementById("pet-species").value
  const breed = document.getElementById("pet-breed").value
  const birthDate = document.getElementById("pet-birthdate").value
  const gender = document.getElementById("pet-gender").value
  const weight = document.getElementById("pet-weight").value
  const vaccinated = document.getElementById("pet-vaccinated").checked
  const healthNotes = document.getElementById("pet-health-notes").value

  // Simple validation
  if (!name || !species || !gender) {
    showToast("Please fill in all required fields", "error")
    return
  }

  // Create pet object
  const petData = {
    name,
    species,
    breed,
    birthDate,
    gender,
    weight: weight ? Number.parseFloat(weight) : null,
    vaccinated,
    healthNotes,
    owner: {
      id: currentUser.id,
    },
  }

  // In a real application, you would send this data to your API
  fetch(`${API_BASE_URL}/pets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(petData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to save pet")
      }
      return response.json()
    })
    .then((data) => {
      // Add new pet to the list
      userPets.push(data)

      // Update UI
      displayPets(userPets)

      // Close modal
      const addPetModalElement = document.getElementById("addPetModal")
      const addPetModal = bootstrap.Modal.getInstance(addPetModalElement)
      addPetModal.hide()

      // Show success message
      showToast("Pet added successfully!", "success")

      // Reset form
      document.getElementById("add-pet-form").reset()
    })
    .catch((error) => {
      console.error("Error saving pet:", error)
      showToast("Error saving pet. Please try again.", "error")
    })
}

// Load user's bookings
function loadUserBookings() {
  if (!currentUser) return

  // Show loading state
  bookingsTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Loading your bookings...
            </td>
        </tr>
    `

  // In a real application, you would fetch this data from your API
  fetch(`${API_BASE_URL}/bookings/user/${currentUser.id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      userBookings = data
      displayBookings(data)
    })
    .catch((error) => {
      console.error("Error loading bookings:", error)
      bookingsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Error loading your bookings. Please try again later.
                </td>
            </tr>
        `
    })
}

// Display bookings in the UI
function displayBookings(bookings) {
  bookingsTableBody.innerHTML = ""

  if (bookings.length === 0) {
    bookingsTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    You don't have any bookings yet.
                </td>
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
            <td>${booking.pet ? booking.pet.name : "N/A"}</td>
            <td>${servicesList}</td>
            <td>${formattedDate} ${formattedTime}</td>
            <td><span class="badge ${statusClass}">${booking.status}</span></td>
            <td>
                ${
                  booking.status === "PENDING" || booking.status === "CONFIRMED"
                    ? `<button class="btn btn-sm btn-outline-danger cancel-booking-btn" data-id="${booking.id}">Cancel</button>`
                    : `<button class="btn btn-sm btn-outline-secondary" disabled>Cancel</button>`
                }
            </td>
        `

    bookingsTableBody.appendChild(row)
  })

  // Add event listeners to cancel buttons
  document.querySelectorAll(".cancel-booking-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const bookingId = this.getAttribute("data-id")
      cancelBooking(bookingId)
    })
  })
}

// Cancel booking
function cancelBooking(bookingId) {
  if (!confirm("Are you sure you want to cancel this booking?")) {
    return
  }

  // In a real application, you would send this request to your API
  fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to cancel booking")
      }
      return response.json()
    })
    .then((data) => {
      // Update booking in the list
      const index = userBookings.findIndex((b) => b.id === bookingId)
      if (index !== -1) {
        userBookings[index] = data
      }

      // Update UI
      displayBookings(userBookings)

      // Show success message
      showToast("Booking cancelled successfully!", "success")
    })
    .catch((error) => {
      console.error("Error cancelling booking:", error)
      showToast("Error cancelling booking. Please try again.", "error")
    })
}

// Validate step before proceeding
function validateStep(stepId) {
  switch (stepId) {
    case "step1":
      if (selectedServices.length === 0) {
        showToast("Please select at least one service", "error")
        return false
      }
      return true

    case "step2":
      if (!currentUser) {
        showLoginModal()
        return false
      }

      if (!selectedPet) {
        showToast("Please select a pet or add a new one", "error")
        return false
      }
      return true

    case "step3":
      const bookingDate = document.getElementById("booking-date").value
      const bookingTime = document.getElementById("booking-time").value

      if (!bookingDate) {
        showToast("Please select a date", "error")
        return false
      }

      if (!bookingTime) {
        showToast("Please select a time", "error")
        return false
      }
      return true

    case "step4":
      const termsCheckbox = document.getElementById("terms-checkbox")

      if (!termsCheckbox.checked) {
        showToast("Please agree to the terms and conditions", "error")
        return false
      }
      return true

    default:
      return true
  }
}

// Update booking summary
function updateSummary() {
  // Update services
  summaryServices.innerHTML = ""
  let total = 0

  selectedServices.forEach((service) => {
    const listItem = document.createElement("li")
    listItem.className = "list-group-item d-flex justify-content-between align-items-center"
    listItem.innerHTML = `
            ${service.name}
            <span class="badge bg-primary rounded-pill">${formatCurrency(service.price)}</span>
        `
    summaryServices.appendChild(listItem)

    total += service.price
  })

  summaryTotal.textContent = formatCurrency(total)

  // Update pet
  if (selectedPet) {
    summaryPet.textContent = `${selectedPet.name} (${selectedPet.species})`
  } else {
    summaryPet.textContent = "Not selected"
  }

  // Update date and time
  const bookingDate = document.getElementById("booking-date").value
  const bookingTime = document.getElementById("booking-time").value

  if (bookingDate) {
    const formattedDate = new Date(bookingDate).toLocaleDateString()
    summaryDate.textContent = formattedDate
  } else {
    summaryDate.textContent = "Not selected"
  }

  if (bookingTime) {
    const timeOption = document.querySelector(`#booking-time option[value="${bookingTime}"]`)
    summaryTime.textContent = timeOption.textContent
  } else {
    summaryTime.textContent = "Not selected"
  }

  // Update notes
  const notes = document.getElementById("booking-notes").value
  summaryNotes.textContent = notes || "None"
}

// Confirm booking
function confirmBooking() {
  if (!validateStep("step4")) {
    return
  }

  const bookingDate = document.getElementById("booking-date").value
  const bookingTime = document.getElementById("booking-time").value
  const notes = document.getElementById("booking-notes").value

  // Create booking object
  const bookingData = {
    pet: {
      id: selectedPet.id,
    },
    customer: {
      id: currentUser.id,
    },
    services: selectedServices.map((service) => ({ id: service.id })),
    bookingDate: bookingDate,
    startTime: bookingTime,
    notes: notes,
    status: "PENDING",
  }

  // In a real application, you would send this data to your API
  fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(bookingData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to create booking")
      }
      return response.json()
    })
    .then((data) => {
      // Show success modal
      const successModal = new bootstrap.Modal(document.getElementById("successModal"))
      document.getElementById("success-booking-id").textContent = data.id.substring(0, 8) + "..."

      const formattedDate = new Date(data.bookingDate).toLocaleDateString()
      document.getElementById("success-date").textContent = formattedDate

      const timeOption = document.querySelector(`#booking-time option[value="${data.startTime}"]`)
      document.getElementById("success-time").textContent = timeOption.textContent

      successModal.show()

      // Reset booking form
      resetBookingForm()
    })
    .catch((error) => {
      console.error("Error creating booking:", error)
      showToast("Error creating booking. Please try again.", "error")
    })
}

// Reset booking form
function resetBookingForm() {
  // Reset selected services
  selectedServices = []
  document.querySelectorAll(".service-checkbox").forEach((checkbox) => {
    checkbox.checked = false
  })

  // Reset selected pet
  selectedPet = null
  if (document.querySelector(".pet-radio")) {
    document.querySelector(".pet-radio").checked = false
  }
  displayPetDetails(null)

  // Reset date and time
  document.getElementById("booking-date").value = ""
  document.getElementById("booking-time").value = ""
  document.getElementById("booking-notes").value = ""

  // Reset terms checkbox
  document.getElementById("terms-checkbox").checked = false

  // Reset summary
  updateSummary()

  // Go back to first step
  document.getElementById("step1-tab").click()
}

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

// Helper function to calculate age from birth date
function calculateAge(birthDate) {
  if (!birthDate) return "Unknown"

  const birth = new Date(birthDate)
  const now = new Date()

  let years = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years--
  }

  if (years < 1) {
    const months = years * 12 + monthDiff
    return `${months} months`
  }

  return `${years} years`
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
