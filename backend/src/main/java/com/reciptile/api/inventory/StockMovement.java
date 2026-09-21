package com.reciptile.api.inventory;

import java.time.Instant;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "stock_movements")
public class StockMovement {
    @Id private String id;
    private String productId;
    private String productName;
    private int change;
    private int balance;
    private String reason;
    private String reference;
    @CreatedDate private Instant createdAt;

    public StockMovement() {}
    public StockMovement(String productId, String productName, int change, int balance, String reason, String reference) {
        this.productId = productId; this.productName = productName; this.change = change;
        this.balance = balance; this.reason = reason; this.reference = reference;
    }
    public String getId() { return id; }
    public String getProductId() { return productId; }
    public String getProductName() { return productName; }
    public int getChange() { return change; }
    public int getBalance() { return balance; }
    public String getReason() { return reason; }
    public String getReference() { return reference; }
    public Instant getCreatedAt() { return createdAt; }
}
