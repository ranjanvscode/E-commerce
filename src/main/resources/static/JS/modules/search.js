import { filterProducts } from "./filters.js";

export function setupSearch() {
  const searchInputs = [
    document.getElementById("searchInput"),
    document.getElementById("mobileSearchInput"),
  ];

  searchInputs.forEach((input) => {
    input?.addEventListener("input", () => {
      filterProducts();
    });
  });
}
