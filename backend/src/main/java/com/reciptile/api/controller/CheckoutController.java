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
import com.reciptile.api.product.Product;
import com.reciptile.api.product.ProductNotFoundException;
import com.reciptile.api.repository.ProductRepository;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
    private final ProductRepository products;
    public CheckoutController(ProductRepository products) { this.products = products; }
    public record CheckoutRequest(@NotEmpty List<String> productIds) {}

    @PostMapping("/prepare")
    public Map<String, String> prepare(@Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal Jwt customer) {
        for (String id : request.productIds()) {
            Product product = products.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
            if (product.getStatus() != com.reciptile.api.product.ProductStatus.ACTIVE) {
                throw new IllegalArgumentException(product.getName() + " is not available");
            }
            if (product.getQuantity() < 1) {
                throw new IllegalArgumentException(product.getName() + " is out of stock");
            }
        }
        return Map.of("status", "READY", "customerId", customer.getSubject());
    }
}
