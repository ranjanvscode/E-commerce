package com.ecommerce.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class ShippingUpdateRequest {

    private String orderId;
    private String paymentStatus;
    private String shippingStatus;
    private String trackingNumber;
    private String shippingCarrier;
    private LocalDate dispatchDate;
}
