# 🎨 Zentrox Whiteboard

Zentrox is a high-performance, collaborative workspace-based whiteboard application built on Next.js 16 App Router, React 19, and Supabase. It features real-time workspace collaboration, granular workspace membership and invite flows, whiteboard canvas sketching, and automated database persistence.

---

## 📂 Repository Documentation

Detailed system architecture and database documentation can be found in the `docs/` folder:

*   **[System Architecture](docs/Whiteboard.md):** Client runtime flow, persistence layers, and state handling.
*   **[Database Design](docs/DATABASE.md):** Complete schema diagrams, relations, triggers, and migrations.
*   **[Build Phases & Roadmap](docs/PHASES.md):** Overview of core milestones.
*   **[Timeline Tasks Log](docs/timestamp.md):** Progress tracking of milestones.
*   **[Developer & Agent Guide](AGENT.md):** Guidelines for codebase patterns, file placement, and naming conventions.
*   **[Vercel Deployment Guide](docs/DEPLOYMENT.md):** Detailed guide to deploying the app to Vercel and configuring Supabase URL/Redirects.

---

## 🚀 Key Features

*   **🔐 Multi-Tenant Authentication:** Built on Supabase SSR with secure session validation and public profile syncing.
*   **🏢 Workspace Isolation:** Isolated spaces for boards and team management, preventing data bleeding.
*   **👥 Real-Time Collaborators (Stage 3):** Manage team roles (Owner, Admin, Editor, Viewer) with secure token-based workspace invitation flows.
*   **📋 Board CRUD (Stage 4):** Create, edit, and delete multiple boards per workspace.
*   **✏️ Vector Sketch Canvas (Stage 5):** Embed dynamic infinite drawing boards with shapes, arrows, text, and vector freehands.
*   **💾 State Persistence (Stage 5):** Automatic JSONB serialization of whiteboard canvas data directly to Supabase PostgreSQL.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Core Framework** | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| **Styling & UI** | Tailwind CSS v4, shadcn/ui, Radix UI Primitives, Lucide Icons, Sonner |
| **State Management** | Zustand (Client State), Next.js Server Actions & Route Handlers (Server State) |
| **Database & Auth** | Supabase SSR SDK, Supabase Auth, PostgreSQL |
| **Forms & Validation** | React Hook Form, Zod, `@hookform/resolvers` |

---

## 🏗️ Codebase Structure

```txt
src/
├── actions/             # Server Actions for authenticated mutations & cache revalidations
├── api/                 # Next.js API Route Handlers
├── app/                 # Next.js App Router (Layouts, pages, route segments)
├── components/          # React components
│   ├── auth/            # Auth forms & layouts
│   ├── board/           # Board cards, lists, and form dialogs
│   ├── landing/         # Marketing landing page sections
│   ├── ui/              # Reusable shadcn/ui components
│   ├── whiteboard/      # Whiteboard canvas wrapper and sub-modules
│   │   ├── hooks/       # Custom hooks (e.g. use-whiteboard-sync, use-collaborator-notifications)
│   │   └── utils/       # Utility helpers (e.g. sync-uri.ts)
│   └── workspace/       # Workspace dashboard layouts & list views
├── hooks/               # Custom reusable React hooks
├── lib/                 # Shared utilities, helper libraries (e.g. cn tailwind-merge)
├── services/            # Direct Supabase PostgreSQL data-access layer
├── store/               # Zustand global client-side stores (Workspaces, Boards)
├── types/               # Shared TypeScript models and Zod schemas
├── utils/supabase/      # Supabase server, client, and middleware clients
└── proxy.ts             # Auth middleware route protection and redirects
```

---

## 📊 Database Relationships

Zentrox maps workspaces, members, invitations, and boards to Supabase Auth profiles:

```mermaid
erDiagram
    auth_users ||--|| profiles : "syncs to via triggers"
    profiles ||--o{ workspaces : "owns"
    profiles ||--o{ workspace_members : "joins"
    profiles ||--o{ workspace_invites : "creates / accepts"
    profiles ||--o{ boards : "creates"

    workspaces ||--o{ workspace_members : "hosts"
    workspaces ||--o{ workspace_invites : "hosts"
    workspaces ||--o{ boards : "hosts"
```

---

## 💻 Local Development Setup

Follow these steps to run the application locally:

### 1. Prerequisites
Ensure you have **Node.js 18+** and **npm** installed.

### 2. Clone the Repository
```bash
git clone <repository-url>
cd whiteboard-canvas
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory and populate it with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## 📦 Build & Deployment

For a full walkthrough on production deployment, see the **[Vercel Deployment Guide](docs/DEPLOYMENT.md)**.

### Build Scripts
*   `npm run dev`: Starts the Next.js development server with Turbopack.
*   `npm run build`: Generates an optimized production bundle, checking typescript and linting.
*   `npm run lint`: Analyzes codebase structure using ESLint and Next.js compiler checks.
*   `npm run start`: Starts the Next.js build bundle in production mode.

### Production Build Command
To compile the production build, run:
```bash
npm run build
```
The output directory will be created at `.next/`.

```
whiteboard-canvas
├─ .next
├─ AGENT.md
├─ CLAUDE.md
├─ README.md
├─ client.ts
├─ components.json
├─ docs
│  ├─ DATABASE.md
│  ├─ DEPLOYMENT.md
│  ├─ PHASES.md
│  ├─ Whiteboard.md
│  └─ timestamp.md
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ logo.png
│  ├─ next.svg
│  ├─ vercel.svg
│  ├─ whiteboard_banner.png
│  └─ window.svg
├─ src
│  ├─ actions
│  │  ├─ auth.ts
│  │  ├─ board.ts
│  │  ├─ invite.ts
│  │  ├─ member.ts
│  │  └─ workspace.ts
│  ├─ app
│  │  ├─ (auth)
│  │  │  ├─ login
│  │  │  │  └─ page.tsx
│  │  │  └─ register
│  │  │     └─ page.tsx
│  │  ├─ (protected)
│  │  │  ├─ board
│  │  │  │  └─ [boardId]
│  │  │  │     ├─ loading.tsx
│  │  │  │     └─ page.tsx
│  │  │  ├─ invite
│  │  │  │  └─ [token]
│  │  │  │     └─ page.tsx
│  │  │  └─ workspaces
│  │  │     ├─ [workspaceId]
│  │  │     │  ├─ loading.tsx
│  │  │     │  └─ page.tsx
│  │  │     ├─ layout.tsx
│  │  │     ├─ loading.tsx
│  │  │     └─ page.tsx
│  │  ├─ apple-icon.png
│  │  ├─ auth
│  │  │  └─ callback
│  │  │     └─ route.ts
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ icon.png
│  │  ├─ layout.tsx
│  │  ├─ loading.tsx
│  │  ├─ not-found.tsx
│  │  └─ page.tsx
│  ├─ components
│  │  ├─ auth
│  │  │  ├─ auth-decorations.tsx
│  │  │  ├─ auth-input.tsx
│  │  │  ├─ auth-tab-toggle.tsx
│  │  │  ├─ github-button.tsx
│  │  │  ├─ github-icon.tsx
│  │  │  └─ login-form.tsx
│  │  ├─ board
│  │  │  ├─ board-card.tsx
│  │  │  ├─ board-list.tsx
│  │  │  ├─ create-board-dialog.tsx
│  │  │  ├─ delete-board-dialog.tsx
│  │  │  ├─ edit-board-dialog.tsx
│  │  │  └─ empty-boards.tsx
│  │  ├─ landing
│  │  │  ├─ features.tsx
│  │  │  ├─ footer.tsx
│  │  │  ├─ hero.tsx
│  │  │  ├─ logout.tsx
│  │  │  └─ navbar.tsx
│  │  ├─ ui
│  │  │  ├─ avatar.tsx
│  │  │  ├─ button.tsx
│  │  │  ├─ card.tsx
│  │  │  ├─ dialog.tsx
│  │  │  ├─ field.tsx
│  │  │  ├─ input.tsx
│  │  │  ├─ label.tsx
│  │  │  ├─ separator.tsx
│  │  │  ├─ skeleton.tsx
│  │  │  └─ sonner.tsx
│  │  ├─ whiteboard
│  │  │  ├─ hooks
│  │  │  │  ├─ use-collaborator-notifications.ts
│  │  │  │  └─ use-whiteboard-sync.ts
│  │  │  ├─ utils
│  │  │  │  └─ sync-uri.ts
│  │  │  ├─ whiteboard-canvas.tsx
│  │  │  ├─ whiteboard-editor.tsx
│  │  │  └─ whiteboard-save-status.tsx
│  │  └─ workspace
│  │     ├─ dialogs
│  │     │  ├─ create-workspace-dialog.tsx
│  │     │  ├─ delete-workspace-dialog.tsx
│  │     │  ├─ invite-member-dialog.tsx
│  │     │  └─ leave-workspace-dialog.tsx
│  │     ├─ empty-state.tsx
│  │     ├─ invite
│  │     │  ├─ invite-accept-client.tsx
│  │     │  └─ workspace-invites-list.tsx
│  │     ├─ members
│  │     │  └─ workspace-members-list.tsx
│  │     ├─ workspace-card.tsx
│  │     ├─ workspace-details-client.tsx
│  │     ├─ workspace-list.tsx
│  │     ├─ workspace-nav.tsx
│  │     └─ workspaces-client.tsx
│  ├─ contexts
│  ├─ hooks
│  │  └─ auth
│  │     └─ use-auth-form.ts
│  ├─ lib
│  │  ├─ constants.ts
│  │  └─ utils.ts
│  ├─ proxy.ts
│  ├─ services
│  │  ├─ board.ts
│  │  ├─ invite.ts
│  │  ├─ member.ts
│  │  ├─ profile.ts
│  │  └─ workspace.ts
│  ├─ store
│  │  ├─ use-board-store.ts
│  │  ├─ use-member-store.ts
│  │  ├─ use-whiteboard-store.ts
│  │  └─ use-workspace-store.ts
│  ├─ types
│  │  ├─ auth.ts
│  │  ├─ profile.ts
│  │  ├─ whiteboard.ts
│  │  └─ workspace.ts
│  └─ utils
│     └─ supabase
│        ├─ client.ts
│        └─ server.ts
├─ supabase
│  └─ migrations
│     └─ 20260604000000_create_profiles_table_and_trigger.sql
├─ sync-server
│  ├─ auth.ts
│  ├─ config.ts
│  ├─ connection.ts
│  ├─ database.ts
│  ├─ persistence.ts
│  ├─ rooms.ts
│  ├─ server.ts
│  └─ types.ts
├─ tsconfig.json
└─ vercel.json

```