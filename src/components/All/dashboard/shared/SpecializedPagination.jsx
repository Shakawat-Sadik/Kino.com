"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * SpecializedPagination
 *
 * Props:
 *   page         – current 1-based page number
 *   total        – total number of records from the server
 *   limit        – records per page (matches the limit sent to the server action)
 *   onPageChange – (newPage: number) => void
 */
export function SpecializedPagination({ page, total, limit, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Don't render if everything fits on one page
  if (totalPages <= 1 && total <= limit) return null;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Build the array of page numbers to display, inserting "ellipsis" strings as needed.
  // Always shows: first, last, current±1 (when far from edges).
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [1];

    if (page > 3) pages.push("ellipsis-start");

    const rangeStart = Math.max(2, page - 1);
    const rangeEnd = Math.min(totalPages - 1, page + 1);
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);

    if (page < totalPages - 2) pages.push("ellipsis-end");

    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-border">
      {/* Record range info */}
      <p className="text-xs text-muted-foreground order-2 sm:order-1">
        {total === 0
          ? "No results"
          : `Showing ${from}–${to} of ${total}`}
      </p>

      {/* Page controls */}
      <Pagination className="mx-0 w-auto order-1 sm:order-2">
        <PaginationContent className="gap-0.5">

          {/* Previous */}
          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 pl-2 h-8"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Prev</span>
            </Button>
          </PaginationItem>

          {/* Page numbers */}
          {getPageNumbers().map((p) =>
            typeof p === "string" ? (
              <PaginationItem key={p}>
                <PaginationEllipsis className="h-8 w-8" />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <Button
                  variant={p === page ? "outline" : "ghost"}
                  size="icon"
                  className="h-8 w-8 text-xs font-medium"
                  onClick={() => onPageChange(p)}
                  aria-current={p === page ? "page" : undefined}
                  aria-label={`Go to page ${p}`}
                >
                  {p}
                </Button>
              </PaginationItem>
            )
          )}

          {/* Next */}
          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 pr-2 h-8"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="Go to next page"
            >
              <span className="hidden sm:inline text-xs">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>

        </PaginationContent>
      </Pagination>
    </div>
  );
}
