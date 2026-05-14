import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/privacy(.*)",
  "/terms(.*)",
  "/refund-policy(.*)",
  "/contact(.*)",
  // Handlers return JSON 401 instead of an HTML redirect for `fetch`.
  "/api/generate",
  "/api/user/state",
  // Payment verify: handler returns JSON 401; avoids HTML redirect on `fetch`.
  "/api/razorpay/verify",
  // Order creation: public in middleware so the route runs; handler still enforces auth().
  /^\/api\/razorpay$/,
  // Webhooks: Razorpay server-to-server (no Clerk session).
  /^\/api\/razorpay\/webhook/,
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};