import { useCallback, useEffect, useMemo, useState, type SubmitEvent } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal, PackagePlus, Plus } from "lucide-react";
import {
  getProductImages,
  purchaseInvoicesApi,
  suppliersApi,
  type Contact,
  type Product,
  type PurchasePaymentStatus,
} from "../../../api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currency } from "../../../lib/currency";
import { DataTable, DataTableColumnHeader } from "../data-table/DataTable";
import type { DataTableFeatures } from "../data-table/data-table-features";
import { PageHeader } from "../PageHeader";

type ProductsPageProps = {
  products: Product[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onProductsChanged: () => Promise<void>;
  onNotify: (message: string) => void;
};

const columnHelper = createColumnHelper<DataTableFeatures, Product>();

export function ProductsPage({
  products,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onProductsChanged,
  onNotify,
}: ProductsPageProps) {
  const [restocking, setRestocking] = useState<Product | null>(null);
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);
  const [reference, setReference] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PurchasePaymentStatus>("CREDIT");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    suppliersApi.list().then(setSuppliers).catch((error: Error) => onNotify(error.message));
  }, [onNotify]);

  const openRestock = useCallback((product: Product) => {
    setRestocking(product);
    setSupplierId(product.supplierId ?? "");
    setQuantity(1);
    setUnitCost(product.price);
    setReference("");
    setPaymentStatus("CREDIT");
    setIssueDate(new Date().toISOString().slice(0, 10));
  }, []);

  async function restock(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!restocking || !supplierId || quantity < 1 || unitCost < 0) return;
    setSaving(true);
    try {
      await purchaseInvoicesApi.create({
        supplierId,
        supplierReference: reference.trim() || null,
        issueDate,
        dueDate: null,
        notes: null,
        paymentStatus,
        items: [{ productId: restocking.id, quantity, unitCost }],
      });
      await onProductsChanged();
      setRestocking(null);
      onNotify(`${restocking.name} restocked by ${quantity}`);
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Could not restock product");
    } finally {
      setSaving(false);
    }
  }

  const columns = useMemo(() => columnHelper.columns([
    columnHelper.display({
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)} aria-label="Select all products" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(checked) => row.toggleSelected(checked)} aria-label={`Select ${row.original.name}`} />,
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("name", {
      id: "product",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
      cell: ({ row }) => {
        const product = row.original;
        const image = getProductImages(product)[0];
        return <div className="flex min-w-64 items-center gap-3"><div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-xs text-muted-foreground">{image ? <img className="size-full object-cover" src={image.url} alt={image.alt || product.name} /> : product.name.charAt(0).toUpperCase()}</div><div className="min-w-0"><strong className="block">{product.name}</strong><span className="block max-w-80 truncate text-xs text-muted-foreground">{product.description}</span></div></div>;
      },
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge variant="secondary">{row.original.status === "ACTIVE" ? "Active" : "Draft"}</Badge>,
    }),
    columnHelper.accessor("quantity", {
      id: "stock",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
      cell: ({ row }) => <span className="flex items-center gap-2"><span className="font-medium tabular-nums">{row.original.quantity}</span>{row.original.quantity <= (row.original.lowStockThreshold ?? 5) && <Badge variant="outline">Low</Badge>}</span>,
    }),
    columnHelper.accessor("price", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
      cell: ({ row }) => <span className="font-medium tabular-nums">{currency.format(row.original.price)}</span>,
    }),
    columnHelper.display({
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => <div className="flex justify-end"><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.name}`} />}><MoreHorizontal /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuLabel>Product actions</DropdownMenuLabel><DropdownMenuItem onClick={() => openRestock(row.original)}><PackagePlus />Restock</DropdownMenuItem><DropdownMenuItem onClick={() => onEdit(row.original)}>Edit product</DropdownMenuItem></DropdownMenuGroup><DropdownMenuSeparator/><DropdownMenuGroup><DropdownMenuItem variant="destructive" onClick={() => onDelete(row.original.id)}>Delete product</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu></div>,
    }),
  ]), [onDelete, onEdit, openRestock]);

  return <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-8">
    <PageHeader eyebrow="Catalog" title="Products" description="Create and organise the things you sell." action={<Button onClick={onAdd}><Plus data-icon="inline-start" />Add product</Button>} />
    <DataTable columns={columns} data={products} getRowId={(product) => product.id} filterColumn="product" filterPlaceholder="Filter products…" emptyMessage={loading ? "Loading products…" : "No products found."} />
    <Dialog open={restocking !== null} onOpenChange={(open) => !open && setRestocking(null)}>
      <DialogContent>
        <form className="flex flex-col gap-4" onSubmit={restock}>
          <DialogHeader>
            <DialogTitle>Restock {restocking?.name}</DialogTitle>
            <DialogDescription>
              Create a supplier purchase invoice and add received units to the current stock of {restocking?.quantity ?? 0}.
            </DialogDescription>
          </DialogHeader>
          <label className="flex flex-col gap-2 text-sm">
            Supplier
            <Select value={supplierId || null} onValueChange={(value) => setSupplierId(value ?? "")}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select supplier" /></SelectTrigger>
              <SelectContent><SelectGroup>{suppliers.map((supplier) => <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Issue date
            <Input required type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Payment status
            <Select value={paymentStatus} onValueChange={(value) => value && setPaymentStatus(value as PurchasePaymentStatus)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectGroup><SelectItem value="CREDIT">Credit</SelectItem><SelectItem value="PAID">Paid</SelectItem><SelectItem value="ADVANCE">Advance</SelectItem></SelectGroup></SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Quantity received
            <Input
              required
              autoFocus
              min="1"
              max="999999"
              step="1"
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Unit purchase cost
            <Input
              required
              min="0"
              step="0.01"
              type="number"
              value={unitCost}
              onChange={(event) => setUnitCost(Math.max(0, Number(event.target.value) || 0))}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Supplier reference <span className="text-muted-foreground">optional</span>
            <Input
              maxLength={120}
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="Delivery or purchase order number"
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setRestocking(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !supplierId || quantity < 1 || unitCost < 0}>
              <PackagePlus data-icon="inline-start" />
              {saving ? "Restocking…" : "Add stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
}
