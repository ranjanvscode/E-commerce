// Sidebar functionality
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar")
  const sidebarOverlay = document.getElementById("sidebarOverlay")
  const toggleSidebar = document.getElementById("toggleSidebar")
  const closeSidebar = document.getElementById("closeSidebar")
  const darkModeToggle = document.getElementById("darkModeToggle")
  const sunIcon = document.getElementById("sunIcon")
  const moonIcon = document.getElementById("moonIcon")
  const themeText = document.getElementById("themeText")
  const html = document.documentElement

  // Show sidebar
  function showSidebar() {
    if (sidebar && sidebarOverlay) {
      sidebar.classList.add("show")
      sidebarOverlay.classList.add("show")
      document.body.style.overflow = "hidden"
    }
  }

  // Hide sidebar
  function hideSidebar() {
    if (sidebar && sidebarOverlay) {
      sidebar.classList.remove("show")
      sidebarOverlay.classList.remove("show")
      document.body.style.overflow = ""
    }
  }

  // Sidebar event listeners
  if (toggleSidebar) {
    toggleSidebar.addEventListener("click", showSidebar)
  }

  if (closeSidebar) {
    closeSidebar.addEventListener("click", hideSidebar)
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", hideSidebar)
  }

  // Dark mode functionality
  const currentTheme = localStorage.getItem("theme") || "light"
  if (currentTheme === "dark") {
    html.classList.add("dark")
    if (sunIcon && moonIcon && themeText) {
      sunIcon.classList.add("hidden")
      moonIcon.classList.remove("hidden")
      themeText.textContent = "Light Mode"
    }
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      html.classList.toggle("dark")
      const isDark = html.classList.contains("dark")

      if (sunIcon && moonIcon && themeText) {
        if (isDark) {
          sunIcon.classList.add("hidden")
          moonIcon.classList.remove("hidden")
          themeText.textContent = "Light Mode"
          localStorage.setItem("theme", "dark")
        } else {
          sunIcon.classList.remove("hidden")
          moonIcon.classList.add("hidden")
          themeText.textContent = "Dark Mode"
          localStorage.setItem("theme", "light")
        }
      }
    })
  }

  // Handle responsive behavior
  // function handleResize() {
  //   if (window.innerWidth >= 1024) {
  //     // Desktop: hide overlay and reset body overflow
  //     if (sidebarOverlay) {
  //       sidebarOverlay.classList.remove("show")
  //     }
  //     document.body.style.overflow = ""
  //   }
  // }

  function handleResize() {
  if (window.innerWidth >= 1024) {
    // Desktop: always show sidebar, hide overlay, reset body overflow
    if (sidebar) sidebar.classList.add("show");
    if (sidebarOverlay) sidebarOverlay.classList.remove("show");
    document.body.style.overflow = "";
  } else {
    // Mobile: hide sidebar by default
    if (sidebar) sidebar.classList.remove("show");
    if (sidebarOverlay) sidebarOverlay.classList.remove("show");
    document.body.style.overflow = "";
  }
}

window.addEventListener("resize", handleResize);
window.addEventListener("DOMContentLoaded", handleResize);

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Escape key to close sidebar
    if (e.key === "Escape") {
      hideSidebar()
    }
  })

  // Set active navigation item based on current page
  function setActiveNavItem() {
    const currentPath = window.location.pathname
    const navLinks = document.querySelectorAll("nav a")

    navLinks.forEach((link) => {
      const href = link.getAttribute("href")
      if (href && (currentPath === href || currentPath.includes(href))) {
        link.classList.remove(
          "text-gray-600",
          "dark:text-gray-300",
          "hover:text-orange-600",
          "dark:hover:text-orange-400",
          "hover:bg-orange-50",
          "dark:hover:bg-orange-900/20",
        )
        link.classList.add("bg-orange-100", "dark:bg-orange-900/30", "text-orange-600", "dark:text-orange-400")
      }
    })
  }

  setActiveNavItem()
})
