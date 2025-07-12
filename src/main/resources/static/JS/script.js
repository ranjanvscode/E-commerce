// Global variables
let cart = [];
let filteredProducts = [];
let allProducts = [];
let currentProduct = null;
let receiptId = null;
let paymentMethod = null;
let totalAmount = null;
let shippingFee = 0;

// DOM elements
const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const emptyCart = document.getElementById("emptyCart");
const cartFooter = document.getElementById("cartFooter");
const noResults = document.getElementById("noResults");

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function renderProducts(productsToRender = filteredProducts) {
  // Handle empty state
  if (!productsToRender.length) {
    productGrid.classList.add("hidden");  
    noResults.classList.remove("hidden");
    return;
  }

  productGrid.classList.remove("hidden");
  noResults.classList.add("hidden");

  // Helper: Render discount badge
  const renderDiscountBadge = (discount) =>
    discount > 0
      ? `<div class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
            ${discount}%
        </div>`
      : "";

  // Helper: Render stock status
  const renderStockStatus = (inStock) =>
    !inStock
      ? `<div class="absolute top-3 right-3 bg-gray-800 text-white px-2 py-1 rounded-md text-sm font-semibold">
            Out of Stock
        </div>`
      : "";

  // Helper: Render rating
  const renderRating = (rating) =>
    `<div class="absolute top-60 right-4">
        <div class="bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-sm font-semibold flex items-center">
            <i class="fas fa-star text-yellow-400 mr-1"></i>
            ${rating}
        </div>
    </div>`;

  // Helper: Render pricing
  const renderPricing = (product) => {
    if (product.discount > 0) {
      return `
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold text-green-600">${formatCurrency(product.discountPrice.toFixed(2))}</span>
          <span class="text-lg text-gray-500 line-through">${formatCurrency(product.price.toFixed(2))}</span>
          <span class="text-sm text-green-600 font-semibold">Save ${formatCurrency((product.price - product.discountPrice).toFixed(2))}</span>
        </div>
      `;
    }
    return `
      <div class="flex items-center">
        <span class="text-2xl font-bold text-gray-800 dark:text-gray-300">${formatCurrency(product.price.toFixed(2))}</span>
      </div>
    `;
  };

  // Helper: Render Add to Cart or Out of Stock button
  const renderCartButton = (product) =>
    product.inStock
      ? `<div class="flex items-center gap-2">
            <button onclick="addToCart('${product.id}')" 
                class="flex-1 bg-primary2 text-white py-2 px-4 rounded-md hover:bg-secondary dark:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2">
                <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                Add to Cart
            </button>
        </div>`
      : `<button disabled class="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed">
            Out of Stock
        </button>`;

  // Render all products
  productGrid.innerHTML = productsToRender
    .map((product) => {
      return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div class="relative">
            <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover cursor-pointer" onclick="openProductModal('${product.id}')">
            ${renderDiscountBadge(product.discount)}
            ${renderStockStatus(product.inStock)}
            ${renderRating(product.rating)}
          </div>
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-2 cursor-pointer hover:text-primary-600 transition-colors" onclick="openProductModal('${product.id}')">${product.name}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">${product.description.substring(0, 80)}...</p>
            <div class="mb-4">
              ${renderPricing(product)}
            </div>
            ${renderCartButton(product)}
          </div>
        </div>
      `;
    })
    .join("");
}

// Search functionality
function setupSearch() {
  const searchInputs = [
    document.getElementById("searchInput"),
    document.getElementById("mobileSearchInput"),
  ];

  searchInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      filterProducts();
    });
  });
}

// Filter functionality
function setupFilters() {
  const categoryFilter = document.getElementById("categoryFilter");
  const priceFilter = document.getElementById("priceFilter");
  const sortFilter = document.getElementById("sortFilter");

  [categoryFilter, priceFilter, sortFilter].forEach((filter) => {
    filter.addEventListener("change", filterProducts);
  });
}

function filterProducts() {
  const searchQuery =
    document.getElementById("searchInput").value.toLowerCase() ||
    document.getElementById("mobileSearchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const priceRange = document.getElementById("priceFilter").value;
  const sortBy = document.getElementById("sortFilter").value;

  filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery);
    const matchesCategory = !category || product.category === category;

    let matchesPrice = true;
    if (priceRange) {
      const [min, max] = priceRange.split("-").map((p) => p.replace("+", ""));
      if (max) {
        matchesPrice =
          product.price >= parseInt(min) && product.price <= parseInt(max);
      } else {
        matchesPrice = product.price >= parseInt(min);
      }
    }

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort products
  switch (sortBy) {
    case "price-low":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filteredProducts.sort((a, b) => b.rating - a.rating);
      break;
    case "name":
    default:
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  renderProducts();
}

function getCsrfData() {
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
    return { token: csrfToken, header: csrfHeader };
}

//cart functionality
function addToCart(productId, quantity = 1) {
  if (!isAuthenticated) {
    loginModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    return;
  }

  const existingItemIndex = cart.findIndex(
    (item) => String(item.product.id) === String(productId)
  );

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += quantity;
    updateCartUI();
    updateCartQuantity(productId, cart[existingItemIndex].quantity);
  } else {

  const csrf = getCsrfData(); // Get CSRF token and header
  if (!csrf.token || !csrf.header) {
       console.error("CSRF token or header not found.");
       alert("Security error: CSRF token missing. Please refresh the page.");
       return; // Stop execution if CSRF data is missing
  }

  const headers = {
       "Content-Type": "application/json",
       [csrf.header]: csrf.token, // Add the CSRF header and token
  };

    const product = allProducts.find((p) => String(p.id) === String(productId));
    const cartData = {
      productId,
      quantity,
    };

    fetch("/cart/SaveCart", {
      method: "POST",
      headers:headers,
      body: JSON.stringify(cartData),
    })
      .then((response) => {
        if (response.ok) {
          showNotification(`${product.name} added to cart!`);
        } else {
          throw new Error("Failed to save cart");
        }
      })
      .catch((error) => console.error("Error:", error));

    cart.push({ id: product.id, product, quantity });
    updateCartUI();
  }
}

function removeFromCart(productId) {
    const csrf = getCsrfData(); // Get CSRF token and header
  if (!csrf.token || !csrf.header) {
       console.error("CSRF token or header not found.");
       alert("Security error: CSRF token missing. Please refresh the page.");
       return; // Stop execution if CSRF data is missing
  }

  const headers = {
       "Content-Type": "application/json",
       [csrf.header]: csrf.token, // Add the CSRF header and token
  };

  cart = cart.filter((item) => String(item.product.id) !== String(productId));

  fetch(`/cart/removeCartItem/${productId}`, {
    method: "DELETE",
    headers:headers,
  })
    .then((response) => {
      return;
    })
    .then((message) => {
      // showNotification(message);
    })
    .catch((error) => {
      console.error("Error removing cart item:", error);
      showNotification("Failed to remove item from cart");
    });

  updateCartUI();
}

function updateCartQuantity(productId, quantity) {

  const csrf = getCsrfData(); // Get CSRF token and header
  if (!csrf.token || !csrf.header) {
       console.error("CSRF token or header not found.");
       alert("Security error: CSRF token missing. Please refresh the page.");
       return; // Stop execution if CSRF data is missing
  }

  const headers = {
       "Content-Type": "application/json",
       [csrf.header]: csrf.token, // Add the CSRF header and token
  };

  const item = cart.find(
    (item) => String(item.product.id) === String(productId)
  );
  if (item) {
    item.quantity = Math.max(1, quantity);
    updateCartUI();

    const cartData = {
      productId: productId,
      quantity: quantity,
    };

    fetch("/cart/updateCartQuantity", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(cartData),
    })
      .then((response) => {
        if (response.ok) {
          // showNotification(`${product.name} added to cart!`);
          return;
        }
        throw new Error("Failed to save cart");
      })
      .then((data) => {
        // showNotification(`${product.name} added to cart!`);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}


function updateCartUI() {
  // Calculate total items and price
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const price =
      item.product?.discountPrice > 0
        ? item.product.discountPrice
        : item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  // Update cart summary UI
  cartCount.textContent = totalItems;
  cartTotal.textContent = formatCurrency(totalPrice.toFixed(2));
  document.getElementById("subtotalAmount").textContent = formatCurrency(totalPrice.toFixed(2));
  document.getElementById("shippingAmount").textContent = shippingFee;
  document.getElementById("checkoutTotal").textContent = formatCurrency((totalPrice + shippingFee).toFixed(2));

  // Handle empty cart UI
  if (cart.length === 0) {
    emptyCart.classList.remove("hidden");
    cartFooter.classList.add("hidden");
    cartItems.innerHTML =
      `<div id="emptyCart" class="text-center py-12">
        <i class="fas fa-shopping-cart text-6xl text-gray-400 mb-4"></i>
        <p class="text-gray-500 dark:text-gray-400">Your cart is empty</p>
      </div>`;
    return;
  }

  // Show cart items and footer
  emptyCart.classList.add("hidden");
  cartFooter.classList.remove("hidden");

  // Render each cart item
  cartItems.innerHTML = cart.map(item => {
    const { id, name, imageId, image, discountPrice, price } = item.product;
    const displayPrice = discountPrice > 0 ? discountPrice : price;
    return `
      <div class="flex items-center space-x-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <img src="${imageId || image}" alt="${name}" class="w-16 h-16 object-cover rounded">
        <div class="flex-1">
          <h4 class="font-semibold">${name}</h4>
          <p class="text-primary-600 font-bold">${formatCurrency(displayPrice)}</p>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="updateCartQuantity('${id}', ${item.quantity - 1})"
            class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">-</button>
          <span class="w-8 text-center">${item.quantity}</span>
          <button onclick="updateCartQuantity('${id}', ${item.quantity + 1})"
            class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">+</button>
        </div>
        <button onclick="removeFromCart('${id}')" class="text-red-500 hover:text-red-700 transition-colors">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }).join("");
}

// Cart sidebar toggle
function setupCartSidebar() {
  const cartToggle = document.getElementById("cartToggle");
  const closeCart = document.getElementById("closeCart");

  cartToggle.addEventListener("click", () => {
    cartSidebar.classList.remove("translate-x-full");
    cartOverlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  closeCart.addEventListener("click", closeCartSidebar);
  cartOverlay.addEventListener("click", closeCartSidebar);
}

function closeCartSidebar() {
  cartSidebar.classList.add("translate-x-full");
  cartOverlay.classList.add("hidden");
  document.body.style.overflow = "auto";
}

// Product modal
function openProductModal(productId) {
  currentProduct = allProducts.find((p) => String(p.id) === String(productId));

  const modal = document.getElementById("productModal");

  document.getElementById("modalTitle").textContent = currentProduct.name;
  document.getElementById("modalImage").src = currentProduct.image;
  document.getElementById("modalImage").alt = currentProduct.name;
  document.getElementById("modalPrice").textContent = `${formatCurrency(currentProduct.discountPrice > 0 ? currentProduct.discountPrice : currentProduct.price)}`;
  document.getElementById("modalDescription").textContent = currentProduct.description;
  document.getElementById("modalRating").innerHTML = generateStars(currentProduct.rating);
  document.getElementById("modalRatingText").textContent = `(${currentProduct.rating}/5)`;
  document.getElementById("modalQuantity").value = 1;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function setupProductModal() {
  const modal = document.getElementById("productModal");
  const closeModal = document.getElementById("closeModal");
  const modalAddToCart = document.getElementById("modalAddToCart");
  const decreaseQty = document.getElementById("decreaseQty");
  const increaseQty = document.getElementById("increaseQty");
  const modalQuantity = document.getElementById("modalQuantity");

  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  });

  modalAddToCart.addEventListener("click", () => {
    const quantity = parseInt(modalQuantity.value);
    addToCart(currentProduct.id, quantity);
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  decreaseQty.addEventListener("click", () => {
    const current = parseInt(modalQuantity.value);
    if (current > 1) {
      modalQuantity.value = current - 1;
    }
  });

  increaseQty.addEventListener("click", () => {
    const current = parseInt(modalQuantity.value);
    modalQuantity.value = current + 1;
  });
}

// Authentication modals
function setupAuthModals() {
  const loginBtn = document.getElementById("loginBtn");
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");
  const closeLoginModal = document.getElementById("closeLoginModal");
  const closeSignupModal = document.getElementById("closeSignupModal");
  const showSignup = document.getElementById("showSignup");
  const showLogin = document.getElementById("showLogin");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  loginBtn.addEventListener("click", () => {
    loginModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  closeLoginModal.addEventListener("click", () => {
    loginModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  closeSignupModal.addEventListener("click", () => {
    signupModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  showSignup.addEventListener("click", () => {
    loginModal.classList.add("hidden");
    signupModal.classList.remove("hidden");
  });

  showLogin.addEventListener("click", () => {
    signupModal.classList.add("hidden");
    loginModal.classList.remove("hidden");
  });

  loginForm.addEventListener("submit", (e) => {
    // e.preventDefault();
    loginModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  signupForm.addEventListener("submit", (e) => {
    signupModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  });
}


//Sign Up Function
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();

  const csrf = getCsrfData(); // Get CSRF token and header
  if (!csrf.token || !csrf.header) {
       console.error("CSRF token or header not found.");
       alert("Security error: CSRF token missing. Please refresh the page.");
       return; // Stop execution if CSRF data is missing
  }

  const headers = {
       "Content-Type": "application/json",
       [csrf.header]: csrf.token, // Add the CSRF header and token
  };

    // Collect form data
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Prepare payload
    const payload = { name, email, password };

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            showNotification(data.message);
        } else {
          showNotification(data.message,'error');
        }
    } catch (err) {
      showNotification('An error occurred. Please try again.','error');
      throw err;
    }
});

//Checkout modal setup
function setupCheckoutModal() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  const checkoutModal = document.getElementById("checkoutModal");
  const closeCheckoutModal = document.getElementById("closeCheckoutModal");
  const checkoutForm = document.getElementById("checkoutForm");
  const placeOrderBtn = document.getElementById("placeOrderBtn");

  function showCheckoutSpinner() {
    document.getElementById('checkoutSpinnerOverlay').classList.remove('hidden');
  }
  function hideCheckoutSpinner() {
    document.getElementById('checkoutSpinnerOverlay').classList.add('hidden');
  }

  // Open checkout modal
  checkoutBtn.addEventListener("click", () => {
    checkoutModal.classList.remove("hidden");
    closeCartSidebar();
    document.body.style.overflow = "hidden";
  });

  // Close checkout modal
  closeCheckoutModal.addEventListener("click", () => {
    checkoutModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  // Handle checkout form submission
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate city is filled (auto-filled by pin code)
    const city = document.getElementById("addCity").value.trim();
    if (!city) {
      showNotification("Please wait for city to be filled before checkout.", "error");
      return;
    }

    placeOrderBtn.innerText = "Processing...";
    showCheckoutSpinner();

    // Calculate total amount
    totalAmount = cart.reduce((sum, item) => {
      const price = item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    // Generate receipt ID
    await fetchReceiptId();

    paymentMethod = document.getElementById("paymentMethod").value;

    // Payment flow
    if (paymentMethod === "prepaid") {
      loadRazorpayScript(() => {
        rzpCheckout();
        hideCheckoutSpinner();
        placeOrderBtn.innerText = "Place Order";
      });
    } else {
      await SaveOrderData();
      hideCheckoutSpinner();
      placeOrderBtn.innerText = "Place Order";
    }
  });
}


//Payment System
// Load Razorpay script dynamically
function loadRazorpayScript(callback) {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
            console.log("Razorpay script loaded.");
            callback(); // call your payment logic after loading
        };
        script.onerror = () => {
            alert("Failed to load Razorpay script. Please try again.");
        };
        document.body.appendChild(script);
    } else {
        callback(); // If already loaded
    }
}

// Razorpay Checkout Handler
function rzpCheckout() {

  const csrf = getCsrfData(); // Get CSRF token and header
  if (!csrf.token || !csrf.header) {
       console.error("CSRF token or header not found.");
       alert("Security error: CSRF token missing. Please refresh the page.");
       return; // Stop execution if CSRF data is missing
  }

  const headers = {
       "Content-Type": "application/json",
       [csrf.header]: csrf.token, // Add the CSRF header and token
  };

  const amount = parseFloat(totalAmount + shippingFee).toFixed(2);

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount greater than 0");
    return;
  }

  // Fetch order from backend
  fetch(`/payment/createOrder?amount=${amount}&receipt=${receiptId}`, {
    method: "POST",
    headers: headers,
  })
    .then((response) => response.json())
    .then((order) => {
      if (order.error) {
        alert("Error: " + order.error);
        return;
      }

      openRazorpay(order);
    })
    .catch((err) => {
      alert("Failed to initiate payment. Please try again.");
      console.error("Order creation error:", err);
    });
}

// Open Razorpay Payment Modal
function openRazorpay(order) {
  const name = document.getElementById("addName").value;
  const phoneNo = document.getElementById("addPhoneNo").value;

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: "RMR",
    description: "Payment for your order",
    image: "",
    order_id: order.id,
    handler: verifySignature,
    prefill: {
      name: name,
      email: "",
      contact: phoneNo,
    },
    notes: {
      receipt_id: "Receipt id in note",
    },
    theme: {
      color: "#3399cc",
    },
  };

  const rzp1 = new Razorpay(options);

  rzp1.on("payment.failed", handlePaymentFailure);

  rzp1.open();
}

// Handle Payment Failure
function handlePaymentFailure(response) {
    const csrf = getCsrfData(); // Get CSRF token and header
  if (!csrf.token || !csrf.header) {
       console.error("CSRF token or header not found.");
       alert("Security error: CSRF token missing. Please refresh the page.");
       return; // Stop execution if CSRF data is missing
  }

  const headers = {
       "Content-Type": "application/json",
       [csrf.header]: csrf.token, // Add the CSRF header and token
  };

  alert("FAILED: " + response.error.description);

  fetch("/payment/failure", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      razorpay_order_id: response.error.metadata.order_id,
      razorpay_payment_id: response.error.metadata.payment_id,
      reason: response.error.reason,
      code: response.error.code,
      description: response.error.description,
      source: response.error.source,
      step: response.error.step,
    }),
  })
    .then((res) => res.text())
    .then((data) => console.log("Failure saved:", data))
    .catch((err) => console.error("Failure save error:", err));
}

// Verify Payment Signature
function verifySignature(response) {

      const csrf = getCsrfData(); // Get CSRF token and header
  if (!csrf.token || !csrf.header) {
       console.error("CSRF token or header not found.");
       alert("Security error: CSRF token missing. Please refresh the page.");
       return; // Stop execution if CSRF data is missing
  }

  const headers = {
       "Content-Type": "application/json",
       [csrf.header]: csrf.token, // Add the CSRF header and token
  };

  fetch("/payment/verifySignature", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }),
  })
    .then((res) => res.text())
    .then((data) => {

      if (data === "Payment Verified") {
        SaveOrderData();
      } else {
        showNotification("Signature mismatch. Possible fraud.","error");
      }
    })
    .catch((err) => {
      console.error("Verification Error:", err);
      alert("Something went wrong while verifying the payment.");
    });
}

//Save order data in DB
async function SaveOrderData() {

  const csrf = getCsrfData(); // Get CSRF token and header
  if (!csrf.token || !csrf.header) {
       console.error("CSRF token or header not found.");
       alert("Security error: CSRF token missing. Please refresh the page.");
       return; // Stop execution if CSRF data is missing
  }

  const headers = {
       "Content-Type": "application/json",
       [csrf.header]: csrf.token, // Add the CSRF header and token
  };

  // 1. Get address details from the form
  const shipping = {
    name: document.getElementById("addName").value,
    phoneNo: document.getElementById("addPhoneNo").value,
    address: document.getElementById("addAddress").value,
    city: document.getElementById("addCity").value,
    state: document.getElementById("addState").value,
    zipCode: document.getElementById("addPostalCode").value,
  };

  // 2. Convert cart items into OrderItemRequest format
  const items = cart.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    price:
      item.product?.discountPrice > 0
        ? item.product.discountPrice
        : item.product?.price || 0,
  }));

  // 3. Prepare full order payload
  const orderData = {
    receiptId: receiptId,
    paymentMethod: paymentMethod,
    shipping: shipping,
    items: items,
  };

  try {
    const response = await fetch("/user/placeOrder", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      //Remove all item from cart after order placed
      removeAllCartItem();

      // Show ThankU Message
      setTimeout(() => {
        showModal();//Thanku message modal
        document.getElementById("placeOrderBtn").innerText = "Place Order";
      }, 200);

      checkoutModal.classList.add("hidden");
      document.body.style.overflow = "auto";
      cart = [];
      updateCartUI();
    } else {
      const err = await response.text();
      alert("Order failed: " + err);
    }
  } catch (error) {
    console.error("Error placing order:", error);
    alert("Order failed due to a network error.");
  }
}

//Remove all cart item of user after placing order
function removeAllCartItem() {

    const csrf = getCsrfData(); // Get CSRF token and header
  if (!csrf.token || !csrf.header) {
       console.error("CSRF token or header not found.");
       alert("Security error: CSRF token missing. Please refresh the page.");
       return; // Stop execution if CSRF data is missing
  }

  const headers = {
       "Content-Type": "application/json",
       [csrf.header]: csrf.token, // Add the CSRF header and token
  };

  fetch("/cart/removeAllCartItem", {
    method: "DELETE",
    headers: headers,
  })
    .then((response) => {
      return;
    })
    .then((message) => {
      // showNotification(message);
    })
    .catch((error) => {
      console.error("Error removing cart item:", error);
    });
}

// Utility functions
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = "";

  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }

  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }

  return stars;
}

//Generate order Id
async function fetchReceiptId() {
  try {
    const response = await fetch("/payment/generateReceipt");
    const data = await response.json();
    receiptId = data.receiptId;
  } catch (error) {
    console.error("Error fetching receipt ID:", error);
    receiptId = null;
  }
}

// Order place thank you message
//
const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");
const closeModalBtn = document.getElementById("closeModalBtn");
const trackOrderBtn = document.getElementById("trackOrderBtn");
const orderNumber = document.getElementById("orderNumber");
const thanksTotal = document.getElementById("thanksTotal");

// Show modal with animation
function showModal() {
  // Generate new order number
  orderNumber.textContent = receiptId;
  thanksTotal.textContent = formatCurrency(totalAmount + shippingFee);

  // Show overlay
  modalOverlay.classList.remove("hidden");
  modalOverlay.classList.add("flex", "animate-fade-in");

  // Prevent body scroll
  document.body.style.overflow = "hidden";

  // Add bounce animation to modal content
  modalContent.classList.add("animate-bounce-in");

  // Reset animations for repeated use
  setTimeout(() => {
    modalContent.classList.remove("animate-bounce-in");
  }, 600);
}

// Hide modal
function hideModal() {
  modalOverlay.classList.add("opacity-0");

  setTimeout(() => {
    modalOverlay.classList.add("hidden");
    modalOverlay.classList.remove("flex", "animate-fade-in", "opacity-0");
    document.body.style.overflow = "auto";
  }, 300);
}

closeModalBtn.addEventListener("click", hideModal);

trackOrderBtn.addEventListener("click", () => {
  alert("Redirecting to order tracking page...");
  hideModal();
});

// Close modal when clicking outside
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    hideModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalOverlay.classList.contains("hidden")) {
    hideModal();
  }
});
// close thanku message

function showNotification(message, type = "success") {
  const notification = document.createElement("div");

  // Common styles
  notification.className =
    "fixed left-1/2 top-2 transform -translate-x-1/2 translate-y-[-100%] transition-transform duration-300 px-6 py-3 rounded-lg shadow-lg z-50 text-white text-center w-full max-w-md";

  // Dynamic background based on type
  notification.classList.add(type === "error" ? "bg-red-500" : "bg-green-500");
  notification.textContent = message;

  // Add to body
  document.body.appendChild(notification);

  // Slide in after slight delay
  setTimeout(() => {
    notification.style.transform = "translate(-50%, 0)";
  }, 200);

  // Slide out and remove after 2.5 seconds
  setTimeout(() => {
    notification.style.transform = "translate(-50%, -100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2500);
}


//Fetch State and district name by pin code
document.getElementById("addPostalCode").addEventListener("blur", function () {
  const pin = this.value.trim();

  // Validate 6-digit PIN
  if (!/^\d{6}$/.test(pin)) {
    alert("Please enter a valid 6-digit PIN code.");
    return;
  }

  fetch(`https://api.postalpincode.in/pincode/${pin}`)
    .then((response) => response.json())
    .then((data) => {
      if (data[0].Status === "Success" && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        document.getElementById("addCity").value = postOffice.District;
        document.getElementById("addState").value = postOffice.State;
      } else {
        alert("Invalid PIN code or not found.");
        document.getElementById("addCity").value = "";
        document.getElementById("addState").value = "";
      }
    })
    .catch((error) => {
      console.error("Error fetching location:", error);
      alert("Something went wrong while fetching location.");
    });
}); //close

 window.addEventListener('DOMContentLoaded', () => {

     const urlParams = new URLSearchParams(window.location.search);

      // LOGIN MODAL HANDLING
      if (urlParams.has('loginError')) {
          let errorMsg = decodeURIComponent(urlParams.get("loginError"));
          showNotification(errorMsg,"error");
      }

      if(urlParams.has('logout')){
        let message = decodeURIComponent(urlParams.get("logout"));
        showNotification(message,"success");
      }
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
});


// Initialize the application
function init() { 
  setupSearch();
  setupFilters();
  setupProductModal();
  setupAuthModals();
}

function runAfterLogin() {
  setupCartSidebar();
  setupCheckoutModal();
  updateCartUI();
}


document.addEventListener("DOMContentLoaded", () => {
  fetch("/products/getAllProduct")
    .then((response) => response.json())
    .then((products) => {
      allProducts = [...products];
      filteredProducts = [...products];
      console.log("Products loaded:", allProducts);
      renderProducts();
      init();

        // Load cart item if user is logged In and after product is loaded
        if (typeof isAuthenticated !== "undefined" && isAuthenticated) {
          return fetch("/cart/getAllCartItems");
        }
    }).then((response) => response?.json())
      .then((cartItems) => {
       if (cartItems) {
          cart = [...cartItems];

          cart = cartItems.map((item) => {
          const fullProduct = allProducts.find((p) => p.id === item.product.id);
          if (fullProduct) {
            item.product.discountPrice = fullProduct.discountPrice;
            item.product.price = fullProduct.price; // optional
          }
          return item;
        });
        runAfterLogin();
      }
    })
    .catch((error) => {
      console.error("Error loading products or cart:", error);
    });
}); 
