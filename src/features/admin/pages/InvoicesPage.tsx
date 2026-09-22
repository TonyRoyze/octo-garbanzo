import { useCallback, useEffect, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import {
  invoicesApi,
  purchaseInvoicesApi,
  customersApi,
  type Contact,
  type CreateInvoiceInput,
  type CreatePurchaseInvoiceInput,
  type Invoice,
  type InvoiceStatus,
  type Product,
  type PurchaseInvoice,
} from "../../../api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currency } from "../../../lib/currency";
import { InvoiceBuilder } from "../invoices/InvoiceBuilder";
import { PurchaseInvoiceBuilder } from "../invoices/PurchaseInvoiceBuilder";
import { InvoiceStatusSelect } from "../invoices/InvoiceStatusSelect";
import { downloadInvoicePdf } from "../invoices/invoicePdf";
import { PageHeader } from "../PageHeader";
import { DataTable, DataTableColumnHeader } from "../data-table/DataTable";
import type { DataTableFeatures } from "../data-table/data-table-features";

type InvoicesPageProps = {
  products: Product[];
  onProductsChanged: () => Promise<void>;
  onNotify: (message: string) => void;
};
const columnHelper = createColumnHelper<DataTableFeatures, Invoice>();
const purchaseColumnHelper = createColumnHelper<DataTableFeatures, PurchaseInvoice>();

export function InvoicesPage({ products, onProductsChanged, onNotify }: InvoicesPageProps) {
  const [activeTab, setActiveTab] = useState("sales");
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [creating, setCreating] = useState(false);
  const [creatingPurchase, setCreatingPurchase] = useState(false);
  const building = editingInvoice !== null || creating;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(true);
  const [customers, setCustomers] = useState<Contact[]>([]);

  useEffect(() => {
    invoicesApi
      .list()
      .then(setInvoices)
      .catch((error: Error) => onNotify(error.message))
      .finally(() => setLoading(false));
  }, [onNotify]);

  useEffect(() => {
    customersApi.list().then(setCustomers).catch((error: Error) => onNotify(error.message));
  }, [onNotify]);

  useEffect(() => {
    purchaseInvoicesApi
      .list()
      .then(setPurchaseInvoices)
      .catch((error: Error) => onNotify(error.message))
      .finally(() => setPurchasesLoading(false));
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
      await onProductsChanged();
      onNotify(editingInvoice ? "Invoice updated" : "Invoice saved");
      return saved;
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Could not save invoice");
      throw error;
    }
  }

  async function savePurchaseInvoice(input: CreatePurchaseInvoiceInput) {
    try {
      const saved = await purchaseInvoicesApi.create(input);
      setPurchaseInvoices((current) => [saved, ...current]);
      setCreatingPurchase(false);
      await onProductsChanged();
      onNotify("Purchase invoice saved");
      return saved;
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Could not save purchase invoice");
      throw error;
    }
  }

  const changeStatus = useCallback(async (invoice: Invoice, status: InvoiceStatus) => {
    try {
      const updated = await invoicesApi.update(invoice.id, {
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        notes: invoice.notes,
        items: invoice.items.flatMap((item) => item.productId && (item.type ?? "PRODUCT") === "PRODUCT"
          ? [{
              type: "PRODUCT" as const,
              productId: item.productId,
              quantity: item.quantity,
            }]
          : [],
        ),
        status,
      });
      setInvoices((current) => current.map((candidate) =>
        candidate.id === updated.id ? updated : candidate,
      ));
      await onProductsChanged();
      onNotify("Invoice status updated");
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Could not update invoice status");
    }
  }, [onNotify, onProductsChanged]);

  const download = useCallback(async (invoice: Invoice) => {
    try {
      await downloadInvoicePdf({
        ...invoice,
        items: (invoice.items ?? []).flatMap((item) => item.productId && (item.type ?? "PRODUCT") === "PRODUCT"
          ? [{
              ...item,
              id: item.productId,
              productId: item.productId,
              type: "PRODUCT" as const,
            }]
          : [],
        ),
        notes: invoice.notes ?? "",
      });
      onNotify("Invoice PDF downloaded");
    } catch {
      onNotify("Could not generate the invoice PDF");
    }
  }, [onNotify]);

  const remove = useCallback(async (invoice: Invoice) => {
    try {
      await invoicesApi.remove(invoice.id);
      setInvoices((current) =>
        current.filter((candidate) => candidate.id !== invoice.id),
      );
      await onProductsChanged();
      onNotify("Invoice deleted");
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "Could not delete invoice",
      );
    }
  }, [onNotify, onProductsChanged]);

  const columns = useMemo(() => columnHelper.columns([
    columnHelper.display({
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)} aria-label="Select all invoices" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(checked) => row.toggleSelected(checked)} aria-label={`Select ${row.original.invoiceNumber}`} />,
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("invoiceNumber", {
      id: "invoice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />,
      cell: ({ row }) => <div><strong className="block">{row.original.invoiceNumber}</strong><span className="text-xs text-muted-foreground">Issued {row.original.issueDate}</span></div>,
    }),
    columnHelper.accessor("customerName", {
      id: "customer",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => <div><strong className="block">{row.original.customerName}</strong><span className="text-xs text-muted-foreground">{row.original.customerEmail || "Email not included"}</span></div>,
    }),
    columnHelper.accessor("dueDate", { header: ({ column }) => <DataTableColumnHeader column={column} title="Due" />, cell: ({ row }) => row.original.dueDate || <span className="text-muted-foreground">No due date</span> }),
    columnHelper.accessor("amount", { header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />, cell: ({ row }) => <strong className="tabular-nums">{currency.format(row.original.amount)}</strong> }),
    columnHelper.accessor("status", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <InvoiceStatusSelect value={row.original.status} onChange={(status) => changeStatus(row.original, status)} ariaLabel={`Change status for ${row.original.invoiceNumber}`} className="w-32" />,
    }),
    columnHelper.display({
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => <div className="flex justify-end"><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.invoiceNumber}`} />}><MoreHorizontal /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuLabel>Invoice actions</DropdownMenuLabel><DropdownMenuItem onClick={() => download(row.original)}>Download PDF</DropdownMenuItem><DropdownMenuItem onClick={() => setEditingInvoice(row.original)}>Edit invoice</DropdownMenuItem></DropdownMenuGroup><DropdownMenuSeparator/><DropdownMenuGroup><DropdownMenuItem variant="destructive" onClick={() => remove(row.original)}>Delete invoice</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu></div>,
    }),
  ]), [changeStatus, download, remove]);

  const purchaseColumns = useMemo(() => purchaseColumnHelper.columns([
    purchaseColumnHelper.accessor("purchaseInvoiceNumber", {
      id: "purchaseInvoice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />,
      cell: ({ row }) => <div><strong className="block">{row.original.purchaseInvoiceNumber}</strong><span className="text-xs text-muted-foreground">Issued {row.original.issueDate}</span></div>,
    }),
    purchaseColumnHelper.accessor("supplierName", {
      id: "supplier",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier" />,
      cell: ({ row }) => <strong>{row.original.supplierName}</strong>,
    }),
    purchaseColumnHelper.accessor("issueDate", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Issue date" />,
    }),
    purchaseColumnHelper.accessor("amount", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
      cell: ({ row }) => <strong className="tabular-nums">{currency.format(row.original.amount)}</strong>,
    }),
    purchaseColumnHelper.accessor("paymentStatus", {
      id: "paymentStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Payment status" />,
      cell: ({ row }) => <Badge variant="secondary">{row.original.paymentStatus.charAt(0) + row.original.paymentStatus.slice(1).toLowerCase()}</Badge>,
    }),
  ]), []);

  if (creatingPurchase) {
    return (
      <PurchaseInvoiceBuilder
        products={products}
        onCancel={() => setCreatingPurchase(false)}
        onSave={savePurchaseInvoice}
        onNotify={onNotify}
      />
    );
  }

  if (building) {
    return (
      <InvoiceBuilder
        products={products}
        customers={customers}
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
        eyebrow="Sales and purchasing"
        title="Invoices"
        description="Manage customer sales and supplier purchases."
        action={
          <Button onClick={() => activeTab === "sales" ? setCreating(true) : setCreatingPurchase(true)}>
            <Plus data-icon="inline-start" />
            {activeTab === "sales" ? "Create sales invoice" : "Create purchase invoice"}
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="pt-4">
          <section aria-label="Sales invoices">
            <DataTable
              columns={columns}
              data={invoices}
              getRowId={(invoice) => invoice.id}
              filterColumn="customer"
              filterPlaceholder="Filter customers…"
              emptyMessage={loading ? "Loading sales invoices…" : "No sales invoices yet."}
            />
          </section>
        </TabsContent>
        <TabsContent value="purchases" className="pt-4">
          <section aria-label="Purchase invoices">
            <DataTable
              columns={purchaseColumns}
              data={purchaseInvoices}
              getRowId={(invoice) => invoice.id}
              filterColumn="supplier"
              filterPlaceholder="Filter suppliers…"
              emptyMessage={purchasesLoading ? "Loading purchase invoices…" : "No purchase invoices yet."}
            />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
