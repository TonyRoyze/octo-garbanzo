import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { BriefcaseBusiness, Download, Save, Trash2 } from "lucide-react";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceLineType,
  InvoiceStatus,
  Product,
  Contact,
} from "../../../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currency } from "../../../lib/currency";
import { downloadInvoicePdf } from "./invoicePdf";
import { InvoicePreview } from "./InvoicePreview";
import { InvoiceStatusSelect } from "./InvoiceStatusSelect";
import { ProductPicker } from "./ProductPicker";
import type { InvoiceDocumentData } from "./types";

type SelectedItem =
  | {
      id: string;
      type: "PRODUCT";
      productId: string;
      quantity: number;
    }
  | {
      id: string;
      type: "SERVICE";
      name: string;
      unitPrice: number;
      quantity: number;
    };

type InvoiceBuilderProps = {
  products: Product[];
  customers: Contact[];
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
  customers,
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
  const [customerId, setCustomerId] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [includeCustomerEmail, setIncludeCustomerEmail] = useState(true);
  const [issueDate, setIssueDate] = useState(isoDate(today));
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [includeDueDate, setIncludeDueDate] = useState(true);
  const [notes, setNotes] = useState("");
  const [includeNotes, setIncludeNotes] = useState(true);
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [serviceName, setServiceName] = useState("");
  const [serviceRate, setServiceRate] = useState(0);
  const [serviceQuantity, setServiceQuantity] = useState(1);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status ?? "DRAFT");

  useEffect(() => {
    if (!invoice) return;
    setCustomerName(invoice.customerName);
    setCustomerId(invoice.customerId ?? "");
    setCustomerEmail(invoice.customerEmail ?? "");
    setIncludeCustomerEmail(Boolean(invoice.customerEmail));
    setIssueDate(invoice.issueDate);
    setDueDate(invoice.dueDate ?? defaultDueDate);
    setIncludeDueDate(Boolean(invoice.dueDate));
    setNotes(invoice.notes ?? "");
    setIncludeNotes(Boolean(invoice.notes));
    setItems(invoice.items.map((item, index) => {
      const type: InvoiceLineType = item.type ?? (item.productId ? "PRODUCT" : "SERVICE");
      return type === "PRODUCT" && item.productId
        ? {
            id: `product-${item.productId}`,
            type: "PRODUCT" as const,
            productId: item.productId,
            quantity: item.quantity,
          }
        : {
            id: `service-${invoice.id}-${index}`,
            type: "SERVICE" as const,
            name: item.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          };
    }));
    setStatus(invoice.status);
  }, [defaultDueDate, invoice]);

  const document = useMemo<InvoiceDocumentData>(() => {
    const documentItems = items.reduce<InvoiceDocumentData["items"]>((result, item) => {
      if (item.type === "SERVICE") {
        result.push({
          id: item.id,
          type: item.type,
          productId: null,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.unitPrice * item.quantity,
        });
        return result;
      }
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) return result;
      result.push({
        id: item.id,
        type: item.type,
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal: product.price * item.quantity,
      });
      return result;
    }, []);
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
    (product) => !items.some(
      (item) => item.type === "PRODUCT" && item.productId === product.id,
    ),
  );

  function addProduct(productId: string) {
    setItems((current) => [
      ...current,
      { id: `product-${productId}`, type: "PRODUCT", productId, quantity: 1 },
    ]);
  }

  function addService() {
    const name = serviceName.trim();
    if (!name) {
      onNotify("Enter a service name");
      return;
    }
    if (serviceRate < 0) {
      onNotify("Service rate cannot be negative");
      return;
    }
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        type: "SERVICE",
        name,
        unitPrice: serviceRate,
        quantity: Math.max(1, Math.min(999, serviceQuantity || 1)),
      },
    ]);
    setServiceName("");
    setServiceRate(0);
    setServiceQuantity(1);
  }

  function changeQuantity(id: string, quantity: number) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
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
      onNotify("Add at least one product or service to the invoice");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        customerId: customerId || null,
        customerName,
        customerEmail: includeCustomerEmail ? customerEmail : null,
        issueDate,
        dueDate: includeDueDate ? dueDate : null,
        notes: includeNotes ? notes : null,
        items: items.map((item) =>
          item.type === "PRODUCT"
            ? {
                type: item.type,
                productId: item.productId,
                quantity: item.quantity,
              }
            : {
                type: item.type,
                name: item.name,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
              },
        ),
        status,
      });
    } catch {
      // The parent surfaces the API error and keeps the draft intact.
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="grid min-h-[calc(100svh-4rem)] grid-cols-[minmax(25rem,0.78fr)_minmax(34rem,1.22fr)] bg-[#eef1ec] max-[1050px]:grid-cols-[minmax(22rem,0.9fr)_minmax(28rem,1.1fr)] max-[820px]:grid-cols-1"
      onSubmit={submit}
    >
      <section className="border-r border-[#d9ded8] bg-[#fbfcf9] p-[clamp(1.5rem,3vw,3rem)] max-[820px]:border-r-0 max-[520px]:p-5">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 font-heading text-[clamp(2rem,3.2vw,3.2rem)] leading-none tracking-[-0.045em]">
              {invoice ? `${invoice.invoiceNumber}` : "Create invoice"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>

        <fieldset className="m-0 grid gap-4 border-0 border-t border-[#dfe3dd] px-0 py-6">
          {/*<legend>Customer</legend>*/}
          {customers.length > 0 && <label className="grid gap-[0.45rem] text-[0.78rem] font-[650] text-[#56635b]">
            Saved customer
            <Select value={customerId || "manual"} onValueChange={(value) => {
              if (!value || value === "manual") { setCustomerId(""); return; }
              const customer = customers.find((candidate) => candidate.id === value);
              if (!customer) return;
              setCustomerId(customer.id);
              setCustomerName(customer.name);
              setCustomerEmail(customer.email ?? "");
              setIncludeCustomerEmail(Boolean(customer.email));
            }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="manual">Enter manually</SelectItem>{customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>)}</SelectContent>
            </Select>
          </label>}
          <label className="grid gap-[0.45rem] text-[0.78rem] font-[650] text-[#56635b]">
            Name
            <Input
              required
              maxLength={120}
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Customer or company"
            />
          </label>
          <div className="grid gap-[0.45rem]">
            <div className="flex items-center justify-between gap-3 text-[0.78rem] font-[650] text-[#56635b]">
              <label className="grid gap-[0.45rem] text-[0.78rem] font-[650] text-[#56635b]" htmlFor="invoice-customer-email">Email</label>
              <span className="inline-flex items-center gap-2 text-[0.7rem] font-[550] text-[#718078]">
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
          <div className="grid grid-cols-2 gap-[0.8rem] max-[520px]:grid-cols-1">
            <label className="grid gap-[0.45rem] text-[0.78rem] font-[650] text-[#56635b]">
              Issue date
              <Input
                required
                type="date"
                value={issueDate}
                onChange={(event) => setIssueDate(event.target.value)}
              />
            </label>
            <div className="grid gap-[0.45rem]">
              <div className="flex items-center justify-between gap-3 text-[0.78rem] font-[650] text-[#56635b]">
                <label className="grid gap-[0.45rem] text-[0.78rem] font-[650] text-[#56635b]" htmlFor="invoice-due-date">Due date</label>
                <span className="inline-flex items-center gap-2 text-[0.7rem] font-[550] text-[#718078]">
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

        <fieldset className="m-0 grid gap-4 border-0 border-t border-[#dfe3dd] px-0 py-6">
          <legend className="float-left mb-4 w-full font-heading text-[0.95rem] font-bold text-[#18352b]">Invoice items</legend>
          <Tabs defaultValue="products">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="pt-2">
              <ProductPicker products={availableProducts} onAdd={addProduct} />
            </TabsContent>
            <TabsContent value="services" className="pt-2">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(6rem,0.55fr)_minmax(5rem,0.4fr)] items-end gap-[0.6rem] max-[520px]:grid-cols-2 [&>button]:col-span-full [&>button]:justify-self-start">
                <label className="flex min-w-0 flex-col gap-[0.4rem] text-[0.78rem] font-[650] text-[#56635b] max-[520px]:col-span-full">
                  Service
                  <Input
                    maxLength={160}
                    value={serviceName}
                    onChange={(event) => setServiceName(event.target.value)}
                    placeholder="Design consultation"
                  />
                </label>
                <label className="flex min-w-0 flex-col gap-[0.4rem] text-[0.78rem] font-[650] text-[#56635b]">
                  Rate
                  <Input
                    min="0"
                    step="0.01"
                    type="number"
                    value={serviceRate}
                    onChange={(event) => setServiceRate(Number(event.target.value))}
                  />
                </label>
                <label className="flex min-w-0 flex-col gap-[0.4rem] text-[0.78rem] font-[650] text-[#56635b]">
                  Quantity
                  <Input
                    min="1"
                    max="999"
                    step="1"
                    type="number"
                    value={serviceQuantity}
                    onChange={(event) =>
                      setServiceQuantity(Number(event.target.value))
                    }
                  />
                </label>
                <Button type="button" variant="outline" onClick={addService}>
                  <BriefcaseBusiness data-icon="inline-start" />
                  Add service
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-1">
            {items.length === 0 && (
              <p className="m-0 border border-dashed border-[#cbd3ca] p-6 text-center text-[0.82rem] text-[#718078]">
                Add products or services to start building the invoice.
              </p>
            )}
            {items.map((item) => {
              const product = item.type === "PRODUCT"
                ? products.find((candidate) => candidate.id === item.productId)
                : null;
              if (item.type === "PRODUCT" && !product) return null;
              const name = item.type === "PRODUCT" ? product!.name : item.name;
              const unitPrice = item.type === "PRODUCT"
                ? product!.price
                : item.unitPrice;
              return (
                <div
                  className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-[0.65rem] border-b border-[#e4e7e2] py-3 max-[520px]:grid-cols-[minmax(0,1fr)_auto]"
                  key={item.id}
                >
                  <div className="min-w-0">
                    <strong className="block truncate text-[0.86rem]">{name}</strong>
                    <span className="block truncate text-[0.72rem] text-[#718078]">
                      {item.type === "SERVICE" ? "Service" : "Product"}
                      {" · "}{currency.format(unitPrice)} each
                    </span>
                  </div>
                  <div className="flex items-center max-[520px]:justify-self-start">
                    <Input
                      className="w-[3.2rem] px-1 text-center"
                      aria-label={`${name} quantity`}
                      type="number"
                      min="1"
                      max="999"
                      value={item.quantity}
                      onChange={(event) =>
                        changeQuantity(
                          item.id,
                          Number(event.target.value),
                        )
                      }
                    />
                  </div>
                  <strong className="text-[0.82rem] max-[520px]:text-right">{currency.format(unitPrice * item.quantity)}</strong>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Remove ${name}`}
                    onClick={() =>
                      setItems((current) =>
                        current.filter((candidate) => candidate.id !== item.id),
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

        <fieldset className="m-0 grid gap-4 border-0 border-t border-[#dfe3dd] px-0 py-6">
          <legend className="float-left mb-4 w-full font-heading text-[0.95rem] font-bold text-[#18352b]">Notes</legend>
          <div className="grid gap-[0.45rem]">
            <div className="flex items-center justify-between gap-3 text-[0.78rem] font-[650] text-[#56635b]">
              <label className="grid gap-[0.45rem] text-[0.78rem] font-[650] text-[#56635b]" htmlFor="invoice-notes">Payment or delivery details</label>
              <span className="inline-flex items-center gap-2 text-[0.7rem] font-[550] text-[#718078]">
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
              className="w-full rounded-(--radius-md) border border-input bg-white px-3 py-[0.65rem] font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-[0.55]"
              placeholder="Optional note shown on the invoice"
            />
          </div>
        </fieldset>

        <fieldset className="m-0 grid gap-4 border-0 border-t border-[#dfe3dd] px-0 py-6">
          <legend className="float-left mb-4 w-full font-heading text-[0.95rem] font-bold text-[#18352b]">Invoice status</legend>
          <InvoiceStatusSelect
            value={status}
            onChange={setStatus}
            ariaLabel="Invoice status"
          />
        </fieldset>

        <div className="flex justify-end gap-3 border-t border-[#dfe3dd] pt-6 max-[820px]:sticky max-[820px]:bottom-0 max-[820px]:z-[5] max-[820px]:-mx-6 max-[820px]:-mb-6 max-[820px]:bg-[#fbfcf9]/96 max-[820px]:px-6 max-[820px]:py-4 max-[820px]:backdrop-blur-[12px] max-[520px]:-mx-5 max-[520px]:-mb-5 max-[520px]:grid max-[520px]:grid-cols-1 max-[520px]:px-5">
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
