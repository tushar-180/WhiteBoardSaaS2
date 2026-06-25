# Workspace Activity Timeline (Audit Log)

## Overview
The Workspace Activity Timeline feature provides an audit trail of important events that occur within a workspace. It answers questions like "Who created this board?", "When did this member join?", and "Who changed this person's role?".

## Monitored Events
We will track the following events:
- **Workspace Created:** Triggered when a new workspace is instantiated.
- **Board Created:** Triggered when a member creates a new whiteboard.
- **Board Deleted:** Triggered when a member deletes an existing whiteboard.
- **Member Invited:** Triggered when an invite is sent to an email address.
- **Member Joined:** Triggered when an invited user accepts their invitation.
- **Role Changed:** Triggered when an admin/owner changes another member's role.
- **Member Removed:** Triggered when a member is kicked from the workspace.
- **Member Left:** Triggered when a member voluntarily leaves the workspace.

## Database Design

### New Table: `workspace_activities`
This table will store the chronological log of all workspace events.

| Column Name    | Type   | Constraints                                       | Description |
|----------------|--------|---------------------------------------------------|-------------|
| `id`           | `uuid` | Primary Key, `gen_random_uuid()`                  | Unique ID for the event. |
| `workspace_id` | `uuid` | Foreign Key → `workspaces.id` `ON DELETE CASCADE` | The workspace where the event occurred. |
| `actor_id`     | `uuid` | Foreign Key → `profiles.id` `ON DELETE CASCADE`   | The user who performed the action. |
| `action_type`  | `text` | Not Null                                          | E.g., `created`, `deleted`, `invited`, `joined`, `role_updated`, `removed`, `left`. |
| `entity_type`  | `text` | Not Null                                          | The object acted upon: `workspace`, `board`, `member`, `invite`. |
| `entity_id`    | `uuid` | Nullable                                          | The UUID of the board, member, etc., if applicable. |
| `metadata`     | `jsonb`| Default `{}`                                      | Additional context (e.g., `board_name`, `previous_role`, `new_role`, `invitee_email`). |
| `created_at`   | `timestamptz` | Not Null, Default `now()`                  | Timestamp of the event. |

### Indexes
- `idx_workspace_activities_workspace_id` on `workspace_id` (Optimizes fetching timeline per workspace).
- `idx_workspace_activities_created_at` on `created_at` (Optimizes chronological sorting).

### Row Level Security (RLS)
- **Select:** Any member of the workspace can read the activities.
- **Insert:** Handled via backend Server Actions / Services using `supabaseAdmin` (Service Role) to ensure tamper-proof audit trails, or allowed for authenticated users if they are members (but Service Role is safer for audit logs).
- **Update/Delete:** Denied for everyone (audit logs must be immutable).

## Backend Integration Points
We will hook into the existing Server Actions & Services to log activities:
1. `src/services/workspace.ts` -> `createWorkspace`: Log `workspace` / `created`.
2. `src/services/board.ts` -> `createBoard`: Log `board` / `created` with `board_name` in metadata.
3. `src/services/board.ts` -> `deleteBoard`: Log `board` / `deleted` with `board_name` in metadata.
4. `src/services/invite.ts` -> `createInvite`: Log `invite` / `invited` with `email` and `role` in metadata.
5. `src/services/invite.ts` -> `acceptInvite`: Log `member` / `joined`.
6. `src/services/member.ts` -> `updateMemberRole`: Log `member` / `role_updated` with `old_role` and `new_role`.
7. `src/services/member.ts` -> `removeMember`: Log `member` / `removed`.

## Frontend UI (Proposed)
- A new Timeline/Activity page inside the workspace settings or dashboard (e.g., `app/dashboard/[slug]/activity/page.tsx`).
- A chronological feed component `ActivityFeed` that groups events by day.
- Support for filtering events by `action_type` or `actor`.
