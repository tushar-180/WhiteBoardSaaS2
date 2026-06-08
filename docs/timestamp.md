# Development Timeline & Tasks Log

This document tracks the practical build plan for the current Zentrox whiteboard app. The roadmap intentionally stays focused on the product being built now: authentication, workspaces, members/invites, boards, and canvas persistence.

AI diagram generation, AI chat, comments, and heavy production scaling are not part of the current roadmap.

---

## Schedule Overview

```txt
Stage 1 -> Project setup, auth, Supabase clients, profiles
Stage 2 -> Workspaces dashboard and workspace CRUD
Stage 3 -> Workspace members, invites, and access control
Stage 4 -> Board CRUD inside workspaces
Stage 5 -> Whiteboard canvas and canvas_data persistence
Stage 6 -> Polish, validation, errors, loading states, and deployment readiness
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

- [ ] Add service functions for workspace members.
- [ ] Show workspace owner/member list on the workspace detail page.
- [ ] Add invite creation UI and Server Action.
- [ ] Add invite accept route using `workspace_invites.token`.
- [ ] Enforce workspace access by checking `owner_id` or `workspace_members`.

## Stage 4: Board CRUD

**Goal:** Let users manage boards inside a workspace.

- [x] Add board service functions for create/read/update/delete.
- [x] Add board Server Actions.
- [x] Show board list inside `/workspaces/[workspaceId]`.
- [x] Add create/edit/delete board UI.
- [x] Route users to `/board/[boardId]` when opening a board.

## Stage 5: Whiteboard Canvas and Persistence

**Goal:** Store and restore board drawing state using `boards.canvas_data`.

- [ ] Install and configure the canvas library.
- [ ] Embed the canvas in `/board/[boardId]`.
- [ ] Load `boards.canvas_data` when a board opens.
- [ ] Save canvas changes back to `boards.canvas_data`.
- [ ] Add simple loading, saving, and error states.

## Stage 6: Polish and Release Readiness

**Goal:** Make the core app stable and pleasant to use.

- [x] Add Next.js loading.tsx suspense states for both workspace list and detail routes.
- [ ] Review empty states, not-found states, and protected-route redirects.
- [ ] Tighten form validation and server-side error messages.
- [ ] Run lint/build verification.
- [ ] Document required environment variables.
- [ ] Prepare deployment notes.

## Later / Optional

- [ ] Supabase Realtime presence or live cursors.
- [ ] Multiplayer canvas sync.
- [ ] AI features.
- [ ] Comments.
- [ ] Advanced scaling infrastructure.
