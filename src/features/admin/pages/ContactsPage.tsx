import { useCallback, useEffect, useMemo, useState, type SubmitEvent } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Building2, MoreHorizontal, Plus, Users } from "lucide-react";
import type { Contact, ContactInput } from "../../../api";
import { customersApi, suppliersApi } from "../../../api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, DataTableColumnHeader } from "../data-table/DataTable";
import type { DataTableFeatures } from "../data-table/data-table-features";
import { PageHeader } from "../PageHeader";

const empty: ContactInput = { name: "", email: null, phone: null, address: null, notes: null };

type Props = { kind: "customers" | "suppliers"; onNotify: (message: string) => void };
const columnHelper = createColumnHelper<DataTableFeatures, Contact>();

export function ContactsPage({ kind, onNotify }: Props) {
  const api = kind === "customers" ? customersApi : suppliersApi;
  const singular = kind === "customers" ? "customer" : "supplier";
  const title = kind === "customers" ? "Customers" : "Suppliers";
  const Icon = kind === "customers" ? Users : Building2;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ContactInput>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.list().then(setContacts).catch((error: Error) => onNotify(error.message)).finally(() => setLoading(false));
  }, [kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const show = useCallback((contact?: Contact) => {
    setEditing(contact ?? null);
    setDraft(contact ? { name: contact.name, email: contact.email, phone: contact.phone, address: contact.address, notes: contact.notes } : empty);
    setOpen(true);
  }, []);

  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try {
      const saved = editing ? await api.update(editing.id, draft) : await api.create(draft);
      setContacts((current) => editing ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
      setOpen(false); onNotify(`${editing ? "Updated" : "Saved"} ${singular}`);
    } catch (error) { onNotify(error instanceof Error ? error.message : `Could not save ${singular}`); }
    finally { setSaving(false); }
  }

  const remove = useCallback(async (contact: Contact) => {
    try { await api.remove(contact.id); setContacts((current) => current.filter((item) => item.id !== contact.id)); onNotify(`Deleted ${singular}`); }
    catch (error) { onNotify(error instanceof Error ? error.message : `Could not delete ${singular}`); }
  }, [api, onNotify, singular]);

  const columns = useMemo(() => columnHelper.columns([
    columnHelper.display({
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)} aria-label={`Select all ${kind}`} />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(checked) => row.toggleSelected(checked)} aria-label={`Select ${row.original.name}`} />,
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("name", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <div className="flex min-w-52 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Icon className="size-4" /></span><strong>{row.original.name}</strong></div>,
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => row.original.email || <span className="text-muted-foreground">No email</span>,
    }),
    columnHelper.accessor("phone", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
      cell: ({ row }) => row.original.phone || <span className="text-muted-foreground">No phone</span>,
    }),
    columnHelper.accessor("address", {
      header: "Address",
      enableSorting: false,
      cell: ({ row }) => <span className="block max-w-64 truncate text-muted-foreground">{row.original.address || "No address"}</span>,
    }),
    columnHelper.accessor("notes", {
      header: "Notes",
      enableSorting: false,
      cell: ({ row }) => <span className="block max-w-52 truncate text-muted-foreground">{row.original.notes || "No notes"}</span>,
    }),
    columnHelper.display({
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => <div className="flex justify-end"><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.name}`} />}><MoreHorizontal /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuLabel>{singular.charAt(0).toUpperCase() + singular.slice(1)} actions</DropdownMenuLabel><DropdownMenuItem onClick={() => show(row.original)}>Edit {singular}</DropdownMenuItem></DropdownMenuGroup><DropdownMenuSeparator/><DropdownMenuGroup><DropdownMenuItem variant="destructive" onClick={() => remove(row.original)}>Delete {singular}</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu></div>,
    }),
  ]), [Icon, kind, remove, show, singular]);

  return <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-8">
    <PageHeader eyebrow={kind === "customers" ? "Sales directory" : "Purchasing directory"} title={title} description={kind === "customers" ? "Keep billing details ready for the next invoice." : "Keep vendor details close to the products they supply."} action={<Button onClick={() => show()}><Plus data-icon="inline-start" />Add {singular}</Button>} />
    <DataTable columns={columns} data={contacts} getRowId={(contact) => contact.id} filterColumn="name" filterPlaceholder={`Filter ${kind}…`} emptyMessage={loading ? `Loading ${kind}…` : `No saved ${kind} yet.`} initialVisibility={{ notes: false }} />
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><form className="flex flex-col gap-4" onSubmit={save}><DialogHeader><DialogTitle>{editing ? `Edit ${singular}` : `Add ${singular}`}</DialogTitle><DialogDescription>Save the details you use for orders and invoices.</DialogDescription></DialogHeader>
      <label className="grid gap-1 text-sm">Name<Input required maxLength={120} value={draft.name} onChange={(e) => setDraft({...draft, name: e.target.value})}/></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1 text-sm">Email<Input type="email" maxLength={180} value={draft.email ?? ""} onChange={(e) => setDraft({...draft, email: e.target.value || null})}/></label><label className="grid gap-1 text-sm">Phone<Input maxLength={40} value={draft.phone ?? ""} onChange={(e) => setDraft({...draft, phone: e.target.value || null})}/></label></div>
      <label className="grid gap-1 text-sm">Address<Textarea maxLength={500} value={draft.address ?? ""} onChange={(e) => setDraft({...draft, address: e.target.value || null})}/></label>
      <label className="grid gap-1 text-sm">Notes<Textarea maxLength={1000} value={draft.notes ?? ""} onChange={(e) => setDraft({...draft, notes: e.target.value || null})}/></label>
      <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button></DialogFooter>
    </form></DialogContent></Dialog>
  </div>;
}
