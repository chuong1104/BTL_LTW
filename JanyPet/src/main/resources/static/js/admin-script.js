// Main admin dashboard script
document.addEventListener("DOMContentLoaded", () => {
  // Toggle sidebar
  const toggleSidebar = document.getElementById("toggle-sidebar")
  const sidebar = document.getElementById("sidebar")

  if (toggleSidebar && sidebar) {
    toggleSidebar.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed")
    })
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById("menu-toggle")

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })
  }

  // Navigation between sections
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
      document.getElementById(sectionId).classList.add("active")

      // Close sidebar on mobile after navigation
      if (window.innerWidth < 768) {
        sidebar.classList.remove("open")
      }
    })
  })

  // Settings navigation
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
      document.getElementById(panelId).classList.add("active")
    })
  })

  // Theme options
  const themeOptions = document.querySelectorAll(".theme-option")

  themeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      themeOptions.forEach((o) => o.classList.remove("active"))
      this.classList.add("active")

      // In a real application, this would apply the selected theme
    })
  })

  // Custom date range for reports
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
