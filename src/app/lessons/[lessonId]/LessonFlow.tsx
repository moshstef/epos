"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Lesson, Exercise } from "@/generated/prisma/client";
import { ExerciseCard } from "@/components/ExerciseCard";
import { Button, ProgressIndicator, Spinner } from "@/components/ui";
import { createSession, completeSession } from "../actions";

type LessonWithExercises = Lesson & { exercises: Exercise[] };

export default function LessonFlow({
  lesson,
}: {
  lesson: LessonWithExercises;
}) {
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
        <p className="mt-2 text-muted">
          Great work finishing &ldquo;{lesson.title}&rdquo;!
        </p>
        <Link href="/lessons">
          <Button size="lg" className="mt-6">
            Back to lessons
          </Button>
        </Link>
      </div>
    );
  }

  if (!sessionId || !exercise) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <Spinner size="sm" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <div className="mt-3">
          <ProgressIndicator
            current={currentIndex + 1}
            total={lesson.exercises.length}
          />
        </div>
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
