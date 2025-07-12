package com.ecommerce.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CartItemRequest {

    private String productId;

    @Min(value = 1, message = "Quantity must be at least 1 and cannot be negative")
    private int quantity;
}
