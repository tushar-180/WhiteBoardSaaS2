# Project: AI-Powered Collaborative Whiteboard SaaS

Think of it as:

```txt
Miro
+
Excalidraw
+
Figma Collaboration
+
AI Architecture Assistant
```

But we'll build it gradually.

---

## 📂 Documentation & Reference Guides

Detailed technical specifications, database diagrams, development lifecycles, and timelines are stored in the [docs](docs/) directory:

*   **Architecture Blueprint:** [Whiteboard.md](docs/Whiteboard.md) – Core design system, rendering loops, and user flows.
*   **Database Design:** [DATABASE.md](docs/DATABASE.md) – Detailed PostgreSQL tables, foreign key constraints, and Supabase trigger scripts.
*   **Development Phases:** [PHASES.md](docs/PHASES.md) – The 11 development build milestones.
*   **15-Day Work timeline:** [timestamp.md](docs/timestamp.md) – Day-by-day checklist task logs.

---

# Final Product Vision

A user can:

```txt
Login
 ↓
Create Workspace
 ↓
Create Boards
 ↓
Draw Diagrams
 ↓
Connect Shapes
 ↓
Invite Team Members
 ↓
Collaborate Live
 ↓
Ask AI to Generate Diagrams
 ↓
Ask AI to Improve Designs
```

Example:

```txt
Workspace: Netflix

Boards:
├── Payment Architecture
├── User Service Design
├── Database Design
└── Microservice Diagram
```

---

# Tech Stack

## Frontend

```txt
Next.js
TypeScript
Tailwind
Shadcn UI
Redux Toolkit
```

---

## Backend

```txt
Next.js Route Handlers
Server Actions
Supabase SDK
Supabase (PostgreSQL)
```

---

## Canvas

Recommended:

```txt
tldraw
```

Why?

```txt
Nodes
Edges
Zoom
Pan
Selection
Resize
Undo
Redo
```

already solved.

---

## Future

```txt
Supabase Realtime
Gemini API
Redis
Docker
```

---

# PHASE 1 - Foundation

Goal:

```txt
Authentication
Workspace CRUD
Board CRUD
```

---

## Features

### Authentication

```txt
Register
Login
Logout
Protected Routes
```

---

### Workspaces

```txt
Create Workspace
List Workspaces
Delete Workspace
```

Example:

```txt
Netflix
Google
Personal
```

---

### Boards

Inside workspace:

```txt
Payment Board
Database Board
Auth Board
```

User can:

```txt
Create
Open
Delete
```

---

## Database

### workspaces

```sql
id
name
user_id
created_at
```

---

### boards

```sql
id
workspace_id
name
created_at
```

---

# PHASE 2 - Whiteboard Core

Goal:

```txt
Canvas
Nodes
Edges
```

---

## Features

### Create Node

Examples:

```txt
Rectangle
Circle
Diamond
Text
```

---

### Drag Node

```txt
Move node
Resize node
Delete node
```

---

### Connect Nodes

Example:

```txt
Client
 ↓
API
 ↓
Database
```

---

## Database

No separate `nodes` and `edges` tables are used. Instead, the serialized canvas document elements and connections are stored as a JSON document in:
- `boards.canvas_data`

---

# PHASE 3 - Persistence

Goal:

```txt
Everything saves automatically
```

---

## Features

### Auto Save

User moves shape.

```txt
5 seconds later
 ↓
Save
```

No save button.

---

### Board Loading

Open board.

```txt
Fetch Board (canvas_data)
Render Canvas
```



# PHASE 4 - Collaboration

Goal:

```txt
Multiple Users
```

---

## Features

### Workspace Members

```txt
Owner
Editor
Viewer
```

---

### Invite Users

```txt
Invite Link
```

Later:

```txt
Email Invite
```

---

## Database

### workspace_members

```sql
id
workspace_id
user_id
role
```

---

### workspace_invites

```sql
id
workspace_id
token
status
created_by
accepted_by
```

---

# PHASE 5 - Realtime

Goal:

```txt
Google Docs style collaboration
```

---

## Features

### Live Shape Updates

```txt
User A moves shape
 ↓
User B sees instantly
```

---

### Live Board Updates

```txt
Create Shape
Delete Shape
Resize Shape
```

all realtime.

---

### Presence

```txt
3 users online
```

display avatars.

---

## Technology

```txt
Supabase Realtime
```

---

# PHASE 6 - Live Cursors

Goal:

```txt
Figma style cursors
```

---

## Features

```txt
Tushar Cursor
Rahul Cursor
Amit Cursor
```

moving live.

---

### Presence Channel

```txt
board:123
```

Users join.

---

### Data

```json
{
  "x":400,
  "y":200,
  "name":"Tushar"
}
```

---

# PHASE 7 - Comments

Goal:

```txt
Review System
```

---

## Features

Click node.

```txt
Add Comment
```

Example:

```txt
Move DB to separate service
```

---

## Database

Comments and review threads are stored directly within the board's JSON canvas data.

---

# PHASE 8 - AI Diagram Generator

Goal:

```txt
Prompt → Diagram
```

---

User:

```txt
Create Netflix Payment Architecture
```

AI returns:

```txt
Client
 ↓
API Gateway
 ↓
Payment Service
 ↓
PostgreSQL
```

Canvas generated automatically.

---

## Database

AI generated canvas layouts are saved directly into the board's JSON canvas data.

---

# PHASE 9 - AI Refiner

Goal:

```txt
Analyze Existing Diagram
```

---

User:

```txt
Improve this architecture
```

AI reads:

```txt
Nodes
Edges
```

and suggests:

```txt
Add Redis
Add Queue
Add Load Balancer
```

---

AI can also:

```txt
Generate Missing Connections
Fix Naming
Suggest Improvements
```

---

# PHASE 10 - AI Chat Assistant

Goal:

```txt
Chat With Board
```

---

User:

```txt
Explain this architecture
```

AI analyzes nodes and edges.

Response:

```txt
This system contains:
- API Gateway
- Auth Service
- Payment Service
- Database
```

---

# PHASE 11 - Production Scaling

Only when you have real users.

Add:

```txt
Redis
Docker
CI/CD
Monitoring
```

Later:

```txt
Kafka
RabbitMQ
Microservices
```

if truly needed.

---

# Database Structure (Final)

```txt
auth.users
  └── profiles (Public replica)

workspaces
workspace_members
workspace_invites (Tracks status/accept audits)

boards (stores canvas_data as JSON)
```

---

# Recommended Build Order

Do **not** jump to AI or collaboration first.

Build in this exact order:

```txt
Phase 1  → Auth + Workspace + Boards
Phase 2  → Canvas Core (tldraw)
Phase 3  → Save/Load (JSON)
Phase 4  → Collaboration Tables
Phase 5  → Realtime Sync
Phase 6  → Live Cursors
Phase 7  → Comments (within JSON canvas)
Phase 8  → AI Diagram Generation
Phase 9  → AI Refinement
Phase 10 → AI Chat
```

If you finish through Phase 3, you'll already have a usable whiteboard product. Everything after that becomes an enhancement rather than a rewrite.
