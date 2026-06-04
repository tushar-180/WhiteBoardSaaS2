# Database Design

For **Phase 1 → Phase 10**, the database is designed as follows. Since we are using **Supabase (PostgreSQL)**, UUIDs are used for all identifier columns.

---

## Database Relationship Overview

```txt
auth.users
    │
    ▼ (Trigger sync)
profiles
    │
    ▼
workspaces
    │
    ▼
workspace_members
    │
    ▼
boards (stores canvas_data as JSON)
```

## Runtime Connection Architecture

Here is how the Next.js application connects to the Supabase PostgreSQL database using the Supabase Client SDK:

We instantiate client-side or server-side Supabase clients (using `@supabase/ssr`) depending on whether the request is run in:
1. **Client Components:** using `@/utils/supabase/client.ts` (`createBrowserClient`)
2. **Server Actions / Route Handlers / Server Components:** using `@/utils/supabase/server.ts` (`createServerClient`)
3. **Middleware:** using `@/utils/supabase/proxy.ts` (`createServerClient` mapping request and response cookies)

---

## 1. profiles

Stores public user profiles. Since `auth.users` is private and restricted, we automatically sync user details into this public table on sign up.

| Column     | Type        | Purpose                             |
| ---------- | ----------- | ----------------------------------- |
| id         | UUID        | Primary key (references auth.users) |
| email      | TEXT        | User's email address                |
| name       | TEXT        | Display name (nullable)             |
| avatar_url | TEXT        | Avatar image URL (nullable)         |
| created_at | TIMESTAMPTZ | Creation timestamp                  |
| updated_at | TIMESTAMPTZ | Last update timestamp               |

### Example

```json
{
  "id": "usr_9999",
  "email": "tushar@example.com",
  "name": "Tushar Gupta",
  "avatar_url": "https://example.com/avatars/tushar.png"
}
```

### Sync Trigger (Supabase / Postgres SQL Setup)
To keep the profiles in sync with Supabase Auth, run the following trigger SQL in Supabase:
```sql
-- Create trigger function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Bind trigger to auth.users table
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 2. workspaces

Represents the organizational boundaries (e.g., Netflix, Google, Startup, Personal). Each user can create multiple workspaces.

| Column     | Type        | Purpose                    |
| ---------- | ----------- | -------------------------- |
| id         | UUID        | Primary key                |
| name       | TEXT        | Workspace name             |
| slug       | TEXT        | URL friendly name          |
| owner_id   | UUID        | User who created workspace (references profiles.id) |
| created_at | TIMESTAMPTZ | Created time               |
| updated_at | TIMESTAMPTZ | Updated time               |

### Example

```json
{
  "id": "ws_1",
  "name": "Netflix",
  "owner_id": "usr_9999"
}
```

### Relationship

```txt
One Profile
    ↓
Many Workspaces
```

---

## 3. workspace_members

Used for collaboration and access control. Not needed in V1 but created now for future-proofing.

| Column       | Type        | Purpose                               |
| ------------ | ----------- | ------------------------------------- |
| id           | UUID        | Primary key                           |
| workspace_id | UUID        | Foreign key referencing workspaces.id |
| user_id      | UUID        | Foreign key referencing profiles.id   |
| role         | ENUM        | Member's role (WorkspaceRole enum: owner, admin, editor, viewer) |
| joined_at    | TIMESTAMPTZ | When they joined                      |

### Example

```txt
Netflix Workspace:
- Tushar -> Owner
- Rahul -> Editor
- Amit -> Viewer
```

### Roles
- `owner`
- `admin`
- `editor`
- `viewer`

### Relationship

```txt
Workspace
    ↓
Many Members
```

---

## 4. workspace_invites

Stores invitations for users to join workspaces.

| Column       | Type        | Purpose                               |
| ------------ | ----------- | ------------------------------------- |
| id           | UUID        | Primary key                           |
| workspace_id | UUID        | Foreign key referencing workspaces.id |
| email        | TEXT        | Invite recipient's email              |
| role         | ENUM        | Assigned role (WorkspaceRole enum: editor, viewer) |
| token        | TEXT        | Invitation token                      |
| status       | TEXT        | Invite status ('pending', 'accepted', etc.) |
| created_by   | UUID        | User who created the invite (references profiles.id) |
| accepted_by  | UUID NULL   | User who accepted the invite (references profiles.id) |

### Example

```json
{
  "email": "rahul@gmail.com",
  "token": "abc123",
  "status": "pending"
}
```

---

## 5. boards

Boards exist inside a workspace (e.g., Netflix Workspace containing a Payment Board, Database Board, and Auth Board).

| Column       | Type        | Purpose                               |
| ------------ | ----------- | ------------------------------------- |
| id           | UUID        | Primary key                           |
| workspace_id | UUID        | Foreign key referencing workspaces.id |
| name         | TEXT        | Board name                            |
| description  | TEXT        | Board description                     |
| canvas_data  | JSONB       | Dynamic tldraw canvas document elements and state |
| created_by   | UUID        | User who created the board (references profiles.id) |
| created_at   | TIMESTAMPTZ | Creation timestamp                    |
| updated_at   | TIMESTAMPTZ | Last update timestamp                 |

### Relationship

```txt
Workspace
    ↓
Many Boards
```

---

## Foreign Key Constraints

```txt
profiles.id                    → auth.users.id
workspaces.owner_id            → profiles.id
workspace_members.workspace_id  → workspaces.id
workspace_members.user_id      → profiles.id
workspace_invites.workspace_id  → workspaces.id
workspace_invites.created_by    → profiles.id
workspace_invites.accepted_by   → profiles.id
boards.workspace_id            → workspaces.id
boards.created_by              → profiles.id
```

---

## Implementation Roadmap

### V1 Minimum Tables (Core Whiteboard)
- `profiles`
- `workspaces`
- `boards` (with canvas_data JSON storage)

*(Supabase handles `auth.users` automatically, and our trigger synchronizes details to `profiles`).*

### V2 Collaboration
- `workspace_members`
- `workspace_invites`
