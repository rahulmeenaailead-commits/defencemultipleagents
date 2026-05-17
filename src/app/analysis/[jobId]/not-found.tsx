import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-100">Job not found</h1>
      <p className="text-sm text-slate-400">
        This job is no longer in memory — the server probably restarted. Re-run from the landing page.
      </p>
      <Link
        href="/"
        className="rounded-md border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-sm text-sky-200 hover:bg-sky-500/20"
      >
        ← Back to upload
      </Link>
    </main>
  );
}
