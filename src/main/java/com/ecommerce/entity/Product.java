package com.ecommerce.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Product {

    @Id
    private String id;
    @Column(nullable=false)
    private String name;
    @Column(nullable=false)
    private Float rating;
    private String imageId;
    private String cloudinaryImagePublicId;
    private String description;
    private boolean inStock;
    private BigDecimal price;
    private BigDecimal discount; // Optional product-specific discount
    private BigDecimal discountPrize; // Optional product-specific discount

    @ManyToOne
    private Category category;

    // Get final price after discount
    public BigDecimal getFinalPrice(BigDecimal categoryDiscount, BigDecimal globalDiscount) {
        BigDecimal finalDiscount = BigDecimal.ZERO;
        
        if (discount.compareTo(BigDecimal.ZERO) > 0) {
            finalDiscount = discount;
        } else if (categoryDiscount.compareTo(BigDecimal.ZERO) > 0) {
            finalDiscount = categoryDiscount;
        } else if (globalDiscount.compareTo(BigDecimal.ZERO) > 0) {
            finalDiscount = globalDiscount;
        }

        return price.subtract(price.multiply(finalDiscount.divide(BigDecimal.valueOf(100))));
    }
}
