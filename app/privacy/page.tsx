import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#040706] px-6 py-12 text-zinc-100 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-300">
          &larr; Back to Ghostwriter
        </Link>
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>
            At Ghostwriter AI (a Pixelshift project), we prioritize your privacy. This policy outlines how we handle your data when you use our services.
          </p>
          <h2 className="text-xl font-semibold text-zinc-100">1. Data Collection</h2>
          <p>
            We collect basic account information (like your email address) when you sign up for a Pro account. We do not sell your personal data to third parties.
          </p>
          <h2 className="text-xl font-semibold text-zinc-100">2. AI Processing</h2>
          <p>
            The text prompts you submit are sent securely via API to Groq Cloud for processing. We do not permanently store your raw brain-dumps in our database after the session ends.
          </p>
          <h2 className="text-xl font-semibold text-zinc-100">3. Contact</h2>
          <p>
            For any privacy-related questions, contact us at <a href="mailto:pixelshift.hq@gmail.com" className="text-emerald-400">pixelshift.hq@gmail.com</a>.
          </p>
        </div>
      </div>
    </main>
  );
}