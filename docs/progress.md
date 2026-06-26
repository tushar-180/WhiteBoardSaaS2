# Development Timeline & Tasks Log

This document tracks the practical build plan for the current Zentrox whiteboard app. The roadmap intentionally stays focused on the product being built now: authentication, workspaces, members/invites, boards, canvas persistence, and subscription billing.

AI diagram generation, AI chat, comments, and heavy production scaling are not part of the current roadmap.

---

## Schedule Overview

```txt
Stage 1  -> Project setup, auth, Supabase clients, profiles
Stage 2  -> Workspaces dashboard and workspace CRUD
Stage 3  -> Workspace members, invites, and access control
Stage 4  -> Board CRUD inside workspaces
Stage 5  -> Whiteboard canvas and canvas_data persistence
Stage 6  -> Polish, validation, errors, loading states, and deployment readiness
Stage 7  -> Real-Time Collaboration
Stage 8  -> Real-Time Notifications, Access Controls, and UI Polish
Stage 9  -> SEO, Accessibility, and Codebase Polish
Stage 10 -> Codebase Audit and Polish
Stage 11 -> Payment/Subscription Billing with Razorpay
```

---

## Stage 1: Project Setup, Auth, and Profiles

**Goal:** Establish the Next.js app foundation, Supabase authentication, and public profile sync.

- [x] Initialize Next.js 16 project with TypeScript, Tailwind CSS v4, and shadcn/ui.
- [x] Add Supabase SSR clients in `src/utils/supabase/` for browser, server, and proxy middleware usage.
- [x] Add auth route protection in `src/proxy.ts`.
- [x] Build login/register UI with email/password auth, GitHub OAuth, React Hook Form, and Zod validation.
- [x] Add the `profiles` table sync trigger migration.
- [x] Add profile service reads through `src/services/profile.ts`.

## Stage 2: Workspaces Dashboard and Workspace CRUD

**Goal:** Let authenticated users create, view, and delete their own workspaces.

- [x] Add workspace types and `workspaceSchema` in `src/types/workspace.ts`.
- [x] Add workspace database service functions in `src/services/workspace.ts`.
- [x] Add workspace Server Actions for create/read/delete in `src/actions/workspace.ts`.
- [x] Create `/workspaces` dashboard route.
- [x] Hydrate workspace/user state with Zustand through `src/store/use-workspace-store.ts`.
- [x] Add workspace create/delete UI with shadcn dialog components, React Hook Form, Zod, and Sonner toasts.
- [x] Finish `/workspaces/[workspaceId]` detail page.

## Stage 3: Workspace Members and Invites

**Goal:** Use the existing `workspace_members` and `workspace_invites` tables for collaboration access.

- [x] Add service functions for workspace members (`src/services/member.ts`).
- [x] Add service functions for workspace invites (`src/services/invite.ts`).
- [x] Add member Server Actions in `src/actions/member.ts` (list, remove, update role, leave workspace).
- [x] Add invite Server Actions in `src/actions/invite.ts` (create, accept, revoke, list).
- [x] Extend workspace service with membership queries in `src/services/workspace.ts`.
- [x] Show workspace owner/member list on the workspace detail page (`WorkspaceDetailsClient`).
- [x] Add `InviteMemberDialog` — invite creation UI with role selection.
- [x] Add invite accept route at `/invite/[token]` with `InviteAcceptClient` component.
- [x] Add `useMemberStore` Zustand store for member/invite client state.
- [x] Enforce role-based access: board creation restricted to owners only.
- [x] Add read-only canvas mode for editors and viewers (`isReadonly` on tldraw editor).
- [x] Add `LeaveWorkspaceDialog` component for non-owner members to leave a workspace.
- [x] Add Vercel Analytics to `src/app/layout.tsx`.

## Stage 4: Board CRUD

**Goal:** Let users manage boards inside a workspace.

- [x] Add board service functions for create/read/update/delete.
- [x] Add board Server Actions.
- [x] Show board list inside `/workspaces/[workspaceId]`.
- [x] Add create/edit/delete board UI.
- [x] Route users to `/board/[boardId]` when opening a board.

## Stage 5: Whiteboard Canvas and Persistence

**Goal:** Store and restore board drawing state using `boards.canvas_data`.

- [x] Install and configure the canvas library.
- [x] Embed the canvas in `/board/[boardId]`.
- [x] Load `boards.canvas_data` when a board opens.
- [x] Save canvas changes back to `boards.canvas_data`.
- [x] Add simple loading, saving, and error states.

## Stage 6: Polish and Release Readiness

**Goal:** Make the core app stable and pleasant to use.

- [x] Add Next.js loading.tsx suspense states for both workspace list and detail routes.
- [x] Refactor repeating Supabase client/auth calls into reusable server helpers.
- [x] Extract shared layout, background gradients, and navigation headers into workspaces route layout.
- [x] Centralize route configuration targets and asset paths into constants file.
- [x] Review empty states, not-found states, and protected-route redirects.
- [x] Tighten form validation and server-side error messages.
- [x] Run lint/build verification.
- [x] Document required environment variables.
- [x] Prepare deployment notes.

## Stage 7: Real-Time Collaboration

**Goal:** Enable multiple users to collaborate live on the same board using a custom tldraw WebSocket sync server and TLSocketRoom presence.

- [x] Set up a tldraw sync backend (WebSocket server via `@tldraw/sync @tldraw/sync-core`).
- [x] Replace single-user `Tldraw` with `useSync` hook in `WhiteboardCanvas` for multi-user room state.
- [x] Configure an asset store for file/image uploads within the canvas.
- [x] Handle room persistence and reconnection on the backend.
- [x] Test concurrent edits across multiple browser sessions.
- [x] Add live cursor presence for connected users.
- [x] Show live avatar stack (user avatars + names) in the board toolbar when others are present.
- [x] Refactor client-side and sync server codebases into clean modular architectures.
- [x] Implement server-side user profile fetching and props threading.

## Stage 8: Real-Time Notifications, Access Controls, and UI Polish

**Goal:** Provide live feedback for workspace events, enhance access control dynamics, and improve core UI components.

- [x] Create a `NotificationInbox` to display workspace activities in real-time.
- [x] Add `use-notification-store.ts` for managing global notification state.
- [x] Enable Supabase Realtime subscriptions for `workspace_invites` and `workspace_members`.
- [x] Add an `inviter_seen` field to track and notify inviter about accepted invites.
- [x] Refactor `InviteMemberDialog` into modular components (`invite-form`, `invite-success`, `invite-suggestions`).
- [x] Implement real-time access revocation monitoring inside the whiteboard editor.
- [x] Add `KickedOverlay` to handle users losing permissions mid-session.
- [x] Refactor `WorkspaceMembersList` and introduce `WorkspaceMemberRow`.
- [x] Add generic reusable `DropdownMenu` and `Pagination` UI components.
- [x] Integrate pagination into `BoardList` and `WorkspaceList`.
- [x] Resolve React 18 passive event listener warnings for mobile touch gestures on the whiteboard canvas.
- [x] Overhaul landing page (`Hero`, `Features`, `Footer`) to be fully responsive and mobile-first, using SVG `viewBox` scaling.
- [x] Fix mobile layout bugs for creation dialogs and notification inbox.
- [x] Integrate `WorkspaceMembersList` into the canvas `EditorHeader` for on-the-fly member management.

## Stage 9: SEO, Accessibility, and Codebase Polish

**Goal:** Improve search engine visibility, enhance accessibility, and resolve strict compiler/linter warnings.

- [x] Add dynamic `sitemap.ts` and `robots.ts` for SEO.
- [x] Enhance landing page UI with `HoverBorderGradient` from Aceternity UI.
- [x] Improve accessibility (A11y) across the app: better color contrast, ARIA labels, and touch targets.
- [x] Resolve all Next.js 15 / React Compiler hydration and purity errors (`react-hooks/purity`, `set-state-in-effect`).
- [x] Enforce strict typings by replacing `any` with `unknown` in database and email services.
- [x] Fix unescaped entities across legal pages and empty states.

## Stage 10: Codebase Audit and Polish

**Goal:** Eliminate dead code, consolidate duplicates, fix production-readiness issues, and add UI polish.

- [x] Update `.env.example` with correct environment variables (SendGrid, PostHog, Supabase Service Role, Sync Server).
- [x] Remove dead commented-out code (`avatar.ts`, `create-board-dialog.tsx`, `create-workspace-dialog.tsx`).
- [x] Fix hardcoded 2024 year in footer (`new Date().getFullYear()`).
- [x] Fix comment mismatch in whiteboard-canvas.tsx (said "5s" but actual was 10s).
- [x] Extract shared `formatDate` to `lib/utils.ts` — used by `workspaces-settings.tsx` & `invites-tab.tsx`.
- [x] Reuse GithubIcon component in footer instead of duplicating SVG.
- [x] Fix hardcoded route strings (`/workspaces`) to use `ROUTES.WORKSPACES` constant.
- [x] Fix silent error returns in server actions (`searchProfilesAction`, `getUserNotificationsAction`, `getPendingInvitesAction`, `getWorkspaceMembersAction`) — now throw instead of silently returning `[]`.
- [x] Fix ReactDOM import in board page (`import ReactDOM` → named `preconnect`).
- [x] Add role selector dropdown to invites tab (viewer/editor/admin options).
- [x] Create shared `usePagination` hook from `board-list.tsx` and `workspace-list.tsx` duplicates.
- [x] Add `hasManagePermission` helper to `lib/utils.ts`, update 6 component files.
- [x] Add Radix `DialogDescription` to settings modal for accessibility (fixes console warning).
- [x] Replace comma-separated email input with capsule/pill email input (Enter to add, X to remove, Backspace to delete last, max 10 limit).
- [x] Add debounced profile search suggestions to invites tab.
- [x] Fix invites tab UI layout for responsiveness (remove fragile `sm:pt-8` hack, fix suggestion dropdown positioning).
- [x] Add `created_at` column to `workspace_invites` table (was missing from database — created migration to add column with default and backfill).
- [x] Fix font preload warning in layout (moved `font-sans` to `<html>` for earlier inheritance).
- [x] Fix Sent At column visibility (hidden on mobile, fixes incorrect removal of `hidden sm:table-cell`).
- [x] Update all documentation (docs/database.md, docs/deployment.md, docs/phases.md, docs/whiteboard.md, docs/progress.md).

## Stage 11: Payment/Subscription Billing with Razorpay

**Goal:** Implement tiered subscription plans (Free/Pro/Ultra) with Razorpay payment processing, cryptographic signature verification, and plan limit enforcement across workspaces, boards, and member invites.

### Database & Infrastructure
- [x] Create billing migration `20260619000000_create_billing_tables.sql` with `user_subscriptions` and `payments` tables, enums (`plan_type`, `subscription_status`, `payment_status`), RLS policies, indexes, and auto-creation trigger on new user signup.
- [x] Install `razorpay` npm package (v2.9.6).
- [x] Initialize Razorpay SDK singleton in `src/lib/razorpay.ts`.
- [x] Add Razorpay env vars (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`) to `.env.example`.

### Billing Service
- [x] Create `src/types/billing.ts` with PlanType, UserSubscription, Payment, PaymentVerificationInput types, PLAN_LIMITS constants (Free/Pro/Ultra pricing & limits), and Zod schemas.
- [x] Create `src/services/billing.ts` with:
  - `getUserSubscription()` — fetches subscription with built-in expiry detection and DB persistence
  - `createPaymentOrder()` — creates Razorpay order + inserts pending payment record
  - `verifyPayment()` — HMAC signature verification + Razorpay API re-verification + idempotency check
  - `handleWebhookEvent()` — processes `payment.captured` and `payment.failed` events
  - `checkWorkspaceCreationLimit()`, `checkBoardCreationLimit()`, `checkMemberInviteLimit()` — enforce soft limits with descriptive error messages

### API Routes
- [x] Create `POST /api/billing/create-order` — authenticated route that creates Razorpay order and inserts pending payment.
- [x] Create `POST /api/billing/verify` — authenticated route that verifies payment signature, activates subscription, and revalidates cache.
- [x] Create `POST /api/webhooks/billing` — webhook handler with Razorpay signature verification, processes `payment.captured` and `payment.failed`.

### Client-Side Payment
- [x] Create `src/hooks/use-razorpay.ts` — client-side Razorpay checkout hook with script loading, order creation, checkout opening, payment verification, and subscription cache invalidation.
- [x] Create `src/components/billing/pricing-cards.tsx` — Free/Pro/Ultra tier comparison cards with feature lists and upgrade buttons.
- [x] Create `src/components/billing/upgrade-dialog.tsx` — overlay dialog for plan-limit enforcement with Razorpay integration.
- [x] Create `src/components/billing/pricing-client.tsx` — client component for public `/pricing` page with plan fetching and login redirect.
- [x] Create public `/pricing` landing page with `PointerHighlight` UI effect.
- [x] Fix Razorpay container pointer-events CSS issue in `globals.css`.
- [x] Add Razorpay checkout theme customization (indigo brand color, dark backdrop).

### Settings & Billing UI
- [x] Add `"billing"` to `SettingsTab` type union in `settings-store.ts`.
- [x] Create `src/components/settings/billing-tab.tsx` — billing settings with current plan card, usage limits display, "Compare Plans" pricing cards, transaction history table, cancel subscription flow, and subscription cache invalidation.
- [x] Create `src/components/settings/payment-receipt-modal.tsx` — modal with printable receipt design, payment details (date, plan, order/transaction IDs), print using hidden iframe with style injection.
- [x] Add Billing nav item (`CreditCard` icon) to `SettingsSidebar`.
- [x] Wire `BillingSettings` component in `SettingsContent`.

### Limit Enforcement in Dialogs
- [x] Create `src/actions/billing.ts` with proactive limit check actions (`checkWorkspaceLimitAction`, `checkBoardLimitAction`, `checkMemberLimitAction`) returning `LimitCheckResult`.
- [x] Update `CreateWorkspaceDialog` — proactive limit check on open, limit reached UI with usage bar and badge, Upgrade button triggers Razorpay checkout.
- [x] Update `CreateBoardDialog` — proactive limit check on open, limit reached UI with usage bar and badge.
- [x] Update `InviteMemberDialog` — proactive limit check on open, limit reached UI with usage bar and badge.
- [x] Add workspace plan badge display (plan type chip with `workspacePlan` prop) to workspace detail page sidebar.

### Server-Side Limit Enforcement
- [x] Add `checkWorkspaceCreationLimit()` call in `createWorkspaceAction`.
- [x] Add `checkBoardCreationLimit()` call in `createBoardAction`.
- [x] Add `checkMemberInviteLimit()` call in `createInviteAction` and `bulkInviteUsersAction`.
- [x] Pass `ownerSubscription` to `WorkspaceDetailsClient` for plan badge display.

## Stage 12: Real-Time Board Chat & Workspace Activity Timeline

### Real-Time Board Chat

**Goal:** Enable real-time per-board chat with Supabase Realtime subscriptions, @mentions with auto-complete, reply-to threading, and a shadcn sidebar UI.

- [x] Create `board_messages` database table with `reply_to_message_id` self-reference and Supabase Realtime publication.
- [x] Define `BoardMessage`, `BoardMessageSender`, `BoardMessageReplyTo` types in `src/types/chat.ts`.
- [x] Create chat service layer (`src/services/chat.ts`) with `fetchBoardMessages()` and `insertBoardMessage()`, both with joined profile and reply chain hydration.
- [x] Create chat Server Actions (`src/actions/chat.ts`) with auth checks and workspace access verification.
- [x] Create `useChatStore` Zustand store with messages, isOpen, unreadCount, replyingTo, and isLoading state, plus duplicate prevention and board-switch reset.
- [x] Create `useBoardChat` hook with initial fetch and Realtime INSERT subscription for live message broadcasting.
- [x] Build `ChatSidebar` — shadcn `Sidebar` component (`side="right"`, `collapsible="offcanvas"`, 350px width) with header, scrollable message list, and footer input area.
- [x] Build `ChatInput` — auto-resizing textarea with mention badge system (chip/@Name + X button), inline `ChatMentionPicker` with avatar/name/email display, reply-to context bar, and optimistic UI clear on send.
- [x] Build `ChatMessageList` — auto-scroll to bottom, scroll-to-bottom FAB with unread badge, loading spinner.
- [x] Build `ChatMessageItem` — @mention rendering (`@<email>` → styled @DisplayName), reply chain preview, "Read more"/"Show less" for long messages (>300 chars or >6 lines).
- [x] Build `ChatMentionPicker` — filters workspace members by name/email with avatar + name + email rows.
- [x] Create `formatMessageTime` utility in `src/utils/chat.ts` for relative/today/date display.
- [x] Integrate `ChatSidebar` into `WhiteboardEditor` via `SidebarProvider` with controlled open/close state.
- [x] Add `HeaderChatToggle` button in `EditorHeader` with unread badge, using `useSidebar()` context.
- [x] Wire mention picker to `useMemberStore` (populated via `getWorkspaceMembersAction` on chat mount).
- [x] Set sidebar z-index to 100 to sit above tldraw canvas tools, and height to 100dvh to prevent footer clipping.

### Workspace Activity Timeline

**Goal:** Build an immutable audit log of workspace events with a real-time vertical timeline UI, color-coded icons, and human-readable event messages.

- [x] Create `workspace_activities` database table with `action_type`, `entity_type`, `entity_id`, `metadata` (jsonb), and indexes on `workspace_id` and `created_at DESC`.
- [x] Define `ActivityActionType` union (13 event types), `ActivityEntityType`, `WorkspaceActivity`, and `WorkspaceActivityWithProfile` types in `src/types/activity.ts`.
- [x] Create activity service layer (`src/services/activity.ts`) with `logActivity()` (silent fail pattern) and `fetchWorkspaceActivities()` (joined with profiles, ordered by created_at DESC).
- [x] Create `useActivityStore` Zustand store with activities list, loading state, and `addActivity` that inserts at front and sorts by created_at.
- [x] Create `activity-utils.tsx` with `getActivityIcon()`, `getActivityColor()`, `formatActivityMessage()`, and `formatActivityTitle()` for UI rendering.
- [x] Build `TimelineItem` component — vertical timeline entry with color-coded icon circle, actor avatar, title, human-readable message, and timestamp.
- [x] Build `WorkspaceTimeline` component — full timeline view with centered vertical line, alternating layout (desktop), mobile-friendly stacked layout, color legend, empty state, and loading spinner.
- [x] Add Realtime INSERT subscription to `WorkspaceTimeline` — fetches actor profile on new event and appends to the activity store.
- [x] Hook activity logging into all relevant Server Actions:
  - `board_created`, `board_renamed`, `board_deleted` in `src/actions/board.ts`
  - `workspace_renamed` in `src/actions/workspace.ts`
  - `member_invited` (single + bulk) in `src/actions/invite.ts`
  - `invite_rejected`, `invite_revoked` in `src/actions/invite.ts`
  - `member_joined` in `src/actions/invite.ts`
  - `member_removed` (single + bulk) in `src/actions/member.ts`
  - `role_changed` in `src/actions/member.ts`
  - `member_left` in `src/actions/member.ts`
  - `member_renamed` (across all user workspaces) in `src/actions/profile.ts`
- [x] Add "Activity Timeline" tab toggle in `WorkspaceDetailsClient` alongside the existing "Boards" tab.
- [x] Server-side hydration: fetch `initialActivities` in the workspace detail page and pass to `WorkspaceDetailsClient`.
- [x] Add `REPLICA IDENTITY FULL` and add table to `supabase_realtime` publication for live broadcasting.

## Later / Optional

- [ ] AI features.
- [ ] Comments.
- [ ] Recurring subscription billing (auto-renew with Razorpay Subscriptions API).
- [ ] Advanced scaling infrastructure.
- [ ] Chat file/image attachments.
- [ ] Chat message editing and deletion.
- [ ] Chat search.
- [ ] RLS policies for board_messages and workspace_activities (currently omitted).
