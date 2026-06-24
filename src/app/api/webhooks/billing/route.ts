import { NextResponse } from "next/server";
import { handleWebhookEvent } from "@/services/billing";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("[Webhook] Invalid signature received");
      return NextResponse.json(
        { error: "Invalid signature." },
        { status: 401 },
      );
    }

    const event = JSON.parse(body);
    const eventName = event.event as string;
    const payload = event.payload as Record<string, unknown>;

    console.log(`[Webhook] Received event: ${eventName}`);

    await handleWebhookEvent(eventName, payload);

    return NextResponse.json({ status: "ok" });
  } catch (error: unknown) {
    console.error("[Webhook] Processing error:", error);
    // Always return 200 to acknowledge receipt, even if processing fails
    // Razorpay will retry on non-200 responses

    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
}
