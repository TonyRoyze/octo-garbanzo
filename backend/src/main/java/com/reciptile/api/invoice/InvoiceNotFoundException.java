package com.reciptile.api.invoice;

public class InvoiceNotFoundException extends RuntimeException {
    public InvoiceNotFoundException(String id) {
        super("Invoice not found: " + id);
    }
}
