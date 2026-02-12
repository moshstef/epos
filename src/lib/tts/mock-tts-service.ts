import type { TtsResult, TtsService } from "./types";

const MOCK_LATENCY_MS = 50;

// Minimal valid MP3 frame (silent, ~0.026s) — enough for tests and dev
// MPEG1 Layer 3, 128kbps, 44100Hz, mono
const SILENT_MP3 = Buffer.from(
  "//uQxAAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVV",
  "base64"
);

export class MockTtsService implements TtsService {
  async synthesize(_text: string, _languageCode: string): Promise<TtsResult> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
    return { audioContent: SILENT_MP3 };
  }
}
