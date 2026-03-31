import { state } from "./state.js";
import { dom } from "./dom.js";
import { formatCurrency } from "./utils.js";

export function updateCartUI() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.cart.reduce((sum, item) => {
    const price =
      item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  if (dom.cartCount) dom.cartCount.textContent = totalItems;
  if (dom.cartTotal) dom.cartTotal.textContent = formatCurrency(totalPrice.toFixed(2));

  const subtotalAmount = document.getElementById("subtotalAmount");
  const shippingAmount = document.getElementById("shippingAmount");
  const checkoutTotal = document.getElementById("checkoutTotal");
  if (subtotalAmount) subtotalAmount.textContent = formatCurrency(totalPrice.toFixed(2));
  if (shippingAmount) shippingAmount.textContent = state.shippingFee;
  if (checkoutTotal) {
    checkoutTotal.textContent = formatCurrency((totalPrice + state.shippingFee).toFixed(2));
  }

  if (state.cart.length === 0) {
    dom.emptyCart?.classList.remove("hidden");
    dom.cartFooter?.classList.add("hidden");
    if (dom.cartItems) {
      dom.cartItems.innerHTML = `<div id="emptyCart" class="text-center py-12"><i class="fas fa-shopping-cart text-6xl text-gray-400 mb-4"></i><p class="text-gray-500 dark:text-gray-400">Your cart is empty</p></div>`;
    }
    return;
  }

  dom.emptyCart?.classList.add("hidden");
  dom.cartFooter?.classList.remove("hidden");

  if (dom.cartItems) {
    dom.cartItems.innerHTML = state.cart
      .map((item) => {
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
          <button onclick="updateCartQuantity('${id}', ${item.quantity - 1})" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">-</button>
          <span class="w-8 text-center">${item.quantity}</span>
          <button onclick="updateCartQuantity('${id}', ${item.quantity + 1})" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">+</button>
        </div>
        <button onclick="removeFromCart('${id}')" class="text-red-500 hover:text-red-700 transition-colors"><i class="fas fa-trash"></i></button>
      </div>
    `;
      })
      .join("");
  }
}

export function setupCartSidebar() {
  const cartToggle = document.getElementById("cartToggle");
  const closeCart = document.getElementById("closeCart");
  cartToggle?.addEventListener("click", () => {
    dom.cartSidebar?.classList.remove("translate-x-full");
    dom.cartOverlay?.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });
  closeCart?.addEventListener("click", closeCartSidebar);
  dom.cartOverlay?.addEventListener("click", closeCartSidebar);
}

export function closeCartSidebar() {
  dom.cartSidebar?.classList.add("translate-x-full");
  dom.cartOverlay?.classList.add("hidden");
  document.body.style.overflow = "auto";
}
