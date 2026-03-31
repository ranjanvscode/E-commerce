package com.ecommerce.controller;

import com.ecommerce.ServiceInterface.UserService;
import com.ecommerce.entity.Payment;
import com.ecommerce.entity.User;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.ecommerce.service.CheckoutReceiptService;
import com.ecommerce.service.PaymentService;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Value("${razorpay.api_key}")
    private String razorpayKeyId;

    @Value("${razorpay.api_secret}")
    private String razorpayKeySecret;

    private final PaymentService paymentService;
    private final UserService userService;
    private final CheckoutReceiptService checkoutReceiptService;

    public PaymentController(PaymentService paymentService, 
                             UserService userService, 
                             CheckoutReceiptService checkoutReceiptService) {

        this.paymentService = paymentService;
        this.userService = userService;
        this.checkoutReceiptService = checkoutReceiptService;
    }

    @PostMapping("/generateReceipt")
    public ResponseEntity<Map<String, String>> generateReceipt(Authentication authentication) {
        try {
            return ResponseEntity.ok(checkoutReceiptService.generateReceipt(authentication));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/createOrder")
    public Map<String, Object> createOrder(@RequestParam("receipt") String receipt, Authentication authentication) {

        Map<String, Object> response = new HashMap<>();

        if (receipt == null || receipt.isBlank()) {
            response.put("error", "Receipt is required");
            return response;
        }

        String userEmail = authentication.getName();
        User user = userService.getUserByEmail(userEmail);

        BigDecimal totalFinalPrice = checkoutReceiptService.computeCartTotalWithShipping(user);
        totalFinalPrice = totalFinalPrice.setScale(2, RoundingMode.HALF_UP);

        if (totalFinalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            response.put("error", "Cart is Empty");
            return response;
        }

        if (!checkoutReceiptService.isReceiptOpenAndMatchingTotal(receipt, user, totalFinalPrice)) {
            response.put("error", "Invalid or expired receipt, or cart changed. Start checkout again.");
            return response;
        }

        long amountPaise = totalFinalPrice.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", receipt);

            Order order = razorpay.Orders.create(orderRequest);

            Payment payment = new Payment();
            payment.setRazorpayOrderId(order.get("id"));
            payment.setAmount(((Number) order.get("amount")).intValue());
            payment.setCurrency(order.get("currency"));
            payment.setCreatedAt(((Date) order.get("created_at")).toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
            payment.setReceiptId(receipt);
            payment.setUser(user);
            payment.setStatus(order.get("status"));
            payment.setRazorpayPaymentId(null);
            payment.setRazorpaySignature(null);
            payment.setFailureReason(null);
            payment.setPaymentTime(null);

            checkoutReceiptService.consumeReceiptAndSavePayment(receipt, user, totalFinalPrice, payment);

            response.put("id", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("status", order.get("status"));

        } catch (RazorpayException e) {
            response.put("error", e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException | SecurityException ex) {
            response.put("error", ex.getMessage());
        }
        return response;
    }

    //Payment Signature verification JAVA Code

    @PostMapping("/verifySignature")
    public ResponseEntity<String> verifyPayment(@RequestBody Map<String, String> data,
                                                Authentication authentication) {
        String orderId = data.get("razorpay_order_id");
        String paymentId = data.get("razorpay_payment_id");
        String signature = data.get("razorpay_signature");
        String secret = razorpayKeySecret;

        if (orderId == null || paymentId == null || signature == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing payment fields");
        }

        User user = userService.getUserByEmail(authentication.getName());
        Optional<Payment> paymentOpt = paymentService.getPaymentByRazorpayId(orderId);
        if (paymentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
        }
        Payment stored = paymentOpt.get();
        if (!stored.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
        }

        try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", orderId);
                options.put("razorpay_payment_id", paymentId);
                options.put("razorpay_signature", signature);

                boolean status = Utils.verifyPaymentSignature(options, secret);

                if (status) {
                    stored.setStatus("paid");
                    stored.setRazorpayPaymentId(paymentId);
                    stored.setRazorpaySignature(signature);
                    stored.setPaymentTime(LocalDateTime.now());
                    paymentService.savePayment(stored);

                    return ResponseEntity.ok("Payment Verified");
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Signature");
                }
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error verifying payment");
        }
    }


    @PostMapping("/failure")
    public ResponseEntity<String> saveFailedPayment(@RequestBody Map<String, String> failureData,
                                                    Authentication authentication) {

        String orderId = failureData.get("razorpay_order_id");
        if (orderId == null || orderId.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing order id");
        }

        User user = userService.getUserByEmail(authentication.getName());
        Optional<Payment> paymentOpt = paymentService.getPaymentByRazorpayId(orderId);
        if (paymentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
        }
        Payment payment = paymentOpt.get();
        if (!payment.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
        }

        payment.setRazorpayPaymentId(failureData.get("razorpay_payment_id"));
        payment.setStatus("failed");
        payment.setAmount(0);
        payment.setFailureReason(failureData.get("reason") + " - " + failureData.get("description"));

        paymentService.savePayment(payment);

        return ResponseEntity.ok("Failure logged");
    }

}