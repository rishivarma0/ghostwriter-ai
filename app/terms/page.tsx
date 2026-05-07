import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-[#040706] px-6 py-12 text-zinc-100 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-300">
          &larr; Back to Ghostwriter
        </Link>
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Terms of Service</h1>
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>
            By accessing or using Ghostwriter AI, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.
          </p>
          <h2 className="text-xl font-semibold text-zinc-100">1. Service Usage</h2>
          <p>
            Ghostwriter AI provides AI-assisted content generation. You are solely responsible for the final content you publish to LinkedIn or any other platform. We are not liable for any professional or social consequences resulting from generated content.
          </p>
          <h2 className="text-xl font-semibold text-zinc-100">2. Subscriptions</h2>
          <p>
            Pro access is billed as a subscription via Razorpay. You may cancel at any time, but you will retain access until the end of your current billing cycle.
          </p>
          <h2 className="text-xl font-semibold text-zinc-100">3. Legal Entity</h2>
          <p>
            Ghostwriter AI is a product of Pixelshift. Payments are processed under the legal entity of Rishi Varma.
          </p>
        </div>
      </div>
    </main>
  );
}