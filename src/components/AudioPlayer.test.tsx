import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioPlayer } from "./AudioPlayer";

// Mock Audio constructor
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockPause = vi.fn();
const mockAddEventListener = vi.fn();

class MockAudio {
  currentTime = 0;
  play = mockPlay;
  pause = mockPause;
  addEventListener = mockAddEventListener;
}

vi.stubGlobal("Audio", MockAudio);

// Mock URL.createObjectURL / revokeObjectURL
vi.stubGlobal("URL", {
  ...globalThis.URL,
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
});

describe("AudioPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["audio-data"])),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    cleanup();
  });

  it("renders a play button", () => {
    render(<AudioPlayer text="Γεια σου" />);
    expect(screen.getByLabelText("Play audio")).toBeInTheDocument();
  });

  it("fetches audio and plays on click", async () => {
    const user = userEvent.setup();
    render(<AudioPlayer text="Γεια σου" lang="el-GR" />);

    await user.click(screen.getByLabelText("Play audio"));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/tts/synthesize?")
    );
    expect(mockPlay).toHaveBeenCalled();
  });

  it("returns null on fetch error (graceful degradation)", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    const { container } = render(<AudioPlayer text="Γεια σου" />);

    await user.click(screen.getByLabelText("Play audio"));

    // After error, component returns null
    expect(container.innerHTML).toBe("");
  });

  it("returns null on play error (graceful degradation)", async () => {
    mockPlay.mockRejectedValueOnce(new Error("NotAllowedError"));

    const user = userEvent.setup();
    const { container } = render(<AudioPlayer text="Γεια σου" />);

    await user.click(screen.getByLabelText("Play audio"));

    expect(container.innerHTML).toBe("");
  });
});
