package com.ecommerce.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.ecommerce.dto.UserRequest;


@Controller
public class RootController {

    @Value("${razorpay.api_key}")
    private String razorpayKeyId;

    @GetMapping("/")
    public String general() {
        return "redirect:/home";
    }

    @GetMapping("/home")
    public String home(Model m) {
        UserRequest userFrom = new UserRequest();
        m.addAttribute("userForm", userFrom);
        m.addAttribute("RAZORPAY_KEY_ID", razorpayKeyId);
        return "home";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/orders")
    public String adminpage() {
        return "admin/orders";
    }

    @GetMapping("/user/order")
    public String order() {
        return "user/order";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/customer")
    public String test() {
        return "admin/customer";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/adminpannel")
    public String adminpannel(Model model) {
        model.addAttribute("admin", true);
        return "admin/adminpannel";
    }

    @GetMapping("/access-denied")
    public String accessDenied(){

      return "error/access-denied";
    }

    @GetMapping("/forgot-password")
    public String password(){

      return "forgot-password";
    }

    @GetMapping("/help")
    public String helpSupport(){

      return "help-support";
    }

    @GetMapping("/about")
    public String aboutUs(){

      return "aboutus";
    }

    @GetMapping("/user/profile")
    public String profile(){

      return "user/profile";
    }
}
