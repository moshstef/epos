"use client";

import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Button, Spinner, FeedbackBanner } from "@/components/ui";

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function AudioRecorder({
  onSubmit,
  disabled = false,
  submitting = false,
}: {
  onSubmit?: (blob: Blob, mimeType: string) => void;
  disabled?: boolean;
  submitting?: boolean;
}) {
  const {
    status,
    audioBlob,
    mimeType,
    durationMs,
    error,
    nearLimit,
    reachedLimit,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    discardRecording,
  } = useAudioRecorder();

  function handleSubmit() {
    if (audioBlob && mimeType) {
      onSubmit?.(audioBlob, mimeType);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main action button */}
      {(status === "idle" || status === "requesting-permission") && (
        <>
          <Button
            variant="icon"
            size="icon-lg"
            type="button"
            onClick={startRecording}
            disabled={disabled || status === "requesting-permission"}
            aria-label="Start recording"
          >
            {status === "requesting-permission" ? (
              <Spinner size="md" />
            ) : (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </Button>
          <p className="text-sm text-muted">
            {status === "requesting-permission"
              ? "Requesting microphone access..."
              : "Tap to start speaking"}
          </p>
        </>
      )}

      {status === "recording" && (
        <>
          <Button
            variant="danger"
            size="icon-lg"
            type="button"
            onClick={stopRecording}
            aria-label="Stop recording"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </Button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span
              className={`text-sm font-medium tabular-nums ${nearLimit ? "text-retry-text dark:text-amber-400" : "text-zinc-700 dark:text-zinc-300"}`}
            >
              {formatDuration(durationMs)}
            </span>
          </div>
          <p className="text-sm text-muted">
            {nearLimit ? "Finishing soon..." : "Tap to stop"}
          </p>
        </>
      )}

      {(status === "recorded" || status === "playing") && (
        <>
          <div className="flex items-center gap-3">
            <Button
              variant="icon"
              size="icon"
              type="button"
              onClick={status === "playing" ? stopPlayback : playRecording}
              disabled={submitting}
              aria-label={
                status === "playing" ? "Stop playback" : "Play recording"
              }
            >
              {status === "playing" ? (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </Button>
            <Button
              variant="icon-outline"
              size="icon"
              type="button"
              onClick={discardRecording}
              disabled={submitting}
              aria-label="Re-record"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 4v6h6" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </Button>
            <Button
              variant="success"
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              aria-label="Submit recording"
              className="px-4"
            >
              {submitting ? "Checking..." : "Submit"}
            </Button>
          </div>
          <p className="text-sm text-muted">
            {submitting
              ? "Processing your audio..."
              : "Listen back, re-record, or submit."}
          </p>
        </>
      )}

      {reachedLimit && (
        <p className="text-sm text-retry-text dark:text-amber-400">
          Maximum recording length reached.
        </p>
      )}

      {error && <FeedbackBanner variant="retry">{error}</FeedbackBanner>}
    </div>
  );
}
