export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-zinc-300">
      <a href="/" className="text-emerald-400 hover:underline mb-8 block">&larr; Back to Home</a>
      <h1 className="text-3xl font-bold text-zinc-100 mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-sm leading-relaxed">
        <p>Last updated: May 14, 2026</p>
        <p>We respect your privacy and are committed to protecting your personal data.</p>
        <h2 className="text-xl font-semibold text-zinc-100 mt-6">Data Collection</h2>
        <p>We collect your email address and profile information via standard secure authentication (Clerk). Payment information is securely handled by our payment partner (Razorpay). We do not store your credit card details on our servers.</p>
        <h2 className="text-xl font-semibold text-zinc-100 mt-6">Usage of Data</h2>
        <p>Your AI prompts may be temporarily processed to generate your content but are not sold to third parties.</p>
      </div>
    </main>
  );
}