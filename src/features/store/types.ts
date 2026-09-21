import type { Product } from "../../api";

export type StoreView = "shop" | "cart" | "checkout";

export type StorefrontProps = {
  products: Product[];
  cart: Product[];
  view: StoreView;
  userName?: string;
  onView: (view: StoreView) => void;
  onAdd: (product: Product) => void;
  onRemove: (id: string) => void;
  onAdmin: () => void;
  onCheckout: () => void;
  onLogout: () => void;
  onNotify: (message: string) => void;
};
