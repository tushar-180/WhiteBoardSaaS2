# Zentrox Agent Guide

This file is the first stop for any developer or coding agent working in this repository. Its purpose is to help the agent understand the codebase before changing it, avoid duplicate patterns, and keep the roadmap docs updated.

No per-change log files are required anymore. Do not create new files in `logs/` for normal work. When work changes the project state, update the docs and task checklists directly.

---

## Read First

Before making code changes, read these files in this order:

1. `AGENT.md` - this guide.
2. `README.md` - short project overview and active scope.
3. `docs/PHASES.md` - current build phases.
4. `docs/timestamp.md` - task checklist and progress.
5. `docs/DATABASE.md` - current Supabase schema.
6. `docs/DEPLOYMENT.md` - Vercel deployment and Supabase configuration.
7. Relevant source files for the feature being changed.

Do not assume old plans are still active. The current app scope is auth, workspaces, members/invites, boards, and canvas persistence.

---

## Current Stack

- **Framework:** Next.js 16 App Router, React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui, Radix primitives
- **Icons / Feedback:** lucide-react, Sonner
- **State:** Zustand
- **Forms / Validation:** React Hook Form, Zod, `@hookform/resolvers`
- **Backend:** Next.js Server Actions and Route Handlers
- **Database / Auth:** Supabase SSR SDK and Supabase PostgreSQL

Redux Toolkit is not part of this codebase anymore.

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
  -> Boards (owner-only creation)
  -> Whiteboard canvas (read-only for editors/viewers)
  -> Save/load boards.canvas_data
```

AI, comments, large realtime collaboration, and advanced scaling are later ideas only. Do not design around them unless the user explicitly asks.

---

## Codebase Map

```txt
src/
├── actions/              # Server Actions
├── app/                  # Next.js App Router pages and route handlers
├── components/
│   ├── auth/             # Auth UI
│   ├── board/            # Board cards, lists, and form dialogs
│   ├── landing/          # Landing page UI
│   ├── ui/               # shadcn/ui components
│   ├── whiteboard/       # Whiteboard canvas wrapper and sub-modules
│   │   ├── hooks/        # Whiteboard collaboration hooks
│   │   └── utils/        # Whiteboard WebSocket helpers
│   └── workspace/        # Workspace dashboard UI
├── hooks/                # Custom React hooks (e.g. hooks/auth/)
├── lib/                  # Shared utilities (e.g. constants.ts)
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

### Types and Validation
- Put shared TypeScript models and Zod schemas in `src/types/`.
- Use React Hook Form with `zodResolver` for client forms.
- Do not duplicate validation rules inside components if a schema already exists.

### Client State & Hydration
- Use Zustand stores in `src/store/` (`useWorkspaceStore`, `useBoardStore`, `useWhiteboardStore`, `useMemberStore`, `useNotificationStore`).
- Keep server-fetched data authoritative; hydrate Zustand only for interactive client UI.
- When loading a parent page, hydrate the Zustand store via `useWorkspaceStore.setState(...)` or `useBoardStore.setState(...)` inside an effect or component mount phase. Do not recreate independent react state for fetched lists or user auth details.
- `useMemberStore` manages workspace member and invite lists with optimistic updates (add/remove/role-change) for the `WorkspaceDetailsClient`.
- `useNotificationStore` manages real-time workspace activity notifications across the application.
- Do not add Redux providers, slices, or RTK Query.

### React Hooks
- Put reusable UI state and logic wrappers in `src/hooks/`.
- Group related hooks under feature-based subdirectories (e.g., `src/hooks/auth/`).

### UI
- Use existing shadcn/ui components from `src/components/ui/` (e.g. `DropdownMenu`, `Pagination`).
- Use lucide-react icons where icons are needed.
- Use Sonner for user-facing toast feedback.
- Keep UI patterns consistent with existing auth and workspace components.

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
- Notifications UI belongs in `src/components/workspace/` (e.g. `notification-inbox.tsx`).
- Board DB logic belongs in `src/services/board.ts`.
- Board mutations belong in `src/actions/board.ts`.
- Board UI belongs in `src/components/board/`.
- Whiteboard hooks belong in `src/components/whiteboard/hooks/`.
- Whiteboard utils belong in `src/components/whiteboard/utils/`.
- Whiteboard UI/canvas belongs in `src/components/whiteboard/`.

---

## Documentation Updates

Do not create log files for normal changes.

Instead, update the relevant docs:

- Update `docs/timestamp.md` when a task is completed, added, removed, or moved.
- Update `docs/PHASES.md` when the roadmap or phase order changes.
- Update `docs/DATABASE.md` when tables, columns, relationships, or database behavior changes.
- Update `docs/DEPLOYMENT.md` when deployment flows, environment variables, or config changes.
- Update `docs/Whiteboard.md` when architecture or runtime flow changes.
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
