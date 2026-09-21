package com.reciptile.api.repository;

import java.util.List;

import com.reciptile.api.product.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRepository extends MongoRepository<Product, String> {
    boolean existsByNameIgnoreCase(String name);
    List<Product> findByNameContainingIgnoreCaseOrderByCreatedAtDesc(String name);
    List<Product> findAllByOrderByCreatedAtDesc();
}
