// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SttErrorCode } from "@/lib/stt";

// Mock the stt module to control service behavior in tests
const mockTranscribe = vi.fn();
vi.mock("@/lib/stt", async () => {
  const actual = await vi.importActual<typeof import("@/lib/stt")>("@/lib/stt");
  return {
    ...actual,
    createSttService: () => ({ transcribe: mockTranscribe }),
  };
});

// Mock the rate limiter
const mockCheck = vi.fn().mockReturnValue({ allowed: true });
vi.mock("@/lib/rate-limiter", () => ({
  getRateLimiter: () => ({ check: mockCheck }),
  getClientIp: () => "127.0.0.1",
}));

// Import after mock setup
const { POST } = await import("./route");

function createMultipartRequest(
  audioContent: Uint8Array | null,
  mimeType = "audio/webm",
  fieldName = "audio"
): Request {
  const formData = new FormData();
  if (audioContent !== null) {
    const blob = new Blob([audioContent], { type: mimeType });
    formData.append(fieldName, blob, "recording.webm");
  }
  return new Request("http://localhost/api/stt/transcribe", {
    method: "POST",
    body: formData,
  });
}

function createRawRequest(
  audioContent: Uint8Array,
  mimeType = "audio/webm",
  headers: Record<string, string> = {}
): Request {
  return new Request("http://localhost/api/stt/transcribe", {
    method: "POST",
    body: audioContent,
    headers: {
      "content-type": mimeType,
      ...headers,
    },
  });
}

const MOCK_RESULT = {
  transcript: "Γεια σου με λένε Μαρία",
  normalizedTranscript: "γεια σου με λένε μαρία",
  confidence: 0.95,
  languageCode: "el",
};

// Audio content large enough to pass MIN_AUDIO_SIZE_BYTES (1 KB)
const VALID_AUDIO = new Uint8Array(2048).fill(42);

describe("POST /api/stt/transcribe", () => {
  beforeEach(() => {
    mockTranscribe.mockReset();
    mockCheck.mockReturnValue({ allowed: true });
  });

  it("returns 200 with transcript for valid multipart audio", async () => {
    mockTranscribe.mockResolvedValueOnce(MOCK_RESULT);

    const formData = new FormData();
    formData.append(
      "audio",
      new Blob([VALID_AUDIO], { type: "audio/webm" }),
      "recording.webm"
    );
    const req = new Request("http://localhost/api/stt/transcribe", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.transcript).toBe(MOCK_RESULT.transcript);
    expect(body.normalizedTranscript).toBe(MOCK_RESULT.normalizedTranscript);
    expect(body.confidence).toBe(0.95);
    expect(body.languageCode).toBe("el");
  });

  it("returns 200 with transcript for valid raw binary audio", async () => {
    mockTranscribe.mockResolvedValueOnce(MOCK_RESULT);

    const req = createRawRequest(VALID_AUDIO);
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.transcript).toBe(MOCK_RESULT.transcript);
  });

  it("returns 400 for empty audio body", async () => {
    const req = createRawRequest(new Uint8Array(0));
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe(SttErrorCode.VALIDATION_ERROR);
  });

  it('returns 400 when "audio" field is missing', async () => {
    const req = createMultipartRequest(null);
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe(SttErrorCode.VALIDATION_ERROR);
  });

  it("returns 400 for audio below minimum size", async () => {
    const req = createRawRequest(new Uint8Array(500)); // < 1 KB
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe(SttErrorCode.AUDIO_TOO_SHORT);
  });

  it("returns 415 for unsupported MIME type", async () => {
    const req = createRawRequest(VALID_AUDIO, "audio/flac");
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const body = await res.json();

    expect(res.status).toBe(415);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe(SttErrorCode.UNSUPPORTED_FORMAT);
  });

  it("returns 413 for oversized Content-Length", async () => {
    const req = createRawRequest(
      new TextEncoder().encode("small"),
      "audio/webm",
      {
        "content-length": String(10 * 1024 * 1024),
      }
    );
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const body = await res.json();

    expect(res.status).toBe(413);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe(SttErrorCode.REQUEST_TOO_LARGE);
  });

  it("returns 429 when rate limited", async () => {
    mockCheck.mockReturnValue({ allowed: false, retryAfterSeconds: 60 });

    const req = createRawRequest(VALID_AUDIO);
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe(SttErrorCode.RATE_LIMIT_EXCEEDED);
  });

  it("returns 504 on STT timeout", async () => {
    mockTranscribe.mockRejectedValueOnce(new Error("Request timeout"));

    const req = createRawRequest(VALID_AUDIO);
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const body = await res.json();

    expect(res.status).toBe(504);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe(SttErrorCode.STT_TIMEOUT);
  });

  it("returns 502 on STT general failure", async () => {
    mockTranscribe.mockRejectedValueOnce(new Error("Service unavailable"));

    const req = createRawRequest(VALID_AUDIO);
    const res = await POST(req as unknown as import("next/server").NextRequest);
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe(SttErrorCode.STT_FAILURE);
  });
});
