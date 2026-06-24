# Payment & Subscription Integration Plan

## 1. Pricing Tiers

The application will offer three subscription plans billed monthly in INR (₹).

| Feature | Free (₹0) | Pro (₹499/month) | Ultra (₹1499/month) |
| :--- | :--- | :--- | :--- |
| **Price** | Free | ₹499/month | ₹1499/month |
| **Workspaces** | 1 Workspace | Up to 3 Workspaces | Unlimited Workspaces |
| **Boards** | 3 Boards per workspace | 10 Boards per workspace | Unlimited Boards |
| **Members** | 0 Members (Owner only) | 10 Members per workspace | Unlimited Members |

> [!NOTE]
> **Legacy Users (What happens to existing data?)**
> We will use **Soft Limits** for users who created accounts before this update. 
> - **No Data Loss:** If a Free user already has 5 workspaces (and the limit is 1), they keep all 5 workspaces and can continue to access them.
> - **Creation Blocked:** They will not be able to create a 6th workspace (or 4th board, or invite more members) until they either upgrade to Pro/Ultra, or delete enough existing workspaces/boards to fall back under the Free limit.

---

## 2. Database Modifications

Since we are using one-time purchases (non-auto-renewing) instead of recurring subscriptions, our database schema is simplified. We need two tables: one for the user's current access level and one for tracking individual payments.

**Table: `user_subscriptions`**
Tracks the user's current access level.
- `user_id` (UUID, Primary Key, FK to `profiles.id`)
- `plan_type` (Enum: `free`, `pro`, `ultra`) - Default `free`
- `status` (Enum: `active`, `expired`)
- `current_period_end` (Timestamptz, nullable)
- `created_at` / `updated_at` (Timestamptz)

**Table: `payments`**
Stores every individual purchase order.
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK to `profiles.id`)
- `plan_type` (Enum: `pro`, `ultra`)
- `provider` (Text) - e.g., `razorpay`
- `provider_order_id` (Text, Unique)
- `provider_payment_id` (Text, Unique, nullable)
- `amount` (Integer)
- `currency` (Text)
- `status` (Enum: `pending`, `paid`, `failed`, `refunded`)
- `paid_at` (Timestamptz, nullable)
- `created_at` / `updated_at` (Timestamptz)

*RLS Policies:* Users can only view their own subscription and payment data.

---

## 3. Enforcing Limits (Backend & Services)

We will modify existing Server Actions to query the user's subscription from `user_subscriptions` (or `profiles`) before performing mutations.

### A. Workspace Limits (`src/actions/workspace.ts`)
- On `createWorkspaceAction`: Check the number of workspaces the user currently owns.
- Compare against their plan limit (Free: 1, Pro: 3, Ultra: Unlimited).
- Throw a `PaymentRequired` error if they exceed the limit.

### B. Board Limits (`src/actions/board.ts`)
- On `createBoardAction`: Find the `owner_id` of the workspace.
- Check the workspace owner's subscription tier.
- Count the existing boards in that workspace.
- Compare against the plan limit (Free: 3, Pro: 10, Ultra: Unlimited).
- Throw a `PaymentRequired` error if exceeded.

### C. Member Limits (`src/actions/invite.ts`)
- On `createInviteAction`: Find the workspace owner's subscription.
- Count existing members + pending invites in the workspace.
- Compare against the plan limit (Free: 0, Pro: 10, Ultra: Unlimited).
- Throw a `PaymentRequired` error if exceeded.

---

## 4. Payment Provider Integration (Razorpay)

We will use the official `razorpay` Node SDK, but we will wrap it in a generic `src/services/billing.ts` adapter. This ensures that if we switch to Stripe, we only need to change the implementation inside `billing.ts` without touching the frontend or other server actions.

### A. API Routes & Services
- **`src/services/billing.ts`**
  Abstract service with functions like `createOrder(userId, planId)`, `verifyPayment(...)`, `handleWebhook(...)`.
- **`POST /api/billing/create-order`**
  Calls `billing.ts` to create an order and returns provider-specific details (`order_id`) to the client.
- **`POST /api/billing/verify`**
  Calls `billing.ts` to verify the payment signature and update the order to paid.
- **`POST /api/webhooks/billing`**
  Listens for background events from the provider (e.g., `payment.captured`) and updates `payments` and `user_subscriptions`.

### B. Frontend Components
- **`src/components/billing/pricing-cards.tsx`**
  A beautifully designed, premium-looking pricing card component showing the Free, Pro, and Ultra tiers.
- **`src/components/settings/billing-tab.tsx`**
  A new tab in the settings modal. Shows current active plan, billing history, and a button to "Upgrade Plan" or "Manage Subscription".
- **Upgrade Modals**
  When a user hits a limit (e.g., tries to create a 4th board on the Free plan), show a premium modal dialog prompting them to upgrade to Pro.

---

## 5. Implementation Status ✅

All payment integration steps have been completed:

1. **Database:** ✅ Migration `20260619000000` created with `user_subscriptions` and `payments` tables, enums, RLS policies, and auto-creation trigger.
2. **SDK:** ✅ `razorpay` SDK installed (`npm install razorpay`).
3. **Library:** ✅ `src/lib/razorpay.ts` — Razorpay client initialized.
4. **Billing Service:** ✅ `src/services/billing.ts` — Generic adapter with `createPaymentOrder`, `verifyPayment`, `handleWebhookEvent`, and limit checking functions (`checkWorkspaceCreationLimit`, `checkBoardCreationLimit`, `checkMemberInviteLimit`).
5. **API Routes:**
   - ✅ `POST /api/billing/create-order` — Creates Razorpay order and inserts pending payment.
   - ✅ `POST /api/billing/verify` — Verifies payment signature and activates subscription.
   - ✅ `POST /api/webhooks/billing` — Handles `payment.captured` / `payment.failed` events with signature verification.
6. **Limit Enforcement:** ✅ Subscription checks added to `createWorkspaceAction`, `createBoardAction`, and `createInviteAction`.
7. **Settings UI:** ✅ Settings modal now includes a "Billing" tab showing current plan, limits, and upgrade options.
8. **Pricing Cards:** ✅ Reusable `PricingCards` component showing Free/Pro/Ultra tiers.
9. **Upgrade Dialog:** ✅ `UpgradeDialog` component with Razorpay checkout modal integration.
10. **Limits:** ✅ Soft limits enforced — existing data is preserved, creation is blocked when limits are exceeded.

---

## 6. Testing

To simulate payments and verify enforcement:
1. Apply the migration to your Supabase database.
2. Use Razorpay test mode (key_id starting with `rzp_test_*`) for sandbox payments.
3. Test card: `4111 1111 1111 1111` with any future expiry and any CVV.
4. Verify that creating a 2nd workspace (on Free plan) shows the upgrade prompt.
5. Verify that inviting members (on Free plan) shows the upgrade prompt.
6. Check the Billing tab in Settings reflects the correct plan status.
