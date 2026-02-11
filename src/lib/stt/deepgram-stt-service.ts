import { createClient, isDeepgramError } from "@deepgram/sdk";
import type { DeepgramClient } from "@deepgram/sdk";

import { normalizeGreekTranscript } from "./normalize";
import type { SttResult, SttService } from "./types";

const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1_000;

export class DeepgramSttService implements SttService {
  private client: DeepgramClient;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error(
        "Missing STT_API_KEY for Deepgram provider. Set STT_API_KEY in your environment."
      );
    }
    this.client = createClient(apiKey);
  }

  async transcribe(audioBuffer: Buffer, _mimeType: string): Promise<SttResult> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.attemptTranscribe(audioBuffer);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }

    throw lastError;
  }

  private async attemptTranscribe(audioBuffer: Buffer): Promise<SttResult> {
    const responsePromise = this.client.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: "nova-3",
        language: "el",
        punctuate: true,
        smart_format: false,
      }
    );

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), TIMEOUT_MS)
    );

    const response = await Promise.race([responsePromise, timeoutPromise]);

    if (response.error) {
      if (isDeepgramError(response.error)) {
        throw new Error(`Transcription failed: ${response.error.message}`);
      }
      throw new Error("Transcription failed");
    }

    const channel = response.result.results.channels[0];
    const alternative = channel?.alternatives[0];
    const transcript = alternative?.transcript ?? "";
    const confidence = alternative?.confidence ?? 0.0;
    const languageCode = channel?.detected_language ?? "el";

    return {
      transcript,
      normalizedTranscript: normalizeGreekTranscript(transcript),
      confidence,
      languageCode,
    };
  }
}
