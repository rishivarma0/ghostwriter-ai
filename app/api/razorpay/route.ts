import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!, 
});

export async function POST() {
  const options = {
    amount: 34900, // ₹349.00
    currency: "INR",
    receipt: `receipt_${Date.now()}`, // Unique receipt ID
  };

  try {
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}