"use client";

import { useState } from "react";
import { Plus, Search, X, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WorkspaceCard } from "./workspace-card";
import { type Workspace } from "@/types/workspace";
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

interface WorkspaceListProps {
  workspaces: Workspace[];
  userId: string;
  onCreateClick: () => void;
}

export function WorkspaceList({ workspaces, userId, onCreateClick }: WorkspaceListProps) {
  const [filter, setFilter] = useState<"all" | "owned" | "joined">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const ownedWorkspaces = workspaces.filter((w) => w.owner_id === userId);
  const joinedWorkspaces = workspaces.filter((w) => w.owner_id !== userId);

  const filteredWorkspaces = workspaces.filter((w) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "owned" && w.owner_id === userId) ||
      (filter === "joined" && w.owner_id !== userId);

    const matchesSearch = w.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Pagination
  const hasCreateCard = filter === "all" || filter === "owned";
  const {
    activePage,
    totalPages,
    setCurrentPage,
    showCreateCardOnPage,
    getPageNumbers,
  } = usePagination({
    totalItems: filteredWorkspaces.length,
    hasCreateCard,
  });

  // Calculate items to show
  let pageWorkspaces: typeof filteredWorkspaces = [];

  if (hasCreateCard) {
    if (activePage === 1) {
      pageWorkspaces = filteredWorkspaces.slice(0, 5);
    } else {
      const startIndex = (activePage - 1) * 6 - 1;
      pageWorkspaces = filteredWorkspaces.slice(startIndex, startIndex + 6);
    }
  } else {
    const startIndex = (activePage - 1) * 6;
    pageWorkspaces = filteredWorkspaces.slice(startIndex, startIndex + 6);
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-2 shrink-0 w-full min-w-0">
        
        {/* Desktop Filters (Hidden on Mobile) */}
        <div className="hidden sm:flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50 backdrop-blur-xs w-fit">
          <button
            onClick={() => { setFilter("all"); setCurrentPage(1); }}
            className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              filter === "all"
                ? "bg-background text-foreground shadow-xs border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-transparent"
            }`}
          >
            All Workspaces ({workspaces.length})
          </button>
          <button
            onClick={() => { setFilter("owned"); setCurrentPage(1); }}
            className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              filter === "owned"
                ? "bg-background text-foreground shadow-xs border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-transparent"
            }`}
          >
            Owned by Me ({ownedWorkspaces.length})
          </button>
          <button
            onClick={() => { setFilter("joined"); setCurrentPage(1); }}
            className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              filter === "joined"
                ? "bg-background text-foreground shadow-xs border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-transparent"
            }`}
          >
            Joined ({joinedWorkspaces.length})
          </button>
        </div>

        {/* Search & Mobile Filter Row */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Mobile Filter Dropdown */}
          <div className="sm:hidden">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center h-9 w-10 shrink-0 bg-muted/20 border border-border/50 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
                  <Filter className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-background/95 backdrop-blur-md border-border/60">
                <DropdownMenuItem onClick={() => { setFilter("all"); setCurrentPage(1); }} className={`cursor-pointer ${filter === "all" ? "bg-primary/10 text-primary font-bold" : ""}`}>
                  All Workspaces ({workspaces.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setFilter("owned"); setCurrentPage(1); }} className={`cursor-pointer ${filter === "owned" ? "bg-primary/10 text-primary font-bold" : ""}`}>
                  Owned by Me ({ownedWorkspaces.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setFilter("joined"); setCurrentPage(1); }} className={`cursor-pointer ${filter === "joined" ? "bg-primary/10 text-primary font-bold" : ""}`}>
                  Joined ({joinedWorkspaces.length})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              maxLength={50}
              className="pl-9 pr-9 h-9 text-xs rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/30 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content wrapper with scrollable grid */}
      <div className="flex-1 flex flex-col py-2">
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              filter === "joined" ? "bg-purple-500" : "bg-primary"
            }`}
          />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {filter === "all" && `All Workspaces (${workspaces.length})`}
            {filter === "owned" &&
              `Owned Workspaces (${ownedWorkspaces.length})`}
            {filter === "joined" &&
              `Joined Workspaces (${joinedWorkspaces.length})`}
          </h3>
        </div>

       <div className="flex-1 pt-1 pb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Create New Workspace Action Card - Show for All or Owned on Page 1 */}
            {showCreateCardOnPage && (
              <button
                onClick={onCreateClick}
                className="block text-left group h-full w-full cursor-pointer focus:outline-none"
              >
                <Card className="h-full min-h-[140px] border border-dashed border-border/100 bg-background/30 transition-all duration-300 hover:border-primary/60 hover:bg-muted/10 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 ring-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 border border-border/80 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 shadow-xs">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm text-foreground/80 group-hover:text-primary transition-colors duration-200">
                    Create Workspace
                  </span>
                  <span className="text-[11px] text-muted-foreground max-w-[180px] leading-relaxed">
                    Set up a new space for your boards and team.
                  </span>
                </Card>
              </button>
            )}

            {/* Render Workspace Cards */}
            {pageWorkspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                userId={userId}
              />
            ))}

            {/* Empty State when filtering Joined and none are found or search yields no results */}
            {filteredWorkspaces.length === 0 && (
              <div className="col-span-full py-8 sm:py-12 text-center border border-dashed border-border/60 rounded-xl bg-background/30 flex flex-col items-center justify-center p-4 sm:p-6 gap-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  {searchQuery ? "No workspaces found" : "No workspaces"}
                </span>
                <span className="text-xs text-muted-foreground/80 max-w-sm break-words">
                  {searchQuery
                    ? `No workspaces match your search "${searchQuery}".`
                    : filter === "joined"
                      ? "You haven't joined any workspaces yet. When others invite you, their workspaces will show up here."
                      : "You don't have any workspaces yet."}
                </span>
              </div>
            )}
          </div>
          
          {/* Pagination Controls - Moved inside scroll area for mobile */}
          {totalPages > 1 && (
            <div className="mt-4 mb-2 pt-2 border-t border-border/20 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (activePage > 1) setCurrentPage(activePage - 1);
                      }}
                      className={
                        activePage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
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
                      className={
                        activePage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
