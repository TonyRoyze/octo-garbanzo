package com.reciptile.api.controller;

import java.util.List;
import com.reciptile.api.inventory.StockAdjustmentRequest;
import com.reciptile.api.inventory.StockMovement;
import com.reciptile.api.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    private final InventoryService service;
    public InventoryController(InventoryService service) { this.service = service; }
    @GetMapping("/movements") public List<StockMovement> movements() { return service.movements(); }
    @PostMapping("/adjustments") public StockMovement adjust(@Valid @RequestBody StockAdjustmentRequest request) {
        return service.adjust(request);
    }
}
