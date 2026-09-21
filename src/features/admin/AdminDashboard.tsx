import { useMemo, useState } from "react";
import {
  // BarChart3,
  Bell,
  Boxes,
  FileText,
  LogOut,
  // Settings,
  Store,
  // Tag,
} from "lucide-react";
import type { CreateProductInput, Product } from "../../api";
import type { AuthSession } from "../../auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddProductDialog } from "./AddProductDialog";
import { InvoicesPage } from "./pages/InvoicesPage";
// import { OverviewPage } from "./pages/OverviewPage";
import { ProductsPage } from "./pages/ProductsPage";

const navigation = [
  // { label: "Overview", icon: LayoutDashboard },
  { label: "Products", icon: Boxes },
  { label: "Invoices", icon: FileText },
];

type AdminDashboardProps = {
  session: AuthSession;
  products: Product[];
  loading: boolean;
  onCreateProduct: (product: CreateProductInput) => Promise<void>;
  onUpdateProduct: (id: string, product: CreateProductInput) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onLogout: () => void;
  onViewStore: () => void;
  onNotify: (message: string) => void;
};

export function AdminDashboard({
  session: _session,
  products,
  loading,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onLogout,
  onViewStore,
  onNotify,
}: AdminDashboardProps) {
  const [page, setPage] = useState("Invoices");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [products, query],
  );

  async function createProduct(product: CreateProductInput) {
    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, product);
    } else {
      await onCreateProduct(product);
    }
    setEditingProduct(null);
    setPage("Products");
  }

  return (
    <div className="min-h-screen bg-background text-foreground md:grid md:grid-cols-[15rem_1fr]">
      <aside className="hidden border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="flex items-center gap-2 border-b px-5 py-4 text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            m
          </span>
          Morrow
        </div>
        {/*<div className="m-4 flex items-center gap-3 rounded-lg border border-sidebar-border p-3 text-sm">
          <span className="grid size-8 place-items-center rounded-full bg-sidebar-accent font-medium">
            M
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate">Morrow goods</strong>
            <small className="text-sidebar-foreground/60">
              Admin workspace
            </small>
          </span>
          <ChevronDown />
        </div>*/}
        <nav className="flex flex-col gap-1 px-3">
          <p className="px-3 pb-2 pt-3 text-xs font-medium text-sidebar-foreground/60">
            Workspace
          </p>
          {navigation.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              variant={page === label ? "secondary" : "ghost"}
              className="justify-start gap-3"
              onClick={() => setPage(label)}
            >
              <Icon data-icon="inline-start" />
              {label}
              {label === "Products" && (
                <Badge variant="outline" className="ml-auto">
                  {products.length}
                </Badge>
              )}
            </Button>
          ))}
          {/*<p className="px-3 pb-2 pt-6 text-xs font-medium text-sidebar-foreground/60">
            Manage
          </p>
          {[
            ["Analytics", BarChart3],
            ["Discounts", Tag],
            ["Settings", Settings],
          ].map(([label, Icon]) => (
            <Button
              key={label as string}
              variant="ghost"
              className="justify-start gap-3"
              onClick={() => onNotify(`${label as string} is coming soon`)}
            >
              <Icon data-icon="inline-start" />
              {label as string}
            </Button>
          ))}*/}
        </nav>
        <div className="mt-auto p-3">
          {/*<Button
            variant="ghost"
            className="mb-3 w-full justify-start gap-3"
            onClick={onLogout}
          >
            <LogOut data-icon="inline-start" />
            Sign out
          </Button>*/}

            {/*<span className="grid size-8 place-items-center rounded-full bg-sidebar-accent">
              {session.user.name.charAt(0).toUpperCase()}
            </span>
            <span className="flex-1">
              <strong className="block">{session.user.name}</strong>
              <small className="text-sidebar-foreground/60">
                Administrator
              </small>
            </span>*/}
            <Button
              variant="ghost"
              className="justify-between gap-3 w-full"
              onClick={onLogout}
            >
              Log out
              <LogOut data-icon="inline-start" />
            </Button>

        </div>
      </aside>
      <main className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b px-4 sm:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <strong className="text-foreground md:hidden">Morrow</strong>
            <span className="hidden md:inline">Workspace</span>
            <span className="hidden md:inline">/</span>
            <strong className="text-foreground">{page}</strong>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNotify("You are all caught up")}
            >
              <Bell />
            </Button>
            <Button variant="outline" size="sm" onClick={onViewStore}>
              <Store data-icon="inline-start" />
              View store
            </Button>
          </div>
        </header>
        <nav className="admin-mobile-nav" aria-label="Admin pages">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              type="button"
              data-active={page === label}
              onClick={() => setPage(label)}
              key={label}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>
        {/*{page === "Overview" && (
          <OverviewPage
            products={products}
            onAdd={() => {
              setEditingProduct(null);
              setDialogOpen(true);
            }}
            onEdit={(product) => {
              setEditingProduct(product);
              setDialogOpen(true);
            }}
            onPage={setPage}
          />
        )}*/}
        {page === "Products" && (
          <ProductsPage
            products={filteredProducts}
            loading={loading}
            query={query}
            onQuery={setQuery}
            onAdd={() => {
              setEditingProduct(null);
              setDialogOpen(true);
            }}
            onEdit={(product) => {
              setEditingProduct(product);
              setDialogOpen(true);
            }}
            onDelete={onDeleteProduct}
          />
        )}
        {page === "Invoices" && (
          <InvoicesPage products={products} onNotify={onNotify} />
        )}
      </main>
      <AddProductDialog
        key={dialogOpen ? editingProduct?.id ?? "new-product" : "closed"}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}
        onCreate={createProduct}
        product={editingProduct}
      />
    </div>
  );
}
