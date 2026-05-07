import Link from "next/link";

export default function Shipping() {
  return (
    <main className="min-h-screen bg-[#040706] px-6 py-12 text-zinc-100 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-300">
          &larr; Back to Ghostwriter
        </Link>
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Shipping & Delivery</h1>
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          <p>
            Ghostwriter AI is a Cloud-based Software as a Service (SaaS) application. 
          </p>
          <h2 className="text-xl font-semibold text-zinc-100">Digital Delivery</h2>
          <p>
            As a purely digital product, <strong>no physical shipping is involved.</strong>
          </p>
          <p>
            Upon successful payment processing via Razorpay, your Pro access is provisioned immediately. You will be redirected to create an account, which instantly unlocks unlimited generations. Delivery confirmation is provided via the email receipt from our payment gateway.
          </p>
        </div>
      </div>
    </main>
  );
}