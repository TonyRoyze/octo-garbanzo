package com.reciptile.api.invoice;

import java.math.BigDecimal;

public record InvoiceItem(
        String productId,
        InvoiceLineType type,
        String name,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal) {}
