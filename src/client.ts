import { createAuthHeaders } from "./auth.js";

export interface BlofinConfig {
  apiKey: string;
  secretKey: string;
  passphrase: string;
  baseUrl: string;
  brokerId?: string;
  /**
   * Per-request timeout in milliseconds. Exchange endpoints are public-facing
   * and can stall under load, so an unbounded fetch would leave a tool call
   * hanging indefinitely with no way for the caller to recover.
   */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Error thrown when the exchange responds with a non-2xx HTTP status or an
 * unreadable body. Surfacing these as exceptions keeps the failure visible to
 * the MCP client instead of returning a parsed body that looks like success.
 */
export class BlofinApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "BlofinApiError";
    this.status = status;
    this.body = body;
  }
}

export class BlofinClient {
  private config: BlofinConfig;

  constructor(config: BlofinConfig) {
    this.config = config;
  }

  private get timeoutMs(): number {
    return this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  /**
   * Build a query string from defined parameters.
   *
   * Undefined/null entries are dropped so callers can pass optional values
   * directly without pruning them first.
   */
  private static buildQuery(
    params?: Record<string, string | undefined>,
  ): string {
    if (!params) return "";
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        qs.append(key, value);
      }
    }
    const rendered = qs.toString();
    return rendered ? `?${rendered}` : "";
  }

  /**
   * Perform a request and decode the JSON body.
   *
   * Checks the HTTP status before decoding, and aborts on timeout. The prior
   * implementation called `resp.json()` unconditionally, so an HTML error page
   * from a gateway (or a 5xx with an empty body) surfaced as an opaque
   * "Unexpected token < in JSON" syntax error that hid the real cause.
   */
  private async request(
    url: string,
    init: RequestInit,
  ): Promise<unknown> {
    // Compose an abort signal that also respects a caller-supplied signal.
    const timeoutSignal = AbortSignal.timeout(this.timeoutMs);
    const signal = init.signal
      ? AbortSignal.any([init.signal, timeoutSignal])
      : timeoutSignal;

    const resp = await fetch(url, { ...init, signal });

    if (!resp.ok) {
      // Read as text first: the error body is usually HTML or plain text, so
      // parsing it as JSON would throw and mask the status code we need here.
      const body = await resp.text().catch(() => "");
      throw new BlofinApiError(
        `BloFin API request failed with HTTP ${resp.status} ${resp.statusText}`,
        resp.status,
        body.slice(0, 500),
      );
    }

    // A 204 (or any empty body) is a valid success with no payload.
    const text = await resp.text();
    if (!text) return null;

    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new BlofinApiError(
        "BloFin API returned a non-JSON response body",
        resp.status,
        text.slice(0, 500),
      );
    }
  }

  async publicGet(
    path: string,
    params?: Record<string, string | undefined>,
  ): Promise<unknown> {
    const url = `${this.config.baseUrl}${path}${BlofinClient.buildQuery(params)}`;
    return this.request(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  }

  async privateGet(
    path: string,
    params?: Record<string, string | undefined>,
  ): Promise<unknown> {
    // The signature must cover the exact path that is sent, query string
    // included, so build the request path before signing.
    const requestPath = `${path}${BlofinClient.buildQuery(params)}`;
    const headers = createAuthHeaders(
      this.config.apiKey,
      this.config.secretKey,
      this.config.passphrase,
      "GET",
      requestPath
    );
    const url = `${this.config.baseUrl}${requestPath}`;
    return this.request(url, { method: "GET", headers });
  }

  get brokerId(): string | undefined {
    return this.config.brokerId;
  }

  async privatePost(
    path: string,
    body: Record<string, unknown>,
  ): Promise<unknown> {
    const bodyStr = JSON.stringify(body);
    const headers = createAuthHeaders(
      this.config.apiKey,
      this.config.secretKey,
      this.config.passphrase,
      "POST",
      path,
      bodyStr
    );
    const url = `${this.config.baseUrl}${path}`;
    return this.request(url, {
      method: "POST",
      headers,
      body: bodyStr,
    });
  }
}
