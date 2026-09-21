package com.reciptile.api.invoice;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InvoiceRequest(
        @NotBlank @Size(max = 120) String customerName,
        @Email @Size(max = 180) String customerEmail,
        @NotNull LocalDate issueDate,
        LocalDate dueDate,
        @Size(max = 1000) String notes,
        @NotEmpty @Size(max = 100) List<@Valid ItemRequest> items,
        InvoiceStatus status) {

    public record ItemRequest(
            @NotBlank String productId,
            @Min(1) @Max(999) int quantity) {}
}
