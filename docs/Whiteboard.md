# Zentrox Whiteboard Architecture

This document is the current technical reference for Zentrox. The project is a workspace-based whiteboard app with authentication, workspace collaboration, board management, and canvas persistence.

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
```

---

## 2. Tech Stack

- **Framework:** Next.js 16 App Router, React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui, Radix primitives
- **Icons and Feedback:** lucide-react, Sonner
- **Client State:** Zustand
- **Forms and Validation:** React Hook Form, Zod, `@hookform/resolvers`
- **Backend:** Next.js Server Actions and Route Handlers
- **Database/Auth:** Supabase SSR SDK and Supabase PostgreSQL
- **Canvas:** Planned whiteboard canvas saved to `boards.canvas_data`

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
  -> src/services/workspace.ts
  -> Supabase tables
```

The current Zustand store is `src/store/use-workspace-store.ts`.

### Boards

```txt
/workspaces/[workspaceId] page
  -> fetchWorkspaceById(workspaceId)
  -> hasWorkspaceAccess(workspaceId, user.id)
  -> fetchBoardsByWorkspace(workspaceId)
  -> WorkspaceDetailsClient
  -> useBoardStore
```

Board writes go through:

```txt
src/actions/board.ts
  -> src/services/board.ts
  -> Supabase tables
```

The board details and workspace list Zustand stores are `src/store/use-board-store.ts` and `src/store/use-workspace-store.ts`.

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
1. **User Auth Fetch**: The server component (`page.tsx` + `requireAuth()`) queries the Supabase database for the logged-in user profile's display name, formulating a synchronous `currentUser` object.
2. **Props Threading**: `currentUser` is passed down as props to `<WhiteboardEditor>` and then `<WhiteboardCanvas>`, enabling instant preference hydration and preventing client-side loading flashes or validation errors.
3. **Connection**: `WhiteboardCanvas` uses `@tldraw/sync`'s `useSync` hook to connect to the sync server (`ws://localhost:8787/boards/:boardId?token=JWT`).
4. **Auth & Authorization**: The WebSocket server validates the Supabase JWT token, confirms the board and workspace exist, and verifies user membership.
5. **Load**: When the first client connects, the sync server loads `boards.canvas_data`, converts it to a `RoomSnapshot`, and creates a `TLSocketRoom` room.
6. **Collaboration**: TLSocketRoom synchronizes edits, cursors, presence, selections, and conflict resolution across clients in real-time.
7. **Local Change Detection**: The client-side store listener (`store.listen` with `{ source: "all" }`) detects local document changes immediately and transitions the Zustand save state to `"saving"`.
8. **Auto-save**: Server-side document updates trigger a debounced (3-second) callback that saves the room's current snapshot back to `boards.canvas_data` in Supabase.
9. **Indicators**: The client receives server-broadcasted `"autosave:saving"`, `"autosave:saved"`, and `"autosave:error"` custom messages to transition the header status badges cleanly.
10. **Cleanup**: When the last user disconnects, the server saves the final room snapshot to Supabase and shuts down the room. Signal handlers (`SIGTERM`, `SIGINT`) persist active rooms on shutdown.
11. **Manual Save**: The manual save fallback remains available on the client using the `updateBoardCanvasAction` server action.

---

## 4. Database Schema

The current database has five application tables:

- `profiles`
- `workspaces`
- `workspace_members`
- `workspace_invites`
- `boards`

See [DATABASE.md](DATABASE.md) for the exact table columns.

---

## 5. Build Phases

```txt
Phase 1 -> Auth and profiles
Phase 2 -> Workspaces
Phase 3 -> Workspace members and invites
Phase 4 -> Boards
Phase 5 -> Canvas persistence through boards.canvas_data
Phase 6 -> Polish and deployment readiness
```

See [PHASES.md](PHASES.md) and [timestamp.md](timestamp.md) for the current task breakdown.

---

## 6. Folder Map

```txt
src/
├── actions/              # Server Actions
├── app/                  # Next.js App Router pages and route handlers
├── components/
│   ├── auth/             # Login/register UI
│   ├── landing/          # Landing page UI
│   ├── ui/               # shadcn/ui components
│   ├── whiteboard/       # Whiteboard canvas wrapper and sub-modules
│   │   ├── hooks/        # Collaboration custom hooks
│   │   │   ├─ use-collaborator-notifications.ts
│   │   │   └─ use-whiteboard-sync.ts
│   │   └── utils/        # Utility helpers (sync-uri.ts)
│   └── workspace/        # Workspace dashboard UI
├── lib/                  # Shared utilities
├── services/             # Supabase data access
├── store/                # Zustand stores
├── types/                # TypeScript types and Zod schemas
├── utils/supabase/       # Supabase browser/server clients
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

---

## 7. Later / Optional

These can be explored only after the core app is stable:

- Realtime board chat (chat panel per board)
- Comments
- AI helpers
- Advanced deployment/scaling work
