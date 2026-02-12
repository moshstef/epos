"use client";

import { useState, useTransition } from "react";
import type { Exercise } from "@/generated/prisma/client";
import { submitAttempt } from "@/app/lessons/actions";
import { uploadAudio } from "@/lib/api-client";
import type { AnalyzerResult } from "@/lib/analyzer";
import { Button, Card, FeedbackBanner } from "@/components/ui";
import { AudioRecorder } from "./AudioRecorder";
import { AudioPlayer } from "./AudioPlayer";

export function ExerciseCard({
  exercise,
  sessionId,
  autoPlayPrompt = false,
  onNext,
}: {
  exercise: Exercise;
  sessionId: string;
  autoPlayPrompt?: boolean;
  onNext: () => void;
}) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<AnalyzerResult | null>(null);
  const [sttError, setSttError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSubmittingAudio, setIsSubmittingAudio] = useState(false);
  const [inputMode, setInputMode] = useState<"audio" | "text">("audio");
  const [showHint, setShowHint] = useState(false);

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
    } catch {
      setSttError("Something went wrong. Please try again.");
    } finally {
      setIsSubmittingAudio(false);
    }
  }

  return (
    <Card>
      <div className="flex items-start gap-2">
        <AudioPlayer
          text={exercise.expectedPhrase}
          lang="el-GR"
          autoPlay={autoPlayPrompt}
        />
        <p className="text-lg font-medium">{exercise.prompt}</p>
      </div>

      {showHint && (
        <div className="mt-2 flex items-center gap-2">
          <AudioPlayer text={exercise.expectedPhrase} lang="el-GR" />
          <p className="text-sm text-muted italic">{exercise.expectedPhrase}</p>
        </div>
      )}

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

        <div className="mt-3 flex items-center gap-3">
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
          >
            {inputMode === "audio" ? "Type instead" : "Speak instead"}
          </Button>
          {!showHint && !isLocked && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setShowHint(true)}
            >
              Show hint
            </Button>
          )}
        </div>
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

      {isLocked && (
        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={onNext}>
            Next
          </Button>
        </div>
      )}
    </Card>
  );
}
