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
        document.getElementById("totalOrders").textContent = orders.length
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
                                <img src="${product.product.imageId}" alt="${product.product.name}" class="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded border flex-shrink-0">
                                <div class="flex-1 min-w-0">
                                    <div class="text-sm font-medium text-gray-900 dark:text-white truncate">${product.product.name}</div>
                                    <div class="text-xs text-gray-600 dark:text-gray-400">Qty: ${product.quantity} × ₹${product.price}</div>
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
                       <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.shipping?.shippingStatus)} whitespace-nowrap">
                            ${order.shipping.shippingStatus?.charAt(0).toUpperCase() + order.shipping.shippingStatus?.slice(1)}
                        </span>
                    </div>
                </td>
                <td class="py-4 px-4">
                    <div class="space-y-1 text-center">
                         <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)} whitespace-nowrap">
                            ${order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                        </span>
                        <div class="text-xs font-medium text-gray-600 text-center dark:text-gray-400">${order.paymentMethod.toUpperCase()}</div>
                    </div>
                </td>
                <td class="py-4 px-4 text-left font-medium text-gray-900 dark:text-white whitespace-nowrap">₹${order.totalAmount.toFixed(2)}</td>
                <!--<td class="py-4 px-4">
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
                </td>-->
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
                                <button class="updateDetails w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center transition-colors" data-order-index="${index}">
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

    // Add event listeners for view details buttons updateDetails
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

      document.querySelectorAll(".updateDetails").forEach((button) => {
      button.addEventListener("click", (e) => {
        const orderIndex = Number.parseInt(e.target.closest(".updateDetails").dataset.orderIndex)
        showOrderUpdateForm(orders[orderIndex])
        // Close dropdown after clicking
        document.querySelectorAll(".actionDropdown").forEach((d) => {
          d.classList.remove("show")
        })
      })
    })
  }

  function showOrderDetails(order) {
    const modal = document.getElementById("orderModal");
    const modalContent = document.getElementById("modalContent");
    
    // 1. Safety check
    if (!modal || !modalContent || !order) return;

    const formattedDate = formatDate(order.orderDate);

    // 2. Pre-calculate values to avoid long template strings logic
    const shippingStatus = order.shipping?.shippingStatus || "pending";
    const paymentStatus = order.paymentStatus || "pending";
    const shippingName = order.shipping?.name || "Customer";

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
                </div>
            </div>
            
            <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
                <div class="space-y-3">
                    <div class="flex items-center gap-3">
                        <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
                            ${getInitials(shippingName)}
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">${shippingName}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${order.shipping?.email || ""}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${order.shipping?.phone || ""}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Products</h3>
            <div class="space-y-4">
                ${(order.orderItems || []).map((product) => `
                    <div class="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div class="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded border flex-shrink-0">
                            ${product.product?.imageId
                                ? `<img src="${product.product.imageId}" alt="${product.product.name}" class="w-16 h-16 object-cover rounded">`
                                : `<div class="w-16 h-16 flex items-center justify-center">
                                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                   </div>`
                            }
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-medium text-gray-900 dark:text-white">${product.product?.name || 'Unknown Product'}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Quantity: ${product.quantity}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Price: ₹${Number(product.price).toFixed(2)}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-medium text-gray-900 dark:text-white">₹${(product.quantity * product.price).toFixed(2)}</p>
                        </div>
                    </div>
                `).join("")}
            </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Information</h3>
                <div class="space-y-3">
                    <div>
                        <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</label>
                        <p class="text-xl font-bold text-gray-900 dark:text-white">₹${(order.totalAmount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Status</label>
                        <div class="mt-1">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(paymentStatus)}">
                                ${paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</label>
                        <p class="text-gray-900 dark:text-white">${(order.paymentMethod || "N/A").toUpperCase()}</p>
                    </div>
                </div>
            </div>
            
            <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shipping Information</h3>
                <div class="space-y-3">
                    <div>
                        <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Shipping Address</label>
                        <p class="text-gray-900 dark:text-white">${order.shipping?.address || 'N/A'}</p>
                    </div>
                    <div class="flex flex-wrap gap-6">
                        <div>
                          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Shipping Carrier</label>
                          <p class="text-gray-900 dark:text-white">${order.shipping?.shippingCarrier || 'Standard'}</p>
                        </div>
                        ${order.shipping?.trackingNumber ? `
                        <div>
                            <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Tracking Number</label>
                            <p class="text-gray-900 dark:text-white font-mono text-sm">${order.shipping.trackingNumber}</p>
                        </div>
                    ` : ""}
                    </div>
                    <div class="flex flex-wrap gap-6">
                      <div>
                          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Shipping Status</label>
                          <div class="flex items-center gap-2 mt-1">
                              ${getStatusIcon(shippingStatus)}
                              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shippingStatus)}">
                                  ${shippingStatus.charAt(0).toUpperCase() + shippingStatus.slice(1)}
                              </span>
                          </div>
                      </div>
                      <div>
                          <label class="text-sm font-medium text-gray-600 dark:text-gray-400">Shipping Cost</label>
                          <p class="text-gray-900 dark:text-white">₹${(order.shipping?.shippingCost || 0).toFixed(2)}</p>
                      </div>
                    </div>
                </div>
            </div>
        </div>`;

    // Show the modal
    modal.classList.add("show")
}

  function getCsrfData() {
        const tokenEl = document.querySelector('meta[name="_csrf"]');
        const headerEl = document.querySelector('meta[name="_csrf_header"]');
        return {
            token: tokenEl ? tokenEl.getAttribute('content') : null,
            header: headerEl ? headerEl.getAttribute('content') : null
        };
    }

function showOrderUpdateForm(order) {
    const modal = document.getElementById("orderModal");
    const modalContent = document.getElementById("modalContent");
    
    if (!modal || !modalContent || !order) return;

    // Logic: Only show Payment Status update if method is COD
    const isCOD = order.paymentMethod?.toLowerCase() === 'cod';
    const shippingStatus = order.shipping?.shippingStatus || "pending";
    const paymentStatus = order.paymentStatus || "pending";

    // Pre-calculate selected attributes for option elements
    const pendingSelected = shippingStatus === 'pending' ? 'selected' : '';
    const processingSelected = shippingStatus === 'processing' ? 'selected' : '';
    const shippedSelected = shippingStatus === 'shipped' ? 'selected' : '';
    const deliveredSelected = shippingStatus === 'delivered' ? 'selected' : '';
    const cancelledSelected = shippingStatus === 'cancelled' ? 'selected' : '';
    
    const paymentPendingSelected = paymentStatus === 'pending' ? 'selected' : '';
    const paymentPaidSelected = paymentStatus === 'paid' ? 'selected' : '';
    const paymentFailedSelected = paymentStatus === 'failed' ? 'selected' : '';

    modalContent.innerHTML = `
        <form id="updateOrderForm" class="space-y-6">
            <input type="hidden" name="orderId" value="${order.orderId}">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500">Order Status</h3>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Status</label>
                        <select name="shippingStatus" class="mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white">
                            <option value="pending" ${pendingSelected}>Pending</option>
                            <option value="processing" ${processingSelected}>Processing</option>
                            <option value="shipped" ${shippedSelected}>Shipped</option>
                            <option value="delivered" ${deliveredSelected}>Delivered</option>
                            <option value="cancelled" ${cancelledSelected}>Cancelled</option>
                        </select>
                    </div>

                    ${isCOD ? `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status (COD Order)</label>
                        <select name="paymentStatus" class="mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white">
                            <option value="pending" ${paymentPendingSelected}>Pending</option>
                            <option value="paid" ${paymentPaidSelected}>Paid / Collected</option>
                            <option value="failed" ${paymentFailedSelected}>Failed</option>
                        </select>
                    </div>
                    ` : `
                    <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <label class="block text-xs font-medium text-gray-500">Payment Method: ${order.paymentMethod}</label>
                        <p class="text-sm text-gray-400 italic">Status only editable for COD</p>
                        <input type="hidden" name="paymentStatus" value="${order.paymentStatus}">
                    </div>
                    `}
                </div>

                <div class="space-y-4">
                    <h3 class="text-sm font-bold uppercase tracking-wider text-gray-500">Logistics & Tracking</h3>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Method</label>
                        <input type="text" name="shippingCarrier" value="${order.shipping?.shippingCarrier || 'Standard'}" 
                               class="mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tracking Number</label>
                        <input type="text" name="trackingNumber" value="${order.shipping?.trackingNumber || ''}" 
                               class="mt-1 block w-full border rounded-md p-2 font-mono dark:bg-gray-700 dark:text-white" 
                               placeholder="e.g. TRK123456">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Dispatch Date</label>
                        <input type="date" name="dispatchDate" 
                               value="${order.shipping?.dispatchDate ? order.shipping.dispatchDate.split('T')[0] : ''}" 
                               class="mt-1 block w-full border rounded-md p-2 dark:bg-gray-700 dark:text-white">
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onclick="document.getElementById('orderModal').classList.remove('show')" 
                        class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" 
                        class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
                    Update Order
                </button>
            </div>
        </form>
    `;

    modal.classList.add("show");

    // Handle form submission
    document.getElementById("updateOrderForm").onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        console.log("Submitting Update:", data);

        
            const csrf = getCsrfData();

            if (!csrf.token || !csrf.header) {
                console.error("CSRF token or header not found.");
                alert("Security error: CSRF token missing. Please refresh the page.");
                return;
            }
        
        // Example logic for API call:
        try {
            const response = await fetch(`/user/updateOrder`, {
                method: "PUT",
                headers: { [csrf.header]: csrf.token, 'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });

            if (response.ok) {
                await loadOrders();
                renderOrders();
                modal.classList.remove("show");
            } else {
                console.error("Error updating order:", response.statusText);
            }
        } catch (error) {
            console.error("Error updating order:", error);
        }
    };
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

  //Number orders increase or decrease in percentage
function calculatePercentageChange(orders) {
    if (!orders || orders.length === 0) return { percentage: 'N/A', rawValue: 0, trend: 'neutral' };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // specific logic to handle January looking back to December
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1; 
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Helper to safely check dates
    const isOrderInMonth = (dateString, targetMonth, targetYear) => {
        const d = new Date(dateString); // Fix: Ensure it's a Date object
        return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    };

    const thisMonthOrders = orders.filter(o => isOrderInMonth(o.orderDate, currentMonth, currentYear)).length;
    const lastMonthOrders = orders.filter(o => isOrderInMonth(o.orderDate, lastMonth, lastMonthYear)).length;

    // Handle divide by zero
    if (lastMonthOrders === 0) {
        return { percentage: 'N/A', rawValue: 0, trend: 'neutral' };
    }

    const percentageChange = ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;
    
    // Formatting logic
    const sign = percentageChange > 0 ? '+' : '';
    const formatted = `${sign}${percentageChange.toFixed(2)}%`;

    return {
        percentage: formatted,
        rawValue: percentageChange,
        trend: percentageChange >= 0 ? 'up' : 'down'
    };
}

//Total Revenue
function calculateTotalRevenue(orders) {
  if (!orders || !Array.isArray(orders)) return 0;

  const deliveredAndPaidOrders = orders.filter(order => 
    order?.shipping?.shippingStatus === 'delivered' && 
    order?.paymentStatus === 'paid'
  );

  return deliveredAndPaidOrders.reduce((total, order) => {const amount = parseFloat(order?.totalAmount) || 0;
    return total + amount;
  }, 0);
}

//Pending orders
function checkOrderStatus(orders) {
    const pendingOrders = orders.filter(order => order.shipping?.shippingStatus === 'pending');
    const deliveredOrders = orders.filter(order => order.shipping?.shippingStatus === 'delivered');
    const shippedOrders = orders.filter(order => order.shipping?.shippingStatus === 'shipped');
    const cancelledOrders = orders.filter(order => order.shipping?.shippingStatus === 'cancelled');
    return {
        pending: pendingOrders.length,
        delivered: deliveredOrders.length,
        shipped: shippedOrders.length,
        cancelled: cancelledOrders.length
    };
}
  // Fetch all orders and start application 
  async function loadOrders() {
    try {
      const response = await fetch("/user/getAllUserOrders")
      if (response.ok) {
        const data = await response.json()
        orders = [...data]

        const { percentage, trend } = calculatePercentageChange(orders);
        const container = document.getElementById("orderTrendContainer");
        const valueSpan = document.getElementById("changeInPercentageOfOrders");
        valueSpan.textContent = percentage;
        container.classList.add(trend === 'up' ? 'text-green-600' : 'text-red-600');

        document.getElementById("totalRevenue").textContent = calculateTotalRevenue(orders);
        document.getElementById("pendingOrders").textContent = checkOrderStatus(orders).pending;
        document.getElementById("deliveredOrders").textContent = checkOrderStatus(orders).delivered;
        document.getElementById("shippedOrders").textContent = checkOrderStatus(orders).shipped;
        document.getElementById("cancelledOrders").textContent = checkOrderStatus(orders).cancelled;

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
