import { describe, expect, it } from "vitest";

import { normalizeGreekTranscript } from "./normalize";

describe("normalizeGreekTranscript", () => {
  it("lowercases and strips accents from Greek text", () => {
    expect(normalizeGreekTranscript("Γεια σου, με λένε Μαρία")).toBe(
      "γεια σου με λενε μαρια"
    );
  });

  it("strips punctuation", () => {
    expect(normalizeGreekTranscript("Τι κάνεις;")).toBe("τι κανεις");
  });

  it("handles multiple diacritics", () => {
    expect(normalizeGreekTranscript("Είμαι καλά, ευχαριστώ")).toBe(
      "ειμαι καλα ευχαριστω"
    );
  });

  it("collapses multiple spaces", () => {
    expect(normalizeGreekTranscript("  Multiple   spaces  ")).toBe(
      "multiple spaces"
    );
  });

  it("returns empty string for empty input", () => {
    expect(normalizeGreekTranscript("")).toBe("");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(normalizeGreekTranscript("   ")).toBe("");
  });

  it("returns empty string for punctuation-only input", () => {
    expect(normalizeGreekTranscript("!!!")).toBe("");
  });

  it("is idempotent", () => {
    const input = "γεια σου με λενε μαρια";
    expect(normalizeGreekTranscript(input)).toBe(input);
  });

  it("preserves hyphens between words", () => {
    expect(normalizeGreekTranscript("κάτι-άλλο")).toBe("κατι-αλλο");
  });

  it("preserves accents when stripDiacritics is false", () => {
    expect(
      normalizeGreekTranscript("Γεια σου, με λένε Μαρία", {
        stripDiacritics: false,
      })
    ).toBe("γεια σου με λένε μαρία");
  });

  it("handles dialytika", () => {
    // ϊ = iota with dialytika
    expect(normalizeGreekTranscript("ρολόϊ")).toBe("ρολοι");
  });
});
