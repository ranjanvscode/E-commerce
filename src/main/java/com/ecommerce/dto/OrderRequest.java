package com.ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderRequest {

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    @NotNull(message = "Address is required")
    private ShippingRequest shipping;

    @NotBlank(message = "Receipt is required")
    private String receiptId;
}

