import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Download, Save, Trash2 } from "lucide-react";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceStatus,
  Product,
} from "../../../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { currency } from "../../../lib/currency";
import { downloadInvoicePdf } from "./invoicePdf";
import { InvoicePreview } from "./InvoicePreview";
import { ProductPicker } from "./ProductPicker";
import type { InvoiceDocumentData } from "./types";

type SelectedItem = {
  productId: string;
  quantity: number;
};

type InvoiceBuilderProps = {
  products: Product[];
  invoice?: Invoice | null;
  onCancel: () => void;
  onSave: (input: CreateInvoiceInput) => Promise<Invoice>;
  onNotify: (message: string) => void;
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function InvoiceBuilder({
  products,
  invoice = null,
  onCancel,
  onSave,
  onNotify,
}: InvoiceBuilderProps) {
  const today = useMemo(() => new Date(), []);
  const defaultDueDate = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 30);
    return isoDate(date);
  }, [today]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [includeCustomerEmail, setIncludeCustomerEmail] = useState(true);
  const [issueDate, setIssueDate] = useState(isoDate(today));
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [includeDueDate, setIncludeDueDate] = useState(true);
  const [notes, setNotes] = useState("");
  const [includeNotes, setIncludeNotes] = useState(true);
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status ?? "DRAFT");

  useEffect(() => {
    if (!invoice) return;
    setCustomerName(invoice.customerName);
    setCustomerEmail(invoice.customerEmail ?? "");
    setIncludeCustomerEmail(Boolean(invoice.customerEmail));
    setIssueDate(invoice.issueDate);
    setDueDate(invoice.dueDate ?? defaultDueDate);
    setIncludeDueDate(Boolean(invoice.dueDate));
    setNotes(invoice.notes ?? "");
    setIncludeNotes(Boolean(invoice.notes));
    setItems(invoice.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })));
    setStatus(invoice.status);
  }, [defaultDueDate, invoice]);

  const document = useMemo<InvoiceDocumentData>(() => {
    const documentItems = items.flatMap((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) return [];
      return [
        {
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          lineTotal: product.price * item.quantity,
        },
      ];
    });
    return {
      invoiceNumber: invoice?.invoiceNumber ?? "Draft invoice",
      customerName,
      customerEmail: includeCustomerEmail ? customerEmail : "",
      issueDate,
      dueDate: includeDueDate ? dueDate : "",
      notes: includeNotes ? notes : "",
      items: documentItems,
      amount: documentItems.reduce((sum, item) => sum + item.lineTotal, 0),
      currency: "USD",
    };
  }, [
    customerEmail,
    customerName,
    dueDate,
    includeCustomerEmail,
    includeDueDate,
    includeNotes,
    issueDate,
    items,
    notes,
    products,
    invoice,
  ]);

  const availableProducts = products.filter(
    (product) => !items.some((item) => item.productId === product.id),
  );

  function addProduct(productId: string) {
    setItems((current) => [
      ...current,
      { productId, quantity: 1 },
    ]);
  }

  function changeQuantity(productId: string, quantity: number) {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, Math.min(999, quantity || 1)) }
          : item,
      ),
    );
  }

  async function download() {
    setDownloading(true);
    try {
      await downloadInvoicePdf(document);
      onNotify("Invoice PDF downloaded");
    } catch {
      onNotify("Could not generate the invoice PDF");
    } finally {
      setDownloading(false);
    }
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) {
      onNotify("Add at least one product to the invoice");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        customerName,
        customerEmail: includeCustomerEmail ? customerEmail : null,
        issueDate,
        dueDate: includeDueDate ? dueDate : null,
        notes: includeNotes ? notes : null,
        items,
        status,
      });
    } catch {
      // The parent surfaces the API error and keeps the draft intact.
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="invoice-builder" onSubmit={submit}>
      <section className="invoice-controls">
        <div className="invoice-builder-heading">
          <div>
            <h1>{invoice ? `Edit ${invoice.invoiceNumber}` : "Create invoice"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="invoice-status">Invoice status</label>
            <select
              id="invoice-status"
              className="invoice-status-select"
              value={status}
              onChange={(event) => setStatus(event.target.value as InvoiceStatus)}
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>

        <fieldset>
          {/*<legend>Customer</legend>*/}
          <label>
            Name
            <Input
              required
              maxLength={120}
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Customer or company"
            />
          </label>
          <div className="invoice-optional-field">
            <div className="invoice-field-heading">
              <label htmlFor="invoice-customer-email">Email</label>
              <span>
                Include
                <Switch
                  size="sm"
                  checked={includeCustomerEmail}
                  onCheckedChange={setIncludeCustomerEmail}
                  aria-label="Include customer email on invoice"
                />
              </span>
            </div>
            <Input
              id="invoice-customer-email"
              required={includeCustomerEmail}
              disabled={!includeCustomerEmail}
              type="email"
              maxLength={180}
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              placeholder="billing@example.com"
            />
          </div>
          <div className="invoice-date-grid">
            <label>
              Issue date
              <Input
                required
                type="date"
                value={issueDate}
                onChange={(event) => setIssueDate(event.target.value)}
              />
            </label>
            <div className="invoice-optional-field">
              <div className="invoice-field-heading">
                <label htmlFor="invoice-due-date">Due date</label>
                <span>
                  Include
                  <Switch
                    size="sm"
                    checked={includeDueDate}
                    onCheckedChange={setIncludeDueDate}
                    aria-label="Include due date on invoice"
                  />
                </span>
              </div>
              <Input
                id="invoice-due-date"
                required={includeDueDate}
                disabled={!includeDueDate}
                type="date"
                min={issueDate}
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Products</legend>
          <ProductPicker products={availableProducts} onAdd={addProduct} />

          <div className="invoice-line-items">
            {items.length === 0 && (
              <p className="invoice-line-empty">
                Select products to start building the invoice.
              </p>
            )}
            {items.map((item) => {
              const product = products.find(
                (candidate) => candidate.id === item.productId,
              );
              if (!product) return null;
              return (
                <div className="invoice-line-item" key={item.productId}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{currency.format(product.price)} each</span>
                  </div>
                  <div className="invoice-quantity">
                    <Input
                      aria-label={`${product.name} quantity`}
                      type="number"
                      min="1"
                      max="999"
                      value={item.quantity}
                      onChange={(event) =>
                        changeQuantity(
                          item.productId,
                          Number(event.target.value),
                        )
                      }
                    />
                  </div>
                  <strong>{currency.format(product.price * item.quantity)}</strong>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Remove ${product.name}`}
                    onClick={() =>
                      setItems((current) =>
                        current.filter(
                          (candidate) => candidate.productId !== item.productId,
                        ),
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend>Notes</legend>
          <div className="invoice-optional-field">
            <div className="invoice-field-heading">
              <label htmlFor="invoice-notes">Payment or delivery details</label>
              <span>
                Include
                <Switch
                  size="sm"
                  checked={includeNotes}
                  onCheckedChange={setIncludeNotes}
                  aria-label="Include notes on invoice"
                />
              </span>
            </div>
            <textarea
              id="invoice-notes"
              disabled={!includeNotes}
              maxLength={1000}
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional note shown on the invoice"
            />
          </div>
        </fieldset>

        <div className="invoice-builder-actions">
          <Button
            type="button"
            variant="outline"
            disabled={!items.length || downloading}
            onClick={download}
          >
            <Download data-icon="inline-start" />
            {downloading ? "Preparing…" : "Download draft PDF"}
          </Button>
          <Button type="submit" disabled={saving || !items.length}>
            <Save data-icon="inline-start" />
            {saving ? "Saving…" : "Save invoice"}
          </Button>
        </div>
      </section>

      <InvoicePreview invoice={document} />
    </form>
  );
}
