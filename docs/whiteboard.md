# Zentrox Whiteboard Architecture

This document is the current technical reference for Zentrox. The project is a workspace-based whiteboard app with authentication, workspace collaboration, board management, canvas persistence, and subscription billing.

AI features, comments, and advanced realtime scaling are intentionally out of scope for the current build.

---

## 1. Product Scope

The current product flow:

```txt
Login / Register
  ↓
Create or open Workspace
  ↓
Manage workspace members and invites
  ↓
Create or open Board
  ↓
Draw on whiteboard
  ↓
Save and restore board canvas_data
  ↓
Upgrade plan (Free → Pro/Ultra via Razorpay)
  ↓
Limits enforced for workspaces, boards, and members
```

---

## 2. Tech Stack

- **Framework:** Next.js 16 App Router (Turbopack), React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui, Aceternity UI, Radix primitives, Motion (animations), tw-animate-css
- **Icons and Feedback:** lucide-react, Sonner
- **Client State:** Zustand (6 stores: workspace, board, member, notification, whiteboard, settings)
- **Forms and Validation:** React Hook Form, Zod 4.4.3, `@hookform/resolvers`
- **Backend:** Next.js Server Actions and Route Handlers
- **Database/Auth:** Supabase SSR SDK and Supabase PostgreSQL
- **Canvas:** tldraw 5.1.0 with `useSync` for real-time multi-user collaboration
- **Payments:** Razorpay SDK (`razorpay` npm package v2.9.6) with crypto-signed HMAC verification
- **Analytics & Monitoring:** PostHog (client: posthog-js, server: posthog-node), @vercel/analytics, @vercel/speed-insights
- **Email:** SendGrid (@sendgrid/mail) — transactional emails for workspace invites
- **Sync Server:** tldraw sync backend (WebSocket server via `@tldraw/sync`, `@tldraw/sync-core`) deployed to Render
- **Testing:** Vitest, @testing-library/react, jsdom (284 tests, 26 files)
- **Additional:** next-themes (dark mode), simplex-noise (UI effects)

Redux Toolkit is not part of the current architecture.

---

## 3. Current Runtime Flow

### Authentication & Constants

- Centralized route configurations and asset paths reside in `src/lib/constants.ts` (e.g., `ROUTES`, `ASSETS`, `DEFAULT_REDIRECTS`).
- `src/proxy.ts` checks Supabase sessions using route guards and constants:
  - Redirects unauthenticated protected-route users to `DEFAULT_REDIRECTS.AUTH_FALLBACK`.
  - Redirects logged-in users away from `ROUTES.LOGIN`.

- **Auth Helpers (`src/utils/supabase/server.ts`):**
  - `getCurrentUser()`: retrieves client and user (does not throw/redirect).
  - `requireAuth(redirectTo)`: route guard, redirects to login if unauthenticated.
  - `requireActionAuth(errorMessage)`: for Server Actions, throws an error if unauthenticated.

Auth UI lives in `src/components/auth/login-form.tsx` and uses:
- `react-hook-form`
- `zodResolver`
- `authSchema` from `src/types/auth.ts`
- Supabase email/password auth
- Supabase GitHub OAuth

### Workspaces

- **Workspaces Layout (`src/app/(protected)/workspaces/layout.tsx`):**
  - Renders the shared `<WorkspaceNav />` header and background blur gradients across all workspaces pages.
  - Consolidates standard page-level layout wrappers.

- **Workspaces list page (`/workspaces`):**
  - requireAuth() server-side auth validation
  - fetchWorkspacesByOwner(user.id)
  - fetchProfileById(user.id)
  - WorkspacesClient
  - useWorkspaceStore (hydrated client-side)

Workspace writes go through:

```txt
src/actions/workspace.ts
  -> checkWorkspaceCreationLimit(user.id)  // subscription plan check
  -> src/services/workspace.ts
  -> Supabase tables
```

The `createWorkspaceAction` calls `checkWorkspaceCreationLimit()` before creating, which enforces the Free plan limit of 1 workspace.

### Boards

```txt
/workspaces/[workspaceId] page
  -> fetchWorkspaceById(workspaceId)
  -> hasWorkspaceAccess(workspaceId, user.id)
  -> fetchBoardsByWorkspace(workspaceId)
  -> getUserSubscription(workspace.owner_id)  // for plan badge
  -> WorkspaceDetailsClient
  -> useBoardStore
```

Board writes go through:

```txt
src/actions/board.ts
  -> checkBoardCreationLimit(workspaceId)  // subscription plan check
  -> src/services/board.ts
  -> Supabase tables
```

The `createBoardAction` calls `checkBoardCreationLimit()` which checks the workspace owner's plan to enforce board limits.

### Whiteboard Canvas

```txt
/board/[boardId] page
  -> fetchBoardById(boardId)
  -> hasWorkspaceAccess(board.workspace_id, user.id)
  -> WhiteboardEditor (Client component)
  -> WhiteboardCanvas (Dynamically imported with SSR disabled)
  -> useWhiteboardStore (Zustand state for saveStatus and lastSavedAt)
```

The whiteboard canvas collaboration and persistence runtime flow:
1. **User Auth Fetch**: The server component (`page.tsx` + `requireAuth()`) queries the Supabase database for the logged-in user profile's display name and workspace members, formulating `currentUser` and `initialMembers` objects.
2. **Props Threading**: `currentUser` and `initialMembers` are passed down to `<WhiteboardEditor>` then `<WhiteboardCanvas>`, enabling instant preference and member store hydration.
3. **Connection**: `WhiteboardCanvas` uses `@tldraw/sync`'s `useSync` hook to connect to the sync server (`ws://localhost:8787/boards/:boardId?token=JWT`).
4. **Auth & Authorization**: The WebSocket server validates the Supabase JWT token, confirms the board and workspace exist, and verifies user membership.
5. **Load**: When the first client connects, the sync server loads `boards.canvas_data`, converts it to a `RoomSnapshot`, and creates a `TLSocketRoom` room.
6. **Collaboration**: TLSocketRoom synchronizes edits, cursors, presence, selections, and conflict resolution across clients in real-time.
7. **Local Change Detection**: The client-side store listener (`store.listen` with `{ source: "all" }`) detects local document changes immediately and transitions the Zustand save state to `"saving"`.
8. **Auto-save**: Server-side document updates trigger a debounced (3-second) callback that saves the room's current snapshot back to `boards.canvas_data` in Supabase.
9. **Indicators**: The client receives server-broadcasted `"autosave:saving"`, `"autosave:saved"`, and `"autosave:error"` custom messages to transition the header status badges cleanly.
10. **Cleanup**: When the last user disconnects, the server saves the final room snapshot to Supabase and shuts down the room. Signal handlers (`SIGTERM`, `SIGINT`) persist active rooms on shutdown.
11. **Manual Save**: The manual save fallback remains available on the client using the `updateBoardCanvasAction` server action.
12. **Real-Time Access Revocation**: The `KickedOverlay` component monitors `workspace_members` Realtime changes and shows a kicked screen if the user's membership is revoked mid-session.
13. **Collaborator Presence**: `EditorHeader` shows a live avatar stack of active collaborators. The `useCollaboratorNotifications` hook manages join/leave toast notifications.

### Billing & Subscription Flow

```txt
User clicks "Upgrade" → useRazorpay hook → POST /api/billing/create-order
  → createPaymentOrder() inserts pending payment → Returns order_id, key_id
  → Razorpay checkout opens in iframe
  → User pays → handler callback → POST /api/billing/verify
  → verifyPayment() checks HMAC sig, verifies via Razorpay API
  → Updates payment → "paid", upserts subscription → "active"
  → revalidatePath("/", "layout") → UI updates instantly
```

**Payment entry points:**
1. **Settings → Billing tab** (`billing-tab.tsx`): Shows current plan, limits, pricing cards, and payment history with printable receipts.
2. **Upgrade Dialog** (`upgrade-dialog.tsx`): Shown when hitting plan limits during workspace/board/invite creation.

**Database tables (see `database.md`):**
- `user_subscriptions`: Tracks per-user plan type (`free`/`pro`/`ultra`) and status (`active`/`expired`)
- `payments`: Stores Razorpay order/payment IDs, amounts, statuses

**Key files:**
- `src/types/billing.ts` — PlanType, Payment, UserSubscription, PLAN_LIMITS constants
- `src/lib/razorpay.ts` — Razorpay SDK singleton
- `src/services/billing.ts` — Core payment logic (create, verify, webhook, limit checks)
- `src/hooks/use-razorpay.ts` — Client-side checkout hook
- `src/actions/billing.ts` — Server actions for proactive limit checks
- `src/actions/settings.ts` — Subscription CRUD actions
- `src/app/api/billing/create-order/route.ts`, `verify/route.ts`, `webhooks/billing/route.ts`
- `src/components/billing/pricing-cards.tsx`, `upgrade-dialog.tsx`, `pricing-client.tsx`
- `src/components/settings/billing-tab.tsx`, `payment-receipt-modal.tsx`

---

## 4. Database Schema

The current database has seven application tables:

- `profiles`
- `workspaces`
- `workspace_members`
- `workspace_invites`
- `boards`
- `user_subscriptions`
- `payments`

See [database.md](database.md) for the exact table columns.

---

## 5. Build Phases

```txt
Phase 1  -> Auth and profiles
Phase 2  -> Workspaces
Phase 3  -> Workspace members and invites
Phase 4  -> Boards
Phase 5  -> Canvas persistence through boards.canvas_data
Phase 6  -> Polish and deployment readiness
Phase 7  -> Real-Time Collaboration
Phase 8  -> Real-Time Notifications and Advanced Controls
Phase 9  -> SEO, Accessibility, and Codebase Polish
Phase 10 -> Codebase Audit and Polish
Phase 11 -> Payment/Subscription Billing with Razorpay
```

See [phases.md](phases.md) and [progress.md](progress.md) for the current task breakdown.

---

## 6. Folder Map

```txt
src/
├── actions/              # Server Actions (auth, billing, board, invite, member, workspace, profile, settings)
├── app/                  # Next.js App Router (layouts, pages, route handlers)
│   ├── (auth)/           # Login, register, forgot-password, reset-password, link-expired
│   ├── (landing)/        # Home, about, contact, features, pricing, privacy, terms
│   └── (protected)/      # Workspaces, boards, invite pages (behind auth middleware)
│   └── api/
│       ├── billing/      # Razorpay create-order + verify API routes
│       └── webhooks/     # Razorpay webhook handler (billing)
├── components/
│   ├── auth/             # Auth UI (login-form, forgot-password-form, reset-password-form, etc.)
│   ├── billing/          # PricingCards, UpgradeDialog, PricingPageClient
│   ├── board/            # Board cards, lists, form dialogs (create, edit, delete)
│   ├── landing/          # Landing page (hero, features, footer, navbar, mockup, lazy-sections)
│   ├── shared/           # Shared components (error-boundary, unauthorized-access)
│   ├── settings/         # Settings modal (profile, workspaces, billing, notifications, appearance, account, members, invites)
│   ├── ui/               # shadcn/ui & custom components (avatar, badge, button, card, dialog, dropdown, etc.)
│   ├── whiteboard/       # tldraw canvas wrapper (editor, canvas, save-status, kicked-overlay, editor-header)
│   │   ├── hooks/        # Collaboration custom hooks
│   │   │   ├─ use-collaborator-notifications.ts
│   │   │   └─ use-whiteboard-sync.ts
│   │   └── utils/        # Utility helpers (sync-uri.ts)
│   └── workspace/        # Workspace dashboard (cards, lists, members, invites, notifications, dialogs)
├── hooks/                # Custom React hooks (use-auth-form, use-pagination, use-razorpay)
├── lib/                  # Shared utilities (constants, utils, avatar, posthog-server, razorpay)
├── services/             # Supabase data access (billing, board, email, invite, member, profile, workspace)
├── store/                # Zustand stores (workspace, board, member, notification, whiteboard, settings)
├── types/                # TypeScript types and Zod schemas (auth, billing, profile, whiteboard, workspace)
├── utils/supabase/       # Supabase browser/server/middleware clients
├── __tests__/            # Vitest test suite (26 files, 284 tests) mirroring src/ structure
└── proxy.ts              # Auth route guard

sync-server/              # Multiplayer WS Sync Server (Modular)
├── config.ts             # Configurations and env setup
├── types.ts              # Sync types
├── database.ts           # Supabase client helper
├── auth.ts               # Authenticated board verification
├── connection.ts         # Socket routing and connection queues
├── rooms.ts              # Room registry and autosave loops
├── persistence.ts        # Database snapshot savers
└── server.ts             # Main entry point
```


## 7. Board Chat Architecture

The board chat system provides real-time per-board messaging using Supabase Realtime. It lives alongside the canvas as a shadcn `Sidebar` component on the right side.

### Chat Data Flow

```txt
Mount:
  useBoardChat(boardId, workspaceId)
    → resetChat() (clear previous board's state)
    → getBoardMessagesAction(boardId, workspaceId)  // initial fetch
    → supabase.channel('board_messages:{boardId}')
        .on('postgres_changes', INSERT)  // subscribe to new messages
        .subscribe()

Send:
  sendBoardMessageAction(workspaceId, boardId, content, replyToMessageId)
    → requireActionAuth()
    → hasWorkspaceAccess(workspaceId, user.id)
    → insertBoardMessage(boardId, user.id, content, replyToMessageId)
    → INSERT row → Realtime broadcasts to all clients

Realtime Reception:
  INSERT payload received → re-fetch full message with profiles & reply_to
    → addMessage(formattedMsg) to useChatStore
    → Auto-scroll/fab logic in ChatMessageList
    → Unread badge increment (if sidebar is collapsed)
```

### Key Files

| Layer | File | Description |
|:------|:-----|:------------|
| Database | `supabase/migrations/20260625000000_create_board_messages.sql` | board_messages table + Realtime publication |
| Types | `src/types/chat.ts` | BoardMessage, BoardMessageSender, BoardMessageReplyTo |
| Service | `src/services/chat.ts` | fetchBoardMessages(), insertBoardMessage() |
| Actions | `src/actions/chat.ts` | getBoardMessagesAction(), sendBoardMessageAction() |
| Store | `src/store/use-chat-store.ts` | Zustand store (messages, isOpen, unreadCount, replyingTo, isLoading) |
| Utility | `src/utils/chat.ts` | formatMessageTime() |
| Hook | `src/components/whiteboard/hooks/use-board-chat.ts` | Initial fetch + Realtime subscription |
| Sidebar | `src/components/whiteboard/chat/chat-panel.tsx` | ChatSidebar + SidebarClose components |
| Input | `src/components/whiteboard/chat/chat-input.tsx` | Textarea + mention badges + reply-to bar |
| Messages | `src/components/whiteboard/chat/chat-message-list.tsx` | Scrollable list + auto-scroll + FAB |
| Message Item | `src/components/whiteboard/chat/chat-message-item.tsx` | Mention rendering + reply chain + read more |
| Mention Picker | `src/components/whiteboard/chat/chat-mention-picker.tsx` | Member search with avatar + name + email |
| Integration | `src/components/whiteboard/editor-header.tsx` | HeaderChatToggle with unread badge |

### Features

- **Real-time messaging:** Supabase Realtime broadcasts INSERT events to all clients viewing the same board.
- **@Mentions:** Type `@` + name/email to bring up an inline member picker. Selected members appear as badges (chips with X button) in the input area.
- **Reply-to threading:** Hover any message and click the reply icon. Shows a "Replying to..." bar above the input. Stored as `reply_to_message_id` self-reference.
- **Mention rendering:** `@<email>` stored in DB is rendered as a styled `@DisplayName` chip by matching against `useMemberStore`.
- **Unread counter:** Increments when new messages arrive while sidebar is collapsed. Cleared on open.
- **Auto-scroll:** Scrolls to bottom on new messages if user is already near the bottom. Shows a scroll-to-bottom FAB with unread count when scrolled up.
- **Long message expansion:** Messages longer than 300 characters or 6 lines show a "Read more" toggle.
- **Optimistic send:** Input clears immediately on send; message appears via Realtime broadcast.
- **Sidebar integration:** Uses shadcn `Sidebar` component with `collapsible="offcanvas"`. Toggle via header button, keyboard shortcut (`cmd+b`/`ctrl+b`), `SidebarRail`, or X close button.

### Key Files

| Layer | File | Description |
|:------|:-----|:------------|
| Database | `supabase/migrations/20260625000100_create_workspace_activities.sql` | workspace_activities table + indexes + Realtime |
| Types | `src/types/activity.ts` | ActivityActionType (13 types), ActivityEntityType, WorkspaceActivity |
| Service | `src/services/activity.ts` | logActivity(), fetchWorkspaceActivities() |
| Store | `src/store/use-activity-store.ts` | Zustand store with addActivity (insert front + sort) |
| Utils | `src/utils/activity-utils.tsx` | Icons, colors, human-readable message formatting |
| UI | `src/components/workspace/activity/timeline-item.tsx` | Single timeline entry with color-coded icon |
| UI | `src/components/workspace/activity/workspace-timeline.tsx` | Full timeline view with Realtime subscription |
| Integration | `src/components/workspace/workspace-details-client.tsx` | "Activity Timeline" tab toggle |

For full details, see the [Workspace Activity Timeline doc](workspace-timeline.md).

---

## 8. Later / Optional

These can be explored only after the core app is stable:

- Comments
- AI helpers
- Recurring subscription billing (auto-renew)
- Advanced deployment/scaling work
- Chat file/image attachments
- Chat message editing and deletion
- Chat search
