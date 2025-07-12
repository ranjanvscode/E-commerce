package com.ecommerce.controller;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalController {

    @ExceptionHandler(Exception.class)
    public String handleAll(Exception ex) {
        return "error/errorPage";
    }
}
