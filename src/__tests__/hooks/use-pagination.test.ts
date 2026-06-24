import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "@/hooks/use-pagination";

describe("usePagination", () => {
  it("initializes with page 1", () => {
    const { result } = renderHook(() => usePagination({ totalItems: 10, hasCreateCard: false }));
    expect(result.current.currentPage).toBe(1);
  });

  it("calculates total pages correctly", () => {
    const { result } = renderHook(() => usePagination({ totalItems: 13, hasCreateCard: false, itemsPerPage: 6 }));
    expect(result.current.totalPages).toBe(3);
  });

  it("accounts for create card in total pages", () => {
    const { result } = renderHook(() => usePagination({ totalItems: 6, hasCreateCard: true, itemsPerPage: 6 }));
    expect(result.current.totalPages).toBe(2);
  });

  it("setCurrentPage changes page and clamps to total pages", () => {
    const { result } = renderHook(() => usePagination({ totalItems: 20, hasCreateCard: false, itemsPerPage: 6 }));
    act(() => result.current.setCurrentPage(2));
    expect(result.current.currentPage).toBe(2);
    act(() => result.current.setCurrentPage(10));
    expect(result.current.activePage).toBe(4);
  });
});
