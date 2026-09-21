import { currency } from "../../../lib/currency";
import type { InvoiceDocumentData } from "./types";

function displayDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function InvoicePreview({ invoice }: { invoice: InvoiceDocumentData }) {
  return (
    <section className="invoice-preview-wrap" aria-label="PDF preview">
      <div className="invoice-preview-label">
        <span>PDF preview</span>
        <span>A4</span>
      </div>
      <article className="invoice-paper">
        <header className="invoice-paper-header">
          <div className="invoice-paper-brand">
            <span>m</span>
            <strong>Morrow</strong>
          </div>
          <span>Invoice</span>
        </header>

        <h2>{invoice.invoiceNumber || "Draft invoice"}</h2>

        <div className="invoice-paper-meta">
          <div>
            <small>Bill to</small>
            <strong>{invoice.customerName || "Customer name"}</strong>
            {invoice.customerEmail && <span>{invoice.customerEmail}</span>}
          </div>
          <dl>
            <div>
              <dt>Issued</dt>
              <dd>{displayDate(invoice.issueDate)}</dd>
            </div>
            {invoice.dueDate && (
              <div>
                <dt>Due</dt>
                <dd>{displayDate(invoice.dueDate)}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="invoice-paper-table" role="table">
          <div className="invoice-paper-row invoice-paper-table-head" role="row">
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Total</span>
          </div>
          {invoice.items.length ? (
            invoice.items.map((item) => (
              <div className="invoice-paper-row" role="row" key={item.productId}>
                <strong>{item.name}</strong>
                <span>{item.quantity}</span>
                <span>{currency.format(item.unitPrice)}</span>
                <span>{currency.format(item.lineTotal)}</span>
              </div>
            ))
          ) : (
            <div className="invoice-paper-empty">Selected products appear here.</div>
          )}
        </div>

        <div className="invoice-paper-bottom">
          <div>
            {invoice.notes && (
              <>
                <small>Notes</small>
                <p>{invoice.notes}</p>
              </>
            )}
          </div>
          <div className="invoice-paper-total">
            <span>Total due</span>
            <strong>{currency.format(invoice.amount)}</strong>
          </div>
        </div>

        <footer>
          <strong>Morrow goods</strong>
          <span>Thank you for your business.</span>
        </footer>
      </article>
    </section>
  );
}
