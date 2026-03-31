import { state } from "./state.js";
import { formatCurrency } from "./utils.js";

const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");
const closeModalBtn = document.getElementById("closeModalBtn");
const trackOrderBtn = document.getElementById("trackOrderBtn");
const orderNumber = document.getElementById("orderNumber");
const thanksTotal = document.getElementById("thanksTotal");

export function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className =
    "fixed left-1/2 top-2 transform -translate-x-1/2 translate-y-[-100%] transition-transform duration-300 px-6 py-3 rounded-lg shadow-lg z-50 text-white text-center w-full max-w-md";
  notification.classList.add(type === "error" ? "bg-red-500" : "bg-green-500");
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translate(-50%, 0)";
  }, 200);

  setTimeout(() => {
    notification.style.transform = "translate(-50%, -100%)";
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 2500);
}

export function showModal() {
  orderNumber.textContent = state.receiptId;
  thanksTotal.textContent = formatCurrency(state.totalAmount + state.shippingFee);
  modalOverlay.classList.remove("hidden");
  modalOverlay.classList.add("flex", "animate-fade-in");
  document.body.style.overflow = "hidden";
  modalContent.classList.add("animate-bounce-in");
  setTimeout(() => {
    modalContent.classList.remove("animate-bounce-in");
  }, 600);
}

export function hideModal() {
  modalOverlay.classList.add("opacity-0");
  setTimeout(() => {
    modalOverlay.classList.add("hidden");
    modalOverlay.classList.remove("flex", "animate-fade-in", "opacity-0");
    document.body.style.overflow = "auto";
  }, 300);
}

export function setupNotificationsAndAux() {
  closeModalBtn?.addEventListener("click", hideModal);
  trackOrderBtn?.addEventListener("click", () => {
    alert("Redirecting to order tracking page...");
    hideModal();
  });

  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      hideModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalOverlay?.classList.contains("hidden")) {
      hideModal();
    }
  });

  const addPostalCode = document.getElementById("addPostalCode");
  addPostalCode?.addEventListener("blur", function onPinBlur() {
    const pin = this.value.trim();
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
  });

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("loginError")) {
    const errorMsg = decodeURIComponent(urlParams.get("loginError"));
    showNotification(errorMsg, "error");
  }
  if (urlParams.has("logout")) {
    const message = decodeURIComponent(urlParams.get("logout"));
    showNotification(message, "success");
  }
  window.history.replaceState({}, document.title, window.location.pathname);
}
