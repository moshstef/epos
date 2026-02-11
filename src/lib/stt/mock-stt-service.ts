import { normalizeGreekTranscript } from "./normalize";
import type { SttResult, SttService } from "./types";

const MOCK_LATENCY_MS = 200;

const MOCK_TRANSCRIPT = "Γεια σου με λένε Μαρία";

export class MockSttService implements SttService {
  async transcribe(
    _audioBuffer: Buffer,
    _mimeType: string
  ): Promise<SttResult> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

    return {
      transcript: MOCK_TRANSCRIPT,
      normalizedTranscript: normalizeGreekTranscript(MOCK_TRANSCRIPT),
      confidence: 0.95,
      languageCode: "el",
    };
  }
}
