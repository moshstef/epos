import { beforeEach, describe, expect, it, vi } from "vitest";

const mockTranscribeFile = vi.fn();

vi.mock("@deepgram/sdk", () => ({
  createClient: () => ({
    listen: {
      prerecorded: {
        transcribeFile: mockTranscribeFile,
      },
    },
  }),
  isDeepgramError: (e: unknown) =>
    e instanceof Error && "__dgError" in (e as Record<string, unknown>),
}));

const { DeepgramSttService } = await import("./deepgram-stt-service");

function makeResponse(
  transcript: string,
  confidence: number,
  detectedLanguage?: string
) {
  return {
    result: {
      results: {
        channels: [
          {
            alternatives: [{ transcript, confidence }],
            detected_language: detectedLanguage,
          },
        ],
      },
    },
    error: null,
  };
}

describe("DeepgramSttService", () => {
  beforeEach(() => {
    mockTranscribeFile.mockReset();
  });

  it("throws if API key is missing", () => {
    expect(() => new DeepgramSttService("")).toThrow("Missing STT_API_KEY");
  });

  it("returns transcript and normalized transcript", async () => {
    mockTranscribeFile.mockResolvedValueOnce(
      makeResponse("Γεια σου, με λένε Μαρία", 0.95, "el")
    );

    const service = new DeepgramSttService("test-key");
    const result = await service.transcribe(Buffer.from("audio"), "audio/webm");

    expect(result.transcript).toBe("Γεια σου, με λένε Μαρία");
    expect(result.normalizedTranscript).toBe("γεια σου με λενε μαρια");
    expect(result.confidence).toBe(0.95);
    expect(result.languageCode).toBe("el");
  });

  it("returns empty transcript for silence", async () => {
    mockTranscribeFile.mockResolvedValueOnce(makeResponse("", 0.0, "el"));

    const service = new DeepgramSttService("test-key");
    const result = await service.transcribe(Buffer.from("audio"), "audio/webm");

    expect(result.transcript).toBe("");
    expect(result.normalizedTranscript).toBe("");
    expect(result.confidence).toBe(0.0);
  });

  it("defaults confidence to 0 when missing", async () => {
    mockTranscribeFile.mockResolvedValueOnce({
      result: {
        results: {
          channels: [
            {
              alternatives: [{ transcript: "test", confidence: undefined }],
            },
          ],
        },
      },
      error: null,
    });

    const service = new DeepgramSttService("test-key");
    const result = await service.transcribe(Buffer.from("audio"), "audio/webm");

    expect(result.confidence).toBe(0.0);
  });

  it('defaults languageCode to "el" when not detected', async () => {
    mockTranscribeFile.mockResolvedValueOnce(
      makeResponse("Γεια", 0.9, undefined)
    );

    const service = new DeepgramSttService("test-key");
    const result = await service.transcribe(Buffer.from("audio"), "audio/webm");

    expect(result.languageCode).toBe("el");
  });

  it("throws timeout error", async () => {
    mockTranscribeFile.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 20_000))
    );

    const service = new DeepgramSttService("test-key");

    await expect(
      service.transcribe(Buffer.from("audio"), "audio/webm")
    ).rejects.toThrow("timeout");
  }, 30_000);

  it("retries once on failure then succeeds", async () => {
    mockTranscribeFile
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(makeResponse("Γεια", 0.9, "el"));

    const service = new DeepgramSttService("test-key");
    const result = await service.transcribe(Buffer.from("audio"), "audio/webm");

    expect(result.transcript).toBe("Γεια");
    expect(mockTranscribeFile).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting retries", async () => {
    mockTranscribeFile
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"));

    const service = new DeepgramSttService("test-key");

    await expect(
      service.transcribe(Buffer.from("audio"), "audio/webm")
    ).rejects.toThrow("Network error");
    expect(mockTranscribeFile).toHaveBeenCalledTimes(2);
  });

  it("throws on Deepgram API error response", async () => {
    const dgError = Object.assign(new Error("Unauthorized"), {
      __dgError: true,
    });
    const errorResponse = { result: null, error: dgError };
    mockTranscribeFile
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(errorResponse);

    const service = new DeepgramSttService("test-key");

    await expect(
      service.transcribe(Buffer.from("audio"), "audio/webm")
    ).rejects.toThrow("Transcription failed");
  });
});
