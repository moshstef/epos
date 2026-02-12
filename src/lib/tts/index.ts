import { GoogleTtsService } from "./google-tts-service";
import { MockTtsService } from "./mock-tts-service";
import type { TtsService } from "./types";

export { GoogleTtsService } from "./google-tts-service";
export { MockTtsService } from "./mock-tts-service";
export type { TtsResult, TtsService } from "./types";

export const TTS_MAX_TEXT_LENGTH = 500;

export const TtsErrorCode = {
  TEXT_TOO_LONG: "TEXT_TOO_LONG",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  TTS_FAILURE: "TTS_FAILURE",
  TTS_TIMEOUT: "TTS_TIMEOUT",
} as const;

export type TtsErrorCode = (typeof TtsErrorCode)[keyof typeof TtsErrorCode];

export function createTtsService(): TtsService {
  const provider = process.env.TTS_PROVIDER ?? "mock";

  switch (provider) {
    case "mock":
      return new MockTtsService();
    case "google": {
      const apiKey = process.env.TTS_API_KEY ?? "";
      return new GoogleTtsService(apiKey);
    }
    default:
      throw new Error(`Unknown TTS_PROVIDER: "${provider}"`);
  }
}
