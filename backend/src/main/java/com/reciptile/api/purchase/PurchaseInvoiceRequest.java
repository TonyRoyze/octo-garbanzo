package com.reciptile.api.purchase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PurchaseInvoiceRequest(
        @NotBlank String supplierId,
        @Size(max = 160) String supplierReference,
        @NotEmpty @Size(max = 100) List<@Valid ItemRequest> items,
        PurchasePaymentStatus paymentStatus,
        @NotNull LocalDate issueDate,
        LocalDate dueDate,
        @Size(max = 1000) String notes) {

    public record ItemRequest(
            @NotBlank String productId,
            @Min(1) @Max(999999) int quantity,
            @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal unitCost) {}
}
