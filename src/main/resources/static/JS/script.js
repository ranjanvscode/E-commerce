import { state } from "./modules/state.js";
import { renderProducts } from "./modules/product-render.js";
import { setupSearch } from "./modules/search.js";
import { setupFilters } from "./modules/filters.js";
import { setupProductModal, openProductModal } from "./modules/product-modal.js";
import { setupAuthModals, setupSignupHandler } from "./modules/auth-modal.js";
import { setupCartSidebar, updateCartUI } from "./modules/cart-ui.js";
import { addToCart, removeFromCart, updateCartQuantity } from "./modules/cart-api.js";
import { setupCheckoutModal } from "./modules/checkout.js";
import { setupNotificationsAndAux } from "./modules/notifications-and-init.js";

function init() {
  setupSearch();
  setupFilters();
  setupProductModal();
  setupAuthModals();
  setupSignupHandler();
  setupNotificationsAndAux();
}

function runAfterLogin() {
  setupCartSidebar();
  setupCheckoutModal();
  updateCartUI();
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.openProductModal = openProductModal;

document.addEventListener("DOMContentLoaded", () => {
  fetch("/products/getAllProduct")
    .then((response) => response.json())
    .then((products) => {
      state.allProducts = [...products];
      state.filteredProducts = [...products];
      renderProducts();
      init();
      if (typeof isAuthenticated !== "undefined" && isAuthenticated) {
        console.log("use authenticated");
        return fetch("/cart/getAllCartItems");
      }
      console.log("user not authenticated");
      return null;
    })
    .then((response) => response?.json())
    .then((cartItems) => {
      if (!cartItems) return;
      state.cart = cartItems.map((item) => {
        const fullProduct = state.allProducts.find((p) => p.id === item.product.id);
        if (fullProduct) {
          item.product.discountPrice = fullProduct.discountPrice;
          item.product.price = fullProduct.price;
        }
        return item;
      });
      console.log("Run after login")
      runAfterLogin();
    })
    .catch((error) => {
      console.error("Error loading products or cart:", error);
    });
});
