"use client";

import { useEffect, useState } from "react";
import { TimelineItem } from "./timeline-item";
import { useActivityStore } from "@/store/use-activity-store";
import { WorkspaceActivityWithProfile } from "@/types/activity";
import { createClient } from "@/utils/supabase/client";
import { FaPlus, FaUserPlus, FaTrashAlt, FaUserMinus, FaEnvelopeOpenText, FaUserShield, FaSignOutAlt, FaTimesCircle, FaBan } from "react-icons/fa";

interface WorkspaceTimelineProps {
  workspaceId: string;
  initialActivities: WorkspaceActivityWithProfile[];
}

export function WorkspaceTimeline({ workspaceId, initialActivities }: WorkspaceTimelineProps) {
  const { activities, setActivities, addActivity, isLoading, setLoading } = useActivityStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setActivities(initialActivities);
    setLoading(false);
    setIsMounted(true);

    const supabase = createClient();
    
    // Subscribe to realtime inserts
    const channel = supabase
      .channel("workspace_activities_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workspace_activities",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        async (payload) => {
          // Fetch the profile for the actor to get name/email
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, email, avatar_url")
            .eq("id", payload.new.actor_id)
            .single();

          const newActivity: WorkspaceActivityWithProfile = {
            id: payload.new.id,
            workspace_id: payload.new.workspace_id,
            actor_id: payload.new.actor_id,
            action_type: payload.new.action_type,
            entity_type: payload.new.entity_type,
            entity_id: payload.new.entity_id,
            metadata: payload.new.metadata,
            created_at: payload.new.created_at,
            actor_name: profile?.name || null,
            actor_email: profile?.email || null,
            actor_avatar_url: profile?.avatar_url || null,
          };

          addActivity(newActivity);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, initialActivities, setActivities, addActivity, setLoading]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-foreground mb-4">
          Workspace Activity
        </h2>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 text-[11px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500 -ml-2"></div>
            <span>Created / Joined</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-2"></div>
            <span>Deleted / Removed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
            <span>Left</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <span>Invited / Profile Updated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
            <span>Declined / Revoked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <span>Renamed / Role Changed</span>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground">No activity recorded yet.</div>
        ) : (
          <div className="relative">
            <div className="absolute left-[24px] md:left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border"></div>
            {activities.map((activity, index) => (
              <TimelineItem key={activity.id} activity={activity} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
