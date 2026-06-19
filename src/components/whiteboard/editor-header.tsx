"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { type Board } from "@/types/workspace";
import { type CurrentUser } from "@/types/whiteboard";
import { ROUTES } from "@/lib/constants";
import WhiteboardSaveStatus from "./whiteboard-save-status";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EditorMembersPopover } from "./editor-members-popover";

interface EditorHeaderProps {
  board: Board;
  currentUser?: CurrentUser;
  onSave: () => void;
}

export function EditorHeader({ board, currentUser, onSave }: EditorHeaderProps) {

  return (
    <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-md z-40 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <Link
          href={`${ROUTES.WORKSPACES}/${board.workspace_id}`}
          className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
          title="Back to Workspace"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-foreground truncate">
            {board.name}
          </span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[250px]">
            {board.description || "No description"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time Save Status Indicators */}
        <WhiteboardSaveStatus onSave={onSave} />
        
        {/* Divider */}
        <div className="h-6 w-[1px] bg-border/60 hidden sm:block" />

        {/* User Profile */}
        <EditorMembersPopover workspaceId={board.workspace_id} currentUser={currentUser as CurrentUser}>
          <button 
            className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-full hover:bg-muted/40 transition-colors border border-transparent hover:border-border/30 cursor-pointer text-left focus:outline-none"
          >
            <Avatar className="h-8 w-8 border border-border/50 shadow-sm">
              {currentUser?.avatar_url && <AvatarImage src={currentUser.avatar_url} alt={currentUser?.name || currentUser?.email || "User"} />}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center hidden sm:flex pr-2">
              <span className="text-sm font-semibold text-foreground max-w-[140px] truncate leading-tight">
                {currentUser?.name || (currentUser?.email ? currentUser.email.split("@")[0] : "User")}
              </span>
              {currentUser?.role && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-semibold uppercase tracking-wider bg-muted/80 hover:bg-muted/80 text-muted-foreground border-transparent mt-1">
                  {currentUser.role}
                </Badge>
              )}
            </div>
          </button>
        </EditorMembersPopover>
      </div>
    </header>
  );
}
