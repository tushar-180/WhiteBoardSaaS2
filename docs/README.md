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
| **[phases.md](phases.md)** | Build phases and roadmap — from auth to payment billing | Understanding project history & scope |
| **[whiteboard.md](whiteboard.md)** | Whiteboard architecture, runtime flow, sync server, persistence pipeline, and board chat | Before canvas/sync/chat changes |
| **[progress.md](progress.md)** | Detailed task checklist across all build stages | Tracking what's done and left |
| **[code-review-report.md](code-review-report.md)** | Code quality assessment, static analysis results, metrics, scorecard | Code quality review |
| **[payment.md](payment.md)** | Full payment integration plan — database schema, limit enforcement, Razorpay integration | Before payment changes |
| **[payment-working.md](payment-working.md)** | Step-by-step payment flow with code references, file map, and environment variables | Understanding payment system |
| **[paymentflow.md](paymentflow.md)** | Purchase, webhook, and enforcement flow diagrams with sequence charts | Quick payment architecture overview |

---

## 🔄 Document Lifecycle

Each document should be updated when relevant parts of the codebase change:

- **`database.md`** — when tables, columns, relationships, or migrations change
- **`deployment.md`** — when deployment flows, env vars, or hosting config changes
- **`phases.md`** — when the roadmap or phase order changes
- **`whiteboard.md`** — when architecture, runtime flow, or sync logic changes
- **`progress.md`** — when tasks are completed, added, or removed
- **`whiteboard.md`** — when board chat architecture or runtime flow changes
- **`database.md`** — when chat tables or Realtime subscriptions change
- **`code-review-report.md`** — after significant code quality improvements or major audits
- **`payment.md`** — when payment architecture or billing logic changes
- **`payment-working.md`** — when checkout flow or implementation details change
- **`paymentflow.md`** — when payment flow diagrams need updating

---

## 🏗️ Codebase Architecture (High-Level)

```
┌────────────────────────────────────────────────┐
│              UI Components (React)               │
│  auth  billing  board  landing  settings         │
│  shared  ui  whiteboard  workspace               │
├────────────────────────────────────────────────┤
│         Client State (Zustand Stores)            │
│  workspace  board  member  notification          │
│  whiteboard  settings                            │
├────────────────────────────────────────────────┤
│           Server Actions (src/actions/)           │
│  auth  billing  board  invite  member  profile   │
│  settings  workspace                             │
├────────────────────────────────────────────────┤
│         Service Layer (src/services/)             │
│  billing  board  email  invite  member  profile   │
│  workspace                                       │
├────────────────────────────────────────────────┤
│         Database (Supabase PostgreSQL)            │
│  profiles  workspaces  workspace_members          │
│  workspace_invites  boards  user_subscriptions   │
│  payments                                        │
└────────────────────────────────────────────────┘

WebSocket Sync Server (Render) ←→ tldraw canvas
Razorpay Payments ↔ API Routes ↔ Billing Service
```

---

## 🧪 Data Flow Summary

1. **Browser** → Next.js App Router → Server Component (data fetch + auth)
2. **Server Component** → Supabase service → hydrated Zustand store → Client Component
3. **User Action** → Server Action (auth + validation + plan limit check) → Service layer → Supabase + revalidation
4. **Canvas Edit** → tldraw sync → WebSocket sync server → autosave → Supabase `boards.canvas_data`
5. **Payment** → User clicks "Upgrade" → `useRazorpay` hook → Razorpay checkout → Payment verification API → Subscription activation → Cache revalidation
