package com.reciptile.api.repository;

import java.util.List;

import com.reciptile.api.purchase.PurchaseInvoice;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PurchaseInvoiceRepository extends MongoRepository<PurchaseInvoice, String> {
    List<PurchaseInvoice> findAllByOrderByCreatedAtDesc();
}
