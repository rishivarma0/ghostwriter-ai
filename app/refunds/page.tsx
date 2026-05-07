import Link from "next/link";

export default function Refunds() {
  return (
    <main className="min-h-screen bg-[#040706] px-6 py-12 text-zinc-100 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-300">
          &larr; Back to Ghostwriter
        </Link>
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Refund & Cancellation Policy</h1>
        <div className="space-y-6 text-sm leading-relaxed text-zinc-400">
          <h2 className="text-xl font-semibold text-zinc-100">Cancellations</h2>
          <p>
            You may cancel your Ghostwriter Pro subscription at any time. Your cancellation will take effect at the end of the current paid term, and you will not be charged again.
          </p>
          <h2 className="text-xl font-semibold text-zinc-100">Refunds</h2>
          <p>
            Because Ghostwriter AI provides an immediate, non-tangible digital service that incurs hard server/API costs upon usage, <strong>we do not offer refunds</strong> once the service has been used.
          </p>
          <p>
            Exceptions are only made in the event of double-charging or severe technical failures preventing service access. For support, please contact <a href="mailto:pixelshift.hq@gmail.com" className="text-emerald-400">pixelshift.hq@gmail.com</a> within 7 days of your transaction.
          </p>
        </div>
      </div>
    </main>
  );
}