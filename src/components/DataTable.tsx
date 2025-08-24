"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  // Server-side pagination support
  pageCount?: number; // required when manualPagination=true
  manualPagination?: boolean;
  pagination?: PaginationState; // { pageIndex, pageSize }
  onPaginationChange?: (updater: PaginationState | ((old: PaginationState) => PaginationState)) => void;
  // Sorting
  enableSorting?: boolean;
  manualSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
  // UI
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  // Empty state
  emptyMessage?: React.ReactNode;
  // Optional built-in pagination controls (simple prev/next)
  showPaginationControls?: boolean;
  // Sticky header when parent container scrolls vertically
  stickyHeader?: boolean;
  // Max height for vertical scroll inside the table wrapper
  bodyMaxHeight?: string; // e.g., '24rem'
};

export function DataTable<TData>(props: DataTableProps<TData>) {
  const {
    columns,
    data,
    pageCount,
    manualPagination = false,
    pagination,
    onPaginationChange,
    enableSorting = true,
    manualSorting = false,
    sorting,
    onSortingChange,
    className,
    tableClassName,
    headerClassName,
    bodyClassName,
    emptyMessage = (
      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">Sin datos para mostrar</div>
    ),
    showPaginationControls = false,
    stickyHeader = false,
    bodyMaxHeight,
  } = props;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange,
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    onSortingChange,
    manualSorting,
    enableSorting,
  });

  const hasRows = table.getRowModel().rows.length > 0;

  return (
    <div className={className}>
      <div
        className={
          "w-full overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm " +
          (bodyMaxHeight ? "overflow-y-auto" : "")
        }
        style={bodyMaxHeight ? { maxHeight: bodyMaxHeight } : undefined}
      >
        <table className={"w-full text-sm " + (tableClassName ?? "")}> 
          <thead className={(headerClassName ?? "bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300") + (stickyHeader ? " sticky top-0 z-10" : "")}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className="px-3 py-2 text-left font-medium select-none"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort() && enableSorting
                              ? "cursor-pointer select-none flex items-center gap-1"
                              : undefined
                          }
                          onClick={
                            header.column.getCanSort() && enableSorting
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {enableSorting && header.column.getCanSort() ? (
                            <span className="text-xs text-gray-400">
                              {header.column.getIsSorted() === "asc" && "▲"}
                              {header.column.getIsSorted() === "desc" && "▼"}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className={bodyClassName ?? "divide-y divide-gray-200 dark:divide-gray-700"}>
            {hasRows ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={"bg-white dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-800/40"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 align-top text-gray-800 dark:text-gray-100">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={table.getAllLeafColumns().length}>{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPaginationControls && manualPagination && pagination && onPaginationChange && (
        <div className="flex items-center justify-between gap-2 mt-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Página {pagination.pageIndex + 1}
            {typeof pageCount === "number" && pageCount > 0 ? ` de ${pageCount}` : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 text-sm rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              onClick={() => onPaginationChange({ ...pagination, pageIndex: Math.max(0, pagination.pageIndex - 1) })}
              disabled={pagination.pageIndex === 0}
            >
              Anterior
            </button>
            <button
              className="px-3 py-1 text-sm rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              onClick={() =>
                onPaginationChange({
                  ...pagination,
                  pageIndex: pageCount ? Math.min(pageCount - 1, pagination.pageIndex + 1) : pagination.pageIndex + 1,
                })
              }
              disabled={typeof pageCount === "number" ? pagination.pageIndex >= pageCount - 1 : false}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
