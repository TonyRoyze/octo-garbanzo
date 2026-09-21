package com.reciptile.api.invoice;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "invoices")
public class Invoice {
    @Id
    private String id;
    private String invoiceNumber;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private List<InvoiceItem> items = List.of();
    private BigDecimal amount;
    private String currency;
    private InvoiceStatus status;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private String notes = "";
    @CreatedDate
    private Instant createdAt;

    public Invoice() {}

    public Invoice(String invoiceNumber, String customerName, String customerEmail,
            BigDecimal amount, String currency, InvoiceStatus status,
            LocalDate issueDate, LocalDate dueDate) {
        this(invoiceNumber, customerName, customerEmail, List.of(), amount, currency,
                status, issueDate, dueDate, "");
    }

    public Invoice(String invoiceNumber, String customerName, String customerEmail,
            List<InvoiceItem> items, BigDecimal amount, String currency, InvoiceStatus status,
            LocalDate issueDate, LocalDate dueDate, String notes) {
        this.invoiceNumber = invoiceNumber;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.items = items;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.notes = notes;
    }

    public String getId() { return id; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public String getCustomerId() { return customerId; }
    public String getCustomerName() { return customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public List<InvoiceItem> getItems() { return items; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public InvoiceStatus getStatus() { return status; }
    public LocalDate getIssueDate() { return issueDate; }
    public LocalDate getDueDate() { return dueDate; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }

    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public void setItems(List<InvoiceItem> items) { this.items = items; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public void setNotes(String notes) { this.notes = notes; }
    public void setStatus(InvoiceStatus status) { this.status = status; }
}
