package com.reciptile.api.product;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "products")
public class Product {

    @Id
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private ProductStatus status;
    private int quantity;
    private String supplierId;
    private int lowStockThreshold = 5;
    // Kept so products created before multi-image support continue to load.
    private ProductImage image;
    private List<ProductImage> images = List.of();
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;

    public Product() {
    }

    public Product(String id, String name, String description, BigDecimal price, ProductStatus status) {
        this(id, name, description, price, status, null);
    }

    public Product(String id, String name, String description, BigDecimal price, ProductStatus status,
            ProductImage image) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.status = status;
        this.image = image;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public String getSupplierId() { return supplierId; }
    public void setSupplierId(String supplierId) { this.supplierId = supplierId; }
    public int getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(int lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }
    public ProductImage getImage() { return image; }
    public void setImage(ProductImage image) { this.image = image; }
    public List<ProductImage> getImages() {
        if ((images == null || images.isEmpty()) && image != null) return List.of(image);
        return images == null ? List.of() : images;
    }
    public void setImages(List<ProductImage> images) {
        this.images = images == null ? List.of() : List.copyOf(images);
    }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
