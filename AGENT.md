# Zentrox Agent Guide

This file is the first stop for any developer or coding agent working in this repository. Its purpose is to help the agent understand the codebase before changing it, avoid duplicate patterns, and keep the roadmap docs updated.

No per-change log files are required anymore. Do not create new files in `logs/` for normal work. When work changes the project state, update the docs and task checklists directly.

---

## Read First

Before making code changes, read these files in this order:

1. `AGENT.md` - this guide.
2. `README.md` - short project overview and active scope.
3. `docs/phases.md` - current build phases.
4. `docs/progress.md` - task checklist and progress.
5. `docs/database.md` - current Supabase schema.
6. `docs/deployment.md` - Vercel deployment and Supabase configuration.
7. `docs/whiteboard.md` - whiteboard architecture and runtime flow.
8. `docs/README.md` - docs directory overview & navigation.
10. Relevant source files for the feature being changed.

Do not assume old plans are still active. The current app scope is auth, workspaces, members/invites, boards, canvas persistence, **and payment/subscription billing**.

---

## Current Stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui, Aceternity UI, Radix primitives, Motion (animations), tw-animate-css
- **Icons / Feedback:** lucide-react, Sonner
- **State:** Zustand
- **Forms / Validation:** React Hook Form, Zod, `@hookform/resolvers`
- **Backend:** Next.js Server Actions and Route Handlers
- **Database / Auth:** Supabase SSR SDK and Supabase PostgreSQL
- **Canvas:** tldraw 5, @tldraw/sync, @tldraw/sync-core
- **Analytics:** PostHog (client: posthog-js, server: posthog-node)
- **Email:** SendGrid (@sendgrid/mail)
- **Payments:** Razorpay SDK (`razorpay` npm package, version 2.9.6)
- **Testing:** Vitest, @testing-library/react, jsdom
- **Infrastructure:** Vercel (hosting), Render (sync server)
- **Additional:** next-themes, simplex-noise, @vercel/analytics, @vercel/speed-insights

---

## Live Deployment

| Service | URL |
| :--- | :--- |
| **Next.js App (Vercel)** | https://zentrox-one.vercel.app |
| **WebSocket Sync Server (Render)** | https://whiteboardsaas2.onrender.com |

The environment variable `NEXT_PUBLIC_SYNC_SERVER_URL` must be set to `https://whiteboardsaas2.onrender.com` in Vercel.

---

## Current Product Scope

The product flow is:

```txt
Login / Register
  -> Workspaces
  -> Members / Invites (owners/editors/viewers)
  -> Boards
  -> Whiteboard canvas (read-only for editors/viewers)
  -> Save/load boards.canvas_data
  -> Subscription plans (Free/Pro/Ultra) with Razorpay payments
  -> Limit enforcement: workspace creation, board creation, member invites
```

AI, comments, large realtime collaboration, and advanced scaling are later ideas only. Do not design around them unless the user explicitly asks.

---

## Board Chat

The board chat feature is a real-time per-board chat sidebar. Key patterns:

### Architecture
- **Database:** `board_messages` table in Supabase with Realtime enabled for live INSERT broadcasts.
- **Service layer:** `src/services/chat.ts` — `fetchBoardMessages()`, `insertBoardMessage()`. Both join the `profiles` and `reply_to` chain for complete message hydration.
- **Server Actions:** `src/actions/chat.ts` — `getBoardMessagesAction()`, `sendBoardMessageAction()`. Both verify workspace access via `hasWorkspaceAccess()`.
- **Zustand store:** `src/store/use-chat-store.ts` — manages `messages`, `isOpen`, `unreadCount`, `replyingTo`, `isLoading`.

### UI Structure
- **ChatSidebar** (`chat-panel.tsx`): shadcn `Sidebar` component (`side="right"`, `collapsible="offcanvas"`, width 350px), controlled by `SidebarProvider` in `WhiteboardEditor`. Uses `useSidebar()` context for open/close state tied to `useChatStore`.
- **ChatInput** (`chat-input.tsx`): Auto-resizing textarea with mention badges (chip/@Name + X button). `@mention` detection triggers an inline `ChatMentionPicker` popup. Reply-to context bar above the input. Optimistic UI clear on send.
- **ChatMessageList** (`chat-message-list.tsx`): Auto-scroll to bottom on new messages, scroll-to-bottom FAB with unread count badge, loading spinner (uses `isLoading` from store).
- **ChatMessageItem** (`chat-message-item.tsx`): @mention rendering (`@<email>` → styled @DisplayName), reply chain display, "Read more"/"Show less" for long messages (>300 chars or >6 lines).
- **ChatMentionPicker** (`chat-mention-picker.tsx`): Filters workspace members by name or email, shows avatar + name + email, populates `selectedMembers` as badges.
- **HeaderChatToggle** (`editor-header.tsx`): Toggle button in the editor header using `useSidebar()` context, shows unread badge when sidebar is collapsed.

### Data Flow
1. **Mount:** `useBoardChat` hook fetches initial messages via `getBoardMessagesAction()`, then subscribes to Realtime INSERT on `board_messages` filtered by `board_id`.
2. **Send:** `sendBoardMessageAction()` auth → workspace access → `insertBoardMessage()` → DB insert → Realtime broadcasts to all clients.
3. **Realtime:** On INSERT event, the full message (with profiles + reply_to) is re-fetched to ensure complete data, then added to the store.
4. **Mentions:** Stored as `@<email>` in the DB. Rendered by splitting on the regex `/(@<[^>]+>)/g` and looking up the member name from `useMemberStore`.

### Key Dependencies
- `board_messages` migration: `supabase/migrations/20260625000000_create_board_messages.sql`
- The table must be added to the `supabase_realtime` publication for real-time messaging.
- Mention data comes from `useMemberStore`, populated on chat mount by `getWorkspaceMembersAction()`.
- The shadcn `Sidebar` context (`useSidebar()`) manages open/close state across `ChatSidebar` and `HeaderChatToggle`.

---

## Codebase Map

```txt
src/
├── actions/               # Server Actions (auth, board, billing, invite, member, workspace, profile, settings)
├── app/                   # Next.js App Router (layouts, pages, route handlers)
│   ├── (auth)/            # Login, register, forgot-password, reset-password, link-expired
│   ├── (landing)/         # Home, about, contact, features, pricing, privacy, terms
│   └── (protected)/       # Workspaces, board, invite pages (behind auth middleware)
│   └── api/
│       ├── billing/
│       │   ├── create-order/route.ts   # POST — Creates Razorpay order + pending payment
│       │   └── verify/route.ts         # POST — Verifies payment signature, activates subscription
│       └── webhooks/
│           └── billing/route.ts        # POST — Razorpay webhook handler
├── components/
│   ├── auth/              # Auth UI (login-form, forgot-password-form, reset-password-form, github-button, etc.)
│   ├── billing/           # Payment & subscription UI (pricing-cards, pricing-client, upgrade-dialog)
│   ├── board/             # Board cards, lists, and form dialogs (create, edit, delete)
│   ├── landing/           # Landing page UI (hero, features, footer, navbar, mockup, lazy-sections)
│   ├── shared/            # Shared components (error-boundary, unauthorized-access)
│   ├── settings/          # Settings modal (profile, workspaces, billing, notifications, appearance, account)
│   ├── ui/                # shadcn/ui & custom components (avatar, badge, button, dialog, card, dropdown, etc.)
│   ├── whiteboard/        # tldraw canvas wrapper (editor, canvas, save-status, kicked-overlay) + hooks & utils
│   └── workspace/         # Workspace dashboard (cards, lists, members, invites, notifications, dialogs)
├── hooks/                 # Custom React hooks (use-auth-form, use-pagination, use-razorpay)
├── lib/                   # Shared utilities (constants, utils, avatar, posthog-server, razorpay)
├── services/              # Supabase data access (billing, board, email, invite, member, profile, workspace)
├── store/                 # Zustand stores (workspace, board, member, notification, whiteboard, settings)
├── types/                 # TypeScript types & Zod schemas (auth, billing, profile, whiteboard, workspace)
├── utils/supabase/        # Supabase browser/server/middleware clients
├── __tests__/             # Vitest test suite (26 files, 284 tests) mirroring src/ structure
└── proxy.ts               # Auth route guard middleware

sync-server/               # Multiplayer WS Sync Server (Modular)
├── config.ts              # Configurations and env setup
├── types.ts               # Sync types
├── database.ts            # Supabase client helper
├── auth.ts                # Authenticated board verification
├── connection.ts          # Socket routing and connection queues
├── rooms.ts               # Room registry and autosave loops
├── persistence.ts         # Database snapshot savers
└── server.ts              # Main entry point
```

---

## Existing Patterns

### Supabase & Auth
- Client Components use `src/utils/supabase/client.ts`.
- Server Components, Server Actions, and Route Handlers use `src/utils/supabase/server.ts`.
- **Reusable Auth Helpers:** Do not call `createClient()` and `supabase.auth.getUser()` manually to check authorization. Use the exported helper functions from `src/utils/supabase/server.ts`:
  - `getCurrentUser()`: Fetches the Supabase client and authenticated user (no throws or redirects).
  - `requireAuth(redirectTo)`: Used in Server Components (pages); redirects if not logged in.
  - `requireActionAuth(errorMessage)`: Used in Server Actions; throws an error if not logged in.
- **Server-Side Hydration (Profiles & Members):** When loading protected details (like board pages), the server component (`page.tsx`) queries the user profile `displayName` and the `workspaceMembers`, then propagates them via `currentUser` and `initialMembers` props to the editor components. This avoids redundant client-side Supabase auth and lookup calls, ensuring the canvas mounts instantly with correct preferences and the member store is fully hydrated.
- `src/proxy.ts` uses `createMiddlewareClient` from `src/utils/supabase/server.ts`.

### Constants & Routes
- Do **NOT** use hardcoded route strings (e.g., `"/login"`, `"/workspaces"`) or logo paths (`"/logo.png"`).
- Always use the `ROUTES`, `ASSETS`, and `DEFAULT_REDIRECTS` objects exported from `src/lib/constants.ts` for consistency.

### Common Layouts
- Workspace routes `/workspaces` and `/workspaces/[workspaceId]` are wrapped by the shared `src/app/(protected)/workspaces/layout.tsx`.
- Workspace Client Components (e.g. `WorkspacesClient`, `WorkspaceDetailsClient`) must not render their own `WorkspaceNav`, background blur gradients, or page wrappers. These are inherited from the layout.

### Server Work
- Put database reads/writes in `src/services/`.
- Put authenticated mutations and route revalidation in `src/actions/`.
- Keep actions small: validate auth, validate input, call service, revalidate/redirect if needed.

### Billing & Payments
- **`src/types/billing.ts`** — All billing types (`PlanType`, `Payment`, `UserSubscription`), plan limit constants (`PLAN_LIMITS`), Zod schemas for validation.
- **`src/lib/razorpay.ts`** — Razorpay SDK singleton initialized with `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
- **`src/services/billing.ts`** — Core payment logic: `createPaymentOrder()`, `verifyPayment()`, `handleWebhookEvent()`, limit checking functions (`checkWorkspaceCreationLimit`, `checkBoardCreationLimit`, `checkMemberInviteLimit`), and `getUserSubscription()` with built-in expiry detection.
- **`src/hooks/use-razorpay.ts`** — Client-side Razorpay checkout hook that loads the JS SDK, creates orders, opens checkout, and verifies payments.
- **`src/actions/billing.ts`** — Server actions for proactive limit checking (`checkWorkspaceLimitAction`, `checkBoardLimitAction`, `checkMemberLimitAction`).
- **`src/actions/settings.ts`** — Contains `getUserSubscriptionAction()`, `cancelSubscriptionAction()`, `getUserPaymentsAction()`.
- **Billable actions** (`src/actions/workspace.ts`, `src/actions/board.ts`, `src/actions/invite.ts`) call `check*Limit()` from `src/services/billing.ts` before creating resources.
- **Billing UI** lives in `src/components/billing/` (`PricingCards`, `PricingPageClient`, `UpgradeDialog`) and `src/components/settings/billing-tab.tsx`.
- **API routes:** `src/app/api/billing/create-order/route.ts`, `src/app/api/billing/verify/route.ts`, `src/app/api/webhooks/billing/route.ts`.
- **Migration:** `supabase/migrations/20260619000000_create_billing_tables.sql` — creates `user_subscriptions` and `payments` tables with enums, RLS, and auto-creation trigger.
- **Env vars:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (see `.env.example`).
- **Pricing:** Free (1 workspace, 3 boards/WS, 0 members), Pro ₹499/mo (3 WS, 10 boards/WS, 10 members), Ultra ₹1499/mo (unlimited).
- **Soft limits:** Existing data is preserved — only new creation is blocked when limits are exceeded.
- **Plan badge** is displayed on the workspace detail page sidebar via `workspacePlan` prop.

### Types and Validation
- Put shared TypeScript models and Zod schemas in `src/types/`.
- Use React Hook Form with `zodResolver` for client forms.
- Do not duplicate validation rules inside components if a schema already exists.

### Client State & Hydration
- Use Zustand stores in `src/store/` (`useWorkspaceStore`, `useBoardStore`, `useWhiteboardStore`, `useMemberStore`, `useNotificationStore`, `useSettingsStore`).
- Keep server-fetched data authoritative; hydrate Zustand only for interactive client UI.
- When loading a parent page, hydrate the Zustand store via `useWorkspaceStore.setState(...)` or `useBoardStore.setState(...)` inside an effect or component mount phase. Do not recreate independent react state for fetched lists or user auth details.
- `useMemberStore` manages workspace member and invite lists with optimistic updates (add/remove/role-change) for the `WorkspaceDetailsClient`.
- `useNotificationStore` manages real-time workspace activity notifications across the application.
- `settings-store.ts` manages app settings (appearance, etc.) and settings modal state, including the `"billing"` tab in `SettingsTab` type.
- Do not add Redux providers, slices, or RTK Query.

### React Hooks
- Put reusable UI state and logic wrappers in `src/hooks/`.
- Group related hooks under feature-based subdirectories (e.g., `src/hooks/auth/`).

### UI
- Use existing shadcn/ui components from `src/components/ui/` (e.g. `DropdownMenu`, `Pagination`, `Badge`, `Avatar`).
- Use lucide-react icons where icons are needed.
- Use Sonner for user-facing toast feedback.
- Use `Motion` (from the `motion` package) for animations rather than raw CSS transitions where appropriate.
- Keep UI patterns consistent with existing auth and workspace components.

### Settings & Account Management
- Settings UI is a modal-based system in `src/components/settings/`.
- Settings consist of multiple tabs: Profile, Workspaces, **Billing**, Notifications, Appearance, Account.
- The `settings-store.ts` manages open/close state; individual tabs render via `settings-content.tsx`.
- Profile updates go through `src/actions/profile.ts`; workspace management through `src/actions/settings.ts`.
- Subscription/billing state goes through `src/actions/settings.ts` (`getUserSubscriptionAction`, `cancelSubscriptionAction`, `getUserPaymentsAction`).
- Notifications use `useNotificationStore` for real-time updates.

### Page Routes (Landing & Auth)
- **Landing pages** (`about`, `contact`, `features`, `pricing`, `privacy`, `terms`) are in `src/app/(landing)/`.
- **Auth pages** (`login`, `register`, `forgot-password`, `reset-password`, `link-expired`) are in `src/app/(auth)/`.
- **Protected pages** (`workspaces`, `board/[boardId]`, `invite/[token]`) are in `src/app/(protected)/` and guarded by `src/proxy.ts`.

---

## Avoid Duplicates

Before adding a file, component, action, service, type, or schema:

1. Search the repo with `rg`.
2. Check the matching folder for an existing pattern.
3. Extend the existing module when it is the natural owner.
4. Add a new file only when it introduces a genuinely new area.

Examples:

- Workspace DB logic belongs in `src/services/workspace.ts`.
- Workspace mutations belong in `src/actions/workspace.ts`.
- Workspace types and schemas belong in `src/types/workspace.ts`.
- Workspace UI belongs in `src/components/workspace/`.
- Member DB logic belongs in `src/services/member.ts`.
- Member mutations belong in `src/actions/member.ts`.
- Invite DB logic belongs in `src/services/invite.ts`.
- Invite mutations belong in `src/actions/invite.ts`.
- Notifications UI belongs in `src/components/workspace/notifications/` (e.g. `notification-item.tsx`) and `notification-inbox.tsx`.
- Profile DB logic belongs in `src/services/profile.ts`.
- Profile mutations belong in `src/actions/profile.ts`.
- Settings UI belongs in `src/components/settings/`.
- Settings mutations belong in `src/actions/settings.ts`.
- Board DB logic belongs in `src/services/board.ts`.
- Board mutations belong in `src/actions/board.ts`.
- Board UI belongs in `src/components/board/`.
- **Billing DB logic** belongs in `src/services/billing.ts`
- **Billing mutations** belong in `src/actions/billing.ts` (limit checks) and `src/actions/settings.ts` (subscription CRUD)
- **Billing types and schemas** belong in `src/types/billing.ts`
- **Billing UI** belongs in `src/components/billing/` (pricing cards, upgrade dialogs)
- **Billing hooks** belong in `src/hooks/` (`use-razorpay.ts`)
- **Razorpay SDK** belongs in `src/lib/razorpay.ts`
- **Payment API routes** belong in `src/app/api/billing/` and `src/app/api/webhooks/billing/`
- Whiteboard hooks belong in `src/components/whiteboard/hooks/`.
- Whiteboard utils belong in `src/components/whiteboard/utils/`.
- Whiteboard UI/canvas belongs in `src/components/whiteboard/`.
- **Board chat** UI belongs in `src/components/whiteboard/chat/` (ChatSidebar, ChatInput, ChatMessageItem, ChatMessageList, ChatMentionPicker).
- **Board chat** hooks belong in `src/components/whiteboard/hooks/` (`use-board-chat.ts`).
- **Board chat** types and schemas belong in `src/types/chat.ts`.
- **Board chat** DB logic belongs in `src/services/chat.ts`.
- **Board chat** mutations belong in `src/actions/chat.ts`.
- **Board chat** client state belongs in `src/store/use-chat-store.ts`.
- **Board chat** utility helpers belong in `src/utils/chat.ts` (`formatMessageTime`).
- **Workspace activity** types and action enums belong in `src/types/activity.ts`.
- **Workspace activity** DB logic belongs in `src/services/activity.ts` (`logActivity`, `fetchWorkspaceActivities`).
- **Workspace activity** client state belongs in `src/store/use-activity-store.ts`.
- **Workspace activity** utility helpers belong in `src/utils/activity-utils.tsx` (icons, colors, message formatting).
- **Workspace activity** UI belongs in `src/components/workspace/activity/` (TimelineItem, WorkspaceTimeline).
- **Workspace activity** is logged at the **Server Action level** (not service level) so the Supabase client is available — hook into existing actions like `createBoardAction`, `updateWorkspaceAction`, `removeMemberAction`, etc.

---

## Documentation Updates

Do not create log files for normal changes.

Instead, update the relevant docs:

- Update `docs/progress.md` when a task is completed, added, removed, or moved.
- Update `docs/phases.md` when the roadmap or phase order changes.
- Update `docs/database.md` when tables, columns, relationships, or database behavior changes.
- Update `docs/deployment.md` when deployment flows, environment variables, or config changes.
- Update `docs/whiteboard.md` when architecture or runtime flow changes.
- Update `docs/payment.md`, `docs/payment-working.md`, `docs/paymentflow.md` when payment/billing architecture changes.
- Update `README.md` only for high-level project scope, setup, or structure changes.
- Update this `AGENT.md` when codebase conventions change.

Keep docs short and practical. They should say what exists, what is next, and where code lives.

---

## Verification

For code changes, run the smallest useful verification first:

```bash
npm run lint
npm run build
```

For documentation-only changes:

```bash
git diff --check -- README.md AGENT.md docs
```

If verification cannot be run, say why in the final response.
