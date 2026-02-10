"use client";

import { useState, useTransition } from "react";
import type { Exercise } from "@/generated/prisma/client";
import { submitAttempt } from "@/app/lessons/actions";
import type { AnalyzerResult } from "@/lib/analyzer";
import { AudioRecorder } from "./AudioRecorder";

export function ExerciseCard({
  exercise,
  sessionId,
  onComplete,
}: {
  exercise: Exercise;
  sessionId: string;
  onComplete: () => void;
}) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<AnalyzerResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [inputMode, setInputMode] = useState<"audio" | "text">("audio");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitAttempt({
        sessionId,
        exerciseId: exercise.id,
        userInput: input,
      });
      setFeedback(result);
      if (result.outcome === "pass") {
        setTimeout(() => {
          setInput("");
          setFeedback(null);
          onComplete();
        }, 1200);
      }
    });
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-700">
      <p className="text-lg font-medium">{exercise.prompt}</p>

      <div className="mt-4">
        {inputMode === "audio" ? (
          <AudioRecorder disabled={feedback?.outcome === "pass"} />
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer..."
              disabled={isPending || feedback?.outcome === "pass"}
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800"
            />
            <button
              type="submit"
              disabled={
                isPending || !input.trim() || feedback?.outcome === "pass"
              }
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {isPending ? "Checking..." : "Submit"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => setInputMode(inputMode === "audio" ? "text" : "audio")}
          className="mt-3 text-sm text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {inputMode === "audio" ? "Type instead" : "Speak instead"}
        </button>
      </div>

      {feedback && (
        <div
          className={`mt-3 rounded-md px-3 py-2 text-sm ${
            feedback.outcome === "pass"
              ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
          }`}
        >
          {feedback.outcome === "pass" ? "Great job!" : feedback.reason}
        </div>
      )}
    </div>
  );
}
