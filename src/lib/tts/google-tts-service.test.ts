// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleTtsService } from "./google-tts-service";

const FAKE_AUDIO_BASE64 = Buffer.from("fake-mp3-audio").toString("base64");

describe("GoogleTtsService", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("throws when API key is empty", () => {
    expect(() => new GoogleTtsService("")).toThrow(
      "Google TTS API key is required"
    );
  });

  it("returns audio buffer on successful synthesis", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ audioContent: FAKE_AUDIO_BASE64 }),
    }) as unknown as typeof fetch;

    const service = new GoogleTtsService("test-key");
    const result = await service.synthesize("Γεια σου", "el-GR");

    expect(result.audioContent).toBeInstanceOf(Buffer);
    expect(result.audioContent.toString()).toBe("fake-mp3-audio");
  });

  it("sends correct request body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ audioContent: FAKE_AUDIO_BASE64 }),
    });
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    const service = new GoogleTtsService("test-key");
    await service.synthesize("Γεια", "el-GR");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("key=test-key");

    const body = JSON.parse(options.body);
    expect(body.input.text).toBe("Γεια");
    expect(body.voice.languageCode).toBe("el-GR");
    expect(body.voice.name).toBe("el-GR-Wavenet-A");
    expect(body.audioConfig.speakingRate).toBe(0.9);
  });

  it("throws on Google API error response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve("Bad Request"),
    }) as unknown as typeof fetch;

    const service = new GoogleTtsService("test-key");
    await expect(service.synthesize("test", "el-GR")).rejects.toThrow(
      "Google TTS API error (400): Bad Request"
    );
  });

  it("throws timeout error on abort", async () => {
    globalThis.fetch = vi.fn().mockImplementation(() => {
      const error = new Error("The operation was aborted");
      error.name = "AbortError";
      return Promise.reject(error);
    }) as unknown as typeof fetch;

    const service = new GoogleTtsService("test-key");
    await expect(service.synthesize("test", "el-GR")).rejects.toThrow(
      "Google TTS request timeout"
    );
  });

  it("propagates non-abort errors", async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(
        new Error("Network failure")
      ) as unknown as typeof fetch;

    const service = new GoogleTtsService("test-key");
    await expect(service.synthesize("test", "el-GR")).rejects.toThrow(
      "Network failure"
    );
  });
});
