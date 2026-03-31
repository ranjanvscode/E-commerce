package com.ecommerce.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.ServiceInterface.UserService;
import com.ecommerce.dto.OrderRequest;
import com.ecommerce.dto.ShippingUpdateRequest;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.Orders;
import com.ecommerce.entity.Payment;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.Shipping;
import com.ecommerce.entity.User;
import com.ecommerce.service.CartService;
import com.ecommerce.service.CheckoutReceiptService;
import com.ecommerce.service.DiscountService;
import com.ecommerce.service.EmailService;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.PaymentService;

import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/user")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;
    private final PaymentService paymentService;
    private final EmailService emailService;
    private final CartService cartService;
    private final DiscountService discountService;
    private final CheckoutReceiptService checkoutReceiptService;

    public OrderController(OrderService orderService,
                           UserService userService,
                           PaymentService paymentService,
                           EmailService emailService,
                           CartService cartService,
                           DiscountService discountService,
                           CheckoutReceiptService checkoutReceiptService)
    {

        this.orderService = orderService;
        this.userService = userService;
        this.paymentService = paymentService;
        this.emailService = emailService;
        this.cartService = cartService;
        this.discountService = discountService;
        this.checkoutReceiptService = checkoutReceiptService;
    }

    @Value("${app.shipping-fee}")
    private int shippingFee;

    @Transactional
    @PostMapping("/placeOrder")
    public ResponseEntity<String> placeOrder(@Valid @RequestBody OrderRequest request, Authentication authentication, BindingResult result) {
        
        if (result.hasErrors()) {
            
            return ResponseEntity.badRequest().body("Error in form field, Please correct them.");
        }

        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        List<CartItem> cartItems = cartService.getAllCartItemsByUser(user);
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body("Cart is empty");
        }

        BigDecimal subTotal = BigDecimal.ZERO;
        for (CartItem ci : cartItems) {
            Product product = ci.getProduct();
            BigDecimal unit = discountService.getFinalPrice(product);
            subTotal = subTotal.add(unit.multiply(BigDecimal.valueOf(ci.getQuantity())));
        }

        BigDecimal shippingCost = BigDecimal.valueOf(shippingFee);
        BigDecimal totalWithShipping = subTotal.add(shippingCost).setScale(2, RoundingMode.HALF_UP);

        Payment payment = null;
        String paymentMethod = request.getPaymentMethod();

        if ("prepaid".equalsIgnoreCase(paymentMethod)) {
            payment = paymentService.getPaymentByReceiptId(request.getReceiptId());
            if (payment == null) {
                return ResponseEntity.badRequest().body("Payment not found for this order");
            }
            if (!payment.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
            }
            if (!"paid".equals(payment.getStatus())) {
                return ResponseEntity.badRequest().body("Payment not completed");
            }
            BigDecimal paidRupees = BigDecimal.valueOf(payment.getAmount())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (paidRupees.compareTo(totalWithShipping) != 0) {
                return ResponseEntity.badRequest().body("Order total does not match payment");
            }
        } else {
            try {
                checkoutReceiptService.consumeReceiptForCod(request.getReceiptId(), user, totalWithShipping);
            } catch (IllegalArgumentException | IllegalStateException | SecurityException ex) {
                return ResponseEntity.badRequest().body(ex.getMessage());
            }
        }

        // Create Address
        Shipping shipping = new Shipping();
        shipping.setName(request.getShipping().getName());
        shipping.setPhone(request.getShipping().getPhoneNo());
        shipping.setAddress(request.getShipping().getAddress());
        shipping.setCity(request.getShipping().getCity());
        shipping.setState(request.getShipping().getState());
        shipping.setPostalCode(request.getShipping().getZipCode());
        shipping.setUser(user);
        shipping.setId(UUID.randomUUID().toString());
        shipping.setShippedDate(null);
        shipping.setShippingCarrier(null);
        shipping.setShippingCost(BigDecimal.valueOf(shippingFee));
        shipping.setTrackingNumber(null);
        shipping.setShippingStatus("pending");
        shipping.setTax(BigDecimal.valueOf(0));


        Orders orders = new Orders();
        orders.setOrderId(request.getReceiptId());
        orders.setUser(user);
        orders.setOrderDate(LocalDateTime.now());
        orders.setPaymentMethod(request.getPaymentMethod());
        orders.setPaymentStatus("prepaid".equalsIgnoreCase(paymentMethod) ? "paid" : "pending");
        orders.setShipping(shipping);
        orders.setPayment(payment);

        int itemCount = 0;

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem ci : cartItems) {
            Product product = ci.getProduct();
            BigDecimal unitPrice = discountService.getFinalPrice(product);

            OrderItem item = new OrderItem();
            item.setId(UUID.randomUUID().toString());
            item.setProduct(product);
            item.setQuantity(ci.getQuantity());
            item.setPrice(unitPrice);
            item.setOrders(orders);

            itemCount += ci.getQuantity();

            orderItems.add(item);
        }

        orders.setOrderItems(orderItems);
        orders.setSubTotal(subTotal.setScale(2, RoundingMode.HALF_UP));
        orders.setTotalAmount(subTotal.add(shipping.getShippingCost()).add(shipping.getTax()).setScale(2, RoundingMode.HALF_UP));
        orders.setItemCount(itemCount);

        // Save orders (cascades to Address and OrderItems)
        orderService.saveOrder(orders);

        emailService.sendOrderConfirmation(email, orders);

        return ResponseEntity.ok("Order placed successfully");
    }

    @GetMapping("/getAllOrder")
    public List<Orders> getAllOrder(Authentication authentication){

        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        return orderService.getAllOrders(user);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/getAllUserOrders")
    public List<Orders> getAllUserOrder(){

        return orderService.getAllUserOrders();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/updateOrder")
    public ResponseEntity<String> updateOrders(@RequestBody ShippingUpdateRequest shippingUpdateRequest){ {

        Orders order = orderService.getOrderByOrderid(shippingUpdateRequest.getOrderId());
        order.setPaymentStatus(shippingUpdateRequest.getPaymentStatus());
        order.getShipping().setShippedDate(shippingUpdateRequest.getDispatchDate() != null ? shippingUpdateRequest.getDispatchDate().atStartOfDay() : null);
        order.getShipping().setShippingCarrier(shippingUpdateRequest.getShippingCarrier());
        order.getShipping().setShippingStatus(shippingUpdateRequest.getShippingStatus());
        order.getShipping().setTrackingNumber(shippingUpdateRequest.getTrackingNumber());
        orderService.saveOrder(order);
        
        return ResponseEntity.ok("Order updated successfully");
    }
}}