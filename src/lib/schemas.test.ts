import { describe, expect, test } from "vitest";
import {
  parseAllowedVariants,
  parseRequiredWords,
  serializeAllowedVariants,
  serializeRequiredWords,
} from "./schemas";

describe("parseRequiredWords", () => {
  test("parses valid JSON string array", () => {
    expect(parseRequiredWords(JSON.stringify(["Γεια", "λένε"]))).toEqual([
      "Γεια",
      "λένε",
    ]);
  });

  test("returns empty array for invalid data", () => {
    expect(parseRequiredWords(JSON.stringify([1, 2]))).toEqual([]);
  });

  test("returns empty array for empty array", () => {
    expect(parseRequiredWords("[]")).toEqual([]);
  });
});

describe("parseAllowedVariants", () => {
  test("parses valid JSON string array", () => {
    const variants = ["Γεια σου με λένε Μαρία", "Γεια, με λένε Μαρία"];
    expect(parseAllowedVariants(JSON.stringify(variants))).toEqual(variants);
  });
});

describe("serializeRequiredWords", () => {
  test("serializes string array to JSON", () => {
    expect(serializeRequiredWords(["Γεια", "λένε"])).toBe(
      '["Γεια","λένε"]'
    );
  });

  test("throws on invalid input", () => {
    expect(() =>
      serializeRequiredWords([1, 2] as unknown as string[])
    ).toThrow();
  });
});

describe("serializeAllowedVariants", () => {
  test("serializes string array to JSON", () => {
    expect(serializeAllowedVariants(["a", "b"])).toBe('["a","b"]');
  });
});
