package com.ecommerce.controller;

import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.ecommerce.ServiceInterface.UserService;
import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.service.CartService;
import com.ecommerce.service.ProductService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/cart")
public class CartController {

    private final UserService userService;
    private final CartService cartService;
    private final ProductService productService;

    public CartController(UserService userService, CartService cartService, ProductService productService) {
        this.userService = userService;
        this.cartService = cartService;
        this.productService = productService;
    }

    
    @PostMapping("/SaveCart")
    public ResponseEntity<String> saveCartItem(@Valid @RequestBody CartItemRequest request,Authentication authentication,BindingResult result){

        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body("Error in form field, Please coreect them");
        }

        CartItem cartItem = new CartItem();

        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        Product product = productService.getById(request.getProductId());

        cartItem.setId(UUID.randomUUID().toString());
        cartItem.setProduct(product);
        cartItem.setQuantity(request.getQuantity());
        cartItem.setUser(user);

        cartService.savItem(cartItem);

        return ResponseEntity.ok("Cart Saved");
    }

    @GetMapping("/getAllCartItems")
    public List<CartItem> getAllCartItems(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return cartService.getAllCartItemsByUser(user);
    }

    @PostMapping("/updateCartQuantity")
    public void updateCart(@RequestBody CartItemRequest request,Authentication authentication) {

        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        Product product = productService.getById(request.getProductId());
        
        cartService.updateQuantity(user, product, request.getQuantity());
    }

    @DeleteMapping("/removeCartItem/{productId}")
    public ResponseEntity<String> removeCartItem(@PathVariable String productId,Authentication authentication) {
        try {

            String email = authentication.getName();
            User user = userService.getUserByEmail(email);
            Product product = productService.getById(productId);

            cartService.removeCartItem(user,product); // your custom logic
            return ResponseEntity.ok("Item removed successfully");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Failed to remove item");
        }
    }  

    @DeleteMapping("/removeAllCartItem")
    public ResponseEntity<String> removeCartItem(Authentication authentication){

        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        
        cartService.removeAllCartItem(user);

        return ResponseEntity.ok("Deleted all cart items");
    }
}
