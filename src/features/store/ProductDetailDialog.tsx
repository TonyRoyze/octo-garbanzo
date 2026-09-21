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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="store-product-dialog max-h-[calc(100svh-2rem)] overflow-y-auto p-0 sm:max-w-5xl">
        <div className="store-product-dialog-grid">
          <div className="store-product-gallery">
            <div className="store-product-gallery-main">
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
                className="store-product-thumbnail-group"
                value={[String(selectedImage)]}
                onValueChange={(value) => {
                  if (value[0] !== undefined) setSelectedImage(Number(value[0]));
                }}
              >
                {images.map((image, index) => (
                  <ToggleGroupItem
                    className="store-product-thumbnail"
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

          <div className="store-product-dialog-copy">
            <DialogHeader>
              <DialogTitle>{product.name}</DialogTitle>
              <DialogDescription>{product.description}</DialogDescription>
            </DialogHeader>
            <strong className="store-product-dialog-price">
              {currency.format(product.price)}
            </strong>
            <div className="store-product-dialog-details">
              <span>Made for everyday use</span>
              <span>Small-run production</span>
              <span>Carefully packed</span>
            </div>
            <Button
              className="store-product-dialog-action"
              variant={inBag ? "secondary" : "default"}
              disabled={inBag}
              onClick={() => onAdd(product)}
            >
              {inBag ? (
                <Check data-icon="inline-start" />
              ) : (
                <Plus data-icon="inline-start" />
              )}
              {inBag ? "Already in bag" : "Add to bag"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
