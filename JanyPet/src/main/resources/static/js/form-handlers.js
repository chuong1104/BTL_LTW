/**
 * Form Handlers
 * Manages form submissions and validation
 */

const FormHandlers = {
  initializeForms() {
    this.initializeProductForm()
    this.initializeCategoryForm()
    this.initializeSettingsForm()
    // Add other form initializations
  },

  initializeProductForm() {
    const form = document.getElementById("product-basic-form")
    if (form) {
      form.addEventListener("submit", this.handleProductSubmit)
      
      // Add input validation
      const inputs = form.querySelectorAll("input, textarea, select")
      inputs.forEach(input => {
        input.addEventListener("input", () => this.validateInput(input))
      })
    }
  },

  validateInput(input) {
    const value = input.value.trim()
    let isValid = true
    let errorMessage = ""

    switch(input.id) {
      case "product-name":
        isValid = value.length >= 3
        errorMessage = "Name must be at least 3 characters"
        break
      case "product-price":
        isValid = !isNaN(value) && parseFloat(value) > 0
        errorMessage = "Price must be a positive number"
        break
      case "product-stock":
        isValid = !isNaN(value) && parseInt(value) >= 0
        errorMessage = "Stock must be a non-negative number"
        break
      // Add other validations
    }

    this.showInputError(input, isValid, errorMessage)
    return isValid
  },

  showInputError(input, isValid, message) {
    const errorDiv = input.nextElementSibling
    if (!errorDiv || !errorDiv.classList.contains("error-message")) {
      const div = document.createElement("div")
      div.className = "error-message"
      input.parentNode.insertBefore(div, input.nextSibling)
    }

    const messageDiv = input.nextElementSibling
    if (!isValid) {
      messageDiv.textContent = message
      messageDiv.style.display = "block"
      input.classList.add("invalid")
    } else {
      messageDiv.style.display = "none"
      input.classList.remove("invalid")
    }
  },

  validateForm(form) {
    const inputs = form.querySelectorAll("input, textarea, select")
    let isValid = true

    inputs.forEach(input => {
      if (!this.validateInput(input)) {
        isValid = false
      }
    })

    return isValid
  },

  handleProductSubmit(e) {
    e.preventDefault()
    
    if (!FormHandlers.validateForm(e.target)) {
      window.ToastService?.error("Please correct the errors in the form")
      return
    }

    // Process form submission
    const formData = new FormData(e.target)
    const productData = Object.fromEntries(formData.entries())

    // Save product
    if (productData.id) {
      api.updateProduct(productData.id, productData)
        .then(() => {
          window.ToastService?.success("Product updated successfully")
          ModalHandlers.closeModal("product-modal")
          loadProducts()
        })
        .catch(error => {
          console.error("Error updating product:", error)
          window.ToastService?.error("Error updating product")
        })
    } else {
      api.createProduct(productData)
        .then(() => {
          window.ToastService?.success("Product created successfully")
          ModalHandlers.closeModal("product-modal")
          loadProducts()
        })
        .catch(error => {
          console.error("Error creating product:", error)
          window.ToastService?.error("Error creating product")
        })
    }
  }
}

// Initialize forms when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  FormHandlers.initializeForms()
})