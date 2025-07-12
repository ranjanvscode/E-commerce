package com.ecommerce.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.entity.Orders;
import com.ecommerce.entity.User;
import com.ecommerce.repository.OrderRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public void saveOrder(Orders orders){

        orderRepository.save(orders);
    }

    public List<Orders> getAllOrders(User user){

        return orderRepository.findByUser(user);
    }

    public List<Orders> getAllUserOrders(){

        return orderRepository.findAll();
    }
}
