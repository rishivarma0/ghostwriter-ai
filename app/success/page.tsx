"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function SuccessPage() {
  useEffect(() => {
    // Trigger a premium gold/emerald confetti blast
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#34d399', '#ffffff'] });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#34d399', '#10b981'] });
    }, 250);
  }, []);

  return (
    <main className="min-h-screen bg-[#040706] text-zinc-100 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <span className="text-4xl">💎</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Welcome to the <span className="text-emerald-400">Founder Circle</span>
        </h1>
        
        <p className="text-zinc-400 text-lg mb-12 leading-relaxed">
          Your payment was successful. The 3-post limit has been lifted, and your account now has 
          <strong> Priority AI </strong> access. It's time to build your brand.
        </p>

        {/* Next Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left">
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30">
            <p className="text-emerald-400 font-bold text-sm mb-1">⚡ Unlimited Generations</p>
            <p className="text-xs text-zinc-500">Write as many posts as you want, whenever you want.</p>
          </div>
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/30">
            <p className="text-emerald-400 font-bold text-sm mb-1">🖋️ Custom Brand Voice</p>
            <p className="text-xs text-zinc-500">Early access to our upcoming "Style Mimic" feature.</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <Link href="/">
            <button className="px-12 py-4 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_10px_40px_rgba(52,211,153,0.2)]">
              Start Writing Now
            </button>
          </Link>
          
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            Transaction ID: {Math.random().toString(36).substring(2, 12).toUpperCase()}
          </p>
        </div>
      </div>
    </main>
  );
}