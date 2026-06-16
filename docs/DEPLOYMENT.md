# 🚀 Deploying Zentrox to Vercel

This guide provides step-by-step instructions on how to deploy this Next.js 16 + Supabase whiteboard application to **Vercel** and configure the required environment variables and authentication redirects.

---

## 📋 Prerequisites

Before starting, ensure you have:
1. A [GitHub](https://github.com) account.
2. A [Vercel](https://vercel.com) account.
3. A [Supabase](https://supabase.com) project already created.
4. (Optional) A `TLDRAW_API` license key if you are using tldraw's paid features/services.

---

## 🛠️ Step 1: Push code to GitHub

The recommended deployment method is using Vercel's official **Git Integration**. This enables automatic preview deployments for pull requests and builds the main branch whenever you push changes.

1. Create a new repository on GitHub.
2. Commit and push your local repository:
   ```bash
   git remote add origin https://github.com/your-username/whiteboard-canvas.git
   git branch -M main
   git push -u origin main
   ```

---

## ⚡ Step 2: Import Project in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Select your imported GitHub repository.
3. In the **Configure Project** screen:
   - **Framework Preset:** Next.js (detected automatically).
   - **Root Directory:** `./`
   - **Build and Output Settings:** Leave defaults.

---

## 🔑 Step 3: Configure Environment Variables in Vercel

Under the **Environment Variables** section in Vercel, add the following variables matching your `.env.local` settings:

| Name | Source (Supabase Dashboard) / Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Settings -> API -> Project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Settings -> API -> `anon` public key | `eyJhbGciOiJIUzI1NiIsIn...` |
| `TLDRAW_API` | (Optional) Your TLDraw API license key | `tldraw_api_key_here` |
| `RESEND_API_KEY` | (Optional) Your Resend API key for sending emails | `re_123456789...` |

Click **Add** for each variable, then click **Deploy**.

---

## 🔒 Step 4: Configure Supabase Authentication Redirects

Since this app uses Supabase Auth, you must explicitly allow Supabase to redirect back to your newly deployed Vercel domain.

1. The production Vercel URL is **`https://zentrox-one.vercel.app`**.
2. Go to the **[Supabase Dashboard](https://supabase.com/dashboard)**.
3. Navigate to **Authentication** -> **URL Configuration**.
4. Configure the following:
   - **Site URL:**
     ```txt
     https://zentrox-one.vercel.app
     ```
   - **Redirect URLs:** Add the callback URL to the allowed redirects list:
     ```txt
     https://zentrox-one.vercel.app/auth/callback
     ```
5. Click **Save**.

> [!WARNING]
> If you don't configure these redirect URLs, users will see an `oauth-failed` error or will be redirected back to `localhost` when signing in on the deployed Vercel application.

---

## 🗄️ Step 5: Apply Supabase Migrations

The application requires specific database schemas and Realtime configurations (like enabling `workspace_invites` and `workspace_members` for live notifications).

Ensure you apply the latest migrations to your production Supabase database:
```bash
supabase link --project-ref your-project-ref
supabase db push
```

---

## ⚙️ Step 6: Vercel Configuration (`vercel.json`)

To make deployment and security configuration simple, a `vercel.json` file is defined at the root of the project. It handles:
1. **Build settings:** Explicitly hooks up `npm run build`, `npm run dev`, and `npm install`.
2. **Security Headers:** Enforces security policies like `X-Content-Type-Options`, `X-Frame-Options` (prevents clickjacking), `Referrer-Policy`, and standard modern security headers.

No additional configuration is needed on the Vercel dashboard since these settings are applied automatically on deploy.

---

## 💻 Alternative: Deploying via Vercel CLI

If you prefer to deploy directly from your local terminal without connecting GitHub:

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Log in to your Vercel account:
   ```bash
   vercel login
   ```
3. Run the initial deployment command from the project root:
   ```bash
   vercel
   ```
   *Follow the interactive prompts to link the project.*
4. Set your environment variables in the interactive setup, or add them using:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   vercel env add TLDRAW_API
   ```
5. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## 🔌 Deploying the WebSocket Sync Server (Render)

The Next.js app on Vercel is stateless. To enable real-time collaboration, you must deploy the `sync-server` separately to a long-running environment like [Render](https://render.com).

1. Go to your Render Dashboard and create a new **Web Service**.
2. Connect the same GitHub repository.
3. Configure the service:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run sync`
4. Add the required Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. Click **Create Web Service**.
6. The Render sync server is deployed at **`https://whiteboardsaas2.onrender.com`**.
7. **Update Vercel:** Go back to your Vercel Dashboard, find your Next.js project's Environment Variables, and add:
   - `NEXT_PUBLIC_SYNC_SERVER_URL` = `https://whiteboardsaas2.onrender.com`
8. Redeploy your Vercel project so it picks up the new sync server URL.

---

## 🧪 Verification & Health Check

After deployment, verify that:
1. **Landing page** loads at https://zentrox-one.vercel.app.
2. **Auth** — Sign Up and Login redirect correctly to `/workspaces`.
3. **Canvas** — Create a Workspace and Board; drawing data persists after reloading.
4. **Real-time sync** — Open the same board in two tabs and confirm strokes appear on both; the sync server at https://whiteboardsaas2.onrender.com should be reachable.
