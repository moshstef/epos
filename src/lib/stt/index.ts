import { MockSttService } from "./mock-stt-service";
import type { SttService } from "./types";

export { MockSttService } from "./mock-stt-service";
export {
  ACCEPTED_MIME_TYPES,
  MAX_AUDIO_SIZE_BYTES,
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
    case "deepgram":
      throw new Error(
        "Deepgram STT provider is not yet implemented. Set STT_PROVIDER=mock or wait for Issue #9."
      );
    default:
      throw new Error(`Unknown STT_PROVIDER: "${provider}"`);
  }
}
