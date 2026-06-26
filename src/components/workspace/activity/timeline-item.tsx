"use client";

import { useState } from "react";
import { WorkspaceActivityWithProfile } from "@/types/activity";
import {
  getActivityIcon,
  getActivityColor,
  formatActivityMessage,
  formatActivityTitle,
} from "@/utils/activity-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TimelineItemProps {
  activity: WorkspaceActivityWithProfile;
  index: number;
}

export function TimelineItem({ activity, index }: TimelineItemProps) {
  const category = getActivityColor(activity.action_type);
  const icon = getActivityIcon(activity.action_type);
  const title = formatActivityTitle(activity.action_type);
  const message = formatActivityMessage(activity);
  
  const date = new Date(activity.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isEven = index % 2 === 0;

  const iconColors = `
    ${category === "success-create" ? "bg-emerald-500" : ""}
    ${category === "success-join" ? "bg-teal-500" : ""}
    ${category === "destructive-delete" ? "bg-red-500" : ""}
    ${category === "destructive-remove" ? "bg-rose-500" : ""}
    ${category === "warning-leave" ? "bg-orange-500" : ""}
    ${category === "muted" ? "bg-slate-500" : ""}
    ${category === "info" ? "bg-blue-500" : ""}
    ${category === "warning" ? "bg-amber-500" : ""}
    ${category === "default" ? "bg-gray-500" : ""}
  `.trim();

  return (
    <div className="relative flex items-start md:items-center mb-8 w-full group">
      {/* Mobile Icon */}
      <div className="md:hidden flex-shrink-0 z-10 flex justify-center w-12 pt-1">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-background shadow-md text-white ${iconColors}`}
        >
          {icon}
        </div>
      </div>

      {/* Content */}
      <div
        className={`flex-1 min-w-0 pl-4 md:pl-0 md:flex-none md:w-5/12 ${
          isEven ? "md:mr-auto md:text-right md:pr-8" : "md:ml-auto md:text-left md:pl-8"
        }`}
      >
        <div className="mb-2">
          <div className="font-bold text-base md:text-lg text-foreground">{title}</div>
          <div className="text-xs md:text-sm text-muted-foreground">{date}</div>
        </div>
        <div
          className={`p-3 sm:p-4 rounded-lg shadow-sm border bg-card border-border overflow-hidden flex items-start gap-3 sm:gap-4`}
        >
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 border border-border/50">
            <AvatarImage src={activity.actor_avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm font-medium">
              {activity.actor_name?.[0]?.toUpperCase() || activity.actor_email?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 pt-1 sm:pt-0.5">
            <p className="text-foreground/80 opacity-90 break-words whitespace-pre-wrap text-sm sm:text-base leading-snug">
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Icon */}
      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center z-10">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-background shadow-md text-white transition-transform duration-300 group-hover:scale-110 ${iconColors}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
