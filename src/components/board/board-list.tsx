"use client";

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
import { usePagination } from "@/hooks/use-pagination";

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
  const hasCreateCard = currentUserRole !== "viewer" && currentUserRole !== "editor";

  const {
    activePage,
    totalPages,
    setCurrentPage,
    showCreateCardOnPage,
    getPageNumbers,
  } = usePagination({
    totalItems: boards.length,
    hasCreateCard,
  });

  // Slice boards list based on current page
  let pageBoards: Board[] = [];

  if (hasCreateCard) {
    if (activePage === 1) {
      pageBoards = boards.slice(0, 5);
    } else {
      const startIndex = (activePage - 1) * 6 - 1;
      pageBoards = boards.slice(startIndex, startIndex + 6);
    }
  } else {
    const startIndex = (activePage - 1) * 6;
    pageBoards = boards.slice(startIndex, startIndex + 6);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0 px-1 pt-2 pb-4 -mx-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Create New Board Card – only for non‑viewer/editor roles on Page 1 */}
          {showCreateCardOnPage && (
            <button
              onClick={onCreateClick}
              className="block text-left group h-full w-full cursor-pointer focus:outline-none"
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
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 mb-4 pt-4 border-t border-border/20 flex justify-center">
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
    </div>
  );
}
