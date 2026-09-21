import { ArrowLeft, ShieldCheck, ShoppingBag } from "lucide-react";
import { getProductImages, type Product } from "../../api";
import { Button } from "@/components/ui/button";
import { currency } from "../../lib/currency";

type CartViewProps = {
  cart: Product[];
  total: number;
  onBack: () => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
};

export function CartView({
  cart,
  total,
  onBack,
  onRemove,
  onCheckout,
}: CartViewProps) {
  return (
    <main className="store-page">
      <button className="store-back" type="button" onClick={onBack}>
        <ArrowLeft />
        Back to the collection
      </button>
      <div className="store-page-heading">
        <p className="store-kicker">Your bag</p>
        <h1>Review your selection.</h1>
        <p>You’ll sign in only when you continue to payment.</p>
      </div>
      <div className="store-cart-layout">
        <section className="store-cart-items" aria-label="Items in your bag">
          {cart.length === 0 ? (
            <div className="store-empty">
              <ShoppingBag />
              <h3>Your bag is empty.</h3>
              <p>Choose something useful from the collection.</p>
              <Button onClick={onBack}>Browse products</Button>
            </div>
          ) : (
            cart.map((product, index) => {
              const mainImage = getProductImages(product)[0];
              return (
                <article className="store-cart-item" key={product.id}>
                  <div className="cart-thumb" data-tone={index % 4}>
                    {mainImage ? (
                      <img
                        src={mainImage.url}
                        alt={mainImage.alt || product.name}
                      />
                    ) : (
                      <ShoppingBag />
                    )}
                  </div>
                  <div>
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>
                    <button type="button" onClick={() => onRemove(product.id)}>
                      Remove
                    </button>
                  </div>
                  <strong>{currency.format(product.price)}</strong>
                </article>
              );
            })
          )}
        </section>
        {cart.length > 0 && (
          <aside className="store-summary">
            <p>Order summary</p>
            <dl>
              <div>
                <dt>Items</dt>
                <dd>{cart.length}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>Calculated later</dd>
              </div>
              <div className="summary-total">
                <dt>Total</dt>
                <dd>{currency.format(total)}</dd>
              </div>
            </dl>
            <Button className="store-primary-action" onClick={onCheckout}>
              Continue to payment
            </Button>
            <small>
              <ShieldCheck /> Account verification happens next
            </small>
          </aside>
        )}
      </div>
    </main>
  );
}
