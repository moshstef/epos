import { z } from "zod";

export const ACCEPTED_MIME_TYPES = [
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
] as const;

/** 5 MB */
export const MAX_AUDIO_SIZE_BYTES = 5 * 1024 * 1024;

export const SttErrorCode = {
  REQUEST_TOO_LARGE: "REQUEST_TOO_LARGE",
  UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT",
  STT_TIMEOUT: "STT_TIMEOUT",
  STT_FAILURE: "STT_FAILURE",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type SttErrorCode = (typeof SttErrorCode)[keyof typeof SttErrorCode];

export const sttSuccessResponseSchema = z.object({
  ok: z.literal(true),
  transcript: z.string(),
  normalizedTranscript: z.string(),
  confidence: z.number(),
  languageCode: z.string(),
});

export const sttErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export const sttResponseSchema = z.discriminatedUnion("ok", [
  sttSuccessResponseSchema,
  sttErrorResponseSchema,
]);

export type SttSuccessResponse = z.infer<typeof sttSuccessResponseSchema>;
export type SttErrorResponse = z.infer<typeof sttErrorResponseSchema>;
export type SttResponse = z.infer<typeof sttResponseSchema>;
