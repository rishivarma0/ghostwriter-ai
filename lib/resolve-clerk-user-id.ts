import { auth, verifyToken } from "@clerk/nextjs/server";

/**
 * Resolves the signed-in Clerk user id for a Route Handler.
 * Prefer verifying the Bearer session token from the client when present so
 * payment flows work even if `auth()` does not receive middleware-injected headers.
 */
export async function resolveClerkUserId(request: Request): Promise<string | null> {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  if (bearer && secretKey) {
    try {
      const payload = await verifyToken(bearer, { secretKey });
      const sub = typeof payload.sub === "string" ? payload.sub : null;
      if (sub) return sub;
    } catch {
      // Invalid or expired token; fall through to auth().
    }
  }

  const { userId } = await auth();
  return userId ?? null;
}
