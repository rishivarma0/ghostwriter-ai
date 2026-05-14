import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * Razorpay webhooks (no Clerk session). Validates `x-razorpay-signature` over the raw body.
 * Configure the same URL in the Razorpay Dashboard and set RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json({ error: "RAZORPAY_WEBHOOK_SECRET is not configured." }, { status: 503 });
  }

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing x-razorpay-signature header." }, { status: 400 });
  }

  const rawBody = await req.text();

  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

  const sigBuf = Buffer.from(signature, "utf8");
  const expBuf = Buffer.from(expected, "utf8");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  // Signature valid — acknowledge. Extend here to persist subscription state in your database.
  return NextResponse.json({ received: true });
}
