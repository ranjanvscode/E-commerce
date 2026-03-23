// Global variables
let products = []
let editingProductId = null

// DOM Elements
const productsGrid = document.getElementById("productsGrid")
const emptyState = document.getElementById("emptyState")
const productModal = document.getElementById("productModal")
const deleteModal = document.getElementById("deleteModal")
const productForm = document.getElementById("productForm")
const addProductBtn = document.getElementById("addProductBtn")
const closeModal = document.getElementById("closeModal")
const cancelBtn = document.getElementById("cancelBtn")
const confirmDelete = document.getElementById("confirmDelete")
const cancelDelete = document.getElementById("cancelDelete")
const toastContainer = document.getElementById("toastContainer") 

// Save products to localStorage
function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products))
}

// Modal functionality
function openAddModal() {
  editingProductId = null
  document.getElementById("modalTitle").textContent = "Add Product"
  document.getElementById("submitProductText").textContent = "Save Product"
  productForm.reset()
  productModal.classList.remove("hidden")
}

function editProduct(id) {
  const product = products.find((p) => String(p.id) === String(id))
  if (!product) return

  editingProductId = id
  document.getElementById("modalTitle").textContent = "Edit Product"
  document.getElementById("name").value = product.name
  document.getElementById("price").value = product.price
  document.getElementById("discount").value = product.discount || ""
  document.getElementById("category").value = product.category
  document.getElementById("inStock").value = product.inStock ? "yes" : "no"
  document.getElementById("description").value = product.description || ""
  document.getElementById("rating").value = product.rating || ""

  productModal.classList.remove("hidden")
}

function closeProductModal() {
  productModal.classList.add("hidden")
  productForm.reset()
  editingProductId = null
}

function showToast(message, type = "success") {
    const toast = document.createElement("div")
    toast.className = `flex items-center p-4 mb-4 text-sm rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === "success"
        ? "text-green-800 bg-green-50 dark:bg-green-800 dark:text-green-200"
        : "text-red-800 bg-red-50 dark:bg-red-800 dark:text-red-200"
    }`

    toast.innerHTML = `
            <svg class="flex-shrink-0 inline w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="${
                  type === "success"
                    ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    : "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                }" clip-rule="evenodd"></path>
            </svg>
            <span class="font-medium">${message}</span>
            <button type="button" class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-green-200 dark:hover:bg-green-700 inline-flex h-8 w-8" onclick="this.parentElement.remove()">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        `

    toastContainer.appendChild(toast)

    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-x-full")
    }, 100)

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.classList.add("translate-x-full")
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, 5000)
  } 

// Render products with orange theme
function renderProducts() {
  if (products.length === 0) {
    productsGrid.classList.add("hidden")
    emptyState.classList.remove("hidden")
    return
  }

  productsGrid.classList.remove("hidden")
  emptyState.classList.add("hidden")

  // Helper: Render price with discount
  const renderPrice = (price, discount, discountPrice) => {
    if (discount && discount > 0 && discountPrice && discountPrice < price) {
      return `
                <div class="flex items-center gap-2">
                    <span class="text-lg font-bold text-orange-600 dark:text-orange-400">₹${discountPrice}</span>
                    <span class="text-base text-gray-500 line-through">₹${price}</span>
                    <span class="text-xs text-orange-600 font-semibold">${discount}%</span>
                </div>
            `
    }
    return `<span class="text-lg font-bold text-orange-600 dark:text-orange-400">₹${price}</span>`
  }

  productsGrid.innerHTML = products
      .map(
        (product) => `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div class="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                    ${
                      product.image
                        ? `<img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">`
                        : `<div class="w-full h-full flex items-center justify-center">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>`
                    }
                    <div class="absolute top-2 right-2 flex gap-1">
                        <button onclick="editProduct('${product.id}')" 
                                class="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button onclick="deleteProduct('${product.id}','${product.cimageId ? product.cimageId : ""}')" 
                                class="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                    ${
                      product.discount > 0
                        ? `<div class="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                            -${product.discount}%
                        </div>`
                        : ""
                    }
                </div>
                <div class="p-4">
                    <div class="flex items-start justify-between mb-2">
                        <h3 class="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">${product.name}</h3>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.inStock
                            ? "bg-sage/10 text-sage"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }">
                            ${product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                    </div>
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">${product.description || "No description available"}</p>
                    <div class="flex items-center justify-between">
                        <div class="flex flex-col">
                            ${renderPrice(product.price, product.discount, product.discountPrice)}
                            <span class="text-xs text-gray-500 dark:text-gray-400 capitalize">${product.category}</span>
                        </div>
                        ${
                          product.rating
                            ? `<div class="flex items-center gap-1">
                                <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                                <span class="text-sm text-gray-600 dark:text-gray-400">${product.rating}</span>
                            </div>`
                            : ""
                        }
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
}

function getCsrfData() {
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
    return { token: csrfToken, header: csrfHeader };
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const csrf = getCsrfData();
  if (!csrf.token || !csrf.header) {
    console.error("CSRF token or header not found.");
    alert("Security error: CSRF token missing. Please refresh the page.");
    return;
  }

  const form = document.getElementById("productForm")
  const formData = new FormData()

  // Append form fields
  formData.append("name", document.getElementById("name").value)
  formData.append("price", document.getElementById("price").value)
  formData.append("discount", document.getElementById("discount").value)
  formData.append("category", document.getElementById("category").value)
  formData.append("description", document.getElementById("description").value)
  formData.append("rating", document.getElementById("rating").value)
  formData.append("inStock", document.getElementById("inStock").value)

  // Append file
  const imageFile = document.getElementById("image").files[0]
  if (imageFile) formData.append("image", imageFile)


  showProductLoading();

  const url = editingProductId
    ? `/products/updateProduct/${editingProductId}`
    : "/products/save";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { [csrf.header]: csrf.token },
      body: formData,
    });

    hideProductLoading();

    if (response.ok) {
      const action = editingProductId ? "updated" : "added";
      showToast(`Product ${action} successfully!`, "success");
      editingProductId = null;
      form.reset();
      closeProductModal();
      loadProducts();
    } else {
      showToast("Failed to save product!", "error");
    }
  } catch (error) {
    hideProductLoading();
    console.error("Error:", error);
    showToast("Something went wrong!", "error");
  }
}


// Delete functions
let productToDelete = null
let productImageId = null

function deleteProduct(id, imageId) {
  productToDelete = id
  productImageId = imageId
  deleteModal.classList.remove("hidden")
}

function closeDeleteModal() {
  deleteModal.classList.add("hidden")
  productToDelete = null
}

function confirmDeleteProduct() {

  const csrf = getCsrfData(); // Get CSRF token and header
  if (!csrf.token || !csrf.header) {
       console.error("CSRF token or header not found."); 
       alert("Security error: CSRF token missing. Please refresh the page.");
       return; // Stop execution if CSRF data is missing
  }

  const headers = {
       "Content-Type": "application/json",
       [csrf.header]: csrf.token, 
  };

  if (productToDelete) {
    showDeleteLoading()
    fetch(`/products/delete`, {
      method: "DELETE",
      headers: headers,
      body: JSON.stringify({
        id: productToDelete,
        imageId: productImageId,
      }),
    })
      .then((response) => {
        if (response.ok) {
          // Remove from frontend list
          products = products.filter((p) => String(p.id) !== String(productToDelete))
          saveProducts()
          renderProducts()
          showToast("Product deleted successfully!", "success")
        } else {
          showToast("Failed to delete product!", "error")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        showToast("Something went wrong!", "error")
      })
      .finally(() => {
        hideDeleteLoading()
        closeDeleteModal()
      })
  } else {
    closeDeleteModal()
  }
}

// Loading states
function showProductLoading() {
  const btn = document.getElementById("submitProductBtn")
  btn.disabled = true
  document.getElementById("submitProductText").classList.add("hidden")
  document.getElementById("submitProductSpinner").classList.remove("hidden")
}

function hideProductLoading() {
  const btn = document.getElementById("submitProductBtn")
  btn.disabled = false
  document.getElementById("submitProductText").classList.remove("hidden")
  document.getElementById("submitProductSpinner").classList.add("hidden")
}

function showDeleteLoading() {
  const btn = document.getElementById("confirmDelete")
  btn.disabled = true
  document.getElementById("deleteProductText").classList.add("hidden")
  document.getElementById("deleteProductSpinner").classList.remove("hidden")
}

function hideDeleteLoading() {
  const btn = document.getElementById("confirmDelete")
  btn.disabled = false
  document.getElementById("deleteProductText").classList.remove("hidden")
  document.getElementById("deleteProductSpinner").classList.add("hidden")
}

// Load products from API
async function loadProducts() {
  try {
    const response = await fetch("/products/getAllProduct")
    if (response.ok) {
      products = await response.json()
      saveProducts()
      renderProducts()
    } else {
      console.error("Failed to load products")
      showToast("Failed to load products", "error")
    }
  } catch (error) {
    console.error("Error loading products:", error)
    showToast("Error loading products", "error")
  }
}

// Event listeners setup
function setupEventListeners() {
  addProductBtn.addEventListener("click", openAddModal)
  closeModal.addEventListener("click", closeProductModal)
  cancelBtn.addEventListener("click", closeProductModal)
  productForm.addEventListener("submit", handleFormSubmit)
  cancelDelete.addEventListener("click", closeDeleteModal)
  confirmDelete.addEventListener("click", confirmDeleteProduct)

  // Close modal when clicking outside
  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeProductModal()
  })

  deleteModal.addEventListener("click", (e) => {
    if (e.target === deleteModal) closeDeleteModal()
  })
}

// Make functions globally available
window.openAddModal = openAddModal
window.editProduct = editProduct
window.deleteProduct = deleteProduct

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeProductModal()
    closeDeleteModal()
  }
})

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  loadProducts()
  setupEventListeners()
})
