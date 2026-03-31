import { state } from "./state.js";
import { showNotification } from "./notifications-and-init.js";
import { updateCartUI } from "./cart-ui.js";
import { getSecureJsonHeaders, requestText } from "./api.js";

export function addToCart(productId, quantity = 1) {
  if (!isAuthenticated) {
    const loginModal = document.getElementById("loginModal");
    loginModal?.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    return;
  }

  const existingItemIndex = state.cart.findIndex(
    (item) => String(item.product.id) === String(productId)
  );

  if (existingItemIndex !== -1) {
    state.cart[existingItemIndex].quantity += quantity;
    updateCartUI();
    updateCartQuantity(productId, state.cart[existingItemIndex].quantity);
    return;
  }

  const headers = getSecureJsonHeaders();
  if (!headers) return;

  const product = state.allProducts.find((p) => String(p.id) === String(productId));
  if (!product) {
    showNotification("Product not found. Refresh and try again.", "error");
    return;
  }
  const cartData = { productId, quantity };

  state.cart.push({ id: product.id, product, quantity });
  updateCartUI();

  requestText(
    "/cart/SaveCart",
    { method: "POST", headers, body: JSON.stringify(cartData) },
    "Failed to save cart"
  )
    .then(() => {
      showNotification(`${product.name} added to cart!`);
    })
    .catch((error) => {
      console.error("Error:", error);
      // Roll back optimistic UI on server failure.
      state.cart = state.cart.filter((item) => String(item.product.id) !== String(productId));
      updateCartUI();
      showNotification("Could not add to cart. Try again.", "error");
    });
}

export function removeFromCart(productId) {
  const headers = getSecureJsonHeaders();
  if (!headers) return;

  const previousCart = [...state.cart];
  state.cart = state.cart.filter((item) => String(item.product.id) !== String(productId));
  updateCartUI();

  requestText(
    `/cart/removeCartItem/${productId}`,
    { method: "DELETE", headers },
    "Failed to remove item from cart"
  ).catch((error) => {
    console.error("Error removing cart item:", error);
    state.cart = previousCart;
    updateCartUI();
    showNotification("Failed to remove item from cart", "error");
  });
}

export function updateCartQuantity(productId, quantity) {
  const headers = getSecureJsonHeaders();
  if (!headers) return;

  const item = state.cart.find((cartItem) => String(cartItem.product.id) === String(productId));
  if (!item) return;

  const previousQuantity = item.quantity;
  item.quantity = Math.max(1, quantity);
  updateCartUI();

  const cartData = { productId, quantity: item.quantity };
  requestText(
    "/cart/updateCartQuantity",
    { method: "POST", headers, body: JSON.stringify(cartData) },
    "Failed to update quantity"
  ).catch((error) => {
    console.error("Error:", error);
    item.quantity = previousQuantity;
    updateCartUI();
    showNotification("Could not update quantity. Try again.", "error");
  });
}

export function removeAllCartItem() {
  const headers = getSecureJsonHeaders();
  if (!headers) return;

  requestText("/cart/removeAllCartItem", { method: "DELETE", headers }).catch((error) => {
    console.error("Error removing cart item:", error);
  });
}
