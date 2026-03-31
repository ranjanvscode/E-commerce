import { getCsrfData } from "./utils.js";
import { showNotification } from "./notifications-and-init.js";

export function getSecureJsonHeaders() {
  const csrf = getCsrfData();
  if (!csrf.token || !csrf.header) {
    console.error("CSRF token or header not found.");
    showNotification("Security token missing. Refresh and try again.", "error");
    return null;
  }
  return { "Content-Type": "application/json", [csrf.header]: csrf.token };
}

export async function requestJson(url, options = {}, errorMessage = "Request failed.") {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function requestText(url, options = {}, errorMessage = "Request failed.") {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  return response.text();
}
