package com.reciptile.api.controller;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
    public record CheckoutRequest(@NotEmpty List<String> productIds) {}

    @PostMapping("/prepare")
    public Map<String, String> prepare(@Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal Jwt customer) {
        return Map.of("status", "READY", "customerId", customer.getSubject());
    }
}
