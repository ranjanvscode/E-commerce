package com.ecommerce.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.ecommerce.entity.Category;
import com.ecommerce.entity.DiscountConfig;
import com.ecommerce.entity.Product;
import com.ecommerce.repository.DiscountConfigRepository;

@Service
public class DiscountService {

    private final DiscountConfigRepository discountConfigRepo;

    public DiscountService(DiscountConfigRepository discountConfigRepo) {
        this.discountConfigRepo = discountConfigRepo;
    }

    public BigDecimal getGlobalDiscount() {
        return discountConfigRepo.findById("discount7858")
                .map(DiscountConfig::getGlobalDiscount)
                .orElse(BigDecimal.ZERO);
    }

    public BigDecimal getCategoryDiscount(Category category) {
        return category != null && category.getCategoryDiscount().compareTo(BigDecimal.ZERO) > 0
                ? category.getCategoryDiscount()
                : BigDecimal.ZERO;
    }

    public BigDecimal getFinalPrice(Product product) {
        BigDecimal global = getGlobalDiscount();
        BigDecimal category = getCategoryDiscount(product.getCategory());
        return product.getFinalPrice(category, global);
    }
}

