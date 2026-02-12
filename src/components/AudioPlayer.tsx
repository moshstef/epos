"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Spinner } from "@/components/ui";

type AudioPlayerStatus = "idle" | "loading" | "ready" | "playing" | "error";

export function AudioPlayer({
  text,
  lang = "el-GR",
  autoPlay = false,
}: {
  text: string;
  lang?: string;
  autoPlay?: boolean;
}) {
  const [status, setStatus] = useState<AudioPlayerStatus>(
    autoPlay ? "loading" : "idle"
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const fetchAndPlay = useCallback(async () => {
    if (!mountedRef.current) return;
    setStatus("loading");
    try {
      const params = new URLSearchParams({ text, lang });
      const response = await fetch(`/api/tts/synthesize?${params}`);

      if (!response.ok || !mountedRef.current) {
        if (mountedRef.current) setStatus("error");
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = objectUrl;

      const audio = new Audio(objectUrl);
      audio.addEventListener("ended", () => {
        if (mountedRef.current) setStatus("ready");
      });
      audio.addEventListener("error", () => {
        if (mountedRef.current) setStatus("error");
      });
      audioRef.current = audio;

      await audio.play();
      if (mountedRef.current) setStatus("playing");
    } catch {
      if (mountedRef.current) setStatus("error");
    }
  }, [text, lang]);

  // Auto-play on mount
  useEffect(() => {
    if (autoPlay) {
      fetchAndPlay();
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick() {
    if (status === "playing" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setStatus("ready");
      return;
    }

    if (status === "ready" && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(
        () => setStatus("playing"),
        () => setStatus("error")
      );
      return;
    }

    fetchAndPlay();
  }

  if (status === "error") {
    // Graceful degradation — hide button, text is always visible
    return null;
  }

  return (
    <Button
      variant="icon-outline"
      size="icon"
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      aria-label={status === "playing" ? "Stop audio" : "Play audio"}
    >
      {status === "loading" ? (
        <Spinner size="sm" />
      ) : status === "playing" ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      )}
    </Button>
  );
}
