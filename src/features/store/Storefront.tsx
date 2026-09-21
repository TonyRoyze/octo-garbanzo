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
  // onAdmin,
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
    <div className="store-shell">
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

      <footer className="store-footer">
        <div>
          <strong>Morrow</strong>
          <span>Objects for a considered everyday.</span>
        </div>
        <span>© 2026 Morrow goods</span>
        {/*<button type="button" onClick={onAdmin}>
          Admin
        </button>*/}
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
