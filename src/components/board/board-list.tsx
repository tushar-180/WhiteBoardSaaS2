"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BoardCard } from "./board-card";
import { type Board, type WorkspaceRole } from "@/types/workspace";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface BoardListProps {
  boards: Board[];
  currentUserRole: WorkspaceRole;
  onCreateClick: () => void;
}

export function BoardList({
  boards,
  currentUserRole,
  onCreateClick,
}: BoardListProps) {
  const ITEMS_PER_PAGE = 6;
  const hasCreateCard = currentUserRole !== "viewer" && currentUserRole !== "editor";
  const totalCount = boards.length + (hasCreateCard ? 1 : 0);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const [currentPage, setCurrentPage] = useState(1);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));

  // Slice boards list based on current page
  let pageBoards: Board[] = [];
  let showCreateCardOnPage = false;

  if (hasCreateCard) {
    if (activePage === 1) {
      showCreateCardOnPage = true;
      pageBoards = boards.slice(0, ITEMS_PER_PAGE - 1);
    } else {
      showCreateCardOnPage = false;
      const startIndex = (activePage - 1) * ITEMS_PER_PAGE - 1;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      pageBoards = boards.slice(startIndex, endIndex);
    }
  } else {
    showCreateCardOnPage = false;
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    pageBoards = boards.slice(startIndex, endIndex);
  }

  const getPageNumbers = () => {
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Create New Board Card – only for non‑viewer/editor roles on Page 1 */}
          {showCreateCardOnPage && (
            <button
              onClick={onCreateClick}
              className="block text-left group h-full cursor-pointer focus:outline-none"
            >
              <Card className="h-full min-h-[160px] border border-dashed border-border/100 bg-background/30 transition-all duration-300 hover:border-primary/60 hover:bg-muted/10 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 ring-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 border border-border/80 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 shadow-xs">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="font-bold text-sm text-foreground/80 group-hover:text-primary transition-colors duration-200">
                  Create Board
                </span>
                <span className="text-[11px] text-muted-foreground max-w-[180px] leading-relaxed">
                  Create a new whiteboard canvas for your designs.
                </span>
              </Card>
            </button>
          )}

          {/* Boards List */}
          {pageBoards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              currentUserRole={currentUserRole}
            />
          ))}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="shrink-0 pt-4 border-t border-border/20 flex justify-center bg-background/80 backdrop-blur-xs">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (activePage > 1) setCurrentPage(activePage - 1);
                  }}
                  className={activePage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {getPageNumbers().map((pageNum, idx) => (
                <PaginationItem key={idx}>
                  {pageNum === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={activePage === pageNum}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (activePage < totalPages) setCurrentPage(activePage + 1);
                  }}
                  className={activePage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
