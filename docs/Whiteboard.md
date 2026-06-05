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

### Authentication

```txt
src/proxy.ts
  -> checks Supabase session
  -> redirects unauthenticated protected-route users to /login
  -> redirects logged-in users away from /login
```

Auth UI lives in `src/components/auth/login-form.tsx` and uses:

- `react-hook-form`
- `zodResolver`
- `authSchema` from `src/types/auth.ts`
- Supabase email/password auth
- Supabase GitHub OAuth

### Workspaces

```txt
/workspaces page
  -> Supabase server auth check
  -> fetchWorkspacesByOwner(user.id)
  -> fetchProfileById(user.id)
  -> WorkspacesClient
  -> useWorkspaceStore
```

Workspace writes go through:

```txt
src/actions/workspace.ts
  -> src/services/workspace.ts
  -> Supabase tables
```

The current Zustand store is `src/store/use-workspace-store.ts`.

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
│   └── workspace/        # Workspace dashboard UI
├── lib/                  # Shared utilities
├── services/             # Supabase data access
├── store/                # Zustand stores
├── types/                # TypeScript types and Zod schemas
├── utils/supabase/       # Supabase browser/server clients
└── proxy.ts              # Auth route guard
```

---

## 7. Later / Optional

These can be explored only after the core app is stable:

- Supabase Realtime presence
- Multiplayer canvas sync
- Comments
- AI helpers
- Advanced deployment/scaling work
