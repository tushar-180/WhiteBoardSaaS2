# 📚 Documentation Index

This directory contains the full technical and project documentation for **Zentrox Whiteboard**.

---

## 📖 Document Guide

| Document | Description | When to Read |
|:---------|:------------|:-------------|
| **[AGENT.md](../AGENT.md)** | Developer & AI agent guide — codebase conventions, patterns, and file placement rules | **Always first** before making changes |
| **[README.md](../README.md)** | Project overview, features, tech stack, and setup instructions | New contributors, setup |
| **[database.md](database.md)** | Supabase PostgreSQL schema, tables, columns, relationships, and migrations | Before DB changes |
| **[deployment.md](deployment.md)** | Vercel deployment setup, environment variables, Supabase auth redirects, Render sync server | Before deploying |
| **[phases.md](phases.md)** | Build phases and roadmap — from auth to production polish | Understanding project history & scope |
| **[whiteboard.md](whiteboard.md)** | Whiteboard architecture, runtime flow, sync server, persistence pipeline | Before canvas/sync changes |
| **[progress.md](progress.md)** | Detailed task checklist across all build stages | Tracking what's done and left |
| **[code-review-report.md](code-review-report.md)** | Code quality assessment, static analysis results, metrics, scorecard | Code quality review |

---

## 🔄 Document Lifecycle

Each document should be updated when relevant parts of the codebase change:

- **`database.md`** — when tables, columns, relationships, or migrations change
- **`deployment.md`** — when deployment flows, env vars, or hosting config changes
- **`phases.md`** — when the roadmap or phase order changes
- **`whiteboard.md`** — when architecture, runtime flow, or sync logic changes
- **`progress.md`** — when tasks are completed, added, or removed
- **`code-review-report.md`** — after significant code quality improvements or major audits

---

## 🏗️ Codebase Architecture (High-Level)

```
┌─────────────────────────────────────────────┐
│              UI Components (React)           │
│  auth  board  landing  settings  whiteboard  │
│  shared  ui  workspace                       │
├─────────────────────────────────────────────┤
│         Client State (Zustand Stores)        │
│  workspace  board  member  notification      │
│  whiteboard  settings                        │
├─────────────────────────────────────────────┤
│           Server Actions (src/actions/)       │
│  auth  board  invite  member  profile        │
│  settings  workspace                         │
├─────────────────────────────────────────────┤
│         Service Layer (src/services/)         │
│  board  email  invite  member  profile       │
│  workspace                                   │
├─────────────────────────────────────────────┤
│         Database (Supabase PostgreSQL)        │
│  profiles  workspaces  workspace_members     │
│  workspace_invites  boards                    │
└─────────────────────────────────────────────┘

WebSocket Sync Server (Render) ←→ tldraw canvas
```

---

## 🧪 Data Flow Summary

1. **Browser** → Next.js App Router → Server Component (data fetch + auth)
2. **Server Component** → Supabase service → hydrated Zustand store → Client Component
3. **User Action** → Server Action (auth + validation) → Service layer → Supabase + revalidation
4. **Canvas Edit** → tldraw sync → WebSocket sync server → autosave → Supabase `boards.canvas_data`
