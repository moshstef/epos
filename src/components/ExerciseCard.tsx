"use client";

import { useState, useTransition } from "react";
import type { Exercise } from "@/generated/prisma/client";
import { submitAttempt } from "@/app/lessons/actions";
import { uploadAudio } from "@/lib/api-client";
import type { AnalyzerResult } from "@/lib/analyzer";
import { Button, Card, FeedbackBanner } from "@/components/ui";
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
    <Card>
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
              className="flex-1 rounded-md border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:bg-zinc-800"
            />
            <Button
              type="submit"
              disabled={isPending || !input.trim() || isLocked}
            >
              {isPending ? "Checking..." : "Submit"}
            </Button>
          </form>
        )}

        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => {
            setInputMode(inputMode === "audio" ? "text" : "audio");
            setFeedback(null);
            setSttError(null);
          }}
          disabled={isSubmittingAudio || isPending}
          className="mt-3"
        >
          {inputMode === "audio" ? "Type instead" : "Speak instead"}
        </Button>
      </div>

      {sttError && (
        <div className="mt-3">
          <FeedbackBanner variant="retry">{sttError}</FeedbackBanner>
        </div>
      )}

      {feedback && (
        <div className="mt-3">
          <FeedbackBanner
            variant={feedback.outcome === "pass" ? "pass" : "retry"}
          >
            {feedback.outcome === "pass" ? "Great job!" : feedback.reason}
          </FeedbackBanner>
        </div>
      )}
    </Card>
  );
}
