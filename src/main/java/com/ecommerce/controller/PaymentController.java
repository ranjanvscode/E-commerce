package com.ecommerce.controller;

import com.ecommerce.ServiceInterface.UserService;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Payment;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.ecommerce.service.CartService;
import com.ecommerce.service.DiscountService;
import com.ecommerce.service.PaymentService;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Value("${razorpay.api_key}")
    private String razorpayKeyId;

    @Value("${razorpay.api_secret}")
    private String razorpayKeySecret;

    @Value("${app.shipping-fee}")
    private int shippingFee;

    private final PaymentService paymentService;
    private final UserService userService;
    private final CartService cartService;
    private final DiscountService discountService;

    public PaymentController(PaymentService paymentService, 
                             UserService userService, 
                             CartService cartService, 
                             DiscountService discountService) {

        this.paymentService = paymentService;
        this.userService = userService;
        this.cartService = cartService;
        this.discountService = discountService;
    }


    @PostMapping("/createOrder")
    public Map<String, Object> createOrder(@RequestParam("amount") BigDecimal amount, @RequestParam("receipt") String receipt, Authentication authentication) {

        Map<String, Object> response = new HashMap<>();

        String userEmail = authentication.getName();
        User user = userService.getUserByEmail(userEmail);

        List<CartItem> cartItems = cartService.getAllCartItemsByUser(user);

        if(cartItems.isEmpty()){
            response.put("error", "Cart is Empty");
            return response;
        }

        BigDecimal totalFinalPrice = cartItems.stream()
            .map(item -> {Product product = item.getProduct();
                        BigDecimal finalPrice = discountService.getFinalPrice(product);
                        return finalPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                        }).reduce(BigDecimal.ZERO, BigDecimal::add).add(BigDecimal.valueOf(shippingFee));//Shipping fee 


        

        if (totalFinalPrice.compareTo(amount)!=0) {
            response.put("error", "Amount is not equal");
        }else{

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", totalFinalPrice.multiply(BigDecimal.valueOf(100))); // convert ₹ to paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", receipt);

            Order order = razorpay.Orders.create(orderRequest);
            
            // Return only required fields
            response.put("id", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("status", order.get("status"));

            //Save Payment in DB
            Payment payment = new Payment();

            payment.setRazorpayOrderId(order.get("id"));
            payment.setAmount(order.get("amount"));
            payment.setCurrency(order.get("currency"));
            payment.setCreatedAt(((Date) order.get("created_at")).toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());


            payment.setReceiptId(receipt);
            payment.setUser(user);
            payment.setStatus(order.get("status"));
            payment.setRazorpayPaymentId(null);
            payment.setRazorpaySignature(null);
            payment.setFailureReason(null);
            payment.setPaymentTime(null);

            paymentService.savePayment(payment);

        } catch (RazorpayException e) {
            response.put("error", e.getMessage());
        }
    }
        return response;
    }

    //Payment Signature verification JAVA Code

    @PostMapping("/verifySignature")
    public ResponseEntity<String> verifyPayment(@RequestBody Map<String, String> data) {
        String orderId = data.get("razorpay_order_id");
        String paymentId = data.get("razorpay_payment_id");
        String signature = data.get("razorpay_signature");
        String secret = razorpayKeySecret;

        try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", orderId);
                options.put("razorpay_payment_id", paymentId);
                options.put("razorpay_signature", signature);

                // Verify the signature
                boolean status = Utils.verifyPaymentSignature(options, secret);

                if (status) {

                    Payment payment = paymentService.getPaymentByRazorpayId(orderId);

                    payment.setStatus("paid");
                    payment.setRazorpayPaymentId(paymentId);
                    payment.setRazorpaySignature(signature);
                    payment.setPaymentTime(LocalDateTime.now());
                    paymentService.savePayment(payment);

                    return ResponseEntity.ok("Payment Verified");
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Signature");
                }
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error verifying payment");
        }
    }


    @PostMapping("/failure")
    public ResponseEntity<String> saveFailedPayment(@RequestBody Map<String, String> failureData) {

        Payment payment = paymentService.getPaymentByRazorpayId(failureData.get("razorpay_order_id"));
        payment.setRazorpayPaymentId(failureData.get("razorpay_payment_id"));
        payment.setStatus("failed");
        payment.setAmount(0);
        payment.setFailureReason(failureData.get("reason") + " - " + failureData.get("description"));

        paymentService.savePayment(payment);

        return ResponseEntity.ok("Failure logged");
    }

}

