<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into Zentrox, the collaborative whiteboard application. Here is a summary of what was added:

- **Client-side initialization** via `instrumentation-client.ts` using the Next.js 15.3+ recommended approach — no provider component required.
- **Reverse proxy rewrites** added to `next.config.ts` so analytics traffic routes through `/ingest/*` instead of directly to PostHog, improving ad-blocker resilience.
- **Server-side PostHog client** created at `src/lib/posthog-server.ts` using `posthog-node` for tracking critical mutations in Server Actions.
- **User identification** on email signup, email sign-in (client-side via `posthog.identify()`), and on returning sessions via the workspaces page. `posthog.reset()` is called on logout to decouple future anonymous events.
- **14 business events** instrumented across 8 files covering the full product lifecycle: auth → workspace → board → collaboration → member management.
- **Error tracking** via `posthog.captureException()` added to auth, save, and OAuth error paths.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User creates a new account with email/password | `src/hooks/auth/use-auth-form.ts` |
| `user_signed_in` | User signs in with email/password | `src/hooks/auth/use-auth-form.ts` |
| `github_auth_started` | User initiates the GitHub OAuth flow | `src/hooks/auth/use-auth-form.ts` |
| `workspace_created` | User successfully creates a new workspace | `src/actions/workspace.ts` |
| `workspace_deleted` | User deletes a workspace they own | `src/actions/workspace.ts` |
| `board_created` | User creates a new whiteboard board | `src/actions/board.ts` |
| `board_canvas_saved` | Board canvas data is persisted to the database | `src/actions/board.ts` |
| `board_saved_manually` | User clicks the manual save button and save succeeds | `src/components/whiteboard/whiteboard-editor.tsx` |
| `workspace_invite_sent` | Owner/admin sends an invite email to a new member | `src/actions/invite.ts` |
| `workspace_invite_accepted` | Invited user accepts the workspace invitation | `src/actions/invite.ts` |
| `workspace_invite_declined` | Invited user declines the workspace invitation | `src/actions/invite.ts` |
| `workspace_member_removed` | Owner/admin removes a member from the workspace | `src/actions/member.ts` |
| `workspace_member_role_updated` | Owner/admin changes a member's role | `src/actions/member.ts` |
| `workspace_left` | A non-owner member voluntarily leaves a workspace | `src/actions/member.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/471144/dashboard/1713904)
- [User Signups & Sign-ins](https://us.posthog.com/project/471144/insights/XwczV05U) — Daily trend of new signups and sign-ins
- [Workspace Creation Trend](https://us.posthog.com/project/471144/insights/N33gRweg) — How many workspaces are created per day
- [Board Activity](https://us.posthog.com/project/471144/insights/p9G8zJXK) — Board creations and canvas saves as a collaboration proxy
- [Onboarding Funnel](https://us.posthog.com/project/471144/insights/rsgTrhtB) — Conversion from signup → workspace → first board
- [Invite Conversion Funnel](https://us.posthog.com/project/471144/insights/FLe5LaNp) — How many sent invites convert to accepted memberships

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
