package com.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.entity.CheckoutReceipt;

@Repository
public interface CheckoutReceiptRepository extends JpaRepository<CheckoutReceipt, String> {
}
