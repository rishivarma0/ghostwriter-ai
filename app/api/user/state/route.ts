import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDb } from "@/lib/db";
import User from "@/lib/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDb();
    const user = await User.findOne({ clerkId: userId }).lean();

    return NextResponse.json({
      generationCount: user?.generationCount ?? 0,
      isPro: user?.isPro ?? false,
    });
  } catch (error) {
    console.error("GET /api/user/state:", error);
    return NextResponse.json({ error: "Failed to load account." }, { status: 500 });
  }
}
  