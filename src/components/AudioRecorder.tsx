"use client";

import { useAudioRecorder } from "@/hooks/useAudioRecorder";

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
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled || status === "requesting-permission"}
            aria-label="Start recording"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {status === "requesting-permission" ? (
              <svg
                className="h-6 w-6 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {status === "requesting-permission"
              ? "Requesting microphone access..."
              : "Tap to start speaking"}
          </p>
        </>
      )}

      {status === "recording" && (
        <>
          <button
            type="button"
            onClick={stopRecording}
            aria-label="Stop recording"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
              {formatDuration(durationMs)}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Tap to stop
          </p>
        </>
      )}

      {(status === "recorded" || status === "playing") && (
        <>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={status === "playing" ? stopPlayback : playRecording}
              disabled={submitting}
              aria-label={
                status === "playing" ? "Stop playback" : "Play recording"
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
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
            </button>
            <button
              type="button"
              onClick={discardRecording}
              disabled={submitting}
              aria-label="Re-record"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
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
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              aria-label="Submit recording"
              className="flex h-10 items-center justify-center rounded-full bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Checking..." : "Submit"}
            </button>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {submitting
              ? "Processing your audio..."
              : "Listen back, re-record, or submit."}
          </p>
        </>
      )}

      {error && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          {error}
        </p>
      )}
    </div>
  );
}
