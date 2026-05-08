"use client";

import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function TestPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || !user) return;
    setIsPro(localStorage.getItem(`usage_${user.id}`) === "-999");
  }, [isLoaded, user]);

  const processPayment = useCallback(async () => {
    if (!isSignedIn || !user) {
      localStorage.setItem("pending_purchase", "true");
      alert("Please sign in first to test payment.");
      return;
    }

    try {
      const res = await fetch("/api/razorpay", { method: "POST" });
      const rawBody = await res.text();
      let data: any = {};
      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        data = { error: rawBody || "Invalid server response from /api/razorpay." };
      }

      if (!res.ok || data.error) {
        const serverError =
          typeof data?.error === "string" && data.error.trim().length > 0
            ? data.error
            : typeof data?.message === "string" && data.message.trim().length > 0
              ? data.message
              : `Payment initialization failed (HTTP ${res.status}).`;
        alert("Error: " + serverError);
        return;
      }

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please refresh and try again.");
      }
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error("NEXT_PUBLIC_RAZORPAY_KEY_ID is missing.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Ghostwriter AI",
        description: "Test Founder Pass Payment",
        order_id: data.id,
        handler: function (response: any) {
          alert(`Payment Successful! ID: ${response.razorpay_payment_id}`);
          localStorage.setItem(`usage_${user.id}`, "-999");
          setIsPro(true);
        },
        prefill: {
          name: user.fullName || "Founder",
          email: user.primaryEmailAddress?.emailAddress || "",
        },
        theme: { color: "#34d399" },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Error: " + message);
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (localStorage.getItem("pending_purchase") === "true") {
      processPayment();
      localStorage.removeItem("pending_purchase");
    }
  }, [isLoaded, isSignedIn, processPayment]);

  const clearProStatus = () => {
    if (!user) return;
    localStorage.removeItem(`usage_${user.id}`);
    setIsPro(false);
  };

  const forceProStatus = () => {
    if (!user) return;
    localStorage.setItem(`usage_${user.id}`, "-999");
    setIsPro(true);
  };

  if (!mounted || !isLoaded) return <div className="min-h-screen bg-[#040706]" />;

  return (
    <main className="min-h-screen bg-[#040706] text-zinc-100">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-[#0a0f0d]/70 px-6 py-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Testing for {user?.firstName || "Founder"}
          </h1>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-emerald-400">
                Sign In
              </button>
            </SignInButton>
          )}
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-[#090d0b] p-8 text-center">
          <p className="mb-6 text-sm text-zinc-400">
            Sandbox for payment + personalization. Current status: {isPro ? "PRO" : "FREE"}
          </p>

          <button
            onClick={processPayment}
            className="mx-auto block rounded-xl bg-emerald-400 px-10 py-4 text-lg font-bold text-zinc-950 transition hover:bg-emerald-300"
          >
            Test Payment - ₹349
          </button>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={clearProStatus}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:border-zinc-500"
            >
              Clear Pro Status
            </button>
            <button
              onClick={forceProStatus}
              className="rounded-lg border border-emerald-600/60 px-4 py-2 text-xs text-emerald-300 hover:border-emerald-400"
            >
              Force Pro Status
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
