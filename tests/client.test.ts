import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BlofinClient } from "../src/client.ts";

const mockJson = vi.fn(async () => ({ code: "0", data: [] }));

describe("BlofinClient request wrappers", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => ({ json: mockJson })) as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockJson.mockClear();
    globalThis.fetch = originalFetch;
  });

  it("publicGet builds querystring and issues GET request", async () => {
    const client = new BlofinClient({
      apiKey: "k",
      secretKey: "s",
      passphrase: "p",
      baseUrl: "https://api.test",
    });

    await client.publicGet("/api/v1/market/tickers", {
      instId: "BTC-USDT",
      limit: "10",
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.test/api/v1/market/tickers?instId=BTC-USDT&limit=10",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
  });

  it("privateGet signs request path with query params", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000001);
    vi.spyOn(crypto, "randomUUID").mockReturnValue("nonce-private-get");

    const client = new BlofinClient({
      apiKey: "api",
      secretKey: "secret",
      passphrase: "pass",
      baseUrl: "https://api.test",
    });

    await client.privateGet("/api/v1/account/positions", { instId: "BTC-USDT" });

    const call = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(call[0]).toBe("https://api.test/api/v1/account/positions?instId=BTC-USDT");
    expect(call[1]?.method).toBe("GET");
    expect(call[1]?.headers).toMatchObject({
      "ACCESS-KEY": "api",
      "ACCESS-PASSPHRASE": "pass",
      "ACCESS-TIMESTAMP": "1700000000001",
      "ACCESS-NONCE": "nonce-private-get",
    });
  });

  it("privatePost serializes body and signs POST request", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000002);
    vi.spyOn(crypto, "randomUUID").mockReturnValue("nonce-private-post");

    const client = new BlofinClient({
      apiKey: "api",
      secretKey: "secret",
      passphrase: "pass",
      baseUrl: "https://api.test",
    });

    await client.privatePost("/api/v1/trade/order", {
      instId: "BTC-USDT",
      size: "0.1",
    });

    const call = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(call[0]).toBe("https://api.test/api/v1/trade/order");
    expect(call[1]?.method).toBe("POST");
    expect(call[1]?.body).toBe("{\"instId\":\"BTC-USDT\",\"size\":\"0.1\"}");
    expect(call[1]?.headers).toMatchObject({
      "ACCESS-KEY": "api",
      "ACCESS-PASSPHRASE": "pass",
      "ACCESS-TIMESTAMP": "1700000000002",
      "ACCESS-NONCE": "nonce-private-post",
      "Content-Type": "application/json",
    });
  });
});
