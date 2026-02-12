// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSynthesize = vi.fn();

vi.mock("@/lib/tts", () => ({
  createTtsService: () => ({ synthesize: mockSynthesize }),
  TtsErrorCode: {
    TEXT_TOO_LONG: "TEXT_TOO_LONG",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    TTS_FAILURE: "TTS_FAILURE",
    TTS_TIMEOUT: "TTS_TIMEOUT",
  },
  TTS_MAX_TEXT_LENGTH: 500,
}));

// Must import after mock
const { GET } = await import("./route");

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/tts/synthesize");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new Request(url.toString(), { method: "GET" }) as never;
}

describe("GET /api/tts/synthesize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when text param is missing", async () => {
    const res = await GET(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when text is empty", async () => {
    const res = await GET(makeRequest({ text: "  " }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when text exceeds max length", async () => {
    const res = await GET(makeRequest({ text: "a".repeat(501) }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("TEXT_TOO_LONG");
  });

  it("returns audio bytes on success", async () => {
    const fakeAudio = Buffer.from("fake-mp3-data");
    mockSynthesize.mockResolvedValueOnce({ audioContent: fakeAudio });

    const res = await GET(makeRequest({ text: "Γεια σου", lang: "el-GR" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("audio/mpeg");
    expect(res.headers.get("Cache-Control")).toContain("max-age=86400");

    const body = await res.arrayBuffer();
    expect(Buffer.from(body).toString()).toBe("fake-mp3-data");
  });

  it("returns cached audio on second request", async () => {
    const fakeAudio = Buffer.from("cached-mp3");
    mockSynthesize.mockResolvedValueOnce({ audioContent: fakeAudio });

    // First request — hits service
    await GET(makeRequest({ text: "cached-test", lang: "el-GR" }));
    expect(mockSynthesize).toHaveBeenCalledTimes(1);

    // Second request — hits cache
    const res = await GET(makeRequest({ text: "cached-test", lang: "el-GR" }));
    expect(res.status).toBe(200);
    expect(mockSynthesize).toHaveBeenCalledTimes(1); // not called again
  });

  it("returns 504 on TTS timeout", async () => {
    mockSynthesize.mockRejectedValueOnce(
      new Error("Google TTS request timeout")
    );

    const res = await GET(makeRequest({ text: "timeout-test" }));
    expect(res.status).toBe(504);
    const body = await res.json();
    expect(body.error.code).toBe("TTS_TIMEOUT");
  });

  it("returns 502 on TTS general failure", async () => {
    mockSynthesize.mockRejectedValueOnce(new Error("Service unavailable"));

    const res = await GET(makeRequest({ text: "failure-test" }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error.code).toBe("TTS_FAILURE");
  });

  it("defaults lang to el-GR when not provided", async () => {
    const fakeAudio = Buffer.from("default-lang");
    mockSynthesize.mockResolvedValueOnce({ audioContent: fakeAudio });

    const res = await GET(makeRequest({ text: "default lang test" }));
    expect(res.status).toBe(200);
    expect(mockSynthesize).toHaveBeenCalledWith("default lang test", "el-GR");
  });
});
