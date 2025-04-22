/**
 * Modal Handlers - Manages modal dialogs
 */
const ModalHandlers = {
  // Initialize modal handlers
  initialize() {
    // Close modal when clicking on X or outside
    window.addEventListener("click", (event) => {
      const modals = document.querySelectorAll(".modal")
      modals.forEach((modal) => {
        if (event.target === modal) {
          modal.style.display = "none"
        }
      })
    })

    // Close buttons
    document.querySelectorAll(".modal .close").forEach((closeBtn) => {
      closeBtn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal")
        if (modal) {
          modal.style.display = "none"
        }
      })
    })
  },

  // Open a modal by ID
  openModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "block"
    } else {
      console.error(`Modal with ID ${modalId} not found`)
    }
  },

  // Close a modal by ID
  closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "none"
    } else {
      console.error(`Modal with ID ${modalId} not found`)
    }
  },
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  ModalHandlers.initialize()
})

// Export to global scope
window.ModalHandlers = ModalHandlers
