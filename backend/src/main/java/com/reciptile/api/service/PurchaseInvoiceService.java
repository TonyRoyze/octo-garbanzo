package com.reciptile.api.service;

import java.math.BigDecimal;
import java.time.Year;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import com.reciptile.api.contact.Supplier;
import com.reciptile.api.product.Product;
import com.reciptile.api.product.ProductNotFoundException;
import com.reciptile.api.purchase.PurchaseInvoice;
import com.reciptile.api.purchase.PurchaseInvoiceItem;
import com.reciptile.api.purchase.PurchaseInvoiceRequest;
import com.reciptile.api.purchase.PurchasePaymentStatus;
import com.reciptile.api.repository.ProductRepository;
import com.reciptile.api.repository.PurchaseInvoiceRepository;
import com.reciptile.api.repository.SupplierRepository;
import org.springframework.stereotype.Service;

@Service
public class PurchaseInvoiceService {
    private final PurchaseInvoiceRepository invoices;
    private final SupplierRepository suppliers;
    private final ProductRepository products;
    private final InventoryService inventory;

    public PurchaseInvoiceService(PurchaseInvoiceRepository invoices, SupplierRepository suppliers,
            ProductRepository products, InventoryService inventory) {
        this.invoices = invoices;
        this.suppliers = suppliers;
        this.products = products;
        this.inventory = inventory;
    }

    public List<PurchaseInvoice> findAll() {
        return invoices.findAllByOrderByCreatedAtDesc();
    }

    public PurchaseInvoice create(PurchaseInvoiceRequest request) {
        validateDates(request);
        Supplier supplier = suppliers.findById(request.supplierId())
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found: " + request.supplierId()));
        List<ResolvedItem> resolvedItems = request.items().stream().map(item -> {
            Product product = products.findById(item.productId())
                    .orElseThrow(() -> new ProductNotFoundException(item.productId()));
            BigDecimal lineTotal = item.unitCost().multiply(BigDecimal.valueOf(item.quantity()));
            return new ResolvedItem(product, new PurchaseInvoiceItem(
                    product.getId(), product.getName(), item.quantity(), item.unitCost(), lineTotal));
        }).toList();
        List<PurchaseInvoiceItem> items = resolvedItems.stream().map(ResolvedItem::item).toList();
        BigDecimal amount = items.stream()
                .map(PurchaseInvoiceItem::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        String purchaseInvoiceNumber = nextPurchaseInvoiceNumber();
        PurchaseInvoice invoice = new PurchaseInvoice(
                purchaseInvoiceNumber,
                supplier.getId(),
                supplier.getName(),
                optionalText(request.supplierReference()),
                items,
                amount,
                request.paymentStatus() == null ? PurchasePaymentStatus.CREDIT : request.paymentStatus(),
                request.issueDate(),
                request.dueDate(),
                optionalText(request.notes()));
        PurchaseInvoice saved = invoices.save(invoice);
        resolvedItems.forEach(item -> inventory.change(
                item.product(), item.item().quantity(), "Purchase invoice", purchaseInvoiceNumber));
        return saved;
    }

    private void validateDates(PurchaseInvoiceRequest request) {
        if (request.dueDate() != null && request.dueDate().isBefore(request.issueDate())) {
            throw new IllegalArgumentException("Due date must be on or after the issue date");
        }
    }

    private String nextPurchaseInvoiceNumber() {
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);
        return "PINV-" + Year.now().getValue() + "-" + suffix;
    }

    private String optionalText(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private record ResolvedItem(Product product, PurchaseInvoiceItem item) {}
}
