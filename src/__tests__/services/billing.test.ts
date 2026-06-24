import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/utils/supabase/server", () => ({ createClient: vi.fn(), createAdminClient: vi.fn() }));
vi.mock("@/lib/razorpay", () => ({ razorpay: { orders: { create: vi.fn() }, payments: { fetch: vi.fn() } } }));

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { razorpay } from "@/lib/razorpay";
import {
  getUserSubscription, createPaymentOrder, verifyPayment, handleWebhookEvent,
  checkWorkspaceCreationLimit, checkBoardCreationLimit, checkMemberInviteLimit, getUserPayments,
} from "@/services/billing";

function buildMock(opts: any = {}) {
  const { singleData = { data: null, error: { code: "PGRST116" } }, subSingleData, workspaceCount = 0, boardCount = 3, memberCount = 0, inviteCount = 0 } = opts;
  function countThenable(c: number) { return { then: (r: Function) => r({ count: c, error: null }), eq: vi.fn().mockImplementation(() => countThenable(c)) }; }
  return {
    from: vi.fn().mockImplementation((t: string) => {
      if (t === "user_subscriptions") return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue(subSingleData ?? singleData) };
      if (t === "workspaces") return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue(singleData), then: (r: Function) => r({ count: workspaceCount, error: null }) };
      if (t === "payments") return { insert: vi.fn().mockRejectedValue(new Error("not mocked")), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockRejectedValue(new Error("not mocked")) };
      const m: Record<string, number> = { boards: boardCount, workspace_members: memberCount, workspace_invites: inviteCount };
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockImplementation(() => countThenable(m[t] ?? 0)) };
    }),
  };
}

describe("getUserSubscription", () => {
  it("returns free plan on PGRST116", async () => {
    vi.mocked(createClient).mockResolvedValue(buildMock() as any);
    expect((await getUserSubscription("u-1")).plan_type).toBe("free");
  });
  it("returns active subscription", async () => {
    vi.mocked(createClient).mockResolvedValue(buildMock({ singleData: { data: { plan_type: "pro", status: "active", current_period_end: new Date(Date.now() + 86400000).toISOString() }, error: null } }) as any);
    expect((await getUserSubscription("u-1")).plan_type).toBe("pro");
  });
  it("downgrades expired subscription", async () => {
    vi.mocked(createClient).mockResolvedValue(buildMock({ singleData: { data: { plan_type: "pro", status: "active", current_period_end: new Date(Date.now() - 86400000).toISOString() }, error: null } }) as any);
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: null, error: null }) } as any);
    expect((await getUserSubscription("u-1")).plan_type).toBe("free");
  });
});

describe("createPaymentOrder", () => {
  beforeEach(() => { process.env.RAZORPAY_KEY_ID = "rzp_test"; });
  it("creates order and inserts payment", async () => {
    vi.mocked(razorpay.orders.create).mockResolvedValue({ id: "order_1", amount: 49900, currency: "INR" } as any);
    const db = buildMock(); db.from.mockImplementation((t: string) => t === "payments" ? { insert: vi.fn().mockResolvedValue({ error: null }) } : buildMock().from(t));
    vi.mocked(createClient).mockResolvedValue(db as any);
    expect((await createPaymentOrder("u-1", "pro", "a@b.com")).order_id).toBe("order_1");
  });
  it("throws on insert failure", async () => {
    vi.mocked(razorpay.orders.create).mockResolvedValue({ id: "order_1", amount: 49900, currency: "INR" } as any);
    const db = buildMock(); db.from.mockImplementation((t: string) => t === "payments" ? { insert: vi.fn().mockResolvedValue({ error: { message: "DB error" } }) } : buildMock().from(t));
    vi.mocked(createClient).mockResolvedValue(db as any);
    await expect(createPaymentOrder("u-1", "pro", "a@b.com")).rejects.toThrow("Failed to create payment record");
  });
});

describe("verifyPayment", () => {
  beforeEach(() => { process.env.RAZORPAY_KEY_SECRET = "test_secret"; });
  it("throws on invalid signature", async () => {
    await expect(verifyPayment({ razorpay_order_id: "o1", razorpay_payment_id: "p1", razorpay_signature: "bad" })).rejects.toThrow("Invalid payment signature");
  });
  it("succeeds with valid signature", async () => {
    const crypto = await import("crypto");
    const sig = crypto.createHmac("sha256", "test_secret").update("o1|p1").digest("hex");
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), upsert: vi.fn().mockResolvedValue({ error: null }), single: vi.fn().mockResolvedValue({ data: { id: "p1", user_id: "u1", plan_type: "pro", amount: 49900, status: "pending" }, error: null }) } as any);
    vi.mocked(razorpay.payments.fetch).mockResolvedValue({ order_id: "o1", status: "captured", amount: 49900 } as any);
    expect((await verifyPayment({ razorpay_order_id: "o1", razorpay_payment_id: "p1", razorpay_signature: sig })).success).toBe(true);
  });
});

describe("handleWebhookEvent", () => {
  it("processes payment.captured", async () => {
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), upsert: vi.fn().mockResolvedValue({ error: null }), single: vi.fn().mockResolvedValue({ data: { id: "p1", user_id: "u1", plan_type: "pro", status: "pending" }, error: null }) } as any);
    await handleWebhookEvent("payment.captured", { payment: { entity: { id: "rp1", order_id: "o1", notes: { plan_type: "pro" } } } });
  });
  it("processes payment.failed", async () => {
    vi.mocked(createAdminClient).mockReturnValue({ from: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: null }) } as any);
    await handleWebhookEvent("payment.failed", { payment: { entity: { id: "rp1", order_id: "o1" } } });
  });
});

describe("checkWorkspaceCreationLimit", () => {
  it("allows creation when under limit", async () => {
    vi.mocked(createClient).mockResolvedValue(buildMock({ singleData: { data: { plan_type: "free", status: "active" }, error: null }, workspaceCount: 0 }) as any);
    await expect(checkWorkspaceCreationLimit("u-1")).resolves.toBeUndefined();
  });
  it("blocks at limit", async () => {
    vi.mocked(createClient).mockResolvedValue(buildMock({ singleData: { data: { plan_type: "free", status: "active" }, error: null }, workspaceCount: 1 }) as any);
    await expect(checkWorkspaceCreationLimit("u-1")).rejects.toThrow("reached the Free plan limit");
  });
  it("allows unlimited for ultra", async () => {
    vi.mocked(createClient).mockResolvedValue(buildMock({ singleData: { data: { plan_type: "ultra", status: "active" }, error: null } }) as any);
    await expect(checkWorkspaceCreationLimit("u-1")).resolves.toBeUndefined();
  });
});

describe("checkBoardCreationLimit", () => {
  it("allows when under limit", async () => {
    const o = { singleData: { data: { owner_id: "o1" }, error: null }, subSingleData: { data: { plan_type: "free", status: "active" }, error: null }, boardCount: 2 };
    vi.mocked(createClient).mockResolvedValueOnce(buildMock(o) as any).mockResolvedValueOnce(buildMock(o) as any);
    await expect(checkBoardCreationLimit("ws-1")).resolves.toBeUndefined();
  });
  it("blocks at limit", async () => {
    const o = { singleData: { data: { owner_id: "o1" }, error: null }, subSingleData: { data: { plan_type: "free", status: "active" }, error: null }, boardCount: 3 };
    vi.mocked(createClient).mockResolvedValueOnce(buildMock(o) as any).mockResolvedValueOnce(buildMock(o) as any);
    await expect(checkBoardCreationLimit("ws-1")).rejects.toThrow("reached the Free plan limit");
  });
});

describe("checkMemberInviteLimit", () => {
  it("blocks free plan invites", async () => {
    const o = { singleData: { data: { owner_id: "o1" }, error: null }, subSingleData: { data: { plan_type: "free", status: "active" }, error: null } };
    vi.mocked(createClient).mockResolvedValueOnce(buildMock(o) as any).mockResolvedValueOnce(buildMock(o) as any);
    await expect(checkMemberInviteLimit("ws-1")).rejects.toThrow("does not support additional members");
  });
  it("allows pro plan invites under limit", async () => {
    const o = { singleData: { data: { owner_id: "o1" }, error: null }, subSingleData: { data: { plan_type: "pro", status: "active" }, error: null }, memberCount: 5, inviteCount: 2 };
    vi.mocked(createClient).mockResolvedValueOnce(buildMock(o) as any).mockResolvedValueOnce(buildMock(o) as any);
    await expect(checkMemberInviteLimit("ws-1")).resolves.toBeUndefined();
  });
});

describe("getUserPayments", () => {
  it("returns payments ordered by created_at desc", async () => {
    const payments = [{ id: "p1", amount: 49900 }];
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: payments, error: null }) } as any);
    expect(await getUserPayments("u-1")).toEqual(payments);
  });
  it("returns empty array on error", async () => {
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }) } as any);
    expect(await getUserPayments("u-1")).toEqual([]);
  });
});
