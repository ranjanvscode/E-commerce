import { state } from "./state.js";
import { renderProducts } from "./product-render.js";

export function setupFilters() {
  const categoryFilter = document.getElementById("categoryFilter");
  const priceFilter = document.getElementById("priceFilter");
  const sortFilter = document.getElementById("sortFilter");

  [categoryFilter, priceFilter, sortFilter].forEach((filter) => {
    filter?.addEventListener("change", filterProducts);
  });
}

export function filterProducts() {
  const searchQuery =
    document.getElementById("searchInput")?.value.toLowerCase() ||
    document.getElementById("mobileSearchInput")?.value.toLowerCase() ||
    "";
  const category = document.getElementById("categoryFilter")?.value || "";
  const priceRange = document.getElementById("priceFilter")?.value || "";
  const sortBy = document.getElementById("sortFilter")?.value || "name";

  state.filteredProducts = state.allProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery);
    const matchesCategory = !category || product.category === category;

    let matchesPrice = true;
    if (priceRange) {
      const [min, max] = priceRange.split("-").map((p) => p.replace("+", ""));
      if (max) {
        matchesPrice = product.price >= parseInt(min, 10) && product.price <= parseInt(max, 10);
      } else {
        matchesPrice = product.price >= parseInt(min, 10);
      }
    }

    return matchesSearch && matchesCategory && matchesPrice;
  });

  switch (sortBy) {
    case "price-low":
      state.filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      state.filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      state.filteredProducts.sort((a, b) => b.rating - a.rating);
      break;
    case "name":
    default:
      state.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  renderProducts();
}
