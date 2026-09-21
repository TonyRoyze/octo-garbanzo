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
    <header className="flex w-full justify-between p-5">
      <Button variant="ghost" onClick={() => onView("shop")}>
        <span className="grid size-8 place-items-center rounded-full bg-[#18352b] text-[0.9rem] text-[#f4f6f1]">
          m
        </span>
        <span>Morrow</span>
      </Button>
      <div>
        {userName && (
          <button
            type="button"
            className="max-w-40 overflow-hidden border-0 bg-transparent text-[0.85rem] text-ellipsis whitespace-nowrap text-inherit hover:text-[#486957] max-[820px]:hidden"
            onClick={onLogout}
            title="Sign out"
          >
            {userName}
          </button>
        )}
        <Button
          className="rounded-full bg-[#18352b] hover:bg-[#244c3d] [&>span]:grid [&>span]:h-[1.3rem] [&>span]:min-w-[1.3rem] [&>span]:place-items-center [&>span]:rounded-full [&>span]:bg-[#f4f6f1] [&>span]:text-[0.72rem] [&>span]:text-[#18352b]"
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
