import { state } from "./state.js";
import { formatCurrency, generateStars } from "./utils.js";
import { addToCart } from "./cart-api.js";

export function openProductModal(productId) {
  state.currentProduct = state.allProducts.find((p) => String(p.id) === String(productId));
  const modal = document.getElementById("productModal");
  document.getElementById("modalTitle").textContent = state.currentProduct.name;
  document.getElementById("modalImage").src = state.currentProduct.image;
  document.getElementById("modalImage").alt = state.currentProduct.name;
  document.getElementById("modalPrice").textContent = formatCurrency(
    state.currentProduct.discountPrice > 0 ? state.currentProduct.discountPrice : state.currentProduct.price
  );
  document.getElementById("modalDescription").textContent = state.currentProduct.description;
  document.getElementById("modalRating").innerHTML = generateStars(state.currentProduct.rating);
  document.getElementById("modalRatingText").textContent = `(${state.currentProduct.rating}/5)`;
  document.getElementById("modalQuantity").value = 1;
  modal?.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

export function setupProductModal() {
  const modal = document.getElementById("productModal");
  const closeModal = document.getElementById("closeModal");
  const modalAddToCart = document.getElementById("modalAddToCart");
  const decreaseQty = document.getElementById("decreaseQty");
  const increaseQty = document.getElementById("increaseQty");
  const modalQuantity = document.getElementById("modalQuantity");

  closeModal?.addEventListener("click", () => {
    modal?.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  });

  modalAddToCart?.addEventListener("click", () => {
    const quantity = parseInt(modalQuantity.value, 10);
    addToCart(state.currentProduct.id, quantity);
    modal?.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  decreaseQty?.addEventListener("click", () => {
    const current = parseInt(modalQuantity.value, 10);
    if (current > 1) {
      modalQuantity.value = String(current - 1);
    }
  });

  increaseQty?.addEventListener("click", () => {
    const current = parseInt(modalQuantity.value, 10);
    modalQuantity.value = String(current + 1);
  });
}
