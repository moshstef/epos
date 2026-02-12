import { describe, it, expect } from "vitest";
import { MockTtsService } from "./mock-tts-service";

describe("MockTtsService", () => {
  it("returns a buffer with audio content", async () => {
    const service = new MockTtsService();
    const result = await service.synthesize("Γεια σου", "el-GR");
    expect(result.audioContent).toBeInstanceOf(Buffer);
    expect(result.audioContent.length).toBeGreaterThan(0);
  });

  it("returns the same result for different inputs", async () => {
    const service = new MockTtsService();
    const r1 = await service.synthesize("Hello", "en-US");
    const r2 = await service.synthesize("Γεια", "el-GR");
    expect(r1.audioContent.equals(r2.audioContent)).toBe(true);
  });
});
