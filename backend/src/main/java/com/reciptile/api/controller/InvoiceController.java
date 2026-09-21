package com.reciptile.api.controller;

import java.net.URI;
import java.util.List;

import com.reciptile.api.invoice.Invoice;
import com.reciptile.api.invoice.InvoiceRequest;
import com.reciptile.api.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    private final InvoiceService service;

    public InvoiceController(InvoiceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Invoice> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Invoice findById(@PathVariable String id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<Invoice> create(@Valid @RequestBody InvoiceRequest request) {
        Invoice created = service.create(request);
        return ResponseEntity.created(URI.create("/api/invoices/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public Invoice update(@PathVariable String id, @Valid @RequestBody InvoiceRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
