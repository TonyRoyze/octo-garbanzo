import type { PDFFont } from "pdf-lib";
import type { InvoiceDocumentData } from "./types";

const pageWidth = 595.28;
const pageHeight = 841.89;
const margin = 48;

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

function shortDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function trimToWidth(text: string, font: PDFFont, size: number, width: number) {
  if (font.widthOfTextAtSize(text, size) <= width) return text;
  let result = text;
  while (
    result.length > 1 &&
    font.widthOfTextAtSize(`${result}…`, size) > width
  ) {
    result = result.slice(0, -1);
  }
  return `${result}…`;
}

export async function createInvoicePdf(data: InvoiceDocumentData) {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
  const green = rgb(24 / 255, 53 / 255, 43 / 255);
  const sage = rgb(220 / 255, 229 / 255, 216 / 255);
  const ink = rgb(32 / 255, 38 / 255, 34 / 255);
  const muted = rgb(101 / 255, 113 / 255, 105 / 255);
  const paper = rgb(248 / 255, 250 / 255, 246 / 255);
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  document.setTitle(`${data.invoiceNumber} — ${data.customerName || "Invoice"}`);
  document.setAuthor("Morrow goods");
  document.setSubject("Customer invoice");

  const firstPageItems = data.items.slice(0, 12);
  const remainingItems = data.items.slice(12);
  const chunks = data.items.length
    ? [
        firstPageItems,
        ...Array.from(
          { length: Math.ceil(remainingItems.length / 16) },
          (_, index) => remainingItems.slice(index * 16, index * 16 + 16),
        ),
      ]
    : [[]];

  chunks.forEach((items, pageIndex) => {
    const page = document.addPage([pageWidth, pageHeight]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: paper,
    });

    page.drawRectangle({
      x: margin,
      y: pageHeight - 80,
      width: 34,
      height: 34,
      color: green,
    });
    page.drawText("m", {
      x: margin + 13,
      y: pageHeight - 69,
      size: 13,
      font: bold,
      color: paper,
    });
    page.drawText("Morrow", {
      x: margin + 46,
      y: pageHeight - 64,
      size: 16,
      font: bold,
      color: green,
    });
    page.drawText(pageIndex === 0 ? "INVOICE" : "INVOICE — CONTINUED", {
      x: pageWidth - margin - (pageIndex === 0 ? 82 : 154),
      y: pageHeight - 66,
      size: 11,
      font: bold,
      color: muted,
    });

    if (pageIndex === 0) {
      page.drawText(data.invoiceNumber, {
        x: margin,
        y: pageHeight - 138,
        size: 27,
        font: bold,
        color: ink,
      });
      page.drawText("Bill to", {
        x: margin,
        y: pageHeight - 184,
        size: 9,
        font: bold,
        color: muted,
      });
      page.drawText(data.customerName || "Customer name", {
        x: margin,
        y: pageHeight - 204,
        size: 13,
        font: bold,
        color: ink,
      });
      if (data.customerEmail) {
        page.drawText(data.customerEmail, {
          x: margin,
          y: pageHeight - 222,
          size: 10,
          font: regular,
          color: muted,
        });
      }
      page.drawText("Issued", {
        x: 370,
        y: pageHeight - 184,
        size: 9,
        font: bold,
        color: muted,
      });
      page.drawText(shortDate(data.issueDate), {
        x: 370,
        y: pageHeight - 204,
        size: 11,
        font: regular,
        color: ink,
      });
      if (data.dueDate) {
        page.drawText("Due", {
          x: 470,
          y: pageHeight - 184,
          size: 9,
          font: bold,
          color: muted,
        });
        page.drawText(shortDate(data.dueDate), {
          x: 470,
          y: pageHeight - 204,
          size: 11,
          font: regular,
          color: ink,
        });
      }
    }

    const tableTop = pageIndex === 0 ? pageHeight - 270 : pageHeight - 120;
    page.drawRectangle({
      x: margin,
      y: tableTop - 26,
      width: pageWidth - margin * 2,
      height: 26,
      color: sage,
    });
    [
      ["Item", margin + 10],
      ["Qty", 350],
      ["Price", 407],
      ["Total", 494],
    ].forEach(([label, x]) =>
      page.drawText(String(label), {
        x: Number(x),
        y: tableTop - 17,
        size: 8,
        font: bold,
        color: green,
      }),
    );

    items.forEach((item, index) => {
      const y = tableTop - 52 - index * 31;
      page.drawText(trimToWidth(item.name, regular, 10, 270), {
        x: margin + 10,
        y,
        size: 10,
        font: regular,
        color: ink,
      });
      page.drawText(String(item.quantity), {
        x: 350,
        y,
        size: 10,
        font: regular,
        color: ink,
      });
      page.drawText(money(item.unitPrice, data.currency), {
        x: 407,
        y,
        size: 10,
        font: regular,
        color: ink,
      });
      const lineTotal = money(item.lineTotal, data.currency);
      page.drawText(lineTotal, {
        x: pageWidth - margin - 10 - regular.widthOfTextAtSize(lineTotal, 10),
        y,
        size: 10,
        font: regular,
        color: ink,
      });
      page.drawLine({
        start: { x: margin, y: y - 12 },
        end: { x: pageWidth - margin, y: y - 12 },
        thickness: 0.5,
        color: rgb(0.84, 0.87, 0.84),
      });
    });

    const isLastPage = pageIndex === chunks.length - 1;
    if (isLastPage) {
      const totalY = Math.max(130, tableTop - 68 - items.length * 31);
      page.drawText("Total due", {
        x: 370,
        y: totalY,
        size: 10,
        font: bold,
        color: muted,
      });
      const total = money(data.amount, data.currency);
      page.drawText(total, {
        x: pageWidth - margin - bold.widthOfTextAtSize(total, 22),
        y: totalY - 4,
        size: 22,
        font: bold,
        color: green,
      });
      if (data.notes) {
        page.drawText("Notes", {
          x: margin,
          y: totalY,
          size: 9,
          font: bold,
          color: muted,
        });
        page.drawText(trimToWidth(data.notes, regular, 9, 270), {
          x: margin,
          y: totalY - 18,
          size: 9,
          font: regular,
          color: ink,
        });
      }
    }

    page.drawLine({
      start: { x: margin, y: 62 },
      end: { x: pageWidth - margin, y: 62 },
      thickness: 0.7,
      color: green,
    });
    page.drawText("Morrow goods", {
      x: margin,
      y: 43,
      size: 8,
      font: bold,
      color: green,
    });
    page.drawText(`Page ${pageIndex + 1} of ${chunks.length}`, {
      x: pageWidth - margin - 54,
      y: 43,
      size: 8,
      font: regular,
      color: muted,
    });
  });

  return document.save();
}

export async function downloadInvoicePdf(data: InvoiceDocumentData) {
  const bytes = await createInvoicePdf(data);
  const blob = new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${data.invoiceNumber || "invoice"}.pdf`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
