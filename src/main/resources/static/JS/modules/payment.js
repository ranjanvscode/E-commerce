import { state } from "./state.js";
import { showNotification } from "./notifications-and-init.js";
import { getSecureJsonHeaders, requestJson, requestText } from "./api.js";

let saveOrderDataRef = null;

export function configurePayment({ saveOrderData }) {
  saveOrderDataRef = saveOrderData;
}

export function loadRazorpayScript(callback) {
  const existingScript = document.querySelector(
    'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
  );
  if (!existingScript) {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = callback;
    script.onerror = () => {
      showNotification("Failed to load payment gateway. Please try again.", "error");
    };
    document.body.appendChild(script);
  } else {
    callback();
  }
}

export function rzpCheckout() {
  const headers = getSecureJsonHeaders();
  if (!headers) return;

  // Amount is computed only on the server from DB cart + shipping; never sent from the browser.
  if (!state.receiptId) {
    showNotification("Checkout session invalid. Please try again.", "error");
    return;
  }

  const receiptParam = encodeURIComponent(state.receiptId);
  requestJson(
    `/payment/createOrder?receipt=${receiptParam}`,
    { method: "POST", headers },
    "Could not create payment order."
  )
    .then((order) => {
      if (order.error) {
        showNotification(`Payment error: ${order.error}`, "error");
        return;
      }
      openRazorpay(order);
    })
    .catch((err) => {
      console.error("Order creation error:", err);
      showNotification("Failed to initiate payment. Please try again.", "error");
    });
}

export function openRazorpay(order) {
  if (!RAZORPAY_KEY_ID) {
    showNotification("Payment key is missing. Contact support.", "error");
    return;
  }
  if (typeof Razorpay !== "function") {
    showNotification("Payment service unavailable. Retry in a moment.", "error");
    return;
  }

  const name = document.getElementById("addName").value;
  const phoneNo = document.getElementById("addPhoneNo").value;

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: "RMR",
    description: "Payment for your order",
    image: "",
    order_id: order.id,
    handler: verifySignature,
    prefill: { name, email: "", contact: phoneNo },
    notes: { receipt_id: "Receipt id in note" },
    theme: { color: "#3399cc" },
  };

  const rzp = new Razorpay(options);
  rzp.on("payment.failed", handlePaymentFailure);
  rzp.open();
}

export function handlePaymentFailure(response) {
  const headers = getSecureJsonHeaders();
  if (!headers) return;

  showNotification(`Payment failed: ${response.error.description}`, "error");
  requestText("/payment/failure", {
    method: "POST",
    headers,
    body: JSON.stringify({
      razorpay_order_id: response.error.metadata.order_id,
      razorpay_payment_id: response.error.metadata.payment_id,
      reason: response.error.reason,
      code: response.error.code,
      description: response.error.description,
      source: response.error.source,
      step: response.error.step,
    }),
  })
    .then((data) => console.log("Failure saved:", data))
    .catch((err) => console.error("Failure save error:", err));
}

export function verifySignature(response) {
  const headers = getSecureJsonHeaders();
  if (!headers) return;

  requestText("/payment/verifySignature", {
    method: "POST",
    headers,
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }),
  })
    .then((data) => {
      if (data === "Payment Verified") {
        if (saveOrderDataRef) {
          saveOrderDataRef();
        }
      } else {
        showNotification("Signature mismatch. Possible fraud.", "error");
      }
    })
    .catch((err) => {
      console.error("Verification Error:", err);
      showNotification("Could not verify payment. Please contact support.", "error");
    });
}
