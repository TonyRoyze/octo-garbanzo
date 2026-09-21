import { useState } from "react";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { getProductImages, type Product } from "../../api";
import { Button } from "@/components/ui/button";
import { currency } from "../../lib/currency";
import { ProductDetailDialog } from "./ProductDetailDialog";

type ShopViewProps = {
  products: Product[];
  cart: Product[];
  onAdd: (product: Product) => void;
};

const productToneClasses = [
  "bg-[#dce5d8]",
  "bg-[#e7dbc7]",
  "bg-[#d8e2e4]",
  "bg-[#e2dbe6]",
] as const;

export function ShopView({ products, cart, onAdd }: ShopViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const visibleProducts = products.filter((product) => product.status === "ACTIVE");

  return (
    <main>
      <section
        id="shop"
        className="scroll-mt-[76px] bg-[#fbfcf9] px-[4vw] py-[clamp(5rem,9vw,9rem)]"
      >
        <div className="mx-auto mb-16 grid max-w-[82rem] grid-cols-[1.2fr_0.8fr] items-end gap-12 max-[820px]:grid-cols-1 max-[820px]:gap-6">
          <div>
            <p className="mb-6 text-[0.8rem] font-[720] tracking-[0.025em] text-[#52685b]">
              The collection
            </p>
            <h2 className="m-0 max-w-[14ch] font-heading text-[clamp(2.6rem,4.5vw,5rem)] font-[670] leading-[0.98] tracking-[-0.05em]">
              Objects with a place and a purpose.
            </h2>
          </div>
          <p className="m-0 max-w-[30rem] leading-[1.65] text-[#657169]">
            Built for desks, shelves, and the small rituals that happen between
            them.
          </p>
        </div>
        {visibleProducts.length > 0 ? (
          <div className="mx-auto grid max-w-[82rem] grid-cols-3 gap-x-5 gap-y-16 max-[820px]:grid-cols-2 max-[560px]:grid-cols-1">
            {visibleProducts.map((product, index) => {
              const inBag = cart.some((item) => item.id === product.id);
              const outOfStock = product.quantity <= 0;
              const mainImage = getProductImages(product)[0];
              const toneClass = productToneClasses[index % productToneClasses.length];

              return (
                <article className="group relative" key={product.id}>
                  <button
                    type="button"
                    className={`relative grid aspect-[1/0.92] w-full cursor-zoom-in place-items-center overflow-hidden border-0 p-0 text-inherit focus-visible:outline-2 focus-visible:outline-[#18352b] ${toneClass}`}
                    aria-label={`View ${product.name}`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <span className="absolute top-4 left-4 z-[1] text-[0.74rem] text-[#18352b99]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {mainImage ? (
                      <img
                        className="h-full w-full object-cover transition-transform duration-[400ms] ease-[ease] group-hover:scale-[1.025]"
                        src={mainImage.url}
                        alt={mainImage.alt || product.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid aspect-square w-[43%] rotate-[-8deg] place-items-center rounded-[30%_48%_34%_43%] bg-[#18352b] text-white/78 shadow-[0.8rem_1.2rem_0_rgb(255_255_255_/_38%)] [&>svg]:size-[24%]">
                        <ShoppingBag />
                      </div>
                    )}
                  </button>
                  <div className="flex items-start justify-between gap-4 pt-5">
                    <div>
                      <h3 className="m-0 font-heading text-[1.05rem] font-[670]">
                        <button
                          type="button"
                          className="cursor-pointer border-0 bg-transparent p-0 text-left font-inherit text-inherit focus-visible:outline-2 focus-visible:outline-[#18352b]"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.name}
                        </button>
                      </h3>
                      <p className="mt-[0.35rem] line-clamp-2 max-w-[28ch] text-[0.86rem] leading-[1.45] text-[#68726c]">
                        {product.description}
                      </p>
                    </div>
                    <Button
                      className="rounded-full"
                      variant={inBag ? "secondary" : "outline"}
                      disabled={inBag || outOfStock}
                      onClick={() => onAdd(product)}
                    >
                      {inBag ? (
                        <Check data-icon="inline-start" />
                      ) : (
                        <Plus data-icon="inline-start" />
                      )}
                      {outOfStock ? "Out of stock" : inBag ? "In bag" : "Add"}
                    </Button>
                  </div>
                  <strong className="absolute top-4 right-4 rounded-full bg-white/82 px-[0.65rem] py-[0.4rem] text-[0.78rem] text-[#18352b] backdrop-blur-[8px]">
                    {currency.format(product.price)}
                  </strong>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[22rem] flex-col items-center justify-center gap-3 text-center">
            <ShoppingBag className="w-8 text-[#819087]" />
            <h3 className="mt-2 mb-0 font-heading text-[1.3rem]">
              The shelf is being stocked.
            </h3>
            <p className="m-0 text-[#6c7770]">New pieces will appear here soon.</p>
          </div>
        )}
      </section>

      <ProductDetailDialog
        key={selectedProduct?.id ?? "no-product"}
        product={selectedProduct}
        open={selectedProduct !== null}
        inBag={
          selectedProduct
            ? cart.some((item) => item.id === selectedProduct.id)
            : false
        }
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
        onAdd={onAdd}
      />
    </main>
  );
}
