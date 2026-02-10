import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioRecorder } from "./AudioRecorder";
import type { UseAudioRecorderReturn } from "@/hooks/useAudioRecorder";

const defaultMock: UseAudioRecorderReturn = {
  status: "idle",
  audioBlob: null,
  mimeType: null,
  durationMs: 0,
  error: null,
  startRecording: vi.fn(),
  stopRecording: vi.fn(),
  playRecording: vi.fn(),
  stopPlayback: vi.fn(),
  discardRecording: vi.fn(),
};

let hookReturn: UseAudioRecorderReturn;

vi.mock("@/hooks/useAudioRecorder", () => ({
  useAudioRecorder: () => hookReturn,
}));

describe("AudioRecorder", () => {
  beforeEach(() => {
    hookReturn = {
      ...defaultMock,
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      playRecording: vi.fn(),
      stopPlayback: vi.fn(),
      discardRecording: vi.fn(),
    };
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders mic button in idle state", () => {
    render(<AudioRecorder />);
    expect(screen.getByLabelText("Start recording")).toBeInTheDocument();
    expect(screen.getByText("Tap to start speaking")).toBeInTheDocument();
  });

  it("calls startRecording when mic button clicked", async () => {
    const user = userEvent.setup();
    render(<AudioRecorder />);
    await user.click(screen.getByLabelText("Start recording"));
    expect(hookReturn.startRecording).toHaveBeenCalled();
  });

  it("shows requesting permission state", () => {
    hookReturn = { ...hookReturn, status: "requesting-permission" };

    render(<AudioRecorder />);
    expect(
      screen.getByText("Requesting microphone access...")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Start recording")).toBeDisabled();
  });

  it("shows recording indicator when recording", () => {
    hookReturn = { ...hookReturn, status: "recording", durationMs: 3000 };

    render(<AudioRecorder />);
    expect(screen.getByLabelText("Stop recording")).toBeInTheDocument();
    expect(screen.getByText("0:03")).toBeInTheDocument();
    expect(screen.getByText("Tap to stop")).toBeInTheDocument();
  });

  it("shows playback and re-record controls when recorded", () => {
    hookReturn = {
      ...hookReturn,
      status: "recorded",
      audioBlob: new Blob(["data"]),
      mimeType: "audio/webm",
    };

    render(<AudioRecorder />);
    expect(screen.getByLabelText("Play recording")).toBeInTheDocument();
    expect(screen.getByLabelText("Re-record")).toBeInTheDocument();
    expect(
      screen.getByText("Ready! Listen back or try again.")
    ).toBeInTheDocument();
  });

  it("shows stop playback button when playing", () => {
    hookReturn = {
      ...hookReturn,
      status: "playing",
      audioBlob: new Blob(["data"]),
      mimeType: "audio/webm",
    };

    render(<AudioRecorder />);
    expect(screen.getByLabelText("Stop playback")).toBeInTheDocument();
  });

  it("shows error message on permission denial", () => {
    hookReturn = {
      ...hookReturn,
      error: "Microphone access was denied.",
    };

    render(<AudioRecorder />);
    expect(
      screen.getByText("Microphone access was denied.")
    ).toBeInTheDocument();
  });

  it("calls onBlobReady when recording completes", () => {
    const onBlobReady = vi.fn();
    const blob = new Blob(["data"]);

    hookReturn = {
      ...hookReturn,
      status: "recorded",
      audioBlob: blob,
      mimeType: "audio/webm",
    };

    render(<AudioRecorder onBlobReady={onBlobReady} />);
    expect(onBlobReady).toHaveBeenCalledWith(blob, "audio/webm");
  });

  it("respects disabled prop", () => {
    render(<AudioRecorder disabled />);
    expect(screen.getByLabelText("Start recording")).toBeDisabled();
  });
});
