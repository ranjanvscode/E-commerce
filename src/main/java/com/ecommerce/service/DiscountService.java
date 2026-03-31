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

    public void saveGlobalDiscount(float discount){
        DiscountConfig discountConfig = new DiscountConfig();
        discountConfig.setId("GLOBAL_DISCOUNT");
        discountConfig.setGlobalDiscount(BigDecimal.valueOf(discount));
        discountConfigRepo.save(discountConfig);
    }
    
    public BigDecimal getGlobalDiscount() {
        return discountConfigRepo.findById("GLOBAL_DISCOUNT")
                .map(DiscountConfig::getGlobalDiscount)
                .orElse(BigDecimal.ZERO);
    }

    public BigDecimal getCategoryDiscount(Category category) {
        return category != null &&  category.getCategoryDiscount().compareTo(BigDecimal.ZERO) > 0
                ? category.getCategoryDiscount()
                : BigDecimal.ZERO;
    }

    public BigDecimal getFinalPrice(Product product) {
        BigDecimal global = getGlobalDiscount();
        BigDecimal category = getCategoryDiscount(product.getCategory());
        return product.getFinalPrice(category, global);
    }
}

