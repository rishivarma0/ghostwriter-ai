import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!, 
});

export async function POST() {
  // 1. Verify the user is actually signed in
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const options = {
    amount: 34900, // ₹349.00
    currency: "INR",
    receipt: `rcpt_${userId}_${Date.now()}`, // Links receipt to the exact user
  };

  try {
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}