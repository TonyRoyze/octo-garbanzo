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

const cartToneClasses = [
  "bg-[#dce5d8]",
  "bg-[#e7dbc7]",
  "bg-[#d8e2e4]",
  "bg-[#e2dbe6]",
] as const;

export function CartView({
  cart,
  total,
  onBack,
  onRemove,
  onCheckout,
}: CartViewProps) {
  return (
    <main className="mx-auto min-h-[calc(100svh-76px)] max-w-[78rem] px-[4vw] pt-12 pb-28">
      <button
        className="inline-flex items-center gap-2 border-0 bg-transparent py-2 text-[0.85rem] text-[#59685f] [&>svg]:w-4"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft />
        Back to the collection
      </button>
      <div className="my-16">
        <p className="mb-6 text-[0.8rem] font-[720] tracking-[0.025em] text-[#52685b]">
          Your bag
        </p>
        <h1 className="m-0 max-w-[14ch] font-heading text-[clamp(2.6rem,4.5vw,5rem)] font-[670] leading-[0.98] tracking-[-0.05em]">
          Review your selection.
        </h1>
        <p className="max-w-[34rem] leading-[1.6] text-[#657169]">
          You’ll sign in only when you continue to payment.
        </p>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_22rem] items-start gap-16 max-[820px]:grid-cols-1 max-[820px]:gap-8">
        <section className="border-t border-[#18352b33]" aria-label="Items in your bag">
          {cart.length === 0 ? (
            <div className="flex min-h-[22rem] flex-col items-center justify-center gap-3 text-center">
              <ShoppingBag className="w-8 text-[#819087]" />
              <h3 className="mt-2 mb-0 font-heading text-[1.3rem]">Your bag is empty.</h3>
              <p className="m-0 text-[#6c7770]">
                Choose something useful from the collection.
              </p>
              <Button onClick={onBack}>Browse products</Button>
            </div>
          ) : (
            cart.map((product, index) => {
              const mainImage = getProductImages(product)[0];
              const toneClass = cartToneClasses[index % cartToneClasses.length];

              return (
                <article
                  className="grid grid-cols-[7rem_1fr_auto] items-center gap-5 border-b border-[#18352b24] py-[1.4rem] max-[560px]:grid-cols-[5rem_1fr]"
                  key={product.id}
                >
                  <div className={`grid aspect-square place-items-center ${toneClass}`}>
                    {mainImage ? (
                      <img
                        className="h-full w-full object-cover"
                        src={mainImage.url}
                        alt={mainImage.alt || product.name}
                      />
                    ) : (
                      <ShoppingBag className="w-6 text-[#18352b6b]" />
                    )}
                  </div>
                  <div>
                    <h2 className="m-0 font-heading text-[1.05rem] font-[670]">
                      {product.name}
                    </h2>
                    <p className="mt-[0.35rem] line-clamp-2 max-w-[28ch] text-[0.86rem] leading-[1.45] text-[#68726c]">
                      {product.description}
                    </p>
                    <button
                      className="mt-[0.7rem] border-0 bg-transparent p-0 text-[0.78rem] text-[#6b756f] underline underline-offset-[3px]"
                      type="button"
                      onClick={() => onRemove(product.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <strong className="self-start max-[560px]:col-start-2">
                    {currency.format(product.price)}
                  </strong>
                </article>
              );
            })
          )}
        </section>
        {cart.length > 0 && (
          <aside className="sticky top-28 bg-[#18352b] p-[1.7rem] text-[#f4f6f1] max-[820px]:static">
            <p className="mt-0 mb-6 font-heading text-[1.15rem] font-[650]">
              Order summary
            </p>
            <dl className="mb-6 flex flex-col gap-[0.9rem]">
              <div className="flex justify-between gap-4 text-[0.85rem] text-[#cbd6ce] [&>dd]:m-0 [&>dt]:m-0">
                <dt>Items</dt>
                <dd>{cart.length}</dd>
              </div>
              <div className="flex justify-between gap-4 text-[0.85rem] text-[#cbd6ce] [&>dd]:m-0 [&>dt]:m-0">
                <dt>Delivery</dt>
                <dd>Calculated later</dd>
              </div>
              <div className="mt-[0.6rem] flex justify-between gap-4 border-t border-white/22 pt-[1.2rem] text-base font-bold text-white [&>dd]:m-0 [&>dt]:m-0">
                <dt>Total</dt>
                <dd>{currency.format(total)}</dd>
              </div>
            </dl>
            <Button
              className="min-h-[2.9rem] w-full rounded-full bg-[#c89b42] px-[1.4rem] text-[#18352b] hover:bg-[#c89b42]"
              onClick={onCheckout}
            >
              Continue to payment
            </Button>
            <small className="mt-4 flex items-center justify-center gap-[0.45rem] text-[0.73rem] text-[#b9c9be] [&>svg]:w-[0.9rem]">
              <ShieldCheck /> Account verification happens next
            </small>
          </aside>
        )}
      </div>
    </main>
  );
}
