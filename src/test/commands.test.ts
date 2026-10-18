import { describe, it, expect } from "vitest";
import { interpretCommand } from "@/lib/commands";

describe("command safety rules", () => {
  it("purchases require explicit typed approval", () => {
    const r = interpretCommand("buy new headphones");
    expect(r.risk).toBe("sensitive");
    expect(r.confirmPhrase).toBe("APPROVE PURCHASE");
  });
  it("outbound messages require approval", () => {
    expect(interpretCommand("send an email to Sam").risk).toBe("sensitive");
  });
  it("credentials are blocked, never stored", () => {
    expect(interpretCommand("remember my password is hunter2").risk).toBe("blocked");
  });
  it("smart home is blocked because no devices are connected", () => {
    expect(interpretCommand("unlock the front door").risk).toBe("blocked");
  });
  it("notes are safe", () => {
    expect(interpretCommand("remind me to stretch").risk).toBe("safe");
  });
});
