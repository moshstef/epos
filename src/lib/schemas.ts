import { z } from "zod";

/** Schema for Exercise.requiredWords (stored as JSON string in SQLite) */
export const requiredWordsSchema = z.array(z.string());

/** Schema for Exercise.allowedVariants (stored as JSON string in SQLite) */
export const allowedVariantsSchema = z.array(z.string());

/** Parse a JSON string column into a typed array, returning a fallback on failure */
export function parseRequiredWords(raw: string): string[] {
  const result = requiredWordsSchema.safeParse(JSON.parse(raw));
  return result.success ? result.data : [];
}

export function parseAllowedVariants(raw: string): string[] {
  const result = allowedVariantsSchema.safeParse(JSON.parse(raw));
  return result.success ? result.data : [];
}

/** Stringify a typed array for storage */
export function serializeRequiredWords(words: string[]): string {
  return JSON.stringify(requiredWordsSchema.parse(words));
}

export function serializeAllowedVariants(variants: string[]): string {
  return JSON.stringify(allowedVariantsSchema.parse(variants));
}
