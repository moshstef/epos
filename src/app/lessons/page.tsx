import Link from "next/link";
import { getLessons } from "./actions";

export default async function LessonsPage() {
  const lessons = await getLessons();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Lessons</h1>
      {lessons.length === 0 ? (
        <p className="text-zinc-500">No lessons available yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              className="rounded-lg border border-zinc-200 p-6 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/50"
            >
              <h2 className="text-xl font-semibold">{lesson.title}</h2>
              {lesson.description && (
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                  {lesson.description}
                </p>
              )}
              <p className="mt-2 text-sm text-zinc-500">
                {lesson.exercises.length} exercise
                {lesson.exercises.length !== 1 && "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
