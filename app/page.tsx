"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useUser, UserButton, SignInButton, useAuth } from "@clerk/nextjs";
import { useIsClient } from "@/lib/use-is-client";
import { parseRazorpayOrderJson } from "@/lib/razorpay-order";
import type { RazorpaySuccessResponse } from "@/types/razorpay-checkout";

type Tone = "Provocative" | "Educational" | "Authentic";

const tones: Tone[] = ["Provocative", "Educational", "Authentic"];

export default function Home() {
  const isClient = useIsClient();
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [input, setInput] = useState("");
  const [tone, setTone] = useState<Tone>("Provocative");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [accountState, setAccountState] = useState<{
    generationCount: number;
    isPro: boolean;
  } | null>(null);
  const [accountStateVersion, setAccountStateVersion] = useState(0);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/state");
        if (cancelled) return;
        if (!res.ok) {
          setAccountState(null);
          return;
        }
        const data = (await res.json()) as { generationCount?: number; isPro?: boolean };
        if (cancelled) return;
        setAccountState({
          generationCount: typeof data.generationCount === "number" ? data.generationCount : 0,
          isPro: Boolean(data.isPro),
        });
      } catch {
        if (!cancelled) setAccountState(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, accountStateVersion]);

  const { limitReached, isPro } = useMemo(() => {
    if (!isClient || !isLoaded || !isSignedIn || !accountState) {
      return { limitReached: false, isPro: false };
    }
    return {
      limitReached: !accountState.isPro && accountState.generationCount >= 3,
      isPro: accountState.isPro,
    };
  }, [isClient, isLoaded, isSignedIn, accountState]);

  const canGenerate = useMemo(
    () => input.trim().length > 0 && !loading && isSignedIn,
    [input, loading, isSignedIn],
  );

  const handleGenerate = async () => {
    if (!input.trim() || loading) return;
    if (!isSignedIn) {
      setError("Sign in to generate posts.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.trim(), tone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate post.");
      }

      setResult(data?.result || data?.post || data?.output || data?.text || "No text returned.");
      setAccountStateVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const processPayment = useCallback(async () => {
    // SECURITY CATCH: Don't allow payment if they aren't logged in.
    // (We handle the UI for this in the render method below)
    if (!isSignedIn || !user) {
      localStorage.setItem("pending_purchase", "true");
      return;
    }

    try {
      const token = await getToken().catch(() => null);
      const authHeaders: Record<string, string> = {};
      if (token) authHeaders.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: authHeaders,
        credentials: "include",
      });
      const rawBody = await res.text();
      const data = parseRazorpayOrderJson(rawBody);

      if (!res.ok || data.error) {
        const e = data.error;
        const serverError =
          typeof e === "string" && e.trim().length > 0
            ? e
            : typeof e === "object" && e !== null && "description" in e
              ? String((e as { description?: string }).description || "").trim() ||
                `Payment initialization failed (HTTP ${res.status}).`
              : typeof data.message === "string" && data.message.trim().length > 0
                ? data.message
                : `Payment initialization failed (HTTP ${res.status}).`;
        alert("Error: " + serverError);
        return;
      }

      if (!data.id || typeof data.amount !== "number" || !data.currency) {
        alert("Error: Invalid order response from server.");
        return;
      }

      if (!window.Razorpay) {
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
        description: "Unlock Founder Pass",
        order_id: data.id,
        handler: async function (response: RazorpaySuccessResponse) {
          const sessionJwt = await getToken().catch(() => null);
          const verifyAuthHeaders: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (sessionJwt) verifyAuthHeaders.Authorization = `Bearer ${sessionJwt}`;

          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: verifyAuthHeaders,
            credentials: "include",
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyJson = (await verifyRes.json().catch(() => ({}))) as { error?: string };
          if (!verifyRes.ok) {
            alert("Error: " + (verifyJson.error || "Could not verify payment on the server."));
            return;
          }
          alert(`Payment Successful! ID: ${response.razorpay_payment_id}`);
          setAccountStateVersion((v) => v + 1);
        },
        prefill: {
          name: user?.fullName || "Founder",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: { color: "#34d399" }, // Emerald 400
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert("Error: " + message);
    }
  }, [isSignedIn, user, getToken]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (localStorage.getItem("pending_purchase") === "true") {
      processPayment();
      localStorage.removeItem("pending_purchase");
    }
  }, [isLoaded, isSignedIn, processPayment]);

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (!isClient || !isLoaded) return <div className="min-h-screen bg-[#040706]" />;

  return (
    <main className="min-h-screen bg-[#040706] text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-[#0a0f0d]/70 px-6 py-4 shadow-[0_0_0_1px_rgba(16,185,129,0.08),0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Ghostwriter v1.0</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Founder Series</p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
              {isPro ? "Pro Intelligence Active" : "Ghostwriter Free"}
            </span>
            
            {/* Show UserButton if logged in, otherwise show a discrete Sign In option */}
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-[#090d0b] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] lg:col-span-2">
            <label className="mb-3 block text-sm font-medium text-zinc-400">Brain Dump your thoughts...</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share your raw ideas, stories, lessons, and hot takes..."
              className="h-[340px] w-full resize-none rounded-xl border border-zinc-700 bg-[#040706] px-4 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-zinc-800 bg-[#090d0b] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <p className="mb-4 text-sm font-medium text-zinc-400">Post Tone</p>
              <div className="space-y-3">
                {tones.map((toneOption) => (
                  <button
                    key={toneOption}
                    type="button"
                    onClick={() => setTone(toneOption)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                      tone === toneOption
                        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]"
                        : "border-zinc-800 bg-[#050807] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {toneOption}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="mt-8 w-full rounded-xl bg-emerald-400 px-4 py-4 text-sm font-bold text-zinc-950 transition-all hover:bg-emerald-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? "Thinking..." : "Generate Post"}
              </button>

              {loading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-300/80">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" />
                  <span className="ml-1 text-xs text-zinc-500">AI is crafting your post...</span>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                   <p className="text-xs leading-relaxed text-red-400/90">{error}</p>
                </div>
              )}
            </div>
          </aside>
        </section>

        {limitReached && (
          <div className="mt-8 p-6 rounded-2xl border border-emerald-500/30 bg-[#090d0b] shadow-[0_20px_60px_rgba(0,0,0,0.45)] text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <span className="text-2xl">🔥</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-zinc-100">{"You're on fire!"}</h3>
            <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-zinc-400">
              {
                "You've used your 3 free Ghostwriter generations. Upgrade to the Founder Pass for unlimited posts, custom brand voices, and priority access."
              }
            </p>
            
            {isSignedIn ? (
              <button
                disabled={isPro}
                className="rounded-xl bg-emerald-400 px-8 py-3 font-bold text-zinc-950 transition-all hover:scale-105 hover:bg-emerald-300 active:scale-95"
                onClick={processPayment}
              >
                {isPro ? "Founder Pass Active" : "Unlock Founder Pass - ₹349/mo"}
              </button>
            ) : (
              <SignInButton mode="modal">
                <button
                  onClick={processPayment}
                  className="rounded-xl bg-zinc-100 px-8 py-3 font-bold text-zinc-950 transition-all hover:scale-105 active:scale-95"
                >
                  Unlock Founder Pass - ₹349/mo
                </button>
              </SignInButton>
            )}
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-[#090d0b] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Generated Post</h2>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!result}
              className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {copied ? "Copied to Clipboard!" : "Copy Post"}
            </button>
          </div>

          <div className="min-h-[200px] whitespace-pre-wrap rounded-xl border border-zinc-800 bg-[#040706] p-6 text-[15px] leading-relaxed text-zinc-300 selection:bg-emerald-500/30">
            {result || <span className="text-zinc-600 italic">Your viral-ready LinkedIn post will appear here...</span>}
          </div>
        </section>

        <footer className="mt-20 border-t border-zinc-900 py-12 text-center">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              A <span className="text-emerald-400">Pixelshift</span> Project
            </p>
            <p className="mt-1 text-[10px] text-zinc-600">Built with ❤️ by Rishi Varma</p>
          </div>
          <p className="mx-auto max-w-md text-[9px] leading-relaxed text-zinc-700 italic">
            Ghostwriter AI is a product of Pixelshift. Payments are processed securely via Razorpay under the legal name Rishi Varma.
          </p>
        </footer>
      </div>
    </main>
  );
}