package com.reciptile.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.reciptile.api.contact.Supplier;
import com.reciptile.api.product.Product;
import com.reciptile.api.product.ProductStatus;
import com.reciptile.api.purchase.PurchaseInvoice;
import com.reciptile.api.purchase.PurchaseInvoiceRequest;
import com.reciptile.api.repository.ProductRepository;
import com.reciptile.api.repository.PurchaseInvoiceRepository;
import com.reciptile.api.repository.SupplierRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PurchaseInvoiceServiceTest {

    @Mock PurchaseInvoiceRepository invoices;
    @Mock SupplierRepository suppliers;
    @Mock ProductRepository products;
    @Mock InventoryService inventory;
    @InjectMocks PurchaseInvoiceService service;

    @Test
    void createsPurchaseInvoiceAndIncreasesStock() {
        Supplier supplier = org.mockito.Mockito.mock(Supplier.class);
        when(supplier.getId()).thenReturn("supplier-1");
        when(supplier.getName()).thenReturn("Paper Supply Co");
        Product product = new Product(
                "product-1", "Notebook", "Paper notebook", new BigDecimal("12.00"), ProductStatus.ACTIVE);
        product.setQuantity(7);
        when(suppliers.findById("supplier-1")).thenReturn(Optional.of(supplier));
        when(products.findById("product-1")).thenReturn(Optional.of(product));
        when(invoices.save(any(PurchaseInvoice.class))).thenAnswer(invocation -> invocation.getArgument(0));
        PurchaseInvoiceRequest request = new PurchaseInvoiceRequest(
                "supplier-1",
                "SUP-42",
                List.of(new PurchaseInvoiceRequest.ItemRequest("product-1", 3, new BigDecimal("8.50"))),
                null,
                LocalDate.of(2026, 9, 21),
                LocalDate.of(2026, 10, 21),
                null);

        PurchaseInvoice created = service.create(request);

        assertThat(created.getAmount()).isEqualByComparingTo("25.50");
        assertThat(created.getCurrency()).isEqualTo("USD");
        assertThat(created.getPaymentStatus().name()).isEqualTo("CREDIT");
        assertThat(created.getItems().getFirst().name()).isEqualTo("Notebook");
        verify(inventory).change(eq(product), eq(3), eq("Purchase invoice"), anyString());
    }

    @Test
    void rejectsDueDateBeforeIssueDate() {
        PurchaseInvoiceRequest request = new PurchaseInvoiceRequest(
                "supplier-1",
                null,
                List.of(new PurchaseInvoiceRequest.ItemRequest("product-1", 1, BigDecimal.ONE)),
                null,
                LocalDate.of(2026, 9, 21),
                LocalDate.of(2026, 9, 20),
                null);

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Due date must be on or after the issue date");
        verify(suppliers, never()).findById(anyString());
        verify(invoices, never()).save(any());
    }
}
