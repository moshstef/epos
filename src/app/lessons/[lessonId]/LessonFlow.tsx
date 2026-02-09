"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Lesson, Exercise } from "@/generated/prisma/client";
import { ExerciseCard } from "@/components/ExerciseCard";
import { createSession, completeSession } from "../actions";

type LessonWithExercises = Lesson & { exercises: Exercise[] };

export default function LessonFlow({ lesson }: { lesson: LessonWithExercises }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const sessionCreated = useRef(false);

  useEffect(() => {
    if (sessionCreated.current) return;
    sessionCreated.current = true;
    createSession(lesson.id).then(setSessionId);
  }, [lesson.id]);

  const exercise = lesson.exercises[currentIndex];

  async function handleExerciseComplete() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= lesson.exercises.length) {
      if (sessionId) {
        await completeSession(sessionId);
      }
      setCompleted(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  }

  if (completed) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold">Lesson Complete!</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Great work finishing &ldquo;{lesson.title}&rdquo;!
        </p>
        <Link
          href="/lessons"
          className="mt-6 inline-block rounded-lg bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Back to lessons
        </Link>
      </div>
    );
  }

  if (!sessionId || !exercise) {
    return <p className="text-zinc-500">Loading...</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Exercise {currentIndex + 1} of {lesson.exercises.length}
        </p>
      </div>
      <ExerciseCard
        key={exercise.id}
        exercise={exercise}
        sessionId={sessionId}
        onComplete={handleExerciseComplete}
      />
    </div>
  );
}
