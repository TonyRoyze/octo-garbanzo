import type { InvoiceStatus } from "../../../api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type InvoiceStatusSelectProps = {
  value: InvoiceStatus;
  onChange: (value: InvoiceStatus) => void;
  ariaLabel: string;
  className?: string;
};

export function InvoiceStatusSelect({
  value,
  onChange,
  ariaLabel,
  className,
}: InvoiceStatusSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) onChange(nextValue as InvoiceStatus);
      }}
    >
      <SelectTrigger
        className={cn(className)}
        aria-label={ariaLabel}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="DRAFT">Draft</SelectItem>
        <SelectItem value="SENT">Sent</SelectItem>
        <SelectItem value="PAID">Paid</SelectItem>
        <SelectItem value="OVERDUE">Overdue</SelectItem>
      </SelectContent>
    </Select>
  );
}
