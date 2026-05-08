import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("Razorpay keys are not configured on the server.");
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // 1. Verify the user is actually signed in
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const options = {
      amount: 34900,
      currency: "INR",
      receipt: `rcpt_${userId.slice(-10)}_${Date.now().toString().slice(-8)}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Razorpay Error:", error);
    const message =
      error?.error?.description ||
      error?.message ||
      "Payment initialization failed on server.";
    const statusCode = typeof error?.statusCode === "number" ? error.statusCode : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}