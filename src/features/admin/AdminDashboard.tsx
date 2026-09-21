import { useState } from "react";
import {
  // BarChart3,
  Bell,
  Boxes,
  Building2,
  FileText,
  LogOut,
  // Settings,
  Menu,
  Store,
  Users,
  Warehouse,
  X,
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
import { ContactsPage } from "./pages/ContactsPage";
import { InventoryPage } from "./pages/InventoryPage";

const navigation = [
  // { label: "Overview", icon: LayoutDashboard },
  { label: "Products", icon: Boxes },
  { label: "Invoices", icon: FileText },
  { label: "Customers", icon: Users },
  { label: "Suppliers", icon: Building2 },
  { label: "Inventory", icon: Warehouse },
];

type AdminDashboardProps = {
  session: AuthSession;
  products: Product[];
  loading: boolean;
  onCreateProduct: (product: CreateProductInput) => Promise<void>;
  onUpdateProduct: (id: string, product: CreateProductInput) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onProductsChanged: () => Promise<void>;
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
  onProductsChanged,
  onLogout,
  onViewStore,
  onNotify,
}: AdminDashboardProps) {
  const [page, setPage] = useState("Invoices");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Button
              className="md:hidden"
              variant="ghost"
              size="icon"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X data-icon="inline-start" /> : <Menu data-icon="inline-start" />}
            </Button>
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
        <nav
          className={`absolute inset-x-0 top-16 z-10 grid-cols-1 gap-1 border-b bg-white/98 p-2 shadow-[0_0.75rem_1.5rem_rgb(24_53_43/12%)] backdrop-blur-[14px] md:hidden ${mobileMenuOpen ? "grid" : "hidden"}`}
          aria-label="Admin pages"
        >
          {navigation.map(({ label, icon: Icon }) => (
            <button
              type="button"
              data-active={page === label}
              className="flex min-w-0 items-center justify-start gap-[0.4rem] rounded-[0.55rem] border-0 bg-transparent px-[0.8rem] py-[0.7rem] text-xs text-muted-foreground data-[active=true]:bg-[#eaf0e7] data-[active=true]:font-bold data-[active=true]:text-[#18352b] [&_svg]:size-4"
              onClick={() => {
                setPage(label);
                setMobileMenuOpen(false);
              }}
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
            products={products}
            loading={loading}
            onAdd={() => {
              setEditingProduct(null);
              setDialogOpen(true);
            }}
            onEdit={(product) => {
              setEditingProduct(product);
              setDialogOpen(true);
            }}
            onDelete={onDeleteProduct}
            onProductsChanged={onProductsChanged}
            onNotify={onNotify}
          />
        )}
        {page === "Invoices" && (
          <InvoicesPage products={products} onProductsChanged={onProductsChanged} onNotify={onNotify} />
        )}
        {page === "Customers" && <ContactsPage kind="customers" onNotify={onNotify} />}
        {page === "Suppliers" && <ContactsPage kind="suppliers" onNotify={onNotify} />}
        {page === "Inventory" && <InventoryPage products={products} onChanged={onProductsChanged} onNotify={onNotify} />}
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
