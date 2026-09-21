import { useMemo, useState } from "react";
import { Combobox as ComboboxBaseUI } from "@base-ui/react";
import { ImageIcon, Link2, Plus, Search } from "lucide-react";
import { getProductImages, type Product } from "../../../api";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { currency } from "../../../lib/currency";

type ProductPickerProps = {
  products: Product[];
  onAdd: (productId: string) => void;
};

export function ProductPicker({ products, onAdd }: ProductPickerProps) {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const items = useMemo(
    () =>
      ComboboxBaseUI.createItems(products, {
        getValue: (product) => product.id,
        getLabel: (product) => product.name,
      }),
    [products],
  );
  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      `${product.name} ${product.description}`.toLowerCase().includes(normalized),
    );
  }, [products, query]);

  function addSelected() {
    if (!selectedProductId) return;
    onAdd(selectedProductId);
    setSelectedProductId("");
  }

  function addFromCatalog(productId: string) {
    onAdd(productId);
    setCatalogOpen(false);
    setQuery("");
  }

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-[0.6rem] max-[520px]:grid-cols-[minmax(0,1fr)_auto] [&_[data-slot=combobox-input]]:w-full">
        <Combobox
          items={items}
          value={selectedProductId || null}
          onValueChange={(value) => setSelectedProductId(value ?? "")}
          itemToStringLabel={(productId) =>
            products.find((product) => product.id === productId)?.name ?? ""
          }
        >
          <ComboboxInput
            aria-label="Search products"
            placeholder="Search products…"
            showClear
          />
          <ComboboxContent>
            <ComboboxEmpty>No matching products.</ComboboxEmpty>
            <ComboboxList>
              {(product) => (
                <ComboboxItem value={product.id} key={product.id}>
                  <span className="min-w-0 flex-1 truncate">{product.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {currency.format(product.price)}
                  </span>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Browse the full product catalog"
          aria-label="Browse the full product catalog"
          disabled={!products.length}
          onClick={() => setCatalogOpen(true)}
        >
          <Link2 />
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!selectedProductId}
          className="max-[520px]:col-span-full"
          onClick={addSelected}
        >
          <Plus data-icon="inline-start" />
          Add
        </Button>
      </div>

      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="max-h-[min(44rem,calc(100svh-2rem))] overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Find a product</DialogTitle>
            <DialogDescription>
              Search the catalog and select one product to add to this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or description"
            />
          </div>
          <div className="grid max-h-112 min-w-0 gap-1 overflow-x-hidden overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filteredProducts.map((product) => (
              <button
                type="button"
                className="grid w-full min-w-0 grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => addFromCatalog(product.id)}
                key={product.id}
              >
                <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-muted-foreground">
                  {getProductImages(product)[0]?.url ? (
                    <img
                      className="size-full object-cover"
                      src={getProductImages(product)[0].url}
                      alt=""
                    />
                  ) : (
                    <ImageIcon className="size-4" />
                  )}
                </span>
                <span className="min-w-0 overflow-hidden">
                  <strong className="block wrap-break-words text-sm">{product.name}</strong>
                  <span className="block truncate text-xs text-muted-foreground">
                    {product.description} · {product.quantity ?? 0} in stock
                  </span>
                </span>
                <strong className="min-w-18 shrink-0 text-right text-sm">
                  {currency.format(product.price)}
                </strong>
              </button>
            ))}
            {!filteredProducts.length && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No products match “{query}”.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
