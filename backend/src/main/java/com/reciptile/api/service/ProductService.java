package com.reciptile.api.service;

import java.util.List;

import com.reciptile.api.product.Product;
import com.reciptile.api.product.ProductImage;
import com.reciptile.api.product.ProductImageRequest;
import com.reciptile.api.product.ProductNotFoundException;
import com.reciptile.api.product.ProductRequest;
import com.reciptile.api.product.ProductStatus;
import com.reciptile.api.repository.ProductRepository;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public List<Product> findAll(String query) {
        if (query == null || query.isBlank()) {
            return repository.findAllByOrderByCreatedAtDesc();
        }
        return repository.findByNameContainingIgnoreCaseOrderByCreatedAtDesc(query.trim());
    }

    public Product findById(String id) {
        return repository.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
    }

    public Product create(ProductRequest request) {
        Product product = new Product(
                null,
                request.name().trim(),
                request.description().trim(),
                request.price(),
                request.status() == null ? ProductStatus.DRAFT : request.status());
        product.setImages(toImages(request.images()));
        return repository.save(product);
    }

    public Product update(String id, ProductRequest request) {
        Product product = findById(id);
        product.setName(request.name().trim());
        product.setDescription(request.description().trim());
        product.setPrice(request.price());
        product.setStatus(request.status() == null ? ProductStatus.DRAFT : request.status());
        product.setImages(toImages(request.images()));
        product.setImage(null);
        return repository.save(product);
    }

    public void delete(String id) {
        Product product = findById(id);
        repository.delete(product);
    }

    private List<ProductImage> toImages(List<ProductImageRequest> images) {
        if (images == null) return List.of();
        return images.stream().map(image -> {
            String alt = image.alt() == null ? "" : image.alt().trim();
            return new ProductImage(image.key().trim(), image.url().trim(), alt);
        }).toList();
    }
}
