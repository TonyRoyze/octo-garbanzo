package com.reciptile.api.purchase;

import java.math.BigDecimal;

public record PurchaseInvoiceItem(
        String productId,
        String name,
        int quantity,
        BigDecimal unitCost,
        BigDecimal lineTotal) {}
