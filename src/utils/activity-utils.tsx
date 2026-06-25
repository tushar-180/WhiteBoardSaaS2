import {
  FaBriefcase,
  FaAward,
  FaPlus,
  FaTrashAlt,
  FaEnvelopeOpenText,
  FaUserPlus,
  FaUserMinus,
  FaUserShield,
  FaSignOutAlt,
  FaTimesCircle,
  FaBan,
  FaEdit,
  FaUserEdit,
} from "react-icons/fa";
import { ActivityActionType, WorkspaceActivityWithProfile } from "@/types/activity";

export function getActivityIcon(actionType: ActivityActionType) {
  switch (actionType) {
    case "workspace_created":
      return <FaBriefcase />;
    case "workspace_renamed":
    case "board_renamed":
      return <FaEdit />;
    case "board_created":
      return <FaPlus />;
    case "board_deleted":
      return <FaTrashAlt />;
    case "member_invited":
      return <FaEnvelopeOpenText />;
    case "invite_rejected":
      return <FaTimesCircle />;
    case "invite_revoked":
      return <FaBan />;
    case "member_joined":
      return <FaUserPlus />;
    case "member_removed":
      return <FaUserMinus />;
    case "role_changed":
      return <FaUserShield />;
    case "member_left":
      return <FaSignOutAlt />;
    case "member_renamed":
      return <FaUserEdit />;
    default:
      return <FaAward />;
  }
}

export function getActivityColor(
  actionType: ActivityActionType
): "success-create" | "success-join" | "destructive-delete" | "destructive-remove" | "info" | "warning" | "warning-leave" | "muted" | "default" {
  switch (actionType) {
    case "workspace_created":
    case "board_created":
      return "success-create";
    case "member_joined":
      return "success-join";
    case "board_deleted":
      return "destructive-delete";
    case "member_removed":
      return "destructive-remove";
    case "member_invited":
    case "member_renamed":
      return "info";
    case "invite_rejected":
    case "invite_revoked":
      return "muted";
    case "role_changed":
    case "workspace_renamed":
    case "board_renamed":
      return "warning";
    case "member_left":
      return "warning-leave";
    default:
      return "default";
  }
}

export function formatActivityMessage(activity: WorkspaceActivityWithProfile): string {
  const actorName = activity.actor_name || activity.actor_email || "Someone";

  switch (activity.action_type) {
    case "workspace_created":
      return `${actorName} created the workspace.`;
    case "workspace_renamed":
      return `${actorName} renamed the workspace from "${activity.metadata?.old_name}" to "${activity.metadata?.new_name}".`;
    case "board_created":
      return `${actorName} created board "${activity.metadata?.board_name || "Unnamed"}".`;
    case "board_deleted":
      return `${actorName} deleted board "${activity.metadata?.board_name || "Unnamed"}".`;
    case "board_renamed":
      return `${actorName} renamed board from "${activity.metadata?.old_name}" to "${activity.metadata?.new_name}".`;
    case "member_invited":
      return `${actorName} invited ${activity.metadata?.email} as ${activity.metadata?.role}.`;
    case "invite_rejected":
      return `${actorName} declined the invitation to join the workspace.`;
    case "invite_revoked":
      return `${actorName} revoked an invitation sent to ${activity.metadata?.email}.`;
    case "member_joined":
      return `${actorName} joined the workspace.`;
    case "member_removed":
      return `${actorName} removed ${activity.metadata?.email} from the workspace.`;
    case "member_renamed":
      return `${actorName} changed their name from "${activity.metadata?.old_name}" to "${activity.metadata?.new_name}".`;
    case "role_changed":
      return `${actorName} changed a role from ${activity.metadata?.old_role} to ${activity.metadata?.new_role}.`;
    case "member_left":
      return `${actorName} left the workspace.`;
    default:
      return `${actorName} performed an action.`;
  }
}

export function formatActivityTitle(actionType: ActivityActionType): string {
  switch (actionType) {
    case "workspace_created":
      return "Workspace Created";
    case "workspace_renamed":
      return "Workspace Renamed";
    case "board_created":
      return "Board Created";
    case "board_deleted":
      return "Board Deleted";
    case "board_renamed":
      return "Board Renamed";
    case "member_invited":
      return "Member Invited";
    case "invite_rejected":
      return "Invite Declined";
    case "invite_revoked":
      return "Invite Revoked";
    case "member_joined":
      return "Member Joined";
    case "member_removed":
      return "Member Removed";
    case "member_renamed":
      return "Profile Updated";
    case "role_changed":
      return "Role Changed";
    case "member_left":
      return "Member Left";
    default:
      return "Action Performed";
  }
}
