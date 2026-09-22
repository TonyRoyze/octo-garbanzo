package com.reciptile.api.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.reciptile.api.invoice.Invoice;
import com.reciptile.api.invoice.InvoiceItem;
import com.reciptile.api.invoice.InvoiceLineType;
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
    private final InventoryService inventory;

    public InvoiceService(InvoiceRepository invoices, ProductRepository products, InventoryService inventory) {
        this.invoices = invoices;
        this.products = products;
        this.inventory = inventory;
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
        invoice.setCustomerId(optionalText(request.customerId()));
        reconcileStock(Map.of(), reservedItems(items, invoice.getStatus()), invoice.getInvoiceNumber());
        return invoices.save(invoice);
    }

    public Invoice update(String id, InvoiceRequest request) {
        validateDates(request);
        Invoice invoice = findById(id);
        List<InvoiceItem> items = buildItems(request);
        InvoiceStatus nextStatus = request.status() == null ? invoice.getStatus() : request.status();
        Map<String, Integer> before = reservedItems(invoice.getItems(), invoice.getStatus());
        Map<String, Integer> after = reservedItems(items, nextStatus);
        BigDecimal amount = items.stream()
                .map(InvoiceItem::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        invoice.setCustomerName(request.customerName().trim());
        invoice.setCustomerId(optionalText(request.customerId()));
        invoice.setCustomerEmail(optionalEmail(request.customerEmail()));
        invoice.setItems(items);
        invoice.setAmount(amount);
        invoice.setIssueDate(request.issueDate());
        invoice.setDueDate(request.dueDate());
        invoice.setNotes(optionalText(request.notes()));
        if (request.status() != null) invoice.setStatus(request.status());
        reconcileStock(before, after, invoice.getInvoiceNumber());
        return invoices.save(invoice);
    }

    private void validateDates(InvoiceRequest request) {
        if (request.dueDate() != null && request.dueDate().isBefore(request.issueDate())) {
            throw new IllegalArgumentException("Due date must be on or after the issue date");
        }
    }

    private List<InvoiceItem> buildItems(InvoiceRequest request) {
        return request.items().stream().map(item -> {
            if (item.type() == InvoiceLineType.SERVICE) {
                throw new IllegalArgumentException("Sales invoices only support product lines");
            }
            if (item.productId() == null || item.productId().isBlank()) {
                throw new IllegalArgumentException("Product is required for a product line");
            }
            Product product = products.findById(item.productId())
                    .orElseThrow(() -> new ProductNotFoundException(item.productId()));
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(item.quantity()));
            return new InvoiceItem(product.getId(), InvoiceLineType.PRODUCT, product.getName(), item.quantity(),
                    product.getPrice(), lineTotal);
        }).toList();
    }

    public void delete(String id) {
        Invoice invoice = findById(id);
        reconcileStock(reservedItems(invoice.getItems(), invoice.getStatus()), Map.of(), invoice.getInvoiceNumber());
        invoices.delete(invoice);
    }

    private Map<String, Integer> reservedItems(List<InvoiceItem> items, InvoiceStatus status) {
        Map<String, Integer> totals = new HashMap<>();
        if (status == InvoiceStatus.DRAFT || items == null) return totals;
        items.stream().filter(item -> item.type() == InvoiceLineType.PRODUCT && item.productId() != null)
                .forEach(item -> totals.merge(item.productId(), item.quantity(), Integer::sum));
        return totals;
    }

    private void reconcileStock(Map<String, Integer> before, Map<String, Integer> after, String reference) {
        Set<String> ids = new HashSet<>(before.keySet());
        ids.addAll(after.keySet());
        Map<String, Product> changed = new HashMap<>();
        for (String id : ids) {
            int change = before.getOrDefault(id, 0) - after.getOrDefault(id, 0);
            if (change == 0) continue;
            Product product = products.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
            if (product.getQuantity() + change < 0) {
                throw new IllegalArgumentException("Not enough stock for " + product.getName());
            }
            changed.put(id, product);
        }
        for (String id : ids) {
            int change = before.getOrDefault(id, 0) - after.getOrDefault(id, 0);
            if (change == 0) continue;
            inventory.change(changed.get(id), change, change < 0 ? "Invoice sale" : "Invoice return", reference);
        }
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
