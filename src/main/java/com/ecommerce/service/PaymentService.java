package com.ecommerce.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.entity.Payment;
import com.ecommerce.repository.PaymentRepository;

@Service
public class PaymentService {

    @Autowired
    PaymentRepository paymentRepository;

    public Payment savePayment(Payment payment)
    {
        return paymentRepository.save(payment);
    }

    public Optional<Payment> getPaymentByRazorpayId(String id) {
        return paymentRepository.findById(id);
    }

    public Payment getPaymentByReceiptId(String receiptId){

       return paymentRepository.findPaymentByReceiptId(receiptId);
    }
}
