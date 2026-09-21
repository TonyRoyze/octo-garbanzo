package com.reciptile.api.inventory;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StockAdjustmentRequest(
        @NotBlank String productId,
        @NotNull @Min(-999999) @Max(999999) Integer change,
        @NotBlank @Size(max = 160) String reason,
        @Size(max = 120) String reference) {}
