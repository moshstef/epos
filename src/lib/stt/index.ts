import { DeepgramSttService } from "./deepgram-stt-service";
import { MockSttService } from "./mock-stt-service";
import type { SttService } from "./types";

export { DeepgramSttService } from "./deepgram-stt-service";
export { MockSttService } from "./mock-stt-service";
export { normalizeGreekTranscript } from "./normalize";
export type { NormalizeOptions } from "./normalize";
export {
  ACCEPTED_MIME_TYPES,
  MAX_AUDIO_SIZE_BYTES,
  MIN_AUDIO_SIZE_BYTES,
  SttErrorCode,
  sttErrorResponseSchema,
  sttResponseSchema,
  sttSuccessResponseSchema,
} from "./schemas";
export type {
  SttErrorResponse,
  SttResponse,
  SttSuccessResponse,
} from "./schemas";
export type { SttResult, SttService } from "./types";

export function createSttService(): SttService {
  const provider = process.env.STT_PROVIDER ?? "mock";

  switch (provider) {
    case "mock":
      return new MockSttService();
    case "deepgram": {
      const apiKey = process.env.STT_API_KEY ?? "";
      return new DeepgramSttService(apiKey);
    }
    default:
      throw new Error(`Unknown STT_PROVIDER: "${provider}"`);
  }
}
