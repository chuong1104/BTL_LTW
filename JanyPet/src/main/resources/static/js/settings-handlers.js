const SettingsHandlers = {
  initializeSettingsEvents() {
    // Save settings button
    const saveBtn = document.getElementById("save-settings-btn")
    if (saveBtn) {
      saveBtn.addEventListener("click", this.handleSaveSettings)
    }

    // Theme selection
    document.querySelectorAll(".theme-option").forEach(option => {
      option.addEventListener("click", this.handleThemeChange)
    })

    // Settings navigation
    document.querySelectorAll(".settings-menu-item").forEach(item => {
      item.addEventListener("click", this.handleSettingsNavigation)
    })

    // Initialize form change tracking
    this.initializeFormTracking()
  },

  initializeFormTracking() {
    const forms = document.querySelectorAll(".settings-panel form")
    forms.forEach(form => {
      const initialData = new FormData(form)
      form.addEventListener("change", () => {
        const currentData = new FormData(form)
        const hasChanges = this.checkFormChanges(initialData, currentData)
        this.toggleSaveButton(hasChanges)
      })
    })
  },

  checkFormChanges(initial, current) {
    for (let [key, value] of current.entries()) {
      if (initial.get(key) !== value) return true
    }
    return false
  },

  toggleSaveButton(show) {
    const saveBtn = document.getElementById("save-settings-btn")
    if (saveBtn) {
      saveBtn.style.display = show ? "block" : "none"
    }
  },

  async handleSaveSettings() {
    try {
      const activePanel = document.querySelector(".settings-panel.active")
      if (!activePanel) return

      const formData = new FormData(activePanel.querySelector("form"))
      const settings = Object.fromEntries(formData.entries())

      await api.updateSettings(settings)
      window.ToastService?.success("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      window.ToastService?.error("Error saving settings")
    }
  },

  handleThemeChange(e) {
    const theme = e.currentTarget.querySelector("span").textContent.toLowerCase()
    
    // Remove active class from all options
    document.querySelectorAll(".theme-option").forEach(option => {
      option.classList.remove("active")
    })
    
    // Add active class to selected option
    e.currentTarget.classList.add("active")
    
    // Update theme
    document.body.className = `theme-${theme}`
    localStorage.setItem("theme", theme)
  },

  handleSettingsNavigation(e) {
    const targetId = e.currentTarget.dataset.settings
    
    // Update active menu item
    document.querySelectorAll(".settings-menu-item").forEach(item => {
      item.classList.remove("active")
    })
    e.currentTarget.classList.add("active")
    
    // Show corresponding panel
    document.querySelectorAll(".settings-panel").forEach(panel => {
      panel.classList.remove("active")
    })
    document.getElementById(`${targetId}-settings`)?.classList.add("active")
  }
}