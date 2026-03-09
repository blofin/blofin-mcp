import crypto from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createAuthHeaders, generateSignature } from "../src/auth.ts";

describe("auth signature helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates deterministic signature for fixed input", () => {
    const signature = generateSignature(
      "secret",
      "GET",
      "/api/v1/test",
      "1700000000000",
      "123e4567-e89b-12d3-a456-426614174000"
    );

    expect(signature).toBe(
      "ZTQ2N2RhODY4OTExZjc1NjQyMDVhODVhZmIxOTFhYTk1OTkxODE1ZWZjNGJhNGZmOWQ1YTA2NGQ4YTE3NGUwNw=="
    );
  });

  it("creates required private API auth headers", () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);
    vi.spyOn(crypto, "randomUUID").mockReturnValue("nonce-test-value");

    const headers = createAuthHeaders(
      "api-key",
      "secret",
      "passphrase",
      "POST",
      "/api/v1/trade/order",
      "{\"instId\":\"BTC-USDT\"}"
    );

    expect(headers["ACCESS-KEY"]).toBe("api-key");
    expect(headers["ACCESS-PASSPHRASE"]).toBe("passphrase");
    expect(headers["ACCESS-TIMESTAMP"]).toBe("1700000000000");
    expect(headers["ACCESS-NONCE"]).toBe("nonce-test-value");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["ACCESS-SIGN"]).toBe(
      generateSignature(
        "secret",
        "POST",
        "/api/v1/trade/order",
        "1700000000000",
        "nonce-test-value",
        "{\"instId\":\"BTC-USDT\"}"
      )
    );
  });
});
