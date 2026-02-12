import { createHash } from "crypto";
import { NextResponse } from "next/server";

import { createTtsService, TtsErrorCode, TTS_MAX_TEXT_LENGTH } from "@/lib/tts";

// In-memory cache: hash → MP3 audio as ArrayBuffer
const audioCache = new Map<string, ArrayBuffer>();

function cacheKey(text: string, lang: string): string {
  return createHash("sha256").update(`${lang}:${text}`).digest("hex");
}

function errorJson(code: string, message: string, status: number) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  const lang = searchParams.get("lang") ?? "el-GR";

  if (!text || text.trim().length === 0) {
    return errorJson(
      TtsErrorCode.VALIDATION_ERROR,
      "Missing required 'text' query parameter",
      400
    );
  }

  if (text.length > TTS_MAX_TEXT_LENGTH) {
    return errorJson(
      TtsErrorCode.TEXT_TOO_LONG,
      `Text exceeds maximum length of ${TTS_MAX_TEXT_LENGTH} characters`,
      400
    );
  }

  const key = cacheKey(text, lang);
  const cached = audioCache.get(key);

  if (cached) {
    return new Response(cached, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  }

  const ttsService = createTtsService();

  try {
    const result = await ttsService.synthesize(text, lang);
    const ab: ArrayBuffer = result.audioContent.buffer.slice(
      result.audioContent.byteOffset,
      result.audioContent.byteOffset + result.audioContent.byteLength
    ) as ArrayBuffer;

    audioCache.set(key, ab);

    return new Response(ab, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    console.error("[TTS] Synthesis failed:", error);

    if (error instanceof Error && error.message.includes("timeout")) {
      return errorJson(TtsErrorCode.TTS_TIMEOUT, "TTS service timed out", 504);
    }

    return errorJson(TtsErrorCode.TTS_FAILURE, "TTS service failed", 502);
  }
}
