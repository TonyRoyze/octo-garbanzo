package com.reciptile.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import com.reciptile.api.product.Product;
import com.reciptile.api.product.ProductRequest;
import com.reciptile.api.product.ProductStatus;
import com.reciptile.api.repository.ProductRepository;
import com.reciptile.api.repository.StockMovementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository repository;
    @Mock
    private StockMovementRepository movements;

    @InjectMocks
    private ProductService service;

    @Test
    void createsDraftProductWhenStatusIsMissing() {
        ProductRequest request = new ProductRequest(
                "  Linen notebook  ", "  Handmade paper  ", new BigDecimal("12.50"), null, 24, null, null, null);
        when(repository.save(org.mockito.ArgumentMatchers.any(Product.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Product created = service.create(request);

        assertThat(created.getName()).isEqualTo("Linen notebook");
        assertThat(created.getDescription()).isEqualTo("Handmade paper");
        assertThat(created.getStatus()).isEqualTo(ProductStatus.DRAFT);
        assertThat(created.getQuantity()).isEqualTo(24);
    }

    @Test
    void searchesProductsByName() {
        when(repository.findByNameContainingIgnoreCaseOrderByCreatedAtDesc("note"))
                .thenReturn(List.of());

        service.findAll("  note  ");

        verify(repository).findByNameContainingIgnoreCaseOrderByCreatedAtDesc("note");
    }
}
