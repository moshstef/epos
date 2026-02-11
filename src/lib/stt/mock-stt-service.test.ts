import { describe, expect, it } from "vitest";

import { MockSttService } from "./mock-stt-service";

describe("MockSttService", () => {
  it("returns a valid Greek transcript", async () => {
    const service = new MockSttService();
    const result = await service.transcribe(
      Buffer.from("fake-audio"),
      "audio/webm"
    );

    expect(result.transcript).toBe("Γεια σου με λένε Μαρία");
    expect(result.normalizedTranscript).toBe("γεια σου με λένε μαρία");
  });

  it("returns confidence in [0, 1]", async () => {
    const service = new MockSttService();
    const result = await service.transcribe(
      Buffer.from("fake-audio"),
      "audio/webm"
    );

    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('returns languageCode "el"', async () => {
    const service = new MockSttService();
    const result = await service.transcribe(
      Buffer.from("fake-audio"),
      "audio/webm"
    );

    expect(result.languageCode).toBe("el");
  });
});
