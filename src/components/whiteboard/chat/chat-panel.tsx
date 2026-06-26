"use client";

import { useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { useChatStore } from "@/store/use-chat-store";
import { useMemberStore } from "@/store/use-member-store";
import { useBoardChat } from "../hooks/use-board-chat";
import { getWorkspaceMembersAction } from "@/actions/member";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

interface ChatPanelProps {
  boardId: string;
  workspaceId: string;
  currentUserId: string;
}

export function ChatSidebar({ boardId, workspaceId, currentUserId }: ChatPanelProps) {
  const setMembers = useMemberStore((state) => state.setMembers);

  // Populate workspace members in the zustand store for the mention picker
  useEffect(() => {
    getWorkspaceMembersAction(workspaceId)
      .then(setMembers)
      .catch(() => {
        // Silently fail — the mention picker just won't show suggestions
      });
  }, [workspaceId, setMembers]);

  // Initialize data fetching and realtime subscription
  useBoardChat(boardId, workspaceId);

  return (
    <Sidebar side="right" collapsible="offcanvas" style={{ zIndex: 100, height: '100dvh' }}>
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary shrink-0" />
          <h3 className="font-semibold text-sm flex-1">Board Chat</h3>
          <SidebarClose />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <ChatMessageList currentUserId={currentUserId} />
      </SidebarContent>
      <SidebarFooter className="p-0 border-t border-sidebar-border">
        <ChatInput boardId={boardId} workspaceId={workspaceId} />
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarClose() {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-sidebar-accent"
    >
      <X className="w-4 h-4" />
    </button>
  );
}

