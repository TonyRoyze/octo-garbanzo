package com.reciptile.api.repository;

import java.util.List;
import com.reciptile.api.inventory.StockMovement;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StockMovementRepository extends MongoRepository<StockMovement, String> {
    List<StockMovement> findTop100ByOrderByCreatedAtDesc();
}
