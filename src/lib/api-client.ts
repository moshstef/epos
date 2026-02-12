import type { SttResponse } from "@/lib/stt/schemas";

const STT_TIMEOUT_MS = 15_000;

/**
 * Upload an audio blob to the STT transcription endpoint.
 * Returns a typed SttResponse (discriminated union on `ok`).
 */
export async function uploadAudio(
  blob: Blob,
  mimeType: string
): Promise<SttResponse> {
  const formData = new FormData();
  formData.append("audio", new Blob([blob], { type: mimeType }));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STT_TIMEOUT_MS);

  try {
    const response = await fetch("/api/stt/transcribe", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    const data: SttResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        ok: false,
        error: {
          code: "STT_TIMEOUT",
          message: "The request timed out. Please try again.",
        },
      };
    }

    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message:
          "Could not connect. Please check your connection and try again.",
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}
