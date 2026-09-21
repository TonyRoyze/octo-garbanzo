import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { AlertTriangle, Plus } from "lucide-react";
import { inventoryApi, type Product, type StockMovement } from "../../../api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, DataTableColumnHeader } from "../data-table/DataTable";
import type { DataTableFeatures } from "../data-table/data-table-features";
import { PageHeader } from "../PageHeader";

type Props = { products: Product[]; onChanged: () => Promise<void>; onNotify: (message: string) => void };
const columnHelper = createColumnHelper<DataTableFeatures, StockMovement>();

export function InventoryPage({ products, onChanged, onNotify }: Props) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [change, setChange] = useState(1);
  const [reason, setReason] = useState("Stock received");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { inventoryApi.movements().then(setMovements).catch((e: Error) => onNotify(e.message)); }, [onNotify]);
  const low = useMemo(() => products.filter((p) => p.quantity <= (p.lowStockThreshold ?? 5)), [products]);
  const columns = useMemo(() => columnHelper.columns([
    columnHelper.display({
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)} aria-label="Select all stock movements" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(checked) => row.toggleSelected(checked)} aria-label={`Select ${row.original.productName} movement`} />,
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("productName", { header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />, cell: ({ row }) => <strong>{row.original.productName}</strong> }),
    columnHelper.accessor("reason", { header: ({ column }) => <DataTableColumnHeader column={column} title="Reason" /> }),
    columnHelper.accessor("reference", { header: "Reference", cell: ({ row }) => row.original.reference || <span className="text-muted-foreground">—</span> }),
    columnHelper.accessor("change", { header: ({ column }) => <DataTableColumnHeader column={column} title="Change" />, cell: ({ row }) => <Badge variant={row.original.change > 0 ? "secondary" : "outline"}>{row.original.change > 0 ? "+" : ""}{row.original.change}</Badge> }),
    columnHelper.accessor("balance", { header: ({ column }) => <DataTableColumnHeader column={column} title="On hand" />, cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.balance}</span> }),
    columnHelper.accessor("createdAt", { header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />, cell: ({ row }) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.original.createdAt)) }),
  ]), []);
  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try { const movement = await inventoryApi.adjust({ productId, change, reason, reference: reference || null }); setMovements((current) => [movement, ...current]); await onChanged(); setOpen(false); onNotify("Stock updated"); }
    catch (error) { onNotify(error instanceof Error ? error.message : "Could not update stock"); }
    finally { setSaving(false); }
  }
  return <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-8">
    <PageHeader eyebrow="Stock control" title="Inventory" description="See what is running low and keep a trace of every stock change." action={<Button onClick={() => setOpen(true)}><Plus data-icon="inline-start"/>Adjust stock</Button>}/>
    <div className="grid gap-4 sm:grid-cols-3"><Card className="p-5"><span className="text-sm text-muted-foreground">Units on hand</span><strong className="mt-2 block text-3xl">{products.reduce((sum,p) => sum + p.quantity, 0)}</strong></Card><Card className="p-5"><span className="text-sm text-muted-foreground">Products stocked</span><strong className="mt-2 block text-3xl">{products.filter((p) => p.quantity > 0).length}</strong></Card><Card className="border-amber-200 bg-amber-50 p-5"><span className="flex items-center gap-2 text-sm text-amber-800"><AlertTriangle className="size-4"/>Low or out of stock</span><strong className="mt-2 block text-3xl text-amber-950">{low.length}</strong></Card></div>
    {low.length > 0 && <Card className="p-5"><h2 className="mb-3 font-semibold">Needs attention</h2><div className="flex flex-wrap gap-2">{low.map((p) => <Badge key={p.id} variant="outline" className="border-amber-300 bg-amber-50">{p.name}: {p.quantity}</Badge>)}</div></Card>}
    <section className="flex flex-col gap-3"><div><h2 className="font-semibold">Stock history</h2><p className="text-sm text-muted-foreground">Latest 100 movements</p></div><DataTable columns={columns} data={movements} getRowId={(movement) => movement.id} filterColumn="productName" filterPlaceholder="Filter stock history…" emptyMessage="No stock movements yet." initialVisibility={{ reference: false }} /></section>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><form className="flex flex-col gap-4" onSubmit={save}><DialogHeader><DialogTitle>Adjust stock</DialogTitle><DialogDescription>Use a positive number for deliveries and a negative number for corrections.</DialogDescription></DialogHeader><label className="grid gap-1 text-sm">Product<Select value={productId} onValueChange={(value) => setProductId(value ?? "")}><SelectTrigger><SelectValue placeholder="Choose a product"/></SelectTrigger><SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.quantity})</SelectItem>)}</SelectContent></Select></label><label className="grid gap-1 text-sm">Change<Input required type="number" value={change} onChange={(e) => setChange(Number(e.target.value))}/></label><label className="grid gap-1 text-sm">Reason<Input required maxLength={160} value={reason} onChange={(e) => setReason(e.target.value)}/></label><label className="grid gap-1 text-sm">Reference <span className="text-muted-foreground">optional</span><Input maxLength={120} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Delivery or order number"/></label><DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={saving || !productId || change === 0} type="submit">{saving ? "Updating…" : "Update stock"}</Button></DialogFooter></form></DialogContent></Dialog>
  </div>;
}
