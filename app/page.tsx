import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-display text-5xl">Your Business in a Link</h1>
      <p className="mt-3 text-zinc-600">One beautiful booking link for real-world service businesses.</p>
      <div className="mt-8 flex gap-3">
        <Link className="rounded-2xl bg-black px-5 py-3 text-white" href="/studio-eleven">View Demo Link</Link>
        <Link className="rounded-2xl border px-5 py-3" href="/dashboard">Owner Dashboard</Link>
      </div>
    </main>
  );
}
