package com.reciptile.api.controller;

import java.net.URI;
import java.util.List;
import com.reciptile.api.contact.ContactRequest;
import com.reciptile.api.contact.Customer;
import com.reciptile.api.repository.CustomerRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerRepository repository;
    public CustomerController(CustomerRepository repository) { this.repository = repository; }
    @GetMapping public List<Customer> list() { return repository.findAllByOrderByCreatedAtDesc(); }
    @PostMapping public ResponseEntity<Customer> create(@Valid @RequestBody ContactRequest r) {
        Customer saved = repository.save(new Customer(clean(r.name()), clean(r.email()), clean(r.phone()), clean(r.address()), clean(r.notes())));
        return ResponseEntity.created(URI.create("/api/customers/" + saved.getId())).body(saved);
    }
    @PutMapping("/{id}") public Customer update(@PathVariable String id, @Valid @RequestBody ContactRequest r) {
        Customer value = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        value.setName(clean(r.name())); value.setEmail(clean(r.email())); value.setPhone(clean(r.phone()));
        value.setAddress(clean(r.address())); value.setNotes(clean(r.notes())); return repository.save(value);
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repository.existsById(id)) throw new IllegalArgumentException("Customer not found");
        repository.deleteById(id); return ResponseEntity.noContent().build();
    }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
