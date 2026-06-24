"use client";

import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "motion/react";
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
      <div className="flex items-center gap-2 shrink-0 pt-2 px-1 relative z-0">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          All Boards ({boards.length})
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 px-1 pt-4 pb-4 -mx-1 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Create New Board Card – only for non‑viewer/editor roles on Page 1 */}
          {showCreateCardOnPage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <button
                onClick={onCreateClick}
                className="block text-left group h-full w-full cursor-pointer focus:outline-none"
              >
                <Card className="h-full min-h-[160px] border-2 border-dashed border-border/40 bg-card/10 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/30 hover:shadow-lg hover:-translate-y-1 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 ring-0 relative overflow-hidden">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 border border-border/50 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300 shadow-xs group-hover:scale-110 relative z-10">
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-bold text-sm text-foreground/80 group-hover:text-primary transition-colors duration-300 relative z-10">
                    Create Board
                  </span>
                  <span className="text-[11px] text-muted-foreground max-w-[180px] leading-relaxed relative z-10">
                    Create a new whiteboard canvas for your designs.
                  </span>
                </Card>
              </button>
            </motion.div>
          )}

          {/* Boards List */}
          {pageBoards.map((board, i) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: hasCreateCard ? (i + 1) * 0.05 : i * 0.05 }}
            >
              <BoardCard
                board={board}
                currentUserRole={currentUserRole}
              />
            </motion.div>
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
