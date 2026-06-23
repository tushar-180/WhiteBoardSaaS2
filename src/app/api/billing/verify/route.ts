import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyPayment } from "@/services/billing";
import { getCurrentUser } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment verification fields." },
        { status: 400 },
      );
    }

    const result = await verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // Revalidate cache so server-rendered pages pick up new plan limits
    revalidatePath("/", "layout");

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[Billing API] Verify error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Payment verification failed." },
      { status: 400 },
    );
  }
}
