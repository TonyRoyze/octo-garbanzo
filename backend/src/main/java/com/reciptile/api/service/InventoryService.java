package com.reciptile.api.service;

import java.util.List;
import com.reciptile.api.inventory.StockAdjustmentRequest;
import com.reciptile.api.inventory.StockMovement;
import com.reciptile.api.product.Product;
import com.reciptile.api.product.ProductNotFoundException;
import com.reciptile.api.repository.ProductRepository;
import com.reciptile.api.repository.StockMovementRepository;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {
    private final ProductRepository products;
    private final StockMovementRepository movements;
    public InventoryService(ProductRepository products, StockMovementRepository movements) {
        this.products = products; this.movements = movements;
    }
    public List<StockMovement> movements() { return movements.findTop100ByOrderByCreatedAtDesc(); }
    public StockMovement adjust(StockAdjustmentRequest request) {
        if (request.change() == 0) throw new IllegalArgumentException("Stock change cannot be zero");
        Product product = products.findById(request.productId())
                .orElseThrow(() -> new ProductNotFoundException(request.productId()));
        return change(product, request.change(), request.reason().trim(), clean(request.reference()));
    }
    public StockMovement change(Product product, int change, String reason, String reference) {
        int balance = product.getQuantity() + change;
        if (balance < 0) throw new IllegalArgumentException("Not enough stock for " + product.getName());
        product.setQuantity(balance);
        products.save(product);
        return movements.save(new StockMovement(product.getId(), product.getName(), change, balance, reason, reference));
    }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
