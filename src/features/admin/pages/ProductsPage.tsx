import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { getProductImages, type Product } from "../../../api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currency } from "../../../lib/currency";
import { PageHeader } from "../PageHeader";

type ProductsPageProps = {
  products: Product[];
  loading: boolean;
  query: string;
  onQuery: (value: string) => void;
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
};

export function ProductsPage({
  products,
  loading,
  query,
  onQuery,
  onAdd,
  onEdit,
  onDelete,
}: ProductsPageProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-8">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Create and organise the things you sell."
        action={
          <Button onClick={onAdd}>
            <Plus data-icon="inline-start" />
            Add product
          </Button>
        }
      />
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search products"
        />
      </div>
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const mainImage = getProductImages(product)[0];
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex min-w-52 items-center gap-3">
                      <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-xs text-muted-foreground">
                        {mainImage ? (
                          <img
                            className="size-full object-cover"
                            src={mainImage.url}
                            alt={mainImage.alt || product.name}
                          />
                        ) : (
                          product.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <strong className="block">{product.name}</strong>
                        <span className="text-xs text-muted-foreground">
                          {product.description}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {product.status === "ACTIVE" ? "Active" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>{currency.format(product.price)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        aria-label={`Edit ${product.name}`}
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(product)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        aria-label={`Delete ${product.name}`}
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(product.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {products.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {loading ? "Loading products…" : "No products found."}
          </div>
        )}
      </Card>
    </div>
  );
}
