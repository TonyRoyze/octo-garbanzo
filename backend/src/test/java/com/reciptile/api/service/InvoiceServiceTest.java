package com.reciptile.api.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.reciptile.api.invoice.Invoice;
import com.reciptile.api.invoice.InvoiceLineType;
import com.reciptile.api.invoice.InvoiceRequest;
import com.reciptile.api.invoice.InvoiceStatus;
import com.reciptile.api.repository.InvoiceRepository;
import com.reciptile.api.repository.ProductRepository;
import com.reciptile.api.product.Product;
import com.reciptile.api.product.ProductStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock InvoiceRepository invoices;
    @Mock ProductRepository products;
    @Mock InventoryService inventory;
    @InjectMocks InvoiceService service;

    @Test
    void rejectsServiceLines() {
        InvoiceRequest.ItemRequest serviceLine = new InvoiceRequest.ItemRequest(
                InvoiceLineType.SERVICE,
                null,
                "Installation",
                new BigDecimal("25.00"),
                2);
        InvoiceRequest request = new InvoiceRequest(
                null,
                "Sam",
                null,
                LocalDate.of(2026, 9, 21),
                null,
                null,
                List.of(serviceLine),
                InvoiceStatus.DRAFT);

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Sales invoices only support product lines");
    }

    @Test
    void sentInvoiceConsumesProductStock() {
        Product product = new Product("product-1", "Notebook", "Paper notebook", new BigDecimal("12.00"), ProductStatus.ACTIVE);
        product.setQuantity(7);
        when(products.findById("product-1")).thenReturn(java.util.Optional.of(product));
        when(invoices.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));
        InvoiceRequest.ItemRequest line = new InvoiceRequest.ItemRequest(
                InvoiceLineType.PRODUCT, "product-1", null, null, 2);
        InvoiceRequest request = new InvoiceRequest(
                null, "Sam", null, LocalDate.of(2026, 9, 21), null, null, List.of(line), InvoiceStatus.SENT);

        service.create(request);

        verify(inventory).change(eq(product), eq(-2), eq("Invoice sale"), anyString());
    }
}
