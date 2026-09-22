package com.reciptile.api.controller;

import java.net.URI;
import java.util.List;

import com.reciptile.api.purchase.PurchaseInvoice;
import com.reciptile.api.purchase.PurchaseInvoiceRequest;
import com.reciptile.api.service.PurchaseInvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/purchase-invoices")
public class PurchaseInvoiceController {
    private final PurchaseInvoiceService service;

    public PurchaseInvoiceController(PurchaseInvoiceService service) {
        this.service = service;
    }

    @GetMapping
    public List<PurchaseInvoice> findAll() {
        return service.findAll();
    }

    @PostMapping
    public ResponseEntity<PurchaseInvoice> create(@Valid @RequestBody PurchaseInvoiceRequest request) {
        PurchaseInvoice created = service.create(request);
        return ResponseEntity.created(URI.create("/api/purchase-invoices/" + created.getId())).body(created);
    }
}
