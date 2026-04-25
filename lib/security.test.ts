import { describe, expect, it } from "vitest";
import { constantTimeCompare, createHmacSignature } from "@/lib/security";

describe("security helpers", () => {
  it("compares matching strings", () => {
    expect(constantTimeCompare("secret", "secret")).toBe(true);
  });

  it("rejects different strings", () => {
    expect(constantTimeCompare("secret", "other")).toBe(false);
  });

  it("creates stable HMAC signatures", () => {
    expect(createHmacSignature("payload", "key")).toBe(
      createHmacSignature("payload", "key"),
    );
  });
});

