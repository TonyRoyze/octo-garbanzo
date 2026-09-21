import type { ReactNode } from "react";
import { Boxes, CreditCard, FileText, Plus } from "lucide-react";
import type { Product } from "../../../api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currency } from "../../../lib/currency";
import { PageHeader } from "../PageHeader";

type OverviewPageProps = {
  products: Product[];
  onAdd: () => void;
  onPage: (page: string) => void;
};

export function OverviewPage({
  products,
  onAdd,
  onPage,
}: OverviewPageProps) {
  const latest = products[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-8">
      <PageHeader
        eyebrow="Store overview"
        title="Good morning"
        description="Here’s what’s happening with your shop today."
        action={
          <Button onClick={onAdd}>
            <Plus data-icon="inline-start" />
            Add product
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          icon={<Boxes />}
          label="Products"
          value={String(products.length)}
          action="Add a product"
          onClick={onAdd}
        />
        <Metric
          icon={<CreditCard />}
          label="Sales this month"
          value="$0"
          action="View invoices"
          onClick={() => onPage("Invoices")}
        />
        <Metric
          icon={<FileText />}
          label="Open invoices"
          value="0"
          action="Create an invoice"
          onClick={() => onPage("Invoices")}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent product</CardTitle>
          <CardDescription>Your newest product appears here.</CardDescription>
        </CardHeader>
        <CardContent className="border-t pt-6 text-sm text-muted-foreground">
          {latest
            ? `${latest.name} · ${currency.format(latest.price)}`
            : "No products yet"}
        </CardContent>
      </Card>
    </div>
  );
}

type MetricProps = {
  icon: ReactNode;
  label: string;
  value: string;
  action: string;
  onClick: () => void;
};

function Metric({ icon, label, value, action, onClick }: MetricProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="text-muted-foreground">{icon}</div>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <Button variant="link" className="mt-2 h-auto p-0" onClick={onClick}>
          {action}
        </Button>
      </CardContent>
    </Card>
  );
}
