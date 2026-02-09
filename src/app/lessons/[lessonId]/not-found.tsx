import Link from "next/link";

export default function LessonNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Lesson not found</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          The lesson you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/lessons"
          className="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400"
        >
          Back to lessons
        </Link>
      </div>
    </div>
  );
}
