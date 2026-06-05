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
6. Relevant source files for the feature being changed.

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

## Current Product Scope

The product flow is:

```txt
Login / Register
  -> Workspaces
  -> Members / Invites
  -> Boards
  -> Whiteboard canvas
  -> Save/load boards.canvas_data
```

AI, comments, large realtime collaboration, and advanced scaling are later ideas only. Do not design around them unless the user explicitly asks.

---

## Codebase Map

```txt
src/
├── actions/              # Server Actions
├── app/                  # Next.js App Router pages and route handlers
│   ├── (auth)/           # login/register routes
│   ├── (protected)/      # protected workspace and board routes
│   └── auth/callback/    # Supabase OAuth callback
├── components/
│   ├── auth/             # Auth UI
│   ├── landing/          # Landing page UI
│   ├── ui/               # shadcn/ui components
│   └── workspace/        # Workspace dashboard UI
├── hooks/                # Custom React hooks (e.g. hooks/auth/)
├── lib/                  # Shared utilities
├── services/             # Supabase data access
├── store/                # Zustand stores
├── types/                # TypeScript types and Zod schemas
├── utils/supabase/       # Supabase browser/server clients
└── proxy.ts              # Auth route guard
```

---

## Existing Patterns

### Supabase

- Client Components use `src/utils/supabase/client.ts`.
- Server Components, Server Actions, and Route Handlers use `src/utils/supabase/server.ts`.
- `src/proxy.ts` uses `createMiddlewareClient` from `src/utils/supabase/server.ts`.

### Server Work

- Put database reads/writes in `src/services/`.
- Put authenticated mutations and route revalidation in `src/actions/`.
- Keep actions small: validate auth, validate input, call service, revalidate/redirect if needed.

### Types and Validation

- Put shared TypeScript models and Zod schemas in `src/types/`.
- Use React Hook Form with `zodResolver` for client forms.
- Do not duplicate validation rules inside components if a schema already exists.

### Client State

- Use Zustand stores in `src/store/`.
- Keep server-fetched data authoritative; hydrate Zustand only for interactive client UI.
- Do not add Redux providers, slices, or RTK Query.

### React Hooks

- Put reusable UI state and logic wrappers in `src/hooks/`.
- Group related hooks under feature-based subdirectories (e.g., `src/hooks/auth/`).

### UI

- Use existing shadcn/ui components from `src/components/ui/`.
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

---

## Documentation Updates

Do not create log files for normal changes.

Instead, update the relevant docs:

- Update `docs/timestamp.md` when a task is completed, added, removed, or moved.
- Update `docs/PHASES.md` when the roadmap or phase order changes.
- Update `docs/DATABASE.md` when tables, columns, relationships, or database behavior changes.
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
