import { useEffect, useState } from "react";
import { Download, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import {
  invoicesApi,
  type CreateInvoiceInput,
  type Invoice,
  type InvoiceStatus,
  type Product,
} from "../../../api";
import { Button } from "@/components/ui/button";
import { currency } from "../../../lib/currency";
import { InvoiceBuilder } from "../invoices/InvoiceBuilder";
import { downloadInvoicePdf } from "../invoices/invoicePdf";
import { PageHeader } from "../PageHeader";

type InvoicesPageProps = {
  products: Product[];
  onNotify: (message: string) => void;
};

export function InvoicesPage({ products, onNotify }: InvoicesPageProps) {
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [creating, setCreating] = useState(false);
  const building = editingInvoice !== null || creating;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoicesApi
      .list()
      .then(setInvoices)
      .catch((error: Error) => onNotify(error.message))
      .finally(() => setLoading(false));
  }, [onNotify]);

  async function saveInvoice(input: CreateInvoiceInput) {
    try {
      const saved = editingInvoice
        ? await invoicesApi.update(editingInvoice.id, input)
        : await invoicesApi.create(input);
      setInvoices((current) => editingInvoice
        ? current.map((invoice) => invoice.id === saved.id ? saved : invoice)
        : [saved, ...current]);
      setEditingInvoice(null);
      setCreating(false);
      onNotify(editingInvoice ? "Invoice updated" : "Invoice saved");
      return saved;
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Could not save invoice");
      throw error;
    }
  }

  async function changeStatus(invoice: Invoice, status: InvoiceStatus) {
    try {
      const updated = await invoicesApi.update(invoice.id, {
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        notes: invoice.notes,
        items: invoice.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        status,
      });
      setInvoices((current) => current.map((candidate) =>
        candidate.id === updated.id ? updated : candidate,
      ));
      onNotify("Invoice status updated");
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Could not update invoice status");
    }
  }

  async function download(invoice: Invoice) {
    try {
      await downloadInvoicePdf({
        ...invoice,
        items: invoice.items ?? [],
        notes: invoice.notes ?? "",
      });
      onNotify("Invoice PDF downloaded");
    } catch {
      onNotify("Could not generate the invoice PDF");
    }
  }

  async function remove(invoice: Invoice) {
    try {
      await invoicesApi.remove(invoice.id);
      setInvoices((current) =>
        current.filter((candidate) => candidate.id !== invoice.id),
      );
      onNotify("Invoice deleted");
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "Could not delete invoice",
      );
    }
  }

  if (building) {
    return (
      <InvoiceBuilder
        products={products}
        invoice={editingInvoice}
        onCancel={() => {
          setEditingInvoice(null);
          setCreating(false);
        }}
        onSave={saveInvoice}
        onNotify={onNotify}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-8">
      <PageHeader
        eyebrow="Money in, made simple"
        title="Invoices"
        description="Build, preview and download customer invoices."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus data-icon="inline-start" />
            Create invoice
          </Button>
        }
      />

      <section className="invoice-list" aria-label="Saved invoices">
        <div className="invoice-list-header">
          <span>Invoice</span>
          <span>Customer</span>
          <span>Due</span>
          <span>Total</span>
          <span>Status</span>
          <span aria-hidden="true" />
        </div>
        {loading && <div className="invoice-list-empty">Loading invoices…</div>}
        {!loading && invoices.length === 0 && (
          <div className="invoice-list-empty">
            <FileText />
            <strong>No invoices yet</strong>
            <span>Create one and the PDF will be ready immediately.</span>
            <Button onClick={() => setCreating(true)}>Create invoice</Button>
          </div>
        )}
        {invoices.map((invoice) => (
          <article className="invoice-list-row" key={invoice.id}>
            <div data-label="Invoice">
              <strong>{invoice.invoiceNumber}</strong>
              <span>Issued {invoice.issueDate}</span>
            </div>
            <div data-label="Customer">
              <strong>{invoice.customerName}</strong>
              <span>{invoice.customerEmail || "Email not included"}</span>
            </div>
            <span data-label="Due">{invoice.dueDate || "No due date"}</span>
            <strong data-label="Total">{currency.format(invoice.amount)}</strong>
            <div data-label="Status">
              <select
                className="invoice-status-select"
                aria-label={`Change status for ${invoice.invoiceNumber}`}
                value={invoice.status}
                onChange={(event) => changeStatus(invoice, event.target.value as InvoiceStatus)}
              >
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
            <div className="invoice-list-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => download(invoice)}
              >
                <Download data-icon="inline-start" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingInvoice(invoice)}
              >
                <Pencil data-icon="inline-start" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${invoice.invoiceNumber}`}
                onClick={() => remove(invoice)}
              >
                <Trash2 />
              </Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
