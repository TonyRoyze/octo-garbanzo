import { useState } from "react";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { dataTableFeatures, type DataTableFeatures } from "./data-table-features";

type DataTableProps<TData extends RowData> = {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
  emptyMessage?: string;
  getRowId?: (row: TData) => string;
  initialVisibility?: ColumnVisibilityState;
};

function labelForColumn(id: string) {
  return id.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
}: {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
}) {
  if (!column.getCanSort()) return <span>{title}</span>;
  const sorted = column.getIsSorted();
  return (
    <Button variant="ghost" size="sm" className="-ml-2" onClick={() => column.toggleSorting(sorted === "asc")}>
      {title}
      {sorted === "asc" ? <ArrowUp data-icon="inline-end" /> : sorted === "desc" ? <ArrowDown data-icon="inline-end" /> : <ArrowUpDown data-icon="inline-end" />}
    </Button>
  );
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Filter records…",
  emptyMessage = "No results.",
  getRowId,
  initialVisibility = {},
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(initialVisibility);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: { sorting, columnFilters, columnVisibility, rowSelection, pagination },
  });
  const filter = filterColumn ? table.getColumn(filterColumn) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {filter && (
          <Input
            className="max-w-sm"
            aria-label={filterPlaceholder}
            placeholder={filterPlaceholder}
            value={(filter.getFilterValue() as string) ?? ""}
            onChange={(event) => filter.setFilterValue(event.target.value)}
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="sm:ml-auto" />}>
            Columns
            <ChevronDown data-icon="inline-end" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
              {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(checked) => column.toggleVisibility(checked)}
                >
                  {labelForColumn(column.id)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card md:hidden">
        {table.getRowModel().rows.length ? (
          <Accordion>
            {table.getRowModel().rows.map((row) => {
              const cells = row
                .getVisibleCells()
                .filter((cell) => cell.column.id !== "select");
              const primaryCell = cells.find(
                (cell) => cell.column.id !== "actions",
              );
              return (
                <AccordionItem
                  className="px-4 last:border-b-0"
                  key={row.id}
                  value={row.id}
                >
                  <AccordionTrigger className="gap-3 no-underline hover:no-underline">
                    <div className="min-w-0 flex-1 overflow-hidden [&_.min-w-52]:min-w-0 [&_.min-w-64]:min-w-0">
                      {primaryCell ? <table.FlexRender cell={primaryCell} /> : row.id}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-3">
                    {cells
                      .filter((cell) => cell.id !== primaryCell?.id)
                      .map((cell) => (
                        <div
                          className="grid grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] items-start gap-3 border-t pt-3"
                          key={cell.id}
                        >
                          <span className="text-xs font-medium text-muted-foreground">
                            {labelForColumn(cell.column.id)}
                          </span>
                          <div className="min-w-0 text-right *:ml-auto">
                            <table.FlexRender cell={cell} />
                          </div>
                        </div>
                      ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}><table.FlexRender cell={cell} /></TableCell>
                ))}
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={columns.length} className="h-28 text-center text-muted-foreground">{emptyMessage}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <span className="flex-1">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} selected
        </span>
        <div className="flex items-center gap-2">
          <span>Rows</span>
          <Select value={String(pagination.pageSize)} onValueChange={(value) => value && table.setPageSize(Number(value))}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent><SelectGroup>{[10, 20, 50].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectGroup></SelectContent>
          </Select>
          <span className="min-w-24 text-center">Page {pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}</span>
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  );
}
