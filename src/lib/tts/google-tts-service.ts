import type { TtsResult, TtsService } from "./types";

// Google Cloud TTS Wavenet pricing: $16 per 1M characters.
// Average exercise: ~80 chars (prompt + phrase) = ~$0.00128 per exercise.
// 50 users x 10 lessons x 5 exercises = 2,500 unique texts ≈ $3.20 total (one-time, cached).
const GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";
const REQUEST_TIMEOUT_MS = 10_000;

export class GoogleTtsService implements TtsService {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Google TTS API key is required");
    }
    this.apiKey = apiKey;
  }

  async synthesize(text: string, languageCode: string): Promise<TtsResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${GOOGLE_TTS_URL}?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
            name: `${languageCode}-Wavenet-A`,
            ssmlGender: "FEMALE",
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 0.9,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Google TTS API error (${response.status}): ${body}`);
      }

      const data = (await response.json()) as { audioContent: string };
      const audioContent = Buffer.from(data.audioContent, "base64");

      return { audioContent };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Google TTS request timeout");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
