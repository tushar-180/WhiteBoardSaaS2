import { NextResponse } from "next/server";
import { createPaymentOrder } from "@/services/billing";
import { getCurrentUser } from "@/utils/supabase/server";
import { billingPlanSchema } from "@/types/billing";

export async function POST(request: Request) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    }

    const body = await request.json();
    const { plan_type } = body;

    const validated = billingPlanSchema.safeParse(plan_type);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid plan type. Must be 'pro' or 'ultra'." }, { status: 400 });
    }

    const result = await createPaymentOrder(user.id, validated.data, user.email || "");

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[Billing API] Create order error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create order." },
      { status: 500 },
    );
  }
}
