"use client";

import { useMemo, useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";

type Tone = "Provocative" | "Educational" | "Authentic";

const tones: Tone[] = ["Provocative", "Educational", "Authentic"];

export default function Home() {
  const { isSignedIn } = useUser(); // Checks if user paid & logged in
  const [input, setInput] = useState("");
  const [tone, setTone] = useState<Tone>("Provocative");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const canGenerate = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const handleGenerate = async () => {
    if (!input.trim() || loading) return;

    // 1. THE GATEKEEPER: Check if they are signed in (Pro) OR under the limit
    const currentUsage = parseInt(localStorage.getItem("ghostwriter_usage") || "0");
    if (!isSignedIn && currentUsage >= 2) {
      setLimitReached(true);
      return; 
    }

    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);
    setLimitReached(false); 

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

      const generatedText =
        data?.result || data?.post || data?.output || data?.text || "No response text returned.";

      setResult(generatedText);

      // 2. THE TOLL BOOTH: Add 1 to usage only if they are not Pro
      if (!isSignedIn) {
        localStorage.setItem("ghostwriter_usage", (currentUsage + 1).toString());
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (!mounted) return <div className="min-h-screen bg-[#040706]" />;

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
              {isSignedIn ? "Pro Intelligence Active" : "Ghostwriter Optimized"}
            </span>
            {/* Shows profile picture if logged in */}
            <UserButton afterSignOutUrl="/" />
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

        {/* --- THE PAYWALL UI --- */}
        {limitReached && !isSignedIn && (
          <div className="mt-8 p-6 rounded-2xl border border-emerald-500/30 bg-[#090d0b] shadow-[0_20px_60px_rgba(0,0,0,0.45)] text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <span className="text-2xl">🔥</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-zinc-100">You're on fire!</h3>
            <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-zinc-400">
              You've used your 2 free Ghostwriter generations. Upgrade to the **Founder Pass** for unlimited posts, custom brand voices, and priority access.
            </p>
            <button 
              className="rounded-xl bg-emerald-400 px-8 py-3 font-bold text-zinc-950 transition-all hover:scale-105 hover:bg-emerald-300 active:scale-95"
              onClick={() => window.open("https://razorpay.me/@pixelshift", "_blank")}
            >
              Unlock Founder Pass - ₹399/mo
            </button>
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

        {/* --- PIXELSHIFT FOOTER --- */}
        <footer className="mt-20 border-t border-zinc-900 py-12 text-center">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              A <span className="text-emerald-400">Pixelshift</span> Project
            </p>
            <p className="mt-1 text-[10px] text-zinc-600">Built with ❤️ by Rishi Varma</p>
          </div>
          
          <div className="mb-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] uppercase tracking-tighter text-zinc-500">
            <a href="/privacy" className="transition hover:text-emerald-400">Privacy</a>
            <a href="/terms" className="transition hover:text-emerald-400">Terms</a>
            <a href="/refunds" className="transition hover:text-emerald-400">Refunds</a>
            <a href="/shipping" className="transition hover:text-emerald-400">Shipping</a>
            <a href="mailto:pixelshift.hq@gmail.com" className="underline underline-offset-4 transition hover:text-emerald-400">Support: pixelshift.hq@gmail.com</a>
          </div>
          
          <p className="mx-auto max-w-md text-[9px] leading-relaxed text-zinc-700 italic">
            Ghostwriter AI is a product of Pixelshift. Payments are processed securely via Razorpay under the legal name Rishi Varma. Digital access is provisioned within 24 hours of payment.
          </p>
        </footer>
      </div>
    </main>
  );
}