package com.reciptile.api.repository;

import java.util.List;
import com.reciptile.api.contact.Supplier;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SupplierRepository extends MongoRepository<Supplier, String> {
    List<Supplier> findAllByOrderByCreatedAtDesc();
}
