"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_DURATION_MS = 15_000;
const WARN_DURATION_MS = 12_000;

export type RecorderStatus =
  | "idle"
  | "requesting-permission"
  | "recording"
  | "recorded"
  | "playing";

export interface UseAudioRecorderReturn {
  status: RecorderStatus;
  audioBlob: Blob | null;
  mimeType: string | null;
  durationMs: number;
  error: string | null;
  nearLimit: boolean;
  reachedLimit: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  playRecording: () => void;
  stopPlayback: () => void;
  discardRecording: () => void;
}

function getSupportedMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus"))
    return "audio/webm;codecs=opus";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  return null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [reachedLimit, setReachedLimit] = useState(false);

  const nearLimit = status === "recording" && durationMs >= WARN_DURATION_MS;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const stopStreamTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreamTracks();
      clearTimer();
      revokeBlobUrl();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [stopStreamTracks, clearTimer, revokeBlobUrl]);

  const startRecording = useCallback(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Your browser does not support audio recording.");
      return;
    }

    const mime = getSupportedMimeType();
    if (!mime) {
      setError("Your browser does not support audio recording.");
      return;
    }

    setError(null);
    setStatus("requesting-permission");

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        chunksRef.current = [];

        const recorder = new MediaRecorder(stream, { mimeType: mime });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mime });
          setAudioBlob(blob);
          setMimeType(mime);
          setStatus("recorded");
          stopStreamTracks();
          clearTimer();
        };

        recorder.start();
        setStatus("recording");
        setDurationMs(0);
        setReachedLimit(false);

        const startTime = Date.now();
        timerRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          setDurationMs(elapsed);
          if (elapsed >= MAX_DURATION_MS && recorder.state === "recording") {
            recorder.stop();
            setReachedLimit(true);
          }
        }, 100);
      })
      .catch(() => {
        setError(
          "Microphone access was denied. Please allow microphone access and try again."
        );
        setStatus("idle");
      });
  }, [stopStreamTracks, clearTimer]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const playRecording = useCallback(() => {
    if (!audioBlob) return;

    revokeBlobUrl();
    const url = URL.createObjectURL(audioBlob);
    blobUrlRef.current = url;

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onended = () => {
      setStatus("recorded");
    };

    audio.play();
    setStatus("playing");
  }, [audioBlob, revokeBlobUrl]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setStatus("recorded");
  }, []);

  const discardRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    revokeBlobUrl();
    setAudioBlob(null);
    setMimeType(null);
    setDurationMs(0);
    setReachedLimit(false);
    setStatus("idle");
  }, [revokeBlobUrl]);

  return {
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
  };
}
