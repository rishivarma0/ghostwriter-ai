import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { resolveClerkUserId } from "@/lib/resolve-clerk-user-id";

export const runtime = "nodejs";

function razorpayErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "error" in error) {
    const inner = (error as { error?: { description?: string } }).error;
    if (inner?.description) return inner.description;
  }
  if (error instanceof Error) return error.message;
  return "Payment initialization failed on server.";
}

function razorpayErrorStatus(error: unknown): number {
  if (error && typeof error === "object" && "statusCode" in error) {
    const code = (error as { statusCode?: unknown }).statusCode;
    if (typeof code === "number") return code;
  }
  return 500;
}

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured (set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)." },
        { status: 500 },
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const userId = await resolveClerkUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Authentication failed: No UserID" }, { status: 401 });
    }

    const options = {
      amount: 34900,
      currency: "INR",
      receipt: `rcpt_${userId.slice(-10)}_${Date.now().toString().slice(-8)}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error: unknown) {
    console.error("Razorpay Error:", error);
    const message = razorpayErrorMessage(error);
    const statusCode = razorpayErrorStatus(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}