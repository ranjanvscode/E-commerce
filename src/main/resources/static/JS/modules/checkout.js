import { state } from "./state.js";
import { closeCartSidebar, updateCartUI } from "./cart-ui.js";
import { removeAllCartItem } from "./cart-api.js";
import { showModal, showNotification } from "./notifications-and-init.js";
import { loadRazorpayScript, rzpCheckout, configurePayment } from "./payment.js";
import { getSecureJsonHeaders, requestJson } from "./api.js";

export async function fetchReceiptId() {
  try {
    const headers = getSecureJsonHeaders();
    if (!headers) return;
    const data = await requestJson(
      "/payment/generateReceipt",
      { method: "POST", headers },
      "Could not initialize checkout."
    );
    state.receiptId = data.receiptId;
  } catch (error) {
    console.error("Error fetching receipt ID:", error);
    state.receiptId = null;
    showNotification("Could not initialize checkout. Please try again.", "error");
  }
}

export async function saveOrderData() {
  const headers = getSecureJsonHeaders();
  if (!headers) return;

  const shipping = {
    name: document.getElementById("addName").value,
    phoneNo: document.getElementById("addPhoneNo").value,
    address: document.getElementById("addAddress").value,
    city: document.getElementById("addCity").value,
    state: document.getElementById("addState").value,
    zipCode: document.getElementById("addPostalCode").value,
  };

  const orderData = {
    receiptId: state.receiptId,
    paymentMethod: state.paymentMethod,
    shipping,
  };

  try {
    const response = await fetch("/user/placeOrder", {
      method: "POST",
      headers,
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      removeAllCartItem();
      setTimeout(() => {
        showModal();
        const placeOrderBtn = document.getElementById("placeOrderBtn");
        if (placeOrderBtn) placeOrderBtn.innerText = "Place Order";
      }, 200);

      const checkoutModal = document.getElementById("checkoutModal");
      checkoutModal?.classList.add("hidden");
      document.body.style.overflow = "auto";
      state.cart = [];
      updateCartUI();
    } else {
      const err = await response.text();
      showNotification(`Order failed: ${err}`, "error");
    }
  } catch (error) {
    console.error("Error placing order:", error);
    showNotification("Order failed due to a network error.", "error");
  }
}

export function setupCheckoutModal() {
  configurePayment({ saveOrderData });

  const checkoutBtn = document.getElementById("checkoutBtn");
  const checkoutModal = document.getElementById("checkoutModal");
  const closeCheckoutModal = document.getElementById("closeCheckoutModal");
  const checkoutForm = document.getElementById("checkoutForm");
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  const spinner = document.getElementById("checkoutSpinnerOverlay");

  function showCheckoutSpinner() {
    spinner?.classList.remove("hidden");
  }
  function hideCheckoutSpinner() {
    spinner?.classList.add("hidden");
  }

  checkoutBtn?.addEventListener("click", () => {
    checkoutModal?.classList.remove("hidden");
    closeCartSidebar();
    document.body.style.overflow = "hidden";
  });

  closeCheckoutModal?.addEventListener("click", () => {
    checkoutModal?.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  checkoutForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!state.cart.length) {
      showNotification("Your cart is empty.", "error");
      return;
    }

    const city = document.getElementById("addCity").value.trim();
    if (!city) {
      showNotification("Please wait for city to be filled before checkout.", "error");
      return;
    }

    if (placeOrderBtn) placeOrderBtn.innerText = "Processing...";
    showCheckoutSpinner();

    state.totalAmount = state.cart.reduce((sum, item) => {
      const price = item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    await fetchReceiptId();
    if (!state.receiptId) {
      hideCheckoutSpinner();
      if (placeOrderBtn) placeOrderBtn.innerText = "Place Order";
      return;
    }
    state.paymentMethod = document.getElementById("paymentMethod").value;

    if (state.paymentMethod === "prepaid") {
      loadRazorpayScript(() => {
        rzpCheckout();
        hideCheckoutSpinner();
        if (placeOrderBtn) placeOrderBtn.innerText = "Place Order";
      });
    } else {
      await saveOrderData();
      hideCheckoutSpinner();
      if (placeOrderBtn) placeOrderBtn.innerText = "Place Order";
    }
  });
}
