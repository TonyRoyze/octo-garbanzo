package com.reciptile.api.repository;

import java.util.List;
import com.reciptile.api.contact.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CustomerRepository extends MongoRepository<Customer, String> {
    List<Customer> findAllByOrderByCreatedAtDesc();
}
