export default function Contact() {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-zinc-300">
        <a href="/" className="mb-8 block text-emerald-400 hover:underline">&larr; Back to Home</a>
        <h1 className="mb-6 text-3xl font-bold text-zinc-100">Contact Us</h1>
        <div className="space-y-4 text-sm leading-relaxed">
          <p>If you have any questions about payments, subscriptions, or technical support, please reach out to us:</p>
          <div className="mt-6 rounded-lg border border-zinc-800 bg-[#090d0b] p-6">
            <p><strong className="text-zinc-100">Email:</strong> pixelshift.hq@gmail.com</p>
            <p className="mt-2"><strong className="text-zinc-100">Address:</strong> Vijayawada, Andhra Pradesh, India</p>
          </div>
        </div>
      </main>
    );
  }