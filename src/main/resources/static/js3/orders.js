// Orders page JavaScript
document.addEventListener("DOMContentLoaded", () => {
  let orders = []

  // Filter dropdown functionality
  const filterButton = document.getElementById("filterButton")
  const filterDropdown = document.getElementById("filterDropdown")

  if (filterButton && filterDropdown) {
    filterButton.addEventListener("click", (e) => {
      e.stopPropagation()
      filterDropdown.classList.toggle("show")
    })

    document.addEventListener("click", (e) => {
      if (!filterDropdown.contains(e.target) && !filterButton.contains(e.target)) {
        filterDropdown.classList.remove("show")
      }
    })
  }

  // Helper functions
  function getStatusIcon(status) {
    const icons = {
      delivered:
        '<svg class="h-4 w-4 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      shipped:
        '<svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>',
      processing:
        '<svg class="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      pending:
        '<svg class="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
      cancelled:
        '<svg class="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    }
    return icons[status] || icons.pending
  }

  function getStatusColor(status) {
    const colors = {
      delivered: "bg-sage/10 text-sage",
      shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      pending: "bg-primary/10 text-primary",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[status] || colors.pending 
  }

  function getPaymentStatusColor(status) {
    const colors = {
      paid: "bg-sage/10 text-sage",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      refunded: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    }
    return colors[status] || colors.pending
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  // Render orders table
  function renderOrders() {
    const tbody = document.getElementById("ordersTableBody")
    if (!tbody) return

    tbody.innerHTML = ""

    orders.forEach((order, index) => {
      const formattedDate = formatDate(order.orderDate)
      const row = document.createElement("tr")
      row.className = "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"

      row.innerHTML = `
                <td class="py-4 px-4 font-medium text-gray-900 dark:text-white">${order.orderId}</td>
                <td class="py-4 px-4">
                    <div class="flex items-center gap-3">
                        <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                            ${getInitials(order.shipping.name)}
                        </div>
                        <div class="min-w-0">
                            <div class="font-medium text-gray-900 dark:text-white truncate">${order.shipping.name}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400 truncate">${order.shipping?.email || ""}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-500">${order.shipping.phone}</div>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-4">
                    <div class="space-y-2">
                        ${order.orderItems
                          .map(
                            (product) => `
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded border flex-shrink-0"></div>
                                <div class="flex-1 min-w-0">
                                    <div class="text-sm font-medium text-gray-900 dark:text-white truncate">${product.product.name}</div>
                                    <div class="text-xs text-gray-600 dark:text-gray-400">Qty: ${product.quantity} × $${product.price}</div>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </td>
                <td class="py-4 px-4">
                    <div class="flex items-center gap-2">
                        <svg class="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z"/>
                        </svg>
                        <div class="min-w-0">
                            <div class="text-sm text-gray-900 dark:text-white">${formattedDate.date}</div>
                            <div class="text-xs text-gray-600 dark:text-gray-400">${formattedDate.time}</div>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-4">
                    <div class="flex items-center gap-2">
                        ${getStatusIcon(order.shipping.shippingStatus)}
                       <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.shipping?.shippingStatus)} whitespace-nowrap">
                            ${order.shipping.shippingStatus?.charAt(0).toUpperCase() + order.shipping.shippingStatus?.slice(1)}
                        </span>
                    </div>
                </td>
                <td class="py-4 px-4">
                    <div class="space-y-1">
                         <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment?.status)} whitespace-nowrap">
                            ${order.payment?.status.charAt(0).toUpperCase() + order.payment?.status.slice(1)}
                        </span>
                        <div class="text-xs text-gray-600 dark:text-gray-400">${order.paymentMethod}</div>
                    </div>
                </td>
                <td class="py-4 px-4 text-right font-medium text-gray-900 dark:text-white whitespace-nowrap">$${order.totalAmount.toFixed(2)}</td>
                <td class="py-4 px-4">
                    <div class="space-y-1">
                        <div class="flex items-center gap-1 text-sm">
                            <svg class="h-3 w-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span class="truncate max-w-[150px] text-gray-900 dark:text-white" title="${order.shipping.address}">
                                ${order.shipping.address}
                            </span>
                        </div>
                        <div class="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <svg class="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
                            </svg>
                            ${order.shipping?.shippingCarrier}
                        </div>
                        ${
                          order.shipping.trackingNumber
                            ? `
                            <div class="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-900 dark:text-white">
                                ${order.shipping.trackingNumber}
                            </div>
                        `
                            : ""
                        }
                    </div>
                </td>
                <td class="py-4 px-4">
                    <div class="relative">
                        <button class="actionButton p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" data-order-index="${index}">
                            <svg class="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                            </svg>
                        </button>
                        <div class="actionDropdown dropdown-content absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                            <div class="py-1">
                                <button class="viewDetails w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center transition-colors" data-order-index="${index}">
                                    <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                    View Details
                                </button>
                                <button class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center transition-colors">
                                    <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                    </svg>
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </td>
            `

      tbody.appendChild(row)
    })

    // Add event listeners for action buttons
    document.querySelectorAll(".actionButton").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation()
        const dropdown = button.nextElementSibling

        // Close all other dropdowns
        document.querySelectorAll(".actionDropdown").forEach((d) => {
          if (d !== dropdown) d.classList.remove("show")
        })

        dropdown.classList.toggle("show")
      })
    })

    // Add event listeners for view details buttons
    document.querySelectorAll(".viewDetails").forEach((button) => {
      button.addEventListener("click", (e) => {
        const orderIndex = Number.parseInt(e.target.closest(".viewDetails").dataset.orderIndex)
        showOrderDetails(orders[orderIndex])
        // Close dropdown after clicking
        document.querySelectorAll(".actionDropdown").forEach((d) => {
          d.classList.remove("show")
        })
      })
    })
  }

  // Show order details modal
  function showOrderDetails(order) {
    const modal = document.getElementById("orderModal")
    const modalContent = document.getElementById("modalContent")
    if (!modal || !modalContent) return

    const formattedDate = formatDate(order.orderDate)

    modalContent.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Information</h3>
                    <div class="space-y-3">
                        <div>
                            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Order ID</label>
                            <p class="text-gray-900 dark:text-white">${order.orderId}</p>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Order Date</label>
                            <p class="text-gray-900 dark:text-white">${formattedDate.date} at ${formattedDate.time}</p>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                            <div class="flex items-center gap-2 mt-1">
                                ${getStatusIcon(order.shipping?.shippingStatus)}
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.shipping.shippingStatus)}">
                                    ${order.shipping.shippingStatus?.charAt(0).toUpperCase() + order.shipping.shippingStatus?.slice(1)}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</label>
                            <p class="text-xl font-bold text-gray-900 dark:text-white">$${order.totalAmount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
                    <div class="space-y-3">
                        <div class="flex items-center gap-3">
                            <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
                                ${getInitials(order.shipping.name)}
                            </div>
                            <div>
                                <p class="font-medium text-gray-900 dark:text-white">${order.shipping.name}</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">${order.shipping?.email || ""}</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">${order.shipping.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Products</h3>
                <div class="space-y-4">
                    ${order.orderItems
                      .map(
                        (product) => `
                        <div class="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div class="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded border flex-shrink-0">
                                ${
                                  product.product.imageId
                                    ? `<img src="${product.product.imageId}" alt="${product.product.name}" class="w-16 h-16 object-cover rounded">`
                                    : `<div class="w-16 h-16 flex items-center justify-center">
                                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                    </div>`
                                }
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-medium text-gray-900 dark:text-white">${product.product.name}</h4>
                                <p class="text-sm text-gray-600 dark:text-gray-400">Quantity: ${product.quantity}</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">Price: $${product.price}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-medium text-gray-900 dark:text-white">$${(product.quantity * product.price).toFixed(2)}</p>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Information</h3>
                    <div class="space-y-3">
                        <div>
                            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Status</label>
                            <div class="mt-1">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment?.status)}">
                                    ${order.payment?.status.charAt(0).toUpperCase() + order.payment?.status.slice(1)}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</label>
                            <p class="text-gray-900 dark:text-white">${order.paymentMethod}</p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shipping Information</h3>
                    <div class="space-y-3">
                        <div>
                            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Shipping Address</label>
                            <p class="text-gray-900 dark:text-white">${order.shipping.address}</p>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Shipping Method</label>
                            <p class="text-gray-900 dark:text-white">${order.shipping?.shippingCarrier}</p>
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Shipping Cost</label>
                            <p class="text-gray-900 dark:text-white">$${order.shipping.shippingCost.toFixed(2)}</p>
                        </div>
                        ${
                          order.shipping.trackingNumber
                            ? `
                            <div>
                                <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Tracking Number</label>
                                <p class="text-gray-900 dark:text-white font-mono text-sm">${order.shipping.trackingNumber}</p>
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            </div>
        `

    modal.classList.add("show")
  }

  // Modal functionality
  const modal = document.getElementById("orderModal")
  const closeModal = document.getElementById("closeModal")

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      modal.classList.remove("show")
    })
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show")
      }
    })
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".actionButton") && !e.target.closest(".actionDropdown")) {
      document.querySelectorAll(".actionDropdown").forEach((dropdown) => {
        dropdown.classList.remove("show")
      })
    }
  })

  // Search functionality for both desktop and mobile
  function setupSearch(inputId) {
    const searchInput = document.getElementById(inputId)
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase()
        const rows = document.querySelectorAll("#ordersTableBody tr")

        rows.forEach((row) => {
          const text = row.textContent.toLowerCase()
          if (text.includes(searchTerm)) {
            row.style.display = ""
          } else {
            row.style.display = "none"
          }
        })
      })
    }
  }

  // Setup search for both inputs
  setupSearch("searchInput")
  setupSearch("mobileSearchInput")

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Escape key to close modal
    if (e.key === "Escape") {
      if (modal) modal.classList.remove("show")
      document.querySelectorAll(".actionDropdown").forEach((dropdown) => {
        dropdown.classList.remove("show")
      })
      if (filterDropdown) filterDropdown.classList.remove("show")
    }

    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault()
      const searchInput = document.getElementById("searchInput") || document.getElementById("mobileSearchInput")
      if (searchInput) {
        searchInput.focus()
      }
    }
  })

  // Add resize listener to handle responsive behavior
  window.addEventListener('resize', () => {
     if (window.innerWidth >= 1024) {
          // On desktop, hide sidebar overlay if visible
          sidebarOverlay.classList.remove('show');
          document.body.style.overflow = '';
      }
  });

  // Fetch all orders and start application
  async function loadOrders() {
    try {
      const response = await fetch("/user/getAllUserOrders")
      if (response.ok) {
        const data = await response.json()
        orders = [...data]

        console.log(orders)
        renderOrders()
      } else {
        console.error("Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }
  loadOrders()
}) 
