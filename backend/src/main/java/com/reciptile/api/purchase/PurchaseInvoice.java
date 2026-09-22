package com.reciptile.api.purchase;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "purchase_invoices")
public class PurchaseInvoice {
    @Id
    private String id;
    private String purchaseInvoiceNumber;
    private String supplierId;
    private String supplierName;
    private String supplierReference;
    private List<PurchaseInvoiceItem> items = List.of();
    private BigDecimal amount;
    private String currency;
    private PurchasePaymentStatus paymentStatus;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private String notes;
    @CreatedDate
    private Instant createdAt;

    public PurchaseInvoice() {}

    public PurchaseInvoice(String purchaseInvoiceNumber, String supplierId, String supplierName,
            String supplierReference, List<PurchaseInvoiceItem> items, BigDecimal amount,
            PurchasePaymentStatus paymentStatus, LocalDate issueDate, LocalDate dueDate, String notes) {
        this.purchaseInvoiceNumber = purchaseInvoiceNumber;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.supplierReference = supplierReference;
        this.items = items;
        this.amount = amount;
        this.currency = "USD";
        this.paymentStatus = paymentStatus;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.notes = notes;
    }

    public String getId() { return id; }
    public String getPurchaseInvoiceNumber() { return purchaseInvoiceNumber; }
    public String getSupplierId() { return supplierId; }
    public String getSupplierName() { return supplierName; }
    public String getSupplierReference() { return supplierReference; }
    public List<PurchaseInvoiceItem> getItems() { return items; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public PurchasePaymentStatus getPaymentStatus() { return paymentStatus; }
    public LocalDate getIssueDate() { return issueDate; }
    public LocalDate getDueDate() { return dueDate; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
}
