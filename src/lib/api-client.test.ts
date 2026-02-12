import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadAudio } from "./api-client";

describe("uploadAudio", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends audio as FormData and returns success response", async () => {
    const mockResponse = {
      ok: true,
      transcript: "Γεια σου",
      normalizedTranscript: "γεια σου",
      confidence: 0.95,
      languageCode: "el",
    };

    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const blob = new Blob(["audio-data"], { type: "audio/webm" });
    const result = await uploadAudio(blob, "audio/webm");

    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith("/api/stt/transcribe", {
      method: "POST",
      body: expect.any(FormData),
      signal: expect.any(AbortSignal),
    });
  });

  it("returns error response from STT API", async () => {
    const errorResponse = {
      ok: false,
      error: { code: "STT_FAILURE", message: "STT service failed" },
    };

    vi.mocked(fetch).mockResolvedValue({
      json: () => Promise.resolve(errorResponse),
    } as Response);

    const blob = new Blob(["audio-data"], { type: "audio/webm" });
    const result = await uploadAudio(blob, "audio/webm");

    expect(result).toEqual(errorResponse);
    expect(result.ok).toBe(false);
  });

  it("returns NETWORK_ERROR on fetch failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));

    const blob = new Blob(["audio-data"], { type: "audio/webm" });
    const result = await uploadAudio(blob, "audio/webm");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NETWORK_ERROR");
    }
  });

  it("returns STT_TIMEOUT on abort", async () => {
    vi.mocked(fetch).mockRejectedValue(
      new DOMException("The operation was aborted", "AbortError")
    );

    const blob = new Blob(["audio-data"], { type: "audio/webm" });
    const result = await uploadAudio(blob, "audio/webm");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("STT_TIMEOUT");
    }
  });
});
