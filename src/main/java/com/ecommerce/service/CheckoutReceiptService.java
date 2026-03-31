package com.ecommerce.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.ServiceInterface.UserService;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.CheckoutReceipt;
import com.ecommerce.entity.Payment;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.repository.CheckoutReceiptRepository;

import org.springframework.security.core.Authentication;

@Service
public class CheckoutReceiptService {

    private final CheckoutReceiptRepository checkoutReceiptRepository;
    private final CartService cartService;
    private final DiscountService discountService;
    private final UserService userService;
    private final PaymentService paymentService;

    @Value("${app.shipping-fee}")
    private int shippingFee;

    @Value("${app.checkout-receipt-ttl-minutes:30}")
    private int receiptTtlMinutes;

    public CheckoutReceiptService(
            CheckoutReceiptRepository checkoutReceiptRepository,
            CartService cartService,
            DiscountService discountService,
            UserService userService,
            PaymentService paymentService) {
        this.checkoutReceiptRepository = checkoutReceiptRepository;
        this.cartService = cartService;
        this.discountService = discountService;
        this.userService = userService;
        this.paymentService = paymentService;
    }

    /** Cart line totals + shipping (same rules as payment createOrder). */
    public BigDecimal computeCartTotalWithShipping(User user) {
        List<CartItem> cartItems = cartService.getAllCartItemsByUser(user);
        if (cartItems.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return cartItems.stream()
                .map(item -> {
                    Product product = item.getProduct();
                    BigDecimal finalPrice = discountService.getFinalPrice(product);
                    return finalPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(BigDecimal.valueOf(shippingFee));
    }

    public Map<String, String> generateReceipt(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        BigDecimal total = computeCartTotalWithShipping(user);
        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Cart is empty or total is invalid");
        }
        total = total.setScale(2, RoundingMode.HALF_UP);

        String receiptId = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        LocalDateTime now = LocalDateTime.now();

        CheckoutReceipt receipt = new CheckoutReceipt();
        receipt.setReceiptId(receiptId);
        receipt.setUser(user);
        receipt.setTotalRupees(total);
        receipt.setCreatedAt(now);
        receipt.setExpiresAt(now.plusMinutes(receiptTtlMinutes));
        receipt.setConsumed(false);

        checkoutReceiptRepository.save(receipt);

        Map<String, String> response = new HashMap<>();
        response.put("receiptId", receiptId);
        return response;
    }

    public boolean isReceiptOpenAndMatchingTotal(String receiptId, User user, BigDecimal currentCartTotal) {
        if (receiptId == null || receiptId.isBlank()) {
            return false;
        }
        Optional<CheckoutReceipt> opt = checkoutReceiptRepository.findById(receiptId);
        if (opt.isEmpty()) {
            return false;
        }
        CheckoutReceipt r = opt.get();
        if (r.isConsumed()) {
            return false;
        }
        if (!r.getUser().getId().equals(user.getId())) {
            return false;
        }
        if (r.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }
        BigDecimal expected = r.getTotalRupees().setScale(2, RoundingMode.HALF_UP);
        BigDecimal actual = currentCartTotal.setScale(2, RoundingMode.HALF_UP);
        return expected.compareTo(actual) == 0;
    }

    /**
     * After Razorpay order creation: mark receipt consumed and persist payment in one transaction.
     */
    @Transactional
    public void consumeReceiptAndSavePayment(String receiptId, User user, BigDecimal currentCartTotal, Payment payment) {
        Optional<CheckoutReceipt> opt = checkoutReceiptRepository.findById(receiptId);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Invalid receipt");
        }
        CheckoutReceipt r = opt.get();
        if (r.isConsumed()) {
            throw new IllegalStateException("Receipt already used");
        }
        if (!r.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Receipt does not belong to user");
        }
        if (r.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Receipt expired");
        }
        BigDecimal expected = r.getTotalRupees().setScale(2, RoundingMode.HALF_UP);
        BigDecimal actual = currentCartTotal.setScale(2, RoundingMode.HALF_UP);
        if (expected.compareTo(actual) != 0) {
            throw new IllegalStateException("Cart total changed since checkout started");
        }

        r.setConsumed(true);
        checkoutReceiptRepository.save(r);
        paymentService.savePayment(payment);
    }

    @Transactional
    public void consumeReceiptForCod(String receiptId, User user, BigDecimal currentCartTotal) {
        Optional<CheckoutReceipt> opt = checkoutReceiptRepository.findById(receiptId);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Invalid receipt");
        }
        CheckoutReceipt r = opt.get();
        if (r.isConsumed()) {
            throw new IllegalStateException("Receipt already used");
        }
        if (!r.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Receipt does not belong to user");
        }
        if (r.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Receipt expired");
        }
        BigDecimal expected = r.getTotalRupees().setScale(2, RoundingMode.HALF_UP);
        BigDecimal actual = currentCartTotal.setScale(2, RoundingMode.HALF_UP);
        if (expected.compareTo(actual) != 0) {
            throw new IllegalStateException("Cart total changed since checkout started");
        }
        r.setConsumed(true);
        checkoutReceiptRepository.save(r);
    }
}
