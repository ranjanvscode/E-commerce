export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function getCsrfData() {
  const csrfToken = document
    .querySelector('meta[name="_csrf"]')
    ?.getAttribute("content");
  const csrfHeader = document
    .querySelector('meta[name="_csrf_header"]')
    ?.getAttribute("content");
  return { token: csrfToken, header: csrfHeader };
}

export function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = "";

  for (let i = 0; i < fullStars; i += 1) {
    stars += '<i class="fas fa-star"></i>';
  }

  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i += 1) {
    stars += '<i class="far fa-star"></i>';
  }

  return stars;
}
