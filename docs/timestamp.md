# 15-Day Development Timeline & Tasks Log

This document serves as your day-by-day roadmap and progress checklist for building the **AI-Powered Collaborative Whiteboard SaaS**. It outlines exactly what tasks should be tackled each day.

---

## 📅 Schedule Overview

```
Week 1 (Days 1–5)   → Auth, Database, Workspaces, Boards & Canvas Core
Week 2 (Days 6–10)  → Persistence, Members, Invites & Live Multiplayer Sync
Week 3 (Days 11–15) → Comments System, Gemini AI Features & Production Scaling
```

---

## 🛠️ Daily Tasks & Logs

### Day 1: Project Initialization & Supabase Setup
- **Goal:** Set up the Next.js repository, initialize Supabase, and configure authentication.
- [ ] Initialize Next.js 15 project with TypeScript, Tailwind CSS, and Shadcn UI.
- [ ] Create Supabase project and database.
- [ ] Run SQL migration script to set up the `profiles` table and the `on_auth_user_created` PostgreSQL trigger/function.
- [ ] Initialize Supabase JS SDK: configure the client, server, and proxy clients in `src/lib/supabase/` to interact with your Supabase project.
- [ ] Build Auth UI screens (Login, Signup, Logout) using Supabase Auth helpers.

### Day 2: Multi-Tenant Workspaces & Dashboard CRUD
- **Goal:** Build workspace isolation and dashboard management routes.
- [ ] Implement Next.js Server Actions for Workspaces (create, read, update, delete).
- [ ] Create Dashboard Layout containing a sidebar listing all workspaces.
- [ ] Build Board CRUD Server Actions to manage dashboards within a specific workspace.
- [ ] Implement Workspace Slug routes (e.g., `/[workspace-slug]/dashboard`).

### Day 3: Whiteboard Canvas Setup (`tldraw` SDK)
- **Goal:** Integrate the vector drawing canvas wrapper.
- [ ] Install and configure the `@tldraw/tldraw` SDK.
- [ ] Create the `/board/[boardId]` page route and embed the canvas.
- [ ] Implement collapsible sidebars for Board settings, active collaborative user indicators, and AI prompt fields.
- [ ] Set up Redux Toolkit for global UI sidebar states and active board details.

### Day 4: Whiteboard Core (Canvas & Elements serialization)
- **Goal:** Bind drawing elements to tldraw state.
- [ ] Configure `tldraw` custom shapes or extensions if needed.
- [ ] Intercept `tldraw` canvas events to capture current document state (shapes, bounds, layers).
- [ ] Serialize the complete canvas elements state into a single cohesive JSON document structure.

### Day 5: Debounced Auto-Save Persistence
- **Goal:** Implement the database write-optimization engine.
- [ ] Write Next.js Server Actions using the Supabase Client SDK to update the `canvas_data` JSON field in the `boards` table.
- [ ] Implement client-side debouncing (e.g., ~3-5 seconds after drawing stops or immediately on `pointer-up` events).
- [ ] Save the updated canvas state JSON document to Supabase.

### Day 6: Board Loader & Canvas State Restoration
- **Goal:** Fetch and load saved diagrams on load.
- [ ] Create a Next.js board loader handler to query the `canvas_data` from the `boards` table via the Supabase Client SDK.
- [ ] Inject restored canvas state JSON directly into the `tldraw` canvas store on mount so users can resume editing.
- [ ] Test the full loop: Draw -> Save -> Refresh Page -> Correct Layout Renders.

### Day 7: Collaboration Setup (Members & Roles)
- **Goal:** Add team lists and permissions settings.
- [ ] Implement the `workspace_members` data access queries.
- [ ] Build a Workspace Settings view to list members, roles (`owner`, `admin`, `editor`, `viewer`), and dates joined.
- [ ] Implement authorization middleware checking membership before allowing access to a board.

### Day 8: Secure Invites & Audit Logs
- **Goal:** Create invite tokens and track acceptance audits.
- [ ] Create "Invite Member" modal UI.
- [ ] Implement Server Action to write a row in `workspace_invites` containing recipient email, role, secure token, and status `'pending'`.
- [ ] Build the acceptance route (`/invite/[token]`):
  - Validate token.
  - Create row in `workspace_members` for the invitee.
  - Update `workspace_invites` status to `'accepted'` and record `accepted_by` (their profile ID).

### Day 9: Live multiplayer synchronization (Broadcast)
- **Goal:** Propagate shape edits to all active screens instantly.
- [ ] Initialize Supabase Realtime Client within a React Context (`RealtimeProvider`).
- [ ] Subscribe to the `board:[boardId]` broadcast channel.
- [ ] Broadcast shape moves, size shifts, and deletions (`node_updated`, `node_deleted`, `edge_created`) in real-time.
- [ ] Listen to incoming updates on other clients and update the local `tldraw` canvas memory store dynamically.

### Day 10: Multiplayer Live Cursors & Presence
- **Goal:** Add live visual cursor tracking and active user headers.
- [ ] Configure Supabase Presence state on the channel.
- [ ] Track active collaborators and display their avatars/names in the header.
- [ ] Throttle cursor movement events (30Hz/every ~33ms) on pointer-move.
- [ ] Broadcast mouse coordinates and render smooth remote cursors with user-colored badges.

### Day 11: Interactive Pin Comments System
- **Goal:** Anchored feedback reviews.
- [ ] Define the comment thread data structures inside the board's JSON canvas data.
- [ ] Build coordinate-anchored comment pin indicators that sit on the canvas.
- [ ] Support threading (replying to a comment pin) and resolution toggle (`Open`/`Resolved`).
- [ ] Sync comment updates to peers in real-time.

### Day 12: AI Diagram Generator (Prompt-to-Diagram)
- **Goal:** Let Gemini API generate shapes from prompts.
- [ ] Install the `@google/genai` SDK and configure Gemini API keys.
- [ ] Define Structured JSON Schema output (nodes array and edges array matching our database structure).
- [ ] Send user text prompts to Gemini (e.g. *"Generate a microservice diagram"*), parse the returned JSON schema, insert records into PostgreSQL, and trigger a broadcast sync to draw them.

### Day 13: AI Refiner (Audit & Delta Updates)
- **Goal:** Provide architecture suggestion loops.
- [ ] Build "Analyze Board" trigger action in UI.
- [ ] Gather current board nodes and edges, feed them to Gemini, and request structural suggestions (e.g. adding redundancy, load balancing, or caching).
- [ ] Parse delta response actions (`add_nodes`, `add_edges`) and apply them to the database/canvas without wiping out existing layouts.

### Day 14: Context-Aware AI Chat Sidebar
- **Goal:** Floating architecture advisor.
- [ ] Build a Chat panel sidebar.
- [ ] Send current whiteboard nodes and edges structure to Gemini as a system instruction/context.
- [ ] Allow users to ask architectural questions (e.g. *"Where is the single point of failure?"*) and receive layout-aware guidance.

### Day 15: Production Tuning & Deployment
- **Goal:** Deploy, scale, and load-test.
- [ ] (Optional Scale Optimization): Configure Redis as a write-back cache in front of Postgres.
- [ ] Configure Docker files and environment settings.
- [ ] Clean up debug logs and verify bundle size optimization.
- [ ] Deploy Next.js to production and set up Supabase database production connection strings.
