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

export function ShopView({ products, cart, onAdd }: ShopViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <main>
      {/*<section className="store-hero">
        <div className="store-hero-copy">
          <p className="store-kicker">Useful objects, considered slowly</p>
          <h1>Make room for the things you reach for every day.</h1>
          <p className="store-intro">
            A small collection of tactile desk goods, made to age well and stay
            within reach.
          </p>
          <div className="store-hero-actions">
            <Button
              className="store-primary-action"
              onClick={() =>
                document
                  .getElementById("shop")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Browse the collection
            </Button>
            <span>{products.length || "A few"} considered pieces</span>
          </div>
        </div>
        <div
          className="store-hero-stage"
          aria-label="A sculptural stack of everyday desk objects"
        >
          <span className="stage-note">Designed for the everyday</span>
          <div className="stage-shadow" />
          <div className="stage-object stage-object-back" />
          <div className="stage-object stage-object-middle" />
          <div className="stage-object stage-object-front">
            <span>01</span>
          </div>
          <p>
            Quiet forms.
            <br />
            Useful weight.
          </p>
        </div>
      </section>*/}

      <section id="shop" className="store-collection">
        <div className="store-section-heading">
          <div>
            <p className="store-kicker">The collection</p>
            <h2>Objects with a place and a purpose.</h2>
          </div>
          <p>
            Built for desks, shelves, and the small rituals that happen between
            them.
          </p>
        </div>
        {products.length > 0 ? (
          <div className="store-product-grid">
            {products.map((product, index) => {
              const inBag = cart.some((item) => item.id === product.id);
              const mainImage = getProductImages(product)[0];
              return (
                <article
                  className="store-product"
                  data-tone={index % 4}
                  key={product.id}
                >
                  <button
                    type="button"
                    className="store-product-visual"
                    aria-label={`View ${product.name}`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <span className="product-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {mainImage ? (
                      <img
                        className="store-product-image"
                        src={mainImage.url}
                        alt={mainImage.alt || product.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="product-shape">
                        <ShoppingBag />
                      </div>
                    )}
                  </button>
                  <div className="store-product-info">
                    <div>
                      <h3>
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.name}
                        </button>
                      </h3>
                      <p>{product.description}</p>
                    </div>
                    <Button
                      variant={inBag ? "secondary" : "outline"}
                      disabled={inBag}
                      onClick={() => onAdd(product)}
                    >
                      {inBag ? (
                        <Check data-icon="inline-start" />
                      ) : (
                        <Plus data-icon="inline-start" />
                      )}
                      {inBag ? "In bag" : "Add"}
                    </Button>
                  </div>
                  <strong>{currency.format(product.price)}</strong>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="store-empty">
            <ShoppingBag />
            <h3>The shelf is being stocked.</h3>
            <p>New pieces will appear here soon.</p>
          </div>
        )}
      </section>

      {/*<section id="story" className="store-story">
        <p className="store-kicker">Our approach</p>
        <blockquote>
          “Keep fewer things. Choose the ones that make everyday work feel
          better.”
        </blockquote>
        <div>
          <span>Made in small runs</span>
          <span>Materials chosen to age well</span>
          <span>Packaged without excess</span>
        </div>
      </section>*/}

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
