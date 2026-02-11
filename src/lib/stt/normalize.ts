export interface NormalizeOptions {
  /** Strip diacritics/accents (tonos, dialytika, etc). Default: true */
  stripDiacritics?: boolean;
}

const DEFAULT_OPTIONS: Required<NormalizeOptions> = {
  stripDiacritics: true,
};

/**
 * Deterministic normalization of Greek transcript text.
 *
 * Pipeline: lowercase → NFD decomposition → strip combining marks (optional)
 * → strip punctuation → collapse whitespace → trim
 */
export function normalizeGreekTranscript(
  text: string,
  options?: NormalizeOptions
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let result = text.toLowerCase();

  if (opts.stripDiacritics) {
    // NFD separates base characters from combining marks, then strip marks
    result = result.normalize("NFD").replace(/\p{M}/gu, "");
  }

  // Strip punctuation (keep letters, numbers, spaces, hyphens between words)
  result = result.replace(/[^\p{L}\p{N}\s-]/gu, "");

  // Collapse whitespace and trim
  result = result.replace(/\s+/g, " ").trim();

  return result;
}
