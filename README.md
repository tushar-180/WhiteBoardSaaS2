<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/logo.webp">
    <img src="/logo.webp" alt="Zentrox Logo" width="120" height="120">
  </picture>
</p>

<h1 align="center">🎨 Zentrox Whiteboard</h1>

<p align="center">
  <em>Infinite multiplayer canvas for visual thinkers — built for teams who design, diagram, and collaborate in real-time.</em>
</p>

<p align="center">
  <a href="https://zentrox-one.vercel.app"><img src="https://img.shields.io/badge/Live-Demo-8B5CF6?style=flat-square&logo=vercel" alt="Live Demo"></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Next.js_16-000?style=flat-square&logo=next.js" alt="Next.js 16"></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react" alt="React 19"></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase" alt="Supabase"></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript" alt="TypeScript"></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Razorpay-02042B?style=flat-square&logo=razorpay" alt="Razorpay"></a>
  <a href="https://whiteboardsaas2.onrender.com"><img src="https://img.shields.io/badge/Sync_Server-Online-22c55e?style=flat-square" alt="Sync Server"></a>
  <a href="docs/code-review-report.md"><img src="https://img.shields.io/badge/Code_Quality-A%2B-22c55e?style=flat-square" alt="Code Quality A+"></a>
  <a href="#"><img src="https://img.shields.io/badge/Tests-284_total-22c55e?style=flat-square" alt="Tests 284 total"></a>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [User Flow](#-user-flow)
- [Pricing](#-pricing)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Available Scripts](#-available-scripts)
- [Deployment & Environment Variables](#-deployment--environment-variables)
- [Documentation](#-documentation)

---

## 🌟 Overview

**Zentrox** is a production-ready, collaborative whiteboard application that combines the power of **Next.js 16**, **Supabase**, and **tldraw** to deliver a seamless real-time sketching experience.

Users can create **workspaces**, invite **team members** with granular roles (Owner, Admin, Editor, Viewer), manage **boards**, and collaborate on an **infinite vector canvas** — all synced in real-time via a dedicated WebSocket sync server. The app features a **subscription billing system** with Razorpay for payment processing, enforcing plan limits on workspaces, boards, and members.

> **Live App:** [https://zentrox-one.vercel.app](https://zentrox-one.vercel.app)
> **Sync Server:** [https://whiteboardsaas2.onrender.com](https://whiteboardsaas2.onrender.com)

---

## 🏗️ Architecture

### System Architecture

```mermaid
graph TB
    subgraph Client["Browser (Next.js 16)"]
        UI["UI Components<br/>(React 19 + Tailwind)"]
        ZS["Zustand Stores<br/>(Client State)"]
        SA["Server Actions<br/>(Auth + Mutations)"]
    end

    subgraph Server["Next.js Server (Vercel)"]
        SR["Service Layer<br/>(Supabase Data Access)"]
        PH["PostHog<br/>(Analytics)"]
        SG["SendGrid<br/>(Email)"]
        BI["Billing Service<br/>(Razorpay SDK)"]
    end

    subgraph Sync["Sync Server (Render)"]
        WS["WebSocket Server<br/>(@tldraw/sync)"]
        RM["Room Manager<br/>(TLSocketRoom)"]
        AP["Autosave Persistence"]
    end

    subgraph Payment["Razorpay"]
        RO["Order Creation"]
        RS["Checkout SDK"]
        RW["Webhook Events"]
    end

    subgraph DB["Supabase PostgreSQL"]
        AU["auth.users"]
        PR["profiles"]
        WS_T["workspaces"]
        WM["workspace_members"]
        WI["workspace_invites"]
        BO["boards<br/>(canvas_data: jsonb)"]
        US["user_subscriptions"]
        PY["payments"]
    end

    UI --> ZS
    UI --> SA
    SA --> SR
    SA --> BI
    SR --> DB
    SR --> PH
    SR --> SG
    BI --> DB
    BI --> RO
    UI --> RS
    RS --> RO
    RS --> RW
    RW --> BI
    UI --> WS
    WS --> RM
    RM --> AP
    AP --> DB
    RM --> UI
```

### Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (React)
    participant A as Server Action
    participant S as Service Layer
    participant DB as Supabase
    participant WS as Sync Server
    participant RP as Razorpay

    Note over U,RP: Authentication & Workspace Flow
    U->>C: Login / Register
    C->>A: Server Action
    A->>S: Validate + Auth Check
    S->>DB: Query / Mutate
    DB-->>S: Result
    S-->>A: Data
    A-->>C: Response + Revalidation

    Note over U,RP: Canvas Collaboration Flow
    U->>C: Draw on canvas
    C->>WS: WebSocket (useSync)
    WS->>WS: Conflict resolution
    WS->>C: Broadcast to peers
    WS->>DB: Autosave (debounced)
    DB-->>WS: Snapshot stored

    Note over U,RP: Payment & Subscription Flow
    C->>A: Create workspace/board/invite
    A->>S: check*Limit()
    S->>DB: Count resources vs plan limits
    DB-->>S: Results
    S-->>A: Allowed or blocked
    alt Limit Reached
        A-->>C: PaymentRequired error
        C->>RP: Open Razorpay checkout
        RP-->>C: Payment success
        C->>A: Verify payment
        A->>S: Activate subscription
        S->>DB: Update user_subscriptions
        A-->>C: Success + revalidation
    end
```

---

## 🚀 Features

<table>
  <tr>
    <td width="50%">
      <h3>🔐 Authentication</h3>
      <p>Email/password + GitHub OAuth via Supabase SSR. Secure session validation, public profile syncing, and protected route guards.</p>
    </td>
    <td width="50%">
      <h3>🏢 Workspaces</h3>
      <p>Isolated spaces for boards and team collaboration. Full CRUD with role-based access control (Owner, Admin, Editor, Viewer).</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>👥 Team Management</h3>
      <p>Token-based workspace invites with role selection. Real-time member presence, role updates, and leave/kick workflows.</p>
    </td>
    <td>
      <h3>✏️ Vector Canvas</h3>
      <p>Infinite tldraw canvas with shapes, arrows, text, sticky notes, freehand drawing. Read-only mode for editors/viewers.</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>⚡ Real-Time Sync</h3>
      <p>Multiplayer WebSocket sync server enabling live cursor presence, collaborative editing, and conflict resolution.</p>
    </td>
    <td>
      <h3>💾 Auto Persistence</h3>
      <p>Automatic JSONB serialization of canvas state to Supabase PostgreSQL. Debounced saves with status indicators.</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>💳 Subscription Billing</h3>
      <p>Free/Pro (₹499/mo)/Ultra (₹1499/mo) plans via Razorpay. Crypto-signed payment verification, webhook fallback, subscription cache invalidation, and printable receipt generation.</p>
    </td>
    <td>
      <h3>🔒 Limit Enforcement</h3>
      <p>Soft limits on workspaces, boards, and members per plan. Proactive limit checks in creation dialogs with visual usage bars. Upgrade prompts with Razorpay checkout integration.</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>💬 Board Chat</h3>
      <p>Real-time per-board chat with Supabase Realtime subscriptions. Send messages, reply to threads, @mention team members with auto-complete avatar picker, expand long messages, and auto-scroll to new messages — all on a shadcn sidebar.</p>
    </td>
    <td>
      <h3>📋 Activity Timeline</h3>
      <p>Chronological audit log of workspace events — board create/delete/rename, member invite/join/leave/remove, role changes, and profile updates. Vertical timeline UI with color-coded icons and real-time updates via Supabase Realtime.</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>🔔 Notifications</h3>
      <p>Real-time notification inbox for workspace invites and member activity via Supabase Realtime subscriptions.</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>⚙️ Settings</h3>
      <p>Comprehensive settings modal — profile, workspace management, billing, notifications, appearance (dark mode), account.</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>📱 Responsive UX</h3>
      <p>Mobile-first design with fluid layouts, touch gestures, and responsive navigation across all device sizes.</p>
    </td>
    <td>
      <h3>📊 Analytics & SEO</h3>
      <p>PostHog session recording & analytics, Vercel Speed Insights, dynamic sitemap, robots.txt, semantic HTML.</p>
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Framework** | Next.js 16 (App Router, Turbopack) | Full-stack React framework with SSR, RSC, and server actions |
| **UI Library** | React 19, TypeScript | Type-safe component architecture |
| **Styling** | Tailwind CSS v4, shadcn/ui, Aceternity UI, Radix Primitives | Utility-first styling + accessible component primitives |
| **Animations** | Motion (framer-motion), tw-animate-css | Declarative animations and transitions |
| **Icons** | Lucide React | Consistent iconography throughout the app |
| **State** | Zustand | Lightweight client-side state management (6 stores) |
| **Forms** | React Hook Form + Zod 4.4.3 | Type-safe form validation with schema inference |
| **Database** | Supabase PostgreSQL | Relational data + Realtime subscriptions (9 tables: profiles, workspaces, workspace_members, workspace_invites, boards, user_subscriptions, payments, board_messages, workspace_activities) |
| **Auth** | Supabase SSR SDK | Email/password + GitHub OAuth |
| **Canvas** | tldraw 5.1.0, @tldraw/sync, @tldraw/sync-core | Infinite vector whiteboard with real-time sync |
| **Payments** | Razorpay SDK v2.9.6 | Order creation, cryptographic signature verification, webhook processing |
| **Analytics** | PostHog (posthog-js, posthog-node) | Product analytics and session recording |
| **Email** | SendGrid (@sendgrid/mail) | Transactional emails for workspace invites |
| **Testing** | Vitest, @testing-library/react, jsdom | 284 unit/integration tests across 26 files |
| **Infrastructure** | Vercel (hosting), Render (sync server) | Production deployment |
| **Monitoring** | @vercel/analytics, @vercel/speed-insights | Performance and usage monitoring |

---

## 📊 Database Schema

```mermaid
erDiagram
    auth_users ||--|| profiles : "syncs via trigger"
    profiles ||--o{ workspaces : "owns"
    profiles ||--o{ workspace_members : "joins"
    profiles ||--o{ workspace_invites : "creates/accepts"
    profiles ||--o{ workspace_activities : "performs"
    profiles ||--o{ boards : "creates"
    profiles ||--o| user_subscriptions : "has"
    profiles ||--o{ payments : "makes"

    workspaces ||--o{ workspace_members : "hosts"
    workspaces ||--o{ workspace_invites : "hosts"
    workspaces ||--o{ workspace_activities : "tracks"
    workspaces ||--o{ boards : "contains"

    auth_users {
        uuid id PK
        string email
        encrypted_password password
    }

    profiles {
        uuid id PK "FK → auth_users.id"
        string email
        string name "nullable"
        string avatar_url "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    workspaces {
        uuid id PK
        string name
        string slug
        uuid owner_id "FK → profiles.id"
        timestamptz created_at
        timestamptz updated_at
    }

    workspace_members {
        uuid id PK
        uuid workspace_id FK "→ workspaces.id"
        uuid user_id FK "→ profiles.id"
        enum role "owner|admin|editor|viewer"
        timestamptz joined_at
    }

    workspace_invites {
        uuid id PK
        uuid workspace_id FK "→ workspaces.id"
        string email
        string token
        enum status "pending|accepted|revoked"
        uuid created_by "FK → profiles.id"
        uuid accepted_by "FK → profiles.id, nullable"
        enum role "owner|admin|editor|viewer"
        boolean inviter_seen "default false"
        timestamptz created_at "default now()"
    }

    boards {
        uuid id PK
        uuid workspace_id FK "→ workspaces.id"
        string name
        string description "nullable"
        uuid created_by "FK → profiles.id"
        jsonb canvas_data "tldraw snapshot"
        timestamptz created_at
        timestamptz updated_at
    }

    user_subscriptions {
        uuid user_id PK "FK → profiles.id"
        enum plan_type "free|pro|ultra"
        enum status "active|expired"
        timestamptz current_period_end "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    payments {
        uuid id PK
        uuid user_id FK "→ profiles.id"
        enum plan_type "pro|ultra"
        string provider "razorpay"
        string provider_order_id "unique"
        string provider_payment_id "unique, nullable"
        int amount "in paise"
        string currency "INR"
        enum status "pending|paid|failed|refunded"
        timestamptz paid_at "nullable"
        timestamptz created_at
        timestamptz updated_at
    }
```

### Key Relationships

- **Auth → Profile:** A database trigger automatically creates a `profiles` row when a new `auth.users` record is inserted.
- **Profile → Subscription:** A trigger auto-creates a Free subscription row in `user_subscriptions` when a new profile is created.
- **Workspace → Members:** When a workspace is created, an `owner` row is inserted into `workspace_members` for the creator.
- **Workspace → Boards:** Boards belong to a workspace; membership is inherited through workspace membership.
- **Realtime Enabled:** `workspace_members`, `workspace_invites`, `workspace_activities`, and `board_messages` tables have Supabase Realtime enabled for live updates.
- **Workspace Activities:** The `workspace_activities` table logs 13 event types across 4 entity types — logged at the Server Action level for all board, member, invite, and workspace mutations.
- **Board Messages:** The `board_messages` table enables per-board real-time chat with reply-to threading and @mention support.

---

## 👤 User Flow

```mermaid
flowchart LR
    A[Visitor] --> B{Registered?}
    B -->|No| C[Register<br/>Email/GitHub]
    B -->|Yes| D[Login]
    C --> D
    D --> E[Dashboard<br/>/workspaces]
    E --> F[Create Workspace]
    E --> G[Join via Invite]
    F --> H[Workspace Detail<br/>/workspaces/:id]
    G --> H
    H --> I[Manage Members]
    H --> J[Create Board]
    J --> K[Board Canvas<br/>/board/:id]
    K --> L{Draw & Collaborate}
    L --> M[Auto-save to DB]
    L --> N[Real-time Sync<br/>with Teammates]
    I --> O[Invite via Email]
    O --> P[Accept Invite<br/>/invite/:token]
    P --> H
    H --> Q[Upgrade Plan<br/>from Settings/Billing]
    Q --> R[Razorpay Checkout]
    R --> S[Subscription Activated]
    S --> H
```

---

## 💰 Pricing

| Feature | Free | Pro (₹499/mo) | Ultra (₹1499/mo) |
|:--------|:-----|:--------------|:-----------------|
| **Workspaces** | 1 | 3 | Unlimited |
| **Boards per WS** | 3 | 10 | Unlimited |
| **Members per WS** | 0 (owner only) | 10 | Unlimited |
| **RBAC** | — | ✅ | ✅ |
| **Priority Support** | — | ✅ | ✅ |
| **Dedicated Support** | — | — | ✅ |

- **Soft limits:** Existing data is preserved when users exceed their plan — only new creation is blocked.
- **Payment provider:** Razorpay with crypto-signed HMAC verification and webhook fallback.
- **30-day access** per one-time payment (recurring billing not yet implemented).

---

## 📁 Project Structure

```
whiteboard-canvas/
├── src/                              # Application source code
│   ├── actions/                      # Next.js Server Actions (8 files)
│   │   ├── auth.ts                   #   Sign out, auth utilities
│   │   ├── billing.ts               #   Proactive limit check actions
│   │   ├── board.ts                  #   Board create/update/delete (+ limit check)
│   │   ├── invite.ts                 #   Invite create/accept/revoke (+ limit check)
│   │   ├── member.ts                 #   Member CRUD + role management
│   │   ├── profile.ts                #   Profile updates
│   │   ├── settings.ts               #   Settings + subscription CRUD
│   │   └── workspace.ts              #   Workspace create/delete (+ limit check)
│   ├── app/                          # Next.js App Router (pages, layouts)
│   │   ├── (auth)/                   #   Login, register, password reset
│   │   ├── (landing)/                #   Home, about, pricing, contact
│   │   └── (protected)/              #   Workspaces, boards, invites
│   │   └── api/
│   │       ├── billing/              #   Razorpay create-order + verify routes
│   │       └── webhooks/billing/     #   Razorpay webhook handler
│   ├── components/                   # React components (93 files)
│   │   ├── auth/                     #   Auth forms, buttons, decorations
│   │   ├── billing/                  #   PricingCards, PricingPageClient, UpgradeDialog
│   │   ├── board/                    #   Board cards, lists, dialogs
│   │   ├── landing/                  #   Hero, features, footer, navbar
│   │   ├── settings/                 #   Settings modal (incl. BillingTab)
│   │   ├── shared/                   #   ErrorBoundary, UnauthorizedAccess
│   │   ├── ui/                       #   shadcn/ui & custom (23 components)
│   │   ├── whiteboard/               #   tldraw canvas, sync hooks, overlays
│   │   └── workspace/                #   Dashboard, members, invites, notifications
│   ├── hooks/                        # Custom React hooks (3 files)
│   ├── lib/                          # Utilities (constants, utils, avatar, posthog, razorpay)
│   ├── services/                     # Supabase data access layer (7 files)
│   ├── store/                        # Zustand stores (6 stores)
│   ├── types/                        # TypeScript types & Zod schemas (5 files)
│   ├── utils/supabase/               # Supabase client/server helpers
│   ├── __tests__/                    # Vitest test suite (284 tests, 26 files)
│   └── proxy.ts                      # Auth middleware route guard
├── sync-server/                      # WebSocket sync server (Render)
│   ├── server.ts                     #   Entry point (HTTP + WS)
│   ├── auth.ts                       #   JWT verification
│   ├── connection.ts                 #   Socket routing
│   ├── rooms.ts                      #   Room registry + autosave
│   ├── persistence.ts                #   DB snapshot operations
│   ├── database.ts                   #   Supabase client
│   └── config.ts                     #   Environment config
├── supabase/migrations/              # 7 SQL migration files (incl. billing)
├── docs/                             # Full documentation suite (13 files)
└── public/                           # Static assets (logos, icons)
```

> **Total:** ~160 TypeScript source files | 26 test files | 284 tests | 6 stores | 8 actions | 7 services | 93 components

---

## ⚡ Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- **Supabase account** (free tier) — [supabase.com](https://supabase.com)
- **SendGrid account** (optional, for invite emails) — [sendgrid.com](https://sendgrid.com)
- **Razorpay account** (optional, for payments) — [razorpay.com](https://razorpay.com)

### Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd whiteboard-canvas

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
```

### Configure Environment

Edit `.env.local` with your credentials. See `.env.example` for the full list:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Sync Server
NEXT_PUBLIC_SYNC_SERVER_URL=http://localhost:8787

# SendGrid (for invite emails)
SENDGRID_API_KEY=SG.your-key
SENDGRID_FROM_EMAIL=noreply@zentrox.app

# Razorpay (for payments)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# PostHog
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=your-token
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# App URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run

```bash
# Start the Next.js dev server
npm run dev

# In another terminal, start the sync server (for collaboration features)
npm run sync

# Or run both together
npm run dev:all
```

Open [http://localhost:3000](http://localhost:3000) to start using Zentrox.

> **Note:** Apply the Supabase migrations before first use. Run the migration SQL files from `supabase/migrations/` in your Supabase SQL editor.

---

## 📦 Available Scripts

| Script | Description |
|:-------|:------------|
| `npm run dev` | Start Next.js dev server (Turbopack) on `:3000` |
| `npm run build` | Build for production (type-check + lint + compile) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint across the codebase |
| `npm run test` | Run Vitest test suite (284 tests) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run sync` | Start WebSocket sync server on `:8787` |
| `npm run dev:all` | Run dev server + sync server concurrently |

---

## 🚢 Deployment & Environment Variables

| Service | Provider | URL |
|:--------|:---------|:----|
| **App** | Vercel | [https://zentrox-one.vercel.app](https://zentrox-one.vercel.app) |
| **Sync Server** | Render | [https://whiteboardsaas2.onrender.com](https://whiteboardsaas2.onrender.com) |

**Required environment variables in Vercel:**

| Variable | Purpose |
|:---------|:--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/ public key |
| `SUPABASE_SERVICE_ROLE_KEY` | For admin operations (avatar, billing) |
| `NEXT_PUBLIC_SYNC_SERVER_URL` | WebSocket sync server URL |
| `SENDGRID_API_KEY` | Transactional emails |
| `SENDGRID_FROM_EMAIL` | Verified sender address |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | Analytics token |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog endpoint |
| `NEXT_PUBLIC_BASE_URL` | Invite links base URL |
| `NEXT_PUBLIC_APP_URL` | App metadata/OG tags URL |
| `RAZORPAY_KEY_ID` | Razorpay publishable key |
| `RAZORPAY_KEY_SECRET` | Razorpay signing secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature verification |

For a complete deployment walkthrough — including Supabase redirect configuration and sync server setup — see the **[Deployment Guide](docs/deployment.md)**.

---

## 📚 Documentation

Full technical documentation is available in the `docs/` directory:

| Document | Content |
|:---------|:--------|
| **[Architecture](docs/whiteboard.md)** | Runtime flow, persistence layers, canvas sync pipeline |
| **[Database](docs/database.md)** | Schema diagrams, tables, columns, migrations |
| **[Phases & Roadmap](docs/phases.md)** | Build milestones and development history |
| **[Progress Tracker](docs/progress.md)** | Task checklist across all build stages |
| **[Deployment](docs/deployment.md)** | Vercel + Render setup, env vars, auth redirects |
| **[Agent Guide](AGENT.md)** | Developer/AI agent conventions, patterns, file placement |
| **[Code Review](docs/code-review-report.md)** | Quality metrics, static analysis, scorecard (A+) |
| **[Payment Architecture](docs/payment.md)** | Full payment integration plan and implementation status |
| **[Payment Working](docs/payment-working.md)** | Step-by-step payment flow with code references |
| **[Payment Flow](docs/paymentflow.md)** | Purchase, webhook, and enforcement flow diagrams |

---

## 🧪 Testing

The project maintains a comprehensive test suite:

```
📁 src/__tests__/
├── actions/        # Server Action tests (6 files)
├── components/     # Component tests (1 file)
├── hooks/          # Hook tests (1 file)
├── lib/            # Utility tests (3 files)
├── services/       # Service layer tests (6 files)
├── store/          # Zustand store tests (6 files)
└── types/          # Schema/type tests (3 files)
```

**Total:** 284 tests across 26 files.

---

## 📊 Code Quality

| Metric | Status |
|:-------|:-------|
| ESLint | ✅ 0 errors, 0 warnings |
| TypeScript | ✅ Strict mode, **0 `any`** in source code |
| Build | ✅ Compiles successfully |
| Tests | 284 total (273 passing, 11 known issues in billing tests) |
| Dependencies | ✅ 0 high-severity vulnerabilities |
| Documentation | ✅ 13 documents, fully consistent |

Overall score: **A+** — see the [full report](docs/code-review-report.md).

---

## 🤝 Contributing

1. Read the **[Agent Guide](AGENT.md)** for codebase conventions and patterns
2. Review the **[phases](docs/phases.md)** and **[progress tracker](docs/progress.md)** for current priorities
3. Follow the existing patterns: Server Actions → Service Layer → Supabase
4. Check the **[payment docs](docs/payment-working.md)** for billing-related changes
5. Ensure all tests pass before submitting changes: `npm test`
6. Run lint and build: `npm run lint && npm run build`

---

## 📄 License

This project is **private** — all rights reserved.

---

<p align="center">
  Built with ❤️ using Next.js 16, Supabase, and tldraw
</p>
