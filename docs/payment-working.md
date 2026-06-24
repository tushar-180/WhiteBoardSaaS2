# 💳 Payment System — Complete Flow

This document explains how payments work in Zentrox, from the moment a user clicks "Upgrade" to having their subscription activated.

---

## 📁 File Map

```
src/
├── types/billing.ts                # Type definitions, plan limits & prices
├── lib/razorpay.ts                 # Razorpay server SDK instance
├── services/billing.ts             # Core payment logic (order, verify, webhook, limits)
├── hooks/use-razorpay.ts           # Client-side Razorpay checkout hook
├── app/api/billing/
│   ├── create-order/route.ts       # POST: Creates Razorpay order
│   ├── verify/route.ts             # POST: Verifies payment signature
│   └── webhooks/billing/route.ts   # POST: Webhook handler from Razorpay
├── components/billing/
│   ├── pricing-cards.tsx           # Pricing tier comparison UI
│   └── upgrade-dialog.tsx          # Upgrade modal (used on limit hit)
├── components/settings/
│   └── billing-tab.tsx             # Billing settings page
├── app/(landing)/
│   └── pricing/page.tsx            # Public pricing page
└── actions/
    ├── settings.ts                 # getUserSubscriptionAction
    ├── workspace.ts                # createWorkspaceAction (calls limit check)
    ├── board.ts                    # createBoardAction (calls limit check)
    └── invite.ts                   # createInviteAction (calls limit check)
```

---

## 🏗️ Architecture Overview

```
User clicks "Upgrade"
       │
       ▼
┌─────────────────────┐
│  useRazorpay hook   │  (Client)
│  pricing-cards.tsx  │
│  billing-tab.tsx    │
└─────────┬───────────┘
          │ POST /api/billing/create-order { plan_type: "pro" }
          ▼
┌─────────────────────┐
│  create-order route │  (Server)
│  → createPayment    │
│    Order()          │
└─────────┬───────────┘
          │ Returns { order_id, amount, currency, key_id }
          ▼
┌─────────────────────┐
│ Razorpay Checkout   │  (Client - iframe)
│ User enters card    │
│ details & pays      │
└─────────┬───────────┘
          │ On success: handler callback with payment response
          ▼
┌─────────────────────┐
│  verify route       │  (Server)
│  → verifyPayment()  │
│  ✓ Validate sig     │
│  ✓ Update payment   │  "pending" → "paid"
│  ✓ Upsert sub       │  plan_type: "pro", status: "active"
└─────────┬───────────┘
          │ 
          ▼
    Subscription Active 🎉
```

---

## 🔄 Step-by-Step Flow

### Step 1: User Sees Pricing

There are **two entry points** to upgrade:

**A) Billing Settings** (`billing-tab.tsx`):
- User opens Settings → Billing tab
- Shows current plan card with limits
- Shows "Compare Plans" section with PricingCards
- Clicking any "Upgrade" button directly calls `openRazorpay("pro" | "ultra")`

**B) Limit-Enforced Upgrade** (`upgrade-dialog.tsx`):
- User hits a plan limit while creating workspace/board/invite
- An overlay dialog opens explaining the limit
- User picks a plan → same flow as above

The PricingCards component (`pricing-cards.tsx`) shows 3 tiers:

| Tier | Price | Workspaces | Boards | Members |
|------|-------|-----------|--------|---------|
| **Free** | ₹0 | 1 | 3 per WS | 0 (owner only) |
| **Pro** | ₹499/mo | 3 | 10 per WS | 10 |
| **Ultra** | ₹1,499/mo | ∞ | ∞ | ∞ |

### Step 2: `openRazorpay(plan)` is Called

File: `src/hooks/use-razorpay.ts`

```typescript
const { openRazorpay, isProcessing } = useRazorpay();

// Called when user clicks "Upgrade to Pro"
openRazorpay("pro");
```

The hook does three things in order:

**2a. Load Razorpay SDK** (only on first use)
```typescript
const script = document.createElement("script");
script.src = "https://checkout.razorpay.com/v1/checkout.js";
document.body.appendChild(script);
```

**2b. Create Order via Backend API**
```typescript
const res = await fetch("/api/billing/create-order", {
  method: "POST",
  body: JSON.stringify({ plan_type: "pro" }),
});
```

**2c. Open Razorpay Checkout**
```typescript
const razorpay = new window.Razorpay({
  key: orderData.key_id,    // "rzp_test_..."
  amount: orderData.amount, // 49900 (paise = ₹499)
  currency: "INR",
  name: "Zentrox",
  order_id: orderData.order_id, // "order_..."
  handler: async function (response) {
    // Step 4: Verify payment
  },
});
razorpay.open();
```

### Step 3: Server Creates Order & Payment Record

File: `src/app/api/billing/create-order/route.ts`

This API route:
1. **Authenticates** the user via Supabase SSR
2. **Validates** the plan type (`"pro"` or `"ultra"`)
3. Calls `createPaymentOrder(userId, planType, userEmail)`

Inside `createPaymentOrder` (`src/services/billing.ts`):

**3a. Create Razorpay Order**
```typescript
const order = await razorpay.orders.create({
  amount: 49900,        // ₹499 in paise
  currency: "INR",
  receipt: "ztx_k3f2a_pro",  // Short unique receipt
  notes: { user_id, plan_type, email },
});
```

**3b. Insert Pending Payment Record**
```typescript
await supabase.from("payments").insert({
  user_id: userId,
  plan_type: "pro",
  provider: "razorpay",
  provider_order_id: order.id,  // "order_..."
  amount: 49900,
  currency: "INR",
  status: "pending",
});
```

**3c. Return to Frontend**
```typescript
return {
  order_id: order.id,
  amount: 49900,
  currency: "INR",
  key_id: process.env.RAZORPAY_KEY_ID,
};
```

### Step 4: User Pays in Razorpay Checkout

Razorpay's checkout iframe opens. The user:
1. Enters card/UPI/bank details
2. Completes authentication (OTP, etc.)
3. Payment is processed by Razorpay

On success, Razorpay calls our `handler` function with:
```json
{
  "razorpay_order_id": "order_PLx123...",
  "razorpay_payment_id": "pay_PLx456...",
  "razorpay_signature": "6d8e9a..."
}
```

### Step 5: Verify Payment

File: `src/app/api/billing/verify/route.ts`

The frontend calls `POST /api/billing/verify` with the payment details.

Inside `verifyPayment` (`src/services/billing.ts`):

**5a. Verify Cryptographic Signature**
```typescript
const body = razorpay_order_id + "|" + razorpay_payment_id;
const expected = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(body)
  .digest("hex");

if (expected !== razorpay_signature) {
  throw new Error("Invalid payment signature.");
}
```

This ensures the payment was genuinely processed by Razorpay and not tampered with.

**5b. Update Payment Record**
```typescript
await adminSupabase.from("payments").update({
  provider_payment_id: razorpay_payment_id,
  status: "paid",
  paid_at: new Date().toISOString(),
}).eq("provider_order_id", razorpay_order_id);
```

**5c. Activate Subscription**
```typescript
await adminSupabase.from("user_subscriptions").upsert({
  user_id: payment.user_id,
  plan_type: "pro",
  status: "active",
  current_period_end: periodEnd.toISOString(),  // 30 days from now
}, { onConflict: "user_id" });
```

**5d. Cache Revalidation**
```typescript
revalidatePath("/", "layout");  // All pages pick up new plan limits
```

### Step 6: UI Updates

On the frontend:
- `toast.success("Successfully upgraded to Pro!")`
- `router.refresh()` — Next.js re-fetches server data
- Nav badge shows "Pro" instead of "Free"
- Limits are lifted: user can create more workspaces/boards/members

---

## 🔐 Fallback: Webhook Processing

If the user closes the browser before the `handler` callback fires (e.g., network issue), Razorpay retries via webhook.

File: `src/app/api/webhooks/billing/route.ts`

```typescript
// Razorpay sends POST to /api/webhooks/billing
// with x-razorpay-signature header

// 1. Verify webhook signature
const expected = crypto
  .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(body)
  .digest("hex");

// 2. Process event
await handleWebhookEvent(eventName, payload);
```

**Events handled:**
| Event | Action |
|-------|--------|
| `payment.captured` | Update payment → "paid", upsert subscription → "active" |
| `payment.failed` | Update payment → "failed" |

> Note: The webhook always returns `200` to acknowledge receipt. Errors are logged but a 200 is returned to prevent Razorpay from retrying unnecessarily.

---

## 🛑 Limit Enforcement

When a user tries to create a resource, the server action checks if the plan allows it.

### Workspace Creation Limit

File: `src/actions/workspace.ts` → `createWorkspaceAction()`

```typescript
// Inside createWorkspaceAction:
await checkWorkspaceCreationLimit(user.id);
```

In `checkWorkspaceCreationLimit` (`src/services/billing.ts`):
1. Fetch user's subscription from DB
2. Look up plan limit from `PLAN_LIMITS`:
   ```typescript
   PLAN_LIMITS = {
     free:  { workspaces: 1, boards: 3, members: 0 },
     pro:   { workspaces: 3, boards: 10, members: 10 },
     ultra: { workspaces: -1, boards: -1, members: -1 }, // -1 = unlimited
   };
   ```
3. Count user's existing workspaces
4. If count ≥ limit → throw error with upgrade prompt

### Board Creation Limit

File: `src/actions/board.ts` → `createBoardAction()`

```typescript
// Check plan limit for the workspace owner
await checkBoardCreationLimit(workspaceId);
```

### Member Invite Limit

File: `src/actions/invite.ts` → `createInviteAction()`

```typescript
await checkMemberInviteLimit(workspaceId);
// Counts existing members + pending invites
```

The error messages include upgrade pricing to guide the user:
```
"You've reached the Free plan limit of 1 workspace. 
 Upgrade to Pro (₹499) for up to 3 workspaces or Ultra (₹1499) for unlimited workspaces."
```

---

## 🗄️ Database Schema

### Table: `user_subscriptions`

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID (PK) | References profiles.id |
| `plan_type` | enum | `free` / `pro` / `ultra` |
| `status` | enum | `active` / `expired` |
| `current_period_end` | timestamptz | When the paid period ends |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

A trigger `on_profile_created_subscription` auto-creates a Free subscription row when a new user signs up.

### Table: `payments`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | |
| `user_id` | UUID | References profiles.id |
| `plan_type` | enum | `pro` / `ultra` |
| `provider` | text | `razorpay` |
| `provider_order_id` | text (unique) | Razorpay order ID |
| `provider_payment_id` | text (unique) | Razorpay payment ID |
| `amount` | integer | In paise (₹1 = 100 paise) |
| `currency` | text | `INR` |
| `status` | enum | `pending` → `paid` / `failed` / `refunded` |
| `paid_at` | timestamptz | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

---

## 🌐 Environment Variables

```env
# Required for Razorpay API
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Required for webhook verification
RAZORPAY_WEBHOOK_SECRET=whsec_ztx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Where to get these:**
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` → [Razorpay Dashboard](https://dashboard.razorpay.com) → Settings → API Keys
- `RAZORPAY_WEBHOOK_SECRET` → Razorpay Dashboard → Settings → Webhooks → Add Webhook

The Razorpay server SDK is initialized in `src/lib/razorpay.ts`:
```typescript
import Razorpay from "razorpay";
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

---

## 🎯 Example: Upgrading from Free to Pro

Here's the complete flow with real data:

### Before
- User has 1 workspace (Free limit)
- Nav badge shows **"Free"**
- Tries to create a 2nd workspace → ❌ Error: "reached the Free plan limit"

### User clicks "Upgrade to Pro" in Billing Settings

```
1. Frontend: POST /api/billing/create-order { plan_type: "pro" }
2. Server:   Creates Razorpay order for ₹499 (49900 paise)
3. Server:   Inserts payment record (status: "pending")
4. Server:   Returns { order_id: "order_PLx...", amount: 49900, ... }
5. Frontend: Opens Razorpay checkout iframe
6. User:     Enters test card: 4111 1111 1111 1111, any future date, any CVV
7. Frontend: Razorpay calls handler with payment response
8. Frontend: POST /api/billing/verify { razorpay_order_id, razorpay_payment_id, ... }
9. Server:   Verifies HMAC signature ✓
10. Server:  Updates payment → status: "paid"
11. Server:  Upserts subscription → plan_type: "pro", status: "active"
12. Server:  Revalidates cache
13. Frontend: toast "Successfully upgraded to Pro!"
14. Nav badge now shows **"Pro"**
```

### After
- User can create up to 3 workspaces
- 10 boards per workspace
- Invite up to 10 members
- All without hitting limits

---

## 🔧 Key Technical Details

### Razorpay Checkout Container Fix
Razorpay's `checkout.js` creates a `razorpay-container` div with `pointer-events: none` during loading. In some cases, this property isn't removed, making the checkout visible but unclickable. The fix in `globals.css`:

```css
div[id*="razorpay-container"],
div[class*="razorpay-container"] {
  pointer-events: auto !important;
}
```

### Admin Supabase Client
The `verifyPayment` and `handleWebhookEvent` functions use `createAdminClient()` (service_role key) to bypass RLS, since the payment flow runs as a system operation, not as the user.

### Price Format
All amounts are in **paise** (₹1 = 100 paise):
- Pro: ₹499 → `49900`
- Ultra: ₹1,499 → `149900`

### 30-Day Billing Period
Currently, each payment grants 30 days of access (`current_period_end = now + 30 days`). This is a fixed period — recurring billing is not implemented yet.
