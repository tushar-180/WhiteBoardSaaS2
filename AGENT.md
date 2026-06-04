# Zentrox - Developer & Agent Documentation

Welcome to the Zentrox repository. This document serves as the guide for developers and AI agents working on the codebase. It details the project architecture, tech stack, folder structure, and the **mandatory logging workflow** for code modifications.

---

## ⚠️ Mandatory Pre-Flight & Update Checks
- **Read the Docs FIRST**: Before making *any* changes, developers and AI agents **MUST read this document (`AGENT.md`)** to align on structural routing, proxy logic, and tech stack conventions.
- **Keep AGENT.md Updated**: If your changes alter the codebase's directory structure, proxy rules, database schemas, or authentication handlers, you **MUST update this `AGENT.md` file** accordingly. Keeping this document accurate and reflective of the current codebase state is a first-class requirement.

---

## 🚀 Architecture & Tech Stack

Zentrox is an infinite multiplayer whiteboard canvas built using a modern Next.js 16 + Supabase stack:

1. **Framework**: Next.js 16 (App Router) powered by Turbopack.
2. **Database & Auth**: Supabase SSR (Server-Side Rendering) for authentication, session synchronization, and real-time canvas storage.
3. **Styling**: Tailwind CSS v4 utilizing HSL/OKLCH color system variables.
4. **UI Components**: shadcn/ui primitives.

### Centralized Authentication Flow
- **Route Guarding (`src/proxy.ts`)**: An edge middleware proxy that intercepts all incoming requests. 
  - Redirects unauthenticated users trying to access protected paths (`/board` and `/workspaces`) to `/login?next=<original_path>`.
  - Redirects authenticated users attempting to load `/login` back to their intended target (via `next`) or `/workspaces`.
- **Unified Auth Form (`src/app/(auth)/login/login-form.tsx`)**: Consolidates both login and registration forms client-side using an animated segmented slider control.
  - Supports email/password registration with validation checks (e.g., password length validator).
  - Supports GitHub OAuth login with dynamic redirects.
- **Code Exchange Callback (`src/app/auth/callback/route.ts`)**: Listens for the temporary authorization `code` returned by Supabase OAuth providers, exchanges it for a persistent session cookie on the server side, and redirects the user back to the application.
- **Logout Action (`src/actions/auth.ts`)**: A Next.js Server Action (`signOutAction`) to securely clear authentication cookies and redirect to the landing page.

---

## 📁 Folder Structure

```
whiteboard-canvas/
├── public/                 # Static brand assets (logo, banner)
├── src/
│   ├── actions/            # Next.js Server Actions (e.g., signOutAction)
│   ├── app/
│   │   ├── (auth)/         # Grouped authentication routing pages
│   │   │   ├── login/      # Sign-in page router (page.tsx)
│   │   │   └── register/   # Redirects to /login router (page.tsx)
│   │   ├── (protected)/    # Route group requiring active session cookies
│   │   │   ├── board/      # Whiteboard canvas route
│   │   │   └── workspaces/ # Workspaces dashboard route
│   │   ├── auth/callback/  # OAuth callback route for session exchange
│   │   ├── globals.css     # Global Tailwind variables and base styles
│   │   ├── layout.tsx      # App wrapper root layout
│   │   └── page.tsx        # Server-rendered home/landing page
│   ├── components/
│   │   ├── auth/           # Authentication UI components (login-form.tsx, auth-decorations.tsx, github-icon.tsx)
│   │   ├── landing/        # Landing page UI components (Navbar, Hero, Features, Footer)
│   │   ├── ui/             # Core UI components (button, input, etc.)
│   │   └── workspace/      # Workspace components
│   ├── types/              # Type schemas and Zod validators
│   ├── utils/              # Client & Server Supabase instantiations
│   └── proxy.ts            # Next.js edge middleware file
├── logs/                   # Mandatory logs folder documenting changes
└── AGENT.md                # This file (Agent guide)
```

---

## 📝 Mandatory Agent Logging Workflow

To maintain repository transparency and trace code modifications:
> [!IMPORTANT]
> **Every single modification** made to this codebase by an AI agent must be documented in a new markdown log file under the `logs/` directory in the project root.

### Log File Naming Convention
Name the log files using the date and a brief descriptor:
`logs/YYYY-MM-DD-descriptor-summary.md` (e.g., `logs/2026-06-04-add-name-field-and-github-oauth.md`).

### Log File Markdown Template
Every log file created must adhere to the following structure:
```markdown
# Modification Log: [Brief Description]

**Date**: YYYY-MM-DD
**Agent**: Antigravity

## 1. Objective
A brief summary of what the user requested and the goal of the changes.

## 2. Proposed Changes
Explain the architectural rationale and files modified:
- **`[MODIFY]` [filename](file:///absolute/path/to/modifiedfile)**: Detail what changed and why.
- **`[NEW]` [filename](file:///absolute/path/to/newfile)**: Describe the purpose of the new file.

## 3. Detailed File Diffs
If helpful, paste brief markdown diff blocks showing the core lines changed.

## 4. Verification & Compilation Status
Provide details of the commands run to test the code (e.g., `npm run build`) and show the logs showing success.
```

---

## 🛠️ Developer Verification Guide

Always run a full build before completing a change to ensure compiler and type safety:
```bash
npm run build
```
The output must show successful Turbopack page generation, TypeScript type-checking (`tsc --noEmit`), and middleware/proxy validation.
