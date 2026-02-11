import { NextRequest, NextResponse } from "next/server";

import {
  ACCEPTED_MIME_TYPES,
  MAX_AUDIO_SIZE_BYTES,
  SttErrorCode,
  createSttService,
} from "@/lib/stt";
import type { SttErrorResponse, SttSuccessResponse } from "@/lib/stt";

function errorResponse(
  code: string,
  message: string,
  status: number
): NextResponse<SttErrorResponse> {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

function isAcceptedMime(mime: string): boolean {
  const normalized = mime.split(";").map((s) => s.trim());
  const base = normalized[0];
  // Check exact match first, then base-only match
  return (
    (ACCEPTED_MIME_TYPES as readonly string[]).includes(mime) ||
    (ACCEPTED_MIME_TYPES as readonly string[]).includes(base)
  );
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SttSuccessResponse | SttErrorResponse>> {
  // Early reject via Content-Length header
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_AUDIO_SIZE_BYTES) {
    return errorResponse(
      SttErrorCode.REQUEST_TOO_LARGE,
      `Audio exceeds maximum size of ${MAX_AUDIO_SIZE_BYTES} bytes`,
      413
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");

  let audioBuffer: Buffer;
  let mimeType: string;

  if (isMultipart) {
    // FormData with "audio" field
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return errorResponse(
        SttErrorCode.VALIDATION_ERROR,
        "Invalid multipart form data",
        400
      );
    }

    const audioFile = formData.get("audio");
    if (!audioFile || !(audioFile instanceof Blob)) {
      return errorResponse(
        SttErrorCode.VALIDATION_ERROR,
        'Missing "audio" field in form data',
        400
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    audioBuffer = Buffer.from(arrayBuffer);
    mimeType = audioFile.type || "audio/webm";
  } else {
    // Raw binary body
    const arrayBuffer = await request.arrayBuffer();
    audioBuffer = Buffer.from(arrayBuffer);
    mimeType = contentType || "audio/webm";
  }

  // Validate empty body
  if (audioBuffer.length === 0) {
    return errorResponse(
      SttErrorCode.VALIDATION_ERROR,
      "Empty audio body",
      400
    );
  }

  // Validate size after read
  if (audioBuffer.length > MAX_AUDIO_SIZE_BYTES) {
    return errorResponse(
      SttErrorCode.REQUEST_TOO_LARGE,
      `Audio exceeds maximum size of ${MAX_AUDIO_SIZE_BYTES} bytes`,
      413
    );
  }

  // Validate MIME type
  if (!isAcceptedMime(mimeType)) {
    return errorResponse(
      SttErrorCode.UNSUPPORTED_FORMAT,
      `Unsupported audio format: ${mimeType}. Accepted: ${ACCEPTED_MIME_TYPES.join(", ")}`,
      415
    );
  }

  // Forward to STT service
  const sttService = createSttService();

  try {
    const result = await sttService.transcribe(audioBuffer, mimeType);

    return NextResponse.json({
      ok: true,
      transcript: result.transcript,
      normalizedTranscript: result.normalizedTranscript,
      confidence: result.confidence,
      languageCode: result.languageCode,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("timeout")) {
      return errorResponse(
        SttErrorCode.STT_TIMEOUT,
        "STT service timed out",
        504
      );
    }

    return errorResponse(SttErrorCode.STT_FAILURE, "STT service failed", 502);
  }
}
