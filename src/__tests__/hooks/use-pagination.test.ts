import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "@/hooks/use-pagination";

describe("usePagination", () => {
  it("initializes with page 1", () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 10, hasCreateCard: false }),
    );
    expect(result.current.currentPage).toBe(1);
    expect(result.current.activePage).toBe(1);
  });

  describe("totalPages", () => {
    it("calculates total pages correctly (no create card)", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 6, hasCreateCard: false, itemsPerPage: 6 }),
      );
      expect(result.current.totalPages).toBe(1);
    });

    it("calculates total pages with items spanning multiple pages", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 13, hasCreateCard: false, itemsPerPage: 6 }),
      );
      expect(result.current.totalPages).toBe(3);
    });

    it("accounts for create card in total pages", () => {
      // 6 items + 1 create card = 7 items, ceil(7/6) = 2 pages
      const { result } = renderHook(() =>
        usePagination({ totalItems: 6, hasCreateCard: true, itemsPerPage: 6 }),
      );
      expect(result.current.totalPages).toBe(2);
    });

    it("ensures at least 1 page", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 0, hasCreateCard: false }),
      );
      expect(result.current.totalPages).toBe(1);
    });
  });

  describe("showCreateCardOnPage", () => {
    it("shows create card on page 1 when hasCreateCard is true", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 10, hasCreateCard: true }),
      );
      expect(result.current.showCreateCardOnPage).toBe(true);
    });

    it("hides create card when on page 2", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 12, hasCreateCard: true, itemsPerPage: 6 }),
      );

      act(() => {
        result.current.setCurrentPage(2);
      });

      expect(result.current.showCreateCardOnPage).toBe(false);
    });

    it("hides create card when hasCreateCard is false", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 10, hasCreateCard: false }),
      );
      expect(result.current.showCreateCardOnPage).toBe(false);
    });
  });

  describe("setCurrentPage", () => {
    it("changes the current page", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 20, hasCreateCard: false, itemsPerPage: 6 }),
      );

      act(() => {
        result.current.setCurrentPage(2);
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.activePage).toBe(2);
    });

    it("clamps active page to total pages", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 6, hasCreateCard: false, itemsPerPage: 6 }),
      );

      act(() => {
        result.current.setCurrentPage(10); // beyond total
      });

      expect(result.current.activePage).toBe(1); // totalPages = 1
    });
  });

  describe("getPageNumbers", () => {
    it("returns all pages when total is small", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 12, hasCreateCard: false, itemsPerPage: 6 }),
      );

      const pages = result.current.getPageNumbers();
      expect(pages).toEqual([1, 2]);
    });

    it("returns pages with ellipsis for large page counts", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 60, hasCreateCard: false, itemsPerPage: 6 }),
      );

      const pages = result.current.getPageNumbers();
      // totalPages = 10, active page = 1
      expect(pages).toContain(1);
      expect(pages).toContain(10);
      // Should have some ellipsis
      const ellipsisCount = pages.filter((p) => p === "ellipsis").length;
      expect(ellipsisCount).toBeGreaterThan(0);
    });

    it("shows correct window around active page", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 60, hasCreateCard: false, itemsPerPage: 6 }),
      );

      act(() => {
        result.current.setCurrentPage(5);
      });

      const pages = result.current.getPageNumbers();
      expect(pages).toContain(4);
      expect(pages).toContain(5);
      expect(pages).toContain(6);
    });
  });

  describe("edge cases", () => {
    it("handles zero items with create card", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 0, hasCreateCard: true }),
      );
      // 0 + 1 = 1 total count, ceil(1/6) = 1
      expect(result.current.totalPages).toBe(1);
      expect(result.current.showCreateCardOnPage).toBe(true);
    });

    it("handles custom itemsPerPage", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 20, hasCreateCard: false, itemsPerPage: 10 }),
      );
      expect(result.current.totalPages).toBe(2);
    });

    it("handles initialPage", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 30,
          hasCreateCard: false,
          itemsPerPage: 6,
          initialPage: 3,
        }),
      );
      expect(result.current.currentPage).toBe(3);
    });
  });
});
