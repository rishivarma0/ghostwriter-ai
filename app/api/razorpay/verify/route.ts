import { NextResponse } from "next/server";
import crypto from "crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { connectDb } from "@/lib/db";
import User from "@/lib/models/User";
import { resolveClerkUserId } from "@/lib/resolve-clerk-user-id";

export const runtime = "nodejs";

type VerifyBody = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const userId = await resolveClerkUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!secret) {
      return NextResponse.json({ error: "Razorpay is not configured on the server." }, { status: 500 });
    }

    const body = (await req.json()) as VerifyBody;
    const orderId = body.razorpay_order_id?.trim();
    const paymentId = body.razorpay_payment_id?.trim();
    const signature = body.razorpay_signature?.trim();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing order id, payment id, or signature." },
        { status: 400 },
      );
    }

    const payload = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    if (!timingSafeEqualHex(expected.toLowerCase(), signature.toLowerCase())) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    await connectDb();
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email =
      clerkUser.primaryEmailAddress?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      "";

    await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: { isPro: true, email },
        $setOnInsert: { generationCount: 0 },
      },
      { upsert: true },
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
