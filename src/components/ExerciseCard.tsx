"use client";

import { useState, useTransition } from "react";
import type { Exercise } from "@/generated/prisma/client";
import { submitAttempt } from "@/app/lessons/actions";
import { uploadAudio } from "@/lib/api-client";
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
  const [sttError, setSttError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSubmittingAudio, setIsSubmittingAudio] = useState(false);
  const [inputMode, setInputMode] = useState<"audio" | "text">("audio");

  const isLocked = feedback?.outcome === "pass";

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitAttempt({
        sessionId,
        exerciseId: exercise.id,
        transcript: input,
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

  async function handleAudioSubmit(blob: Blob, mimeType: string) {
    setIsSubmittingAudio(true);
    setSttError(null);
    setFeedback(null);

    try {
      const sttResponse = await uploadAudio(blob, mimeType);

      if (!sttResponse.ok) {
        const messages: Record<string, string> = {
          RATE_LIMIT_EXCEEDED:
            "You're going a bit fast! Please wait a moment before trying again.",
          AUDIO_TOO_SHORT:
            "We couldn't hear anything. Please try recording again.",
          REQUEST_TOO_LARGE:
            "Your audio file is too large. Please try a shorter recording.",
        };
        setSttError(
          messages[sttResponse.error.code] ??
            "We couldn't process your audio. Please try again."
        );
        return;
      }

      const result = await submitAttempt({
        sessionId,
        exerciseId: exercise.id,
        transcript: sttResponse.transcript,
        normalizedTranscript: sttResponse.normalizedTranscript,
        confidence: sttResponse.confidence,
      });

      setFeedback(result);
      if (result.outcome === "pass") {
        setTimeout(() => {
          setFeedback(null);
          onComplete();
        }, 1200);
      }
    } catch {
      setSttError("Something went wrong. Please try again.");
    } finally {
      setIsSubmittingAudio(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-700">
      <p className="text-lg font-medium">{exercise.prompt}</p>

      <div className="mt-4">
        {inputMode === "audio" ? (
          <AudioRecorder
            onSubmit={handleAudioSubmit}
            disabled={isLocked}
            submitting={isSubmittingAudio}
          />
        ) : (
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer..."
              disabled={isPending || isLocked}
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800"
            />
            <button
              type="submit"
              disabled={isPending || !input.trim() || isLocked}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {isPending ? "Checking..." : "Submit"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setInputMode(inputMode === "audio" ? "text" : "audio");
            setFeedback(null);
            setSttError(null);
          }}
          disabled={isSubmittingAudio || isPending}
          className="mt-3 text-sm text-zinc-500 underline hover:text-zinc-700 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {inputMode === "audio" ? "Type instead" : "Speak instead"}
        </button>
      </div>

      {sttError && (
        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          {sttError}
        </div>
      )}

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
