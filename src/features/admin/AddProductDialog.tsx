import { useRef, useState, type ChangeEvent, type SubmitEvent } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import {
  getProductImages,
  uploadsApi,
  type CreateProductInput,
  type Product,
  type ProductImage,
} from "../../api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const emptyProduct: CreateProductInput = {
  name: "",
  description: "",
  price: 0,
  status: "ACTIVE",
  images: [],
};

type ImageDraft = {
  stored?: ProductImage;
  file?: File;
  previewUrl: string;
  alt: string;
};

type AddProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (product: CreateProductInput) => Promise<void>;
  product?: Product | null;
};

function readPreview(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function initialProduct(product: Product | null): CreateProductInput {
  if (!product) return { ...emptyProduct, images: [] };
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    status: product.status,
    images: getProductImages(product),
  };
}

function initialImages(product: Product | null): ImageDraft[] {
  return product
    ? getProductImages(product).map((image) => ({
        stored: image,
        previewUrl: image.url,
        alt: image.alt,
      }))
    : [];
}

export function AddProductDialog({
  open,
  onOpenChange,
  onCreate,
  product: editingProduct = null,
}: AddProductDialogProps) {
  const [product, setProduct] = useState<CreateProductInput>(() =>
    initialProduct(editingProduct),
  );
  const [imageDrafts, setImageDrafts] = useState<ImageDraft[]>(() =>
    initialImages(editingProduct),
  );
  const [error, setError] = useState("");
  const [stage, setStage] = useState<"idle" | "uploading" | "saving">("idle");
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function selectImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setError("");
    if (!files.length) return;
    if (imageDrafts.length + files.length > 4) {
      const remaining = 4 - imageDrafts.length;
      setError(`You can add ${remaining} more image${remaining === 1 ? "" : "s"}.`);
      return;
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setError("Each image must be 5 MB or smaller.");
      return;
    }

    try {
      const previews = await Promise.all(files.map(readPreview));
      setImageDrafts((current) => [
        ...current,
        ...files.map((file, index) => ({
          file,
          previewUrl: previews[index],
          alt: "",
        })),
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not preview the images");
    }
  }

  function updateImage(index: number, update: Partial<ImageDraft>) {
    setImageDrafts((current) =>
      current.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...update } : image,
      ),
    );
  }

  function makeMain(index: number) {
    setImageDrafts((current) => {
      const next = [...current];
      const [selected] = next.splice(index, 1);
      return [selected, ...next];
    });
  }

  function reset() {
    setProduct({ ...emptyProduct, images: [] });
    setImageDrafts([]);
    setError("");
    if (fileInput.current) fileInput.current.value = "";
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (imageDrafts.some((image) => image.file)) setStage("uploading");
      const images = await Promise.all(
        imageDrafts.map(async (image, index) => {
          const uploaded = image.file
            ? await uploadsApi.uploadProductImage(image.file)
            : image.stored;
          if (!uploaded) throw new Error("One product image is missing upload data");
          return {
            ...uploaded,
            alt:
              image.alt.trim() ||
              `${product.name.trim()}${index === 0 ? "" : `, view ${index + 1}`}`,
          };
        }),
      );
      setStage("saving");
      await onCreate({ ...product, images, image: undefined });
      reset();
      onOpenChange(false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not save product",
      );
    } finally {
      setSaving(false);
      setStage("idle");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit product" : "Add a product"}</DialogTitle>
            <DialogDescription>
              Add one main image and up to three supporting views.
            </DialogDescription>
          </DialogHeader>

          <section className="flex flex-col gap-3" aria-labelledby="product-images-label">
            <div className="flex items-end justify-between gap-4">
              <div>
                <strong id="product-images-label" className="text-sm font-medium">
                  Product images
                </strong>
                <p className="text-xs text-muted-foreground">
                  The first image is used on the store card.
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {imageDrafts.length} / 4
              </span>
            </div>

            {imageDrafts.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {imageDrafts.map((image, index) => (
                  <div className="flex flex-col gap-2 rounded-lg border p-2" key={`${image.previewUrl}-${index}`}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
                      <img className="size-full object-cover" src={image.previewUrl} alt="" />
                      <Badge className="absolute left-2 top-2" variant="secondary">
                        {index === 0 ? "Main" : `View ${index + 1}`}
                      </Badge>
                      <Button
                        className="absolute right-2 top-2"
                        type="button"
                        size="icon-sm"
                        variant="secondary"
                        aria-label={`Remove image ${index + 1}`}
                        onClick={() =>
                          setImageDrafts((current) =>
                            current.filter((_, imageIndex) => imageIndex !== index),
                          )
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <Input
                      aria-label={`Description for image ${index + 1}`}
                      maxLength={160}
                      value={image.alt}
                      placeholder="Image description"
                      onChange={(event) => updateImage(index, { alt: event.target.value })}
                    />
                    {index > 0 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => makeMain(index)}>
                        Make main image
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {imageDrafts.length < 4 && (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground transition-colors hover:bg-muted">
                <ImagePlus />
                Choose image{4 - imageDrafts.length > 1 ? "s" : ""}
                <Input
                  ref={fileInput}
                  className="sr-only"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={selectImages}
                />
              </label>
            )}
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, or AVIF. Maximum 5 MB per image.
            </p>
          </section>

          <label className="flex flex-col gap-2 text-sm">
            Product name
            <Input
              required
              maxLength={120}
              value={product.name}
              onChange={(event) => setProduct({ ...product, name: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Price
            <Input
              required
              min="0"
              step="0.01"
              type="number"
              value={product.price}
              onChange={(event) =>
                setProduct({ ...product, price: Number(event.target.value) })
              }
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Description
            <Input
              required
              maxLength={500}
              value={product.description}
              onChange={(event) =>
                setProduct({ ...product, description: event.target.value })
              }
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {!editingProduct && <Plus data-icon="inline-start" />}
              {stage === "uploading"
                ? "Uploading images…"
                : stage === "saving"
                  ? "Saving product…"
                  : editingProduct
                    ? "Save changes"
                    : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
