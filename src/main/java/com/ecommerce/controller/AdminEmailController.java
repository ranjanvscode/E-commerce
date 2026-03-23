package com.ecommerce.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.service.BrevoDiagnosticsService;

@RestController
@RequestMapping("/admin/email")
public class AdminEmailController {

    @Autowired
    private BrevoDiagnosticsService diagnosticsService;

    @GetMapping("/verify-key")
    public ResponseEntity<String> verifyKey() {
        boolean ok = diagnosticsService.verifyApiKey();
        if (ok) {
            return ResponseEntity.ok("Brevo API key appears valid (see logs for details)");
        } else {
            return ResponseEntity.status(401).body("Brevo API key invalid or request failed (see logs for sib-request-id)");
        }
    }
}