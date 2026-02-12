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

  it("shows playback, re-record, and submit controls when recorded", () => {
    hookReturn = {
      ...hookReturn,
      status: "recorded",
      audioBlob: new Blob(["data"]),
      mimeType: "audio/webm",
    };

    render(<AudioRecorder />);
    expect(screen.getByLabelText("Play recording")).toBeInTheDocument();
    expect(screen.getByLabelText("Re-record")).toBeInTheDocument();
    expect(screen.getByLabelText("Submit recording")).toBeInTheDocument();
    expect(
      screen.getByText("Listen back, re-record, or submit.")
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

  it("calls onSubmit when submit button clicked", async () => {
    const onSubmit = vi.fn();
    const blob = new Blob(["data"]);
    const user = userEvent.setup();

    hookReturn = {
      ...hookReturn,
      status: "recorded",
      audioBlob: blob,
      mimeType: "audio/webm",
    };

    render(<AudioRecorder onSubmit={onSubmit} />);
    await user.click(screen.getByLabelText("Submit recording"));
    expect(onSubmit).toHaveBeenCalledWith(blob, "audio/webm");
  });

  it("respects disabled prop", () => {
    render(<AudioRecorder disabled />);
    expect(screen.getByLabelText("Start recording")).toBeDisabled();
  });

  it("disables controls when submitting", () => {
    hookReturn = {
      ...hookReturn,
      status: "recorded",
      audioBlob: new Blob(["data"]),
      mimeType: "audio/webm",
    };

    render(<AudioRecorder submitting />);
    expect(screen.getByLabelText("Play recording")).toBeDisabled();
    expect(screen.getByLabelText("Re-record")).toBeDisabled();
    expect(screen.getByLabelText("Submit recording")).toBeDisabled();
    expect(screen.getByText("Checking...")).toBeInTheDocument();
    expect(screen.getByText("Processing your audio...")).toBeInTheDocument();
  });
});
