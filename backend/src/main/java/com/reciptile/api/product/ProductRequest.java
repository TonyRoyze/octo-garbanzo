package com.reciptile.api.product;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProductRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 500) String description,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal price,
        ProductStatus status,
        @Size(max = 4, message = "a product can have at most 4 images")
        List<@Valid ProductImageRequest> images) {
}
