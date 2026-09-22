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
    <section
      className="min-w-0 self-start bg-[#dce5d8] p-[clamp(1.5rem,4vw,4.5rem)] max-[1050px]:px-5 max-[1050px]:py-8 max-[820px]:border-t max-[820px]:border-[#cbd4c9] max-[520px]:px-[0.65rem] max-[520px]:py-5"
      aria-label="PDF preview"
    >
      <div className="mx-auto mb-3 flex w-[min(100%,46rem)] justify-between text-[0.72rem] font-bold text-[#53665a]">
        <span>PDF preview</span>
        <span>A4</span>
      </div>
      <article className="mx-auto flex min-h-0 w-[min(100%,46rem)] aspect-[1/1.414] flex-col bg-[#fdfefb] p-[clamp(1.4rem,4.5vw,4rem)] text-[#202622] shadow-[0_1.8rem_5rem_rgb(24_53_43/16%)] max-[520px]:p-[1.1rem]">
        <header className="flex items-center justify-between text-[0.72rem] font-bold text-[#69766e]">
          <div className="flex items-center gap-[0.65rem] text-base text-[#18352b]">
            <span className="grid size-[2.1rem] place-items-center bg-[#18352b] text-[#f4f6f1]">m</span>
            <strong>Morrow</strong>
          </div>
          <span>Invoice</span>
        </header>

        <h2 className="mx-0 mb-8 mt-[clamp(2rem,6vw,4rem)] font-heading text-[clamp(1.7rem,4vw,2.8rem)] tracking-[-0.04em] max-[520px]:mb-5 max-[520px]:mt-[1.7rem]">
          {invoice.invoiceNumber || "Draft invoice"}
        </h2>

        <div className="mb-10 grid grid-cols-[minmax(0,1fr)_auto] gap-8 max-[520px]:mb-5 max-[520px]:grid-cols-1 max-[520px]:gap-[0.8rem]">
          <div className="grid gap-1">
            <small className="text-[0.65rem] font-bold text-[#7b877f]">Bill to</small>
            <strong>{invoice.customerName || "Customer name"}</strong>
            {invoice.customerEmail && (
              <span className="text-[0.72rem] text-[#657169]">{invoice.customerEmail}</span>
            )}
          </div>
          <dl className="m-0 grid grid-cols-[auto_auto] gap-6 max-[520px]:gap-3">
            <div className="grid gap-1">
              <dt className="text-[0.65rem] font-bold text-[#7b877f]">Issued</dt>
              <dd className="m-0 text-[0.72rem] text-[#657169]">{displayDate(invoice.issueDate)}</dd>
            </div>
            {invoice.dueDate && (
              <div className="grid gap-1">
                <dt className="text-[0.65rem] font-bold text-[#7b877f]">Due</dt>
                <dd className="m-0 text-[0.72rem] text-[#657169]">{displayDate(invoice.dueDate)}</dd>
              </div>
            )}
          </dl>
        </div>

        <div role="table">
          <div
            className="grid min-h-[2.2rem] grid-cols-[minmax(0,2fr)_0.45fr_0.8fr_0.8fr] items-center gap-2 bg-[#dce5d8] px-[0.55rem] text-[0.62rem] font-[750] text-[#18352b] [&>:not(:first-child)]:text-right"
            role="row"
          >
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Total</span>
          </div>
          {invoice.items.length ? (
            invoice.items.map((item) => (
              <div
                className="grid min-h-11 grid-cols-[minmax(0,2fr)_0.45fr_0.8fr_0.8fr] items-center gap-2 border-b border-[#e1e5df] px-[0.55rem] text-[clamp(0.58rem,1vw,0.78rem)] [&>:not(:first-child)]:text-right"
                role="row"
                key={item.id}
              >
                <strong>{item.name}</strong>
                <span>{item.quantity}</span>
                <span>{currency.format(item.unitPrice)}</span>
                <span>{currency.format(item.lineTotal)}</span>
              </div>
            ))
          ) : (
            <div className="border-b border-[#e1e5df] px-2 py-10 text-center text-[0.72rem] text-[#849087]">
              Selected products appear here.
            </div>
          )}
        </div>

        <div className="mt-10 grid grid-cols-[1fr_auto] gap-8 max-[520px]:mt-5 max-[520px]:grid-cols-1 max-[520px]:gap-3">
          <div>
            {invoice.notes && (
              <>
                <small className="text-[0.65rem] font-bold text-[#7b877f]">Notes</small>
                <p className="mb-0 mt-[0.35rem] max-w-[32ch] text-[0.7rem] leading-[1.45] text-[#657169]">{invoice.notes}</p>
              </>
            )}
          </div>
          <div className="grid gap-1 text-right max-[520px]:text-left">
            <span className="text-[0.72rem] text-[#657169]">Total due</span>
            <strong className="font-heading text-[clamp(1.3rem,3vw,2rem)] text-[#18352b]">
              {currency.format(invoice.amount)}
            </strong>
          </div>
        </div>

        <footer className="mt-auto flex justify-between border-t border-[#18352b] pt-4 text-[0.62rem] text-[#657169]">
          <strong className="text-[#18352b]">Morrow goods</strong>
          <span className="max-[520px]:hidden">Thank you for your business.</span>
        </footer>
      </article>
    </section>
  );
}
