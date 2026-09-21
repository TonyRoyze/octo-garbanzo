import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CartView } from "./CartView";
import { CheckoutView } from "./CheckoutView";
import { ShopView } from "./ShopView";
import { StoreHeader } from "./StoreHeader";
import type { StorefrontProps } from "./types";

export function Storefront({
  products,
  cart,
  view,
  userName,
  onView,
  onAdd,
  onRemove,
  onCheckout,
  onLogout,
  onNotify,
}: StorefrontProps) {
  const [cookieNoticeOpen, setCookieNoticeOpen] = useState(
    () => window.localStorage.getItem("morrow_cookie_notice") !== "accepted",
  );
  const total = cart.reduce((sum, product) => sum + product.price, 0);

  function acceptCookies() {
    window.localStorage.setItem("morrow_cookie_notice", "accepted");
    setCookieNoticeOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f1] text-[#202622]">
      <StoreHeader
        itemCount={cart.length}
        userName={userName}
        onView={onView}
        onLogout={onLogout}
      />

      {view === "shop" && (
        <ShopView products={products} cart={cart} onAdd={onAdd} />
      )}
      {view === "cart" && (
        <CartView
          cart={cart}
          total={total}
          onBack={() => onView("shop")}
          onRemove={onRemove}
          onCheckout={onCheckout}
        />
      )}
      {view === "checkout" && (
        <CheckoutView
          itemCount={cart.length}
          total={total}
          onBack={() => onView("cart")}
          onNotify={onNotify}
        />
      )}

      <footer className="grid grid-cols-[1fr_auto_1fr] items-end gap-8 border-t border-[#18352b24] px-[4vw] py-12 text-[0.78rem] text-[#657169] max-[560px]:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-[0.35rem]">
          <strong className="font-heading text-xl text-[#18352b]">Morrow</strong>
          <span>Objects for a considered everyday.</span>
        </div>
        <span className="max-[560px]:hidden">© 2026 Morrow goods</span>
      </footer>

      {cookieNoticeOpen && (
        <Card
          role="dialog"
          aria-label="Cookie notice"
          className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-xl shadow-lg"
        >
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="text-sm text-muted-foreground">
              We use cookies to keep Morrow working smoothly and understand how
              the store is used.
            </p>
            <Button className="shrink-0" size="sm" onClick={acceptCookies}>
              Got it
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
