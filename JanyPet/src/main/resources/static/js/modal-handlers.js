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
    
    // Add animation classes when opening modals
    document.querySelectorAll("[data-open-modal]").forEach(trigger => {
      trigger.addEventListener("click", (e) => {
        const modalId = trigger.getAttribute("data-open-modal");
        this.openModal(modalId, true);
      });
    });
  },

  // Open a modal by ID with optional animation
  openModal(modalId, animate = false) {
    const modal = document.getElementById(modalId)
    if (modal) {
      if (animate) {
        modal.classList.add("fade-in");
        setTimeout(() => modal.classList.remove("fade-in"), 500);
      }
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
  
  // Create and show a detail view modal dynamically
  showDetailModal(title, content, size = "medium") {
    // Create modal container
    const modalId = `dynamic-modal-${Date.now()}`;
    const modal = document.createElement("div");
    modal.id = modalId;
    modal.className = "modal enhanced-modal";
    
    // Set content with appropriate size class
    modal.innerHTML = `
      <div class="modal-content ${size}">
        <div class="modal-header">
          <h2>${title}</h2>
          <span class="close">&times;</span>
        </div>
        <div class="modal-body detail-view">
          ${content}
        </div>
        <div class="modal-footer">
          <button type="button" class="secondary-btn close-modal-btn">Close</button>
        </div>
      </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modal);
    
    // Set up event listeners
    const closeBtn = modal.querySelector(".close");
    const closeModalBtn = modal.querySelector(".close-modal-btn");
    
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
      setTimeout(() => modal.remove(), 300);
    });
    
    closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
      setTimeout(() => modal.remove(), 300);
    });
    
    // Show modal with animation
    this.openModal(modalId, true);
    
    return modalId;
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  ModalHandlers.initialize()
})

// Export to global scope
window.ModalHandlers = ModalHandlers
