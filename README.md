# Zentrox Whiteboard

Zentrox is a workspace-based whiteboard app. The current build focuses on authentication, workspaces, members/invites, boards, and saving canvas state to Supabase.

The roadmap is intentionally practical. AI features, comments, and deep realtime collaboration are future ideas, not current build requirements.

---

## Documentation

- [Architecture](docs/Whiteboard.md)
- [Database Design](docs/DATABASE.md)
- [Build Phases](docs/PHASES.md)
- [Timeline / Tasks](docs/timestamp.md)
- [Agent Guide](AGENT.md)

---

## Current Product Flow

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

## Tech Stack

### Frontend

```txt
Next.js 16 App Router
React 19
TypeScript
Tailwind CSS v4
shadcn/ui + Radix primitives
lucide-react icons
Sonner toasts
```

### State, Forms, and Validation

```txt
Zustand
React Hook Form
Zod
@hookform/resolvers
```

Redux Toolkit is not part of the current architecture.

### Backend and Database

```txt
Next.js Server Actions
Next.js Route Handlers
Supabase SSR SDK (@supabase/ssr)
Supabase PostgreSQL
```

---

## Current Database Tables

- `profiles`
- `workspaces`
- `workspace_members`
- `workspace_invites`
- `boards`

Board drawing data is stored in `boards.canvas_data` as `jsonb`.

---

## Current Project Structure

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

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

---

## Current Roadmap

```txt
Phase 1 -> Auth and profiles
Phase 2 -> Workspaces
Phase 3 -> Workspace members and invites
Phase 4 -> Boards
Phase 5 -> Canvas persistence through boards.canvas_data
Phase 6 -> Polish and deployment readiness
```
