/** Result returned by any STT service implementation. */
export interface SttResult {
  /** Raw transcript from the STT provider. */
  transcript: string;
  /** Normalized transcript (lowercased, trimmed, punctuation-stripped). */
  normalizedTranscript: string;
  /** Provider confidence score in [0, 1]. */
  confidence: number;
  /** BCP-47 language code (e.g. "el"). */
  languageCode: string;
}

/** Interface that all STT service implementations must satisfy. */
export interface SttService {
  transcribe(audioBuffer: Buffer, mimeType: string): Promise<SttResult>;
}
