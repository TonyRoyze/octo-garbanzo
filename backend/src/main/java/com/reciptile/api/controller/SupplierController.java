package com.reciptile.api.controller;

import java.net.URI;
import java.util.List;
import com.reciptile.api.contact.ContactRequest;
import com.reciptile.api.contact.Supplier;
import com.reciptile.api.repository.SupplierRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {
    private final SupplierRepository repository;
    public SupplierController(SupplierRepository repository) { this.repository = repository; }
    @GetMapping public List<Supplier> list() { return repository.findAllByOrderByCreatedAtDesc(); }
    @PostMapping public ResponseEntity<Supplier> create(@Valid @RequestBody ContactRequest r) {
        Supplier saved = repository.save(new Supplier(clean(r.name()), clean(r.email()), clean(r.phone()), clean(r.address()), clean(r.notes())));
        return ResponseEntity.created(URI.create("/api/suppliers/" + saved.getId())).body(saved);
    }
    @PutMapping("/{id}") public Supplier update(@PathVariable String id, @Valid @RequestBody ContactRequest r) {
        Supplier value = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
        value.setName(clean(r.name())); value.setEmail(clean(r.email())); value.setPhone(clean(r.phone()));
        value.setAddress(clean(r.address())); value.setNotes(clean(r.notes())); return repository.save(value);
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repository.existsById(id)) throw new IllegalArgumentException("Supplier not found");
        repository.deleteById(id); return ResponseEntity.noContent().build();
    }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
