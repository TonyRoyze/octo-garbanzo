package com.reciptile.api.repository;

import java.util.Optional;
import java.util.List;

import com.reciptile.api.invoice.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findAllByOrderByCreatedAtDesc();
}
