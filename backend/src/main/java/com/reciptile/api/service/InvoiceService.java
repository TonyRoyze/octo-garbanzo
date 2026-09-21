package com.reciptile.api.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.reciptile.api.invoice.Invoice;
import com.reciptile.api.invoice.InvoiceItem;
import com.reciptile.api.invoice.InvoiceNotFoundException;
import com.reciptile.api.invoice.InvoiceRequest;
import com.reciptile.api.invoice.InvoiceStatus;
import com.reciptile.api.product.Product;
import com.reciptile.api.product.ProductNotFoundException;
import com.reciptile.api.repository.InvoiceRepository;
import com.reciptile.api.repository.ProductRepository;

@Service
public class InvoiceService {
    private final InvoiceRepository invoices;
    private final ProductRepository products;

    public InvoiceService(InvoiceRepository invoices, ProductRepository products) {
        this.invoices = invoices;
        this.products = products;
    }

    public List<Invoice> findAll() {
        return invoices.findAllByOrderByCreatedAtDesc();
    }

    public Invoice findById(String id) {
        return invoices.findById(id).orElseThrow(() -> new InvoiceNotFoundException(id));
    }

    public Invoice create(InvoiceRequest request) {
        validateDates(request);
        List<InvoiceItem> items = buildItems(request);
        BigDecimal amount = items.stream()
                .map(InvoiceItem::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Invoice invoice = new Invoice(
                nextInvoiceNumber(),
                request.customerName().trim(),
                optionalEmail(request.customerEmail()),
                items,
                amount,
                "USD",
                request.status() == null ? InvoiceStatus.DRAFT : request.status(),
                request.issueDate(),
                request.dueDate(),
                optionalText(request.notes()));
        return invoices.save(invoice);
    }

    public Invoice update(String id, InvoiceRequest request) {
        validateDates(request);
        Invoice invoice = findById(id);
        List<InvoiceItem> items = buildItems(request);
        BigDecimal amount = items.stream()
                .map(InvoiceItem::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        invoice.setCustomerName(request.customerName().trim());
        invoice.setCustomerEmail(optionalEmail(request.customerEmail()));
        invoice.setItems(items);
        invoice.setAmount(amount);
        invoice.setIssueDate(request.issueDate());
        invoice.setDueDate(request.dueDate());
        invoice.setNotes(optionalText(request.notes()));
        if (request.status() != null) invoice.setStatus(request.status());
        return invoices.save(invoice);
    }

    private void validateDates(InvoiceRequest request) {
        if (request.dueDate() != null && request.dueDate().isBefore(request.issueDate())) {
            throw new IllegalArgumentException("Due date must be on or after the issue date");
        }
    }

    private List<InvoiceItem> buildItems(InvoiceRequest request) {
        return request.items().stream().map(item -> {
            Product product = products.findById(item.productId())
                    .orElseThrow(() -> new ProductNotFoundException(item.productId()));
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(item.quantity()));
            return new InvoiceItem(product.getId(), product.getName(), item.quantity(),
                    product.getPrice(), lineTotal);
        }).toList();
    }

    public void delete(String id) {
        invoices.delete(findById(id));
    }

    private String nextInvoiceNumber() {
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);
        return "INV-" + java.time.Year.now().getValue() + "-" + suffix;
    }

    private String optionalEmail(String value) {
        String email = optionalText(value);
        return email == null ? null : email.toLowerCase(Locale.ROOT);
    }

    private String optionalText(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
