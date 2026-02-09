import { describe, expect, it } from "vitest";
import { mockAnalyze } from "./analyzer";

describe("mockAnalyze", () => {
  const requiredWords = ["Γεια", "λένε"];
  const allowedVariants = [
    "Γεια σου με λένε Μαρία",
    "Γεια, με λένε Μαρία",
  ];

  it("passes on exact variant match", () => {
    const result = mockAnalyze("Γεια σου με λένε Μαρία", requiredWords, allowedVariants);
    expect(result).toEqual({ outcome: "pass" });
  });

  it("passes on variant match (case-insensitive)", () => {
    const result = mockAnalyze("γεια σου με λένε μαρία", requiredWords, allowedVariants);
    expect(result).toEqual({ outcome: "pass" });
  });

  it("passes when all required words are present", () => {
    const result = mockAnalyze("Γεια, με λένε Νίκος", requiredWords, allowedVariants);
    expect(result).toEqual({ outcome: "pass" });
  });

  it("retries when required words are missing", () => {
    const result = mockAnalyze("Γεια σου", requiredWords, allowedVariants);
    expect(result).toEqual({
      outcome: "retry",
      reason: "Try again — include: λένε",
    });
  });

  it("lists all missing words in retry reason", () => {
    const result = mockAnalyze("Μαρία", requiredWords, allowedVariants);
    expect(result).toEqual({
      outcome: "retry",
      reason: "Try again — include: Γεια, λένε",
    });
  });

  it("retries on empty input", () => {
    const result = mockAnalyze("", requiredWords, allowedVariants);
    expect(result).toEqual({
      outcome: "retry",
      reason: "Try again — say the phrase out loud!",
    });
  });

  it("retries on whitespace-only input", () => {
    const result = mockAnalyze("   ", requiredWords, allowedVariants);
    expect(result).toEqual({
      outcome: "retry",
      reason: "Try again — say the phrase out loud!",
    });
  });

  it("matches required words case-insensitively", () => {
    const result = mockAnalyze("γεια με λένε", requiredWords, allowedVariants);
    expect(result).toEqual({ outcome: "pass" });
  });
});
