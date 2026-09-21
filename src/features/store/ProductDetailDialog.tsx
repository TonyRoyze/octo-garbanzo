import { useState } from "react";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { getProductImages, type Product } from "../../api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { currency } from "../../lib/currency";

type ProductDetailDialogProps = {
  product: Product | null;
  open: boolean;
  inBag: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: Product) => void;
};

export function ProductDetailDialog({
  product,
  open,
  inBag,
  onOpenChange,
  onAdd,
}: ProductDetailDialogProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) return null;
  const images = getProductImages(product);
  const activeImage = images[selectedImage] ?? images[0];
  const outOfStock = product.quantity <= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto bg-[#f4f6f1] p-0 text-[#202622] sm:max-w-5xl">
        <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] max-[820px]:grid-cols-1">
          <div className="flex min-w-0 flex-col gap-3 bg-[#dce5d8] p-[clamp(1rem,2vw,1.5rem)]">
            <div className="grid aspect-square min-h-[28rem] place-items-center overflow-hidden bg-white/30 text-[#18352b6b] max-[820px]:min-h-0 [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>svg]:size-12">
              {activeImage ? (
                <img
                  src={activeImage.url}
                  alt={activeImage.alt || product.name}
                />
              ) : (
                <ShoppingBag />
              )}
            </div>
            {images.length > 1 && (
              <ToggleGroup
                aria-label="Product images"
                className="grid w-full grid-cols-4 gap-[0.6rem]"
                value={[String(selectedImage)]}
                onValueChange={(value) => {
                  if (value[0] !== undefined) setSelectedImage(Number(value[0]));
                }}
              >
                {images.map((image, index) => (
                  <ToggleGroupItem
                    className="aspect-square h-auto min-w-0 overflow-hidden rounded-[0.35rem] border-2 border-transparent p-0 opacity-62 aria-pressed:border-[#18352b] aria-pressed:opacity-100 [&>img]:h-full [&>img]:w-full [&>img]:object-cover"
                    value={String(index)}
                    aria-label={`Show image ${index + 1} of ${images.length}`}
                    key={image.key}
                  >
                    <img src={image.url} alt="" />
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            )}
          </div>

          <div className="flex flex-col items-start px-[clamp(1.5rem,4vw,3.5rem)] py-[clamp(2rem,5vw,4.5rem)] max-[820px]:px-6 max-[820px]:py-8">
            <DialogHeader>
              <DialogTitle className="max-w-[11ch] font-heading text-[clamp(2.2rem,4vw,4rem)] font-[670] leading-[0.98] tracking-[-0.05em] text-[#18352b]">
                {product.name}
              </DialogTitle>
              <DialogDescription className="mt-3 max-w-[34ch] text-[0.95rem] leading-[1.65] text-[#657169]">
                {product.description}
              </DialogDescription>
            </DialogHeader>
            <strong className="mt-8 font-heading text-[1.7rem] text-[#18352b]">
              {currency.format(product.price)}
            </strong>
            <div className="my-8 grid w-full gap-0 border-t border-[#18352b24]">
              <span className="border-b border-[#18352b24] py-[0.8rem] text-[0.8rem] text-[#657169]">
                Made for everyday use
              </span>
              <span className="border-b border-[#18352b24] py-[0.8rem] text-[0.8rem] text-[#657169]">
                Small-run production
              </span>
              <span className="border-b border-[#18352b24] py-[0.8rem] text-[0.8rem] text-[#657169]">
                Carefully packed
              </span>
            </div>
            <Button
              className="mt-auto w-full"
              variant={inBag ? "secondary" : "default"}
              disabled={inBag || outOfStock}
              onClick={() => onAdd(product)}
            >
              {inBag ? (
                <Check data-icon="inline-start" />
              ) : (
                <Plus data-icon="inline-start" />
              )}
              {outOfStock ? "Out of stock" : inBag ? "Already in bag" : "Add to bag"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
