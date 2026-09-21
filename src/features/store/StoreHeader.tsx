import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoreView } from "./types";

type StoreHeaderProps = {
  itemCount: number;
  userName?: string;
  onView: (view: StoreView) => void;
  onLogout: () => void;
};

export function StoreHeader({
  itemCount,
  userName,
  onView,
  onLogout,
}: StoreHeaderProps) {
  return (
    <header className="flex w-full p-5 justify-between">
      <Button
        variant="ghost"
        onClick={() => onView("shop")}
      >
        <span className="store-mark">m</span>
        <span>Morrow</span>
      </Button>
      {/*<nav className="store-nav-links" aria-label="Store navigation">
        <button type="button" onClick={() => onView("shop")}>
          Collection
        </button>
        <button
          type="button"
          onClick={() =>
            document
              .getElementById("story")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Our approach
        </button>
      </nav>*/}
      <div>
        {userName && (
          <button
            type="button"
            className="store-account"
            onClick={onLogout}
            title="Sign out"
          >
            {userName}
          </button>
        )}
        <Button
          className="store-bag-button"
          size="sm"
          onClick={() => onView("cart")}
        >
          <ShoppingBag data-icon="inline-start" />
          Bag <span>{itemCount}</span>
        </Button>
      </div>
    </header>
  );
}
