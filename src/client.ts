import { createAuthHeaders } from "./auth.js";

export interface BlofinConfig {
  apiKey: string;
  secretKey: string;
  passphrase: string;
  baseUrl: string;
  brokerId?: string;
}

export class BlofinClient {
  private config: BlofinConfig;

  constructor(config: BlofinConfig) {
    this.config = config;
  }

  async publicGet(path: string, params?: Record<string, string>): Promise<unknown> {
    let url = `${this.config.baseUrl}${path}`;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      if (qs) url += `?${qs}`;
    }
    const resp = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return resp.json();
  }

  async privateGet(path: string, params?: Record<string, string>): Promise<unknown> {
    let requestPath = path;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      if (qs) requestPath += `?${qs}`;
    }
    const headers = createAuthHeaders(
      this.config.apiKey,
      this.config.secretKey,
      this.config.passphrase,
      "GET",
      requestPath
    );
    const url = `${this.config.baseUrl}${requestPath}`;
    const resp = await fetch(url, { method: "GET", headers });
    return resp.json();
  }

  get brokerId(): string | undefined {
    return this.config.brokerId;
  }

  async privatePost(path: string, body: Record<string, unknown>): Promise<unknown> {
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
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: bodyStr,
    });
    return resp.json();
  }
}
