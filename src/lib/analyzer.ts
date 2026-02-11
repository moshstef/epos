import { normalizeGreekTranscript } from "@/lib/stt/normalize";

export type AnalyzerResult =
  | { outcome: "pass" }
  | { outcome: "retry"; reason: string };

export interface AnalyzeParams {
  /** Raw transcript from STT or user text input. */
  transcript: string;
  /** Normalized transcript for comparison. If omitted, normalizes transcript automatically. */
  normalizedTranscript?: string;
  /** STT confidence in [0, 1]. Defaults to 1.0 (text input). */
  confidence?: number;
  requiredWords: string[];
  allowedVariants: string[];
  /** Expected phrase from the exercise, used for word order checking. */
  expectedPhrase?: string;
}

/** Below this threshold, STT audio is too unclear to evaluate. */
const MIN_CONFIDENCE = 0.6;

/**
 * Deterministic rule-based analyzer for speaking practice.
 *
 * Pipeline:
 * 1. Empty/whitespace check
 * 2. STT confidence threshold
 * 3. Exact variant match (bypass remaining checks)
 * 4. Required words presence
 * 5. Basic word order (lenient, only for 3+ required words)
 */
export function analyze(params: AnalyzeParams): AnalyzerResult {
  const {
    transcript,
    confidence = 1.0,
    requiredWords,
    allowedVariants,
    expectedPhrase,
  } = params;

  const normalized =
    params.normalizedTranscript ?? normalizeGreekTranscript(transcript);

  // Step 1: Empty check
  if (!normalized) {
    return {
      outcome: "retry",
      reason: "Try again — say the phrase out loud!",
    };
  }

  // Step 2: STT confidence check
  if (confidence < MIN_CONFIDENCE) {
    return {
      outcome: "retry",
      reason: "Could not understand clearly — please try again.",
    };
  }

  // Step 3: Exact variant match (case/accent-insensitive)
  const variantMatch = allowedVariants.some(
    (v) => normalizeGreekTranscript(v) === normalized
  );
  if (variantMatch) {
    return { outcome: "pass" };
  }

  // Step 4: Required words presence
  const normalizedRequired = requiredWords.map((w) =>
    normalizeGreekTranscript(w)
  );
  const missingWords = requiredWords.filter(
    (_, i) => !normalized.includes(normalizedRequired[i])
  );

  if (missingWords.length > 0) {
    return {
      outcome: "retry",
      reason: `Try again — include: ${missingWords.join(", ")}`,
    };
  }

  // Step 5: Word order check (lenient, only for 3+ required words)
  if (expectedPhrase && normalizedRequired.length >= 3) {
    const normalizedExpected = normalizeGreekTranscript(expectedPhrase);
    if (!checkWordOrder(normalized, normalizedExpected, normalizedRequired)) {
      return {
        outcome: "retry",
        reason: "Try again — check the word order.",
      };
    }
  }

  return { outcome: "pass" };
}

/**
 * Lenient word order check: required words should appear in roughly
 * the same relative order as in the expected phrase.
 * Adjacent swaps are allowed.
 */
function checkWordOrder(
  normalized: string,
  normalizedExpected: string,
  normalizedRequired: string[]
): boolean {
  const getPositions = (text: string, words: string[]) =>
    words.map((w) => text.indexOf(w)).filter((pos) => pos !== -1);

  const actualPositions = getPositions(normalized, normalizedRequired);
  const expectedPositions = getPositions(
    normalizedExpected,
    normalizedRequired
  );

  if (actualPositions.length < 2 || expectedPositions.length < 2) {
    return true; // Not enough words found to check order
  }

  // Get the relative ordering (rank) of words by position
  const toRanks = (positions: number[]) => {
    const sorted = [...positions].sort((a, b) => a - b);
    return positions.map((p) => sorted.indexOf(p));
  };

  const actualRanks = toRanks(actualPositions);
  const expectedRanks = toRanks(expectedPositions);

  // Count inversions (pairs of words in wrong relative order)
  let inversions = 0;
  for (let i = 0; i < actualRanks.length; i++) {
    for (let j = i + 1; j < actualRanks.length; j++) {
      const actualOrder = actualRanks[i] < actualRanks[j];
      const expectedOrder = expectedRanks[i] < expectedRanks[j];
      if (actualOrder !== expectedOrder) {
        inversions++;
      }
    }
  }

  // Allow up to 1 inversion (adjacent swap)
  return inversions <= 1;
}
