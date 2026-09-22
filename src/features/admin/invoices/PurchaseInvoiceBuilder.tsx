import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Save, Trash2 } from "lucide-react";
import {
  suppliersApi,
  type Contact,
  type CreatePurchaseInvoiceInput,
  type Product,
  type PurchasePaymentStatus,
} from "../../../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { currency } from "../../../lib/currency";
import { ProductPicker } from "./ProductPicker";

type PurchaseLine = {
  productId: string;
  quantity: number;
  unitCost: number;
};

type PurchaseInvoiceBuilderProps = {
  products: Product[];
  onCancel: () => void;
  onSave: (input: CreatePurchaseInvoiceInput) => Promise<unknown>;
  onNotify: (message: string) => void;
};

const paymentStatuses: Array<{ value: PurchasePaymentStatus; label: string }> = [
  { value: "CREDIT", label: "Credit" },
  { value: "PAID", label: "Paid" },
  { value: "ADVANCE", label: "Advance" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function PurchaseInvoiceBuilder({
  products,
  onCancel,
  onSave,
  onNotify,
}: PurchaseInvoiceBuilderProps) {
  const [suppliers, setSuppliers] = useState<Contact[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [supplierReference, setSupplierReference] = useState("");
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PurchasePaymentStatus>("CREDIT");
  const [items, setItems] = useState<PurchaseLine[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    suppliersApi
      .list()
      .then(setSuppliers)
      .catch((error: Error) => onNotify(error.message));
  }, [onNotify]);

  const availableProducts = products.filter(
    (product) => !items.some((item) => item.productId === product.id),
  );
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0),
    [items],
  );

  function addProduct(productId: string) {
    const product = products.find((candidate) => candidate.id === productId);
    if (!product) return;
    setItems((current) => [
      ...current,
      { productId, quantity: 1, unitCost: product.price },
    ]);
  }

  function updateLine(productId: string, patch: Partial<PurchaseLine>) {
    setItems((current) =>
      current.map((item) => item.productId === productId ? { ...item, ...patch } : item),
    );
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supplierId) {
      onNotify("Select a supplier");
      return;
    }
    if (!items.length) {
      onNotify("Add at least one product to the purchase invoice");
      return;
    }
    if (items.some((item) => item.quantity < 1 || item.unitCost < 0)) {
      onNotify("Each product needs a valid quantity and unit cost");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        supplierId,
        supplierReference: supplierReference.trim() || null,
        issueDate,
        dueDate: dueDate || null,
        notes: notes.trim() || null,
        paymentStatus,
        items: items.map(({ productId, quantity, unitCost }) => ({
          productId,
          quantity,
          unitCost,
        })),
      });
    } catch {
      // The parent reports API errors and leaves the form intact.
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-8" onSubmit={submit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Stock coming in</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Create purchase invoice</h1>
          <p className="mt-1 text-sm text-muted-foreground">Record supplier costs and add received products to stock.</p>
        </div>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>

      <section className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2" aria-label="Purchase details">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Supplier
          <Select value={supplierId || null} onValueChange={(value) => setSupplierId(value ?? "")}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select supplier" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {suppliers.map((supplier) => <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Supplier reference <span className="font-normal text-muted-foreground">Optional</span>
          <Input maxLength={120} value={supplierReference} onChange={(event) => setSupplierReference(event.target.value)} placeholder="Invoice or delivery number" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Issue date
          <Input required type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Due date <span className="font-normal text-muted-foreground">Optional</span>
          <Input type="date" min={issueDate} value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Payment status
          <Select value={paymentStatus} onValueChange={(value) => value && setPaymentStatus(value as PurchasePaymentStatus)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {paymentStatuses.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
          Notes <span className="font-normal text-muted-foreground">Optional</span>
          <Textarea rows={3} maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Payment or delivery details" />
        </label>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border bg-card p-4" aria-label="Purchased products">
        <div>
          <h2 className="font-heading text-lg font-bold">Products</h2>
          <p className="text-sm text-muted-foreground">Add each received product and enter its purchase cost.</p>
        </div>
        <ProductPicker products={availableProducts} onAdd={addProduct} />
        <div className="flex flex-col gap-2">
          {!items.length && <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">Add products to start this purchase invoice.</p>}
          {items.map((item) => {
            const product = products.find((candidate) => candidate.id === item.productId);
            if (!product) return null;
            return (
              <div className="grid items-end gap-3 border-b pb-3 sm:grid-cols-[minmax(0,1fr)_7rem_9rem_auto_auto]" key={item.productId}>
                <div className="min-w-0 self-center">
                  <strong className="block truncate text-sm">{product.name}</strong>
                  <span className="text-xs text-muted-foreground">Product</span>
                </div>
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Quantity
                  <Input min="1" max="999999" step="1" type="number" value={item.quantity} onChange={(event) => updateLine(item.productId, { quantity: Math.max(1, Number(event.target.value) || 1) })} />
                </label>
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Unit cost
                  <Input min="0" step="0.01" type="number" value={item.unitCost} onChange={(event) => updateLine(item.productId, { unitCost: Math.max(0, Number(event.target.value) || 0) })} />
                </label>
                <strong className="self-center text-right text-sm tabular-nums">{currency.format(item.quantity * item.unitCost)}</strong>
                <Button type="button" size="icon-sm" variant="ghost" aria-label={`Remove ${product.name}`} onClick={() => setItems((current) => current.filter((candidate) => candidate.productId !== item.productId))}><Trash2 /></Button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">Total</span>
          <strong className="font-heading text-2xl tabular-nums">{currency.format(total)}</strong>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving || !supplierId || !items.length}>
          <Save data-icon="inline-start" />
          {saving ? "Saving…" : "Save purchase invoice"}
        </Button>
      </div>
    </form>
  );
}
