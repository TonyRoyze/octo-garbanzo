export type InvoiceDocumentItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type InvoiceDocumentData = {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string | null;
  issueDate: string;
  dueDate: string | null;
  notes: string | null;
  items: InvoiceDocumentItem[];
  amount: number;
  currency: string;
};
