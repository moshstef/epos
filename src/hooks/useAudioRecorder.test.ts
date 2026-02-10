import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAudioRecorder } from "./useAudioRecorder";

// --- Mocks ---

let mockOnDataAvailable: ((e: { data: Blob }) => void) | null = null;
let mockOnStop: (() => void) | null = null;
let mockRecorderState = "inactive";

const mockStop = vi.fn(function () {
  mockRecorderState = "inactive";
  mockOnStop?.();
});

const mockStart = vi.fn(function () {
  mockRecorderState = "recording";
});

const mockTrackStop = vi.fn();

const MockMediaRecorder = vi.fn(function () {
  const instance = {
    start: mockStart,
    stop: mockStop,
    get state() {
      return mockRecorderState;
    },
    set ondataavailable(fn: (e: { data: Blob }) => void) {
      mockOnDataAvailable = fn;
    },
    set onstop(fn: () => void) {
      mockOnStop = fn;
    },
  };
  return instance;
});

(
  MockMediaRecorder as unknown as { isTypeSupported: (t: string) => boolean }
).isTypeSupported = () => true;

const mockGetUserMedia = vi.fn();

function setupBrowserMocks() {
  vi.stubGlobal("MediaRecorder", MockMediaRecorder);
  vi.stubGlobal("navigator", {
    mediaDevices: {
      getUserMedia: mockGetUserMedia,
    },
  });
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:mock-url"),
    revokeObjectURL: vi.fn(),
  });

  mockGetUserMedia.mockResolvedValue({
    getTracks: () => [{ stop: mockTrackStop }],
  });
}

async function flushPromises() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

describe("useAudioRecorder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setupBrowserMocks();
    mockRecorderState = "inactive";
    mockOnDataAvailable = null;
    mockOnStop = null;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts in idle state", () => {
    const { result } = renderHook(() => useAudioRecorder());
    expect(result.current.status).toBe("idle");
    expect(result.current.audioBlob).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("transitions to recording after permission granted", async () => {
    const { result } = renderHook(() => useAudioRecorder());

    act(() => {
      result.current.startRecording();
    });

    expect(result.current.status).toBe("requesting-permission");

    await flushPromises();

    expect(result.current.status).toBe("recording");
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  it("sets error on permission denied", async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error("NotAllowedError"));

    const { result } = renderHook(() => useAudioRecorder());

    act(() => {
      result.current.startRecording();
    });

    await flushPromises();

    expect(result.current.status).toBe("idle");
    expect(result.current.error).toContain("Microphone access was denied");
  });

  it("sets error when mediaDevices is unavailable", () => {
    vi.stubGlobal("navigator", {});

    const { result } = renderHook(() => useAudioRecorder());

    act(() => {
      result.current.startRecording();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.error).toContain("does not support audio recording");
  });

  it("produces blob on stop and transitions to recorded", async () => {
    const { result } = renderHook(() => useAudioRecorder());

    act(() => {
      result.current.startRecording();
    });
    await flushPromises();

    // Simulate data chunk
    act(() => {
      mockOnDataAvailable?.({ data: new Blob(["audio-data"]) });
    });

    // Stop recording
    act(() => {
      result.current.stopRecording();
    });

    expect(result.current.status).toBe("recorded");
    expect(result.current.audioBlob).toBeInstanceOf(Blob);
  });

  it("discards recording and returns to idle", async () => {
    const { result } = renderHook(() => useAudioRecorder());

    act(() => {
      result.current.startRecording();
    });
    await flushPromises();

    act(() => {
      mockOnDataAvailable?.({ data: new Blob(["audio-data"]) });
      result.current.stopRecording();
    });

    act(() => {
      result.current.discardRecording();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.audioBlob).toBeNull();
  });

  it("increments duration during recording", async () => {
    const { result } = renderHook(() => useAudioRecorder());

    act(() => {
      result.current.startRecording();
    });
    await flushPromises();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.durationMs).toBeGreaterThanOrEqual(400);
  });

  it("stops stream tracks on unmount", async () => {
    const { result, unmount } = renderHook(() => useAudioRecorder());

    act(() => {
      result.current.startRecording();
    });
    await flushPromises();

    unmount();

    expect(mockTrackStop).toHaveBeenCalled();
  });
});
