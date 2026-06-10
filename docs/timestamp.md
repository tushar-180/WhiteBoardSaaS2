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

**Goal:** Enable multiple users to collaborate live on the same board using tldraw sync and Supabase Realtime presence.

- [ ] Set up a tldraw sync backend (WebSocket server or Cloudflare Worker via `@tldraw/sync`).
- [ ] Replace single-user `Tldraw` with `useSync` hook in `WhiteboardCanvas` for multi-user room state.
- [ ] Configure an asset store for file/image uploads within the canvas.
- [ ] Handle room persistence and reconnection on the backend.
- [ ] Test concurrent edits across multiple browser sessions.
- [ ] Add live cursor presence for connected users.
- [ ] Integrate Supabase Realtime presence channel on the board page to track which users are currently viewing the canvas.
- [ ] Show live avatar stack (user avatars + names) in the board toolbar when others are present.

## Later / Optional

- [ ] AI features.
- [ ] Comments.
- [ ] Realtime board chat (chat panel per board using Supabase Realtime).
- [ ] Advanced scaling infrastructure.
