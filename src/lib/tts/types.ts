/** Result returned by any TTS service implementation. */
export interface TtsResult {
  /** MP3 audio bytes. */
  audioContent: Buffer;
}

/** Interface that all TTS service implementations must satisfy. */
export interface TtsService {
  synthesize(text: string, languageCode: string): Promise<TtsResult>;
}
