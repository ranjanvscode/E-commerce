import { getCsrfData } from "./utils.js";
import { showNotification } from "./notifications-and-init.js";
import { requestJson } from "./api.js";

export function setupAuthModals() {
  const loginBtn = document.getElementById("loginBtn");
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");
  const closeLoginModal = document.getElementById("closeLoginModal");
  const closeSignupModal = document.getElementById("closeSignupModal");
  const showSignup = document.getElementById("showSignup");
  const showLogin = document.getElementById("showLogin");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  loginBtn?.addEventListener("click", () => {
    loginModal?.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  closeLoginModal?.addEventListener("click", () => {
    loginModal?.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  closeSignupModal?.addEventListener("click", () => {
    signupModal?.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  showSignup?.addEventListener("click", () => {
    loginModal?.classList.add("hidden");
    signupModal?.classList.remove("hidden");
  });

  showLogin?.addEventListener("click", () => {
    signupModal?.classList.add("hidden");
    loginModal?.classList.remove("hidden");
  });

  loginForm?.addEventListener("submit", () => {
    loginModal?.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  signupForm?.addEventListener("submit", () => {
    signupModal?.classList.add("hidden");
    document.body.style.overflow = "auto";
  });
}

export function setupSignupHandler() {
  const signupForm = document.getElementById("signupForm");
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const csrf = getCsrfData();
    if (!csrf.token || !csrf.header) {
      console.error("CSRF token or header not found.");
      showNotification("Security token missing. Refresh and try again.", "error");
      return;
    }

    const headers = { "Content-Type": "application/json", [csrf.header]: csrf.token };
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const payload = { name, email, password };

    try {
      const data = await requestJson(
        "/account/register",
        { method: "POST", headers, body: JSON.stringify(payload) },
        "Failed to register user."
      );
      if (data.status === "success") {
        showNotification(data.message);
      } else {
        showNotification(data.message, "error");
      }
    } catch (err) {
      showNotification("An error occurred. Please try again.", "error");
      throw err;
    }
  });
}
