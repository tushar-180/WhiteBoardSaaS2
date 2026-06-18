"use client";

import { useState, useMemo } from "react";

interface UsePaginationOptions {
  totalItems: number;
  hasCreateCard: boolean;
  itemsPerPage?: number;
  initialPage?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  activePage: number;
  totalPages: number;
  showCreateCardOnPage: boolean;
  getPageNumbers: () => (number | "ellipsis")[];
}

/**
 * Shared hook for paginated grids with an optional "create" card on page 1.
 * Used by `BoardList` and `WorkspaceList`.
 */
export function usePagination({
  totalItems,
  hasCreateCard,
  itemsPerPage = 6,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalCount = totalItems + (hasCreateCard ? 1 : 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const showCreateCardOnPage = hasCreateCard && activePage === 1;

  const getPageNumbers = useMemo(() => {
    return (): (number | "ellipsis")[] => {
      const pages: (number | "ellipsis")[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);

        if (activePage > 3) {
          pages.push("ellipsis");
        }

        const start = Math.max(2, activePage - 1);
        const end = Math.min(totalPages - 1, activePage + 1);

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }

        if (activePage < totalPages - 2) {
          pages.push("ellipsis");
        }

        pages.push(totalPages);
      }

      return pages;
    };
  }, [activePage, totalPages]);

  return {
    currentPage,
    setCurrentPage,
    activePage,
    totalPages,
    showCreateCardOnPage,
    getPageNumbers,
  };
}
