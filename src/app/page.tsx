import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">EPOS</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Greek language tutor — speaking practice with supportive feedback
        </p>
        <Link
          href="/lessons"
          className="mt-2 rounded-lg bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Start Learning
        </Link>
      </main>
    </div>
  );
}
