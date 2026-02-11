import { describe, expect, it } from "vitest";

import { analyze } from "./analyzer";

const requiredWords = ["Γεια", "λένε"];
const allowedVariants = ["Γεια σου με λένε Μαρία", "Γεια, με λένε Μαρία"];

function params(
  transcript: string,
  overrides: {
    confidence?: number;
    expectedPhrase?: string;
    requiredWords?: string[];
    allowedVariants?: string[];
  } = {}
) {
  return {
    transcript,
    requiredWords: overrides.requiredWords ?? requiredWords,
    allowedVariants: overrides.allowedVariants ?? allowedVariants,
    confidence: overrides.confidence,
    expectedPhrase: overrides.expectedPhrase,
  };
}

describe("analyze", () => {
  describe("empty/whitespace input", () => {
    it("retries on empty input", () => {
      expect(analyze(params(""))).toEqual({
        outcome: "retry",
        reason: "Try again — say the phrase out loud!",
      });
    });

    it("retries on whitespace-only input", () => {
      expect(analyze(params("   "))).toEqual({
        outcome: "retry",
        reason: "Try again — say the phrase out loud!",
      });
    });
  });

  describe("STT confidence", () => {
    it("retries when confidence is below threshold", () => {
      expect(
        analyze(params("Γεια σου με λένε Μαρία", { confidence: 0.5 }))
      ).toEqual({
        outcome: "retry",
        reason: "Could not understand clearly — please try again.",
      });
    });

    it("retries at confidence 0.59 (just below threshold)", () => {
      expect(
        analyze(params("Γεια σου με λένε Μαρία", { confidence: 0.59 }))
      ).toEqual({
        outcome: "retry",
        reason: "Could not understand clearly — please try again.",
      });
    });

    it("passes at confidence 0.6 (at threshold)", () => {
      expect(
        analyze(params("Γεια σου με λένε Μαρία", { confidence: 0.6 }))
      ).toEqual({ outcome: "pass" });
    });

    it("passes at high confidence", () => {
      expect(
        analyze(params("Γεια σου με λένε Μαρία", { confidence: 0.95 }))
      ).toEqual({ outcome: "pass" });
    });

    it("retries at confidence 0.0", () => {
      expect(
        analyze(params("Γεια σου με λένε Μαρία", { confidence: 0.0 }))
      ).toEqual({
        outcome: "retry",
        reason: "Could not understand clearly — please try again.",
      });
    });

    it("defaults confidence to 1.0 (text input)", () => {
      expect(analyze(params("Γεια σου με λένε Μαρία"))).toEqual({
        outcome: "pass",
      });
    });
  });

  describe("variant matching", () => {
    it("passes on exact variant match", () => {
      expect(analyze(params("Γεια σου με λένε Μαρία"))).toEqual({
        outcome: "pass",
      });
    });

    it("passes on variant match (case-insensitive)", () => {
      expect(analyze(params("γεια σου με λένε μαρία"))).toEqual({
        outcome: "pass",
      });
    });

    it("passes on variant match (accent-insensitive)", () => {
      expect(analyze(params("ΓΕΙΑ ΣΟΥ ΜΕ ΛΕΝΕ ΜΑΡΙΑ"))).toEqual({
        outcome: "pass",
      });
    });
  });

  describe("required words", () => {
    it("passes when all required words are present", () => {
      expect(analyze(params("Γεια, με λένε Νίκος"))).toEqual({
        outcome: "pass",
      });
    });

    it("retries when required words are missing", () => {
      expect(analyze(params("Γεια σου"))).toEqual({
        outcome: "retry",
        reason: "Try again — include: λένε",
      });
    });

    it("lists all missing words in retry reason", () => {
      expect(analyze(params("Μαρία"))).toEqual({
        outcome: "retry",
        reason: "Try again — include: Γεια, λένε",
      });
    });

    it("matches required words case-insensitively", () => {
      expect(analyze(params("γεια με λένε"))).toEqual({ outcome: "pass" });
    });

    it("matches required words accent-insensitively", () => {
      expect(analyze(params("γεια με λενε"))).toEqual({ outcome: "pass" });
    });
  });

  describe("word order", () => {
    const threeRequiredWords = ["Γεια", "λένε", "Μαρία"];

    it("passes with correct order", () => {
      expect(
        analyze(
          params("Γεια σου με λένε Μαρία", {
            requiredWords: threeRequiredWords,
            expectedPhrase: "Γεια σου με λένε Μαρία",
          })
        )
      ).toEqual({ outcome: "pass" });
    });

    it("passes with adjacent swap (lenient)", () => {
      expect(
        analyze(
          params("Γεια σου Μαρία λένε", {
            requiredWords: threeRequiredWords,
            allowedVariants: [],
            expectedPhrase: "Γεια σου με λένε Μαρία",
          })
        )
      ).toEqual({ outcome: "pass" });
    });

    it("retries on complete inversion", () => {
      expect(
        analyze(
          params("Μαρία λένε Γεια", {
            requiredWords: threeRequiredWords,
            allowedVariants: [],
            expectedPhrase: "Γεια σου με λένε Μαρία",
          })
        )
      ).toEqual({
        outcome: "retry",
        reason: "Try again — check the word order.",
      });
    });

    it("skips word order check with fewer than 3 required words", () => {
      expect(
        analyze(
          params("λένε Γεια", {
            expectedPhrase: "Γεια σου με λένε Μαρία",
          })
        )
      ).toEqual({ outcome: "pass" });
    });

    it("skips word order check when no expectedPhrase", () => {
      expect(
        analyze(
          params("Μαρία λένε Γεια", {
            requiredWords: threeRequiredWords,
            allowedVariants: [],
          })
        )
      ).toEqual({ outcome: "pass" });
    });
  });

  describe("integration scenarios", () => {
    it("low confidence overrides correct text", () => {
      expect(
        analyze(params("Γεια σου με λένε Μαρία", { confidence: 0.3 }))
      ).toEqual({
        outcome: "retry",
        reason: "Could not understand clearly — please try again.",
      });
    });

    it("high confidence + missing words → retry for missing words", () => {
      expect(analyze(params("Γεια σου", { confidence: 0.95 }))).toEqual({
        outcome: "retry",
        reason: "Try again — include: λένε",
      });
    });

    it("allowed variant bypasses word order check", () => {
      expect(
        analyze(
          params("Γεια σου με λένε Μαρία", {
            confidence: 0.95,
            expectedPhrase: "completely different order",
          })
        )
      ).toEqual({ outcome: "pass" });
    });

    it("uses provided normalizedTranscript instead of normalizing", () => {
      expect(
        analyze({
          transcript: "RAW TEXT IGNORED",
          normalizedTranscript: "γεια σου με λενε μαρια",
          requiredWords,
          allowedVariants,
        })
      ).toEqual({ outcome: "pass" });
    });
  });
});
