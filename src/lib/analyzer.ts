export type AnalyzerResult =
  | { outcome: "pass" }
  | { outcome: "retry"; reason: string };

/**
 * Mocked analyzer for the thin-slice lesson flow.
 * Checks user input against allowed variants and required words.
 * No LLM or STT — pure deterministic logic.
 */
export function mockAnalyze(
  userInput: string,
  requiredWords: string[],
  allowedVariants: string[]
): AnalyzerResult {
  const trimmed = userInput.trim();

  if (!trimmed) {
    return { outcome: "retry", reason: "Try again — say the phrase out loud!" };
  }

  const normalizedInput = trimmed.toLowerCase();

  // Check if input matches any allowed variant (case-insensitive)
  const variantMatch = allowedVariants.some(
    (v) => v.toLowerCase() === normalizedInput
  );
  if (variantMatch) {
    return { outcome: "pass" };
  }

  // Check if all required words are present (case-insensitive)
  const missingWords = requiredWords.filter(
    (word) => !normalizedInput.includes(word.toLowerCase())
  );

  if (missingWords.length === 0) {
    return { outcome: "pass" };
  }

  return {
    outcome: "retry",
    reason: `Try again — include: ${missingWords.join(", ")}`,
  };
}
