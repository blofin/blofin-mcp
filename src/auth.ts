import crypto from "node:crypto";

export type AuthHeaders = Record<string, string>;

export function generateSignature(
  secretKey: string,
  method: string,
  path: string,
  timestamp: string,
  nonce: string,
  body?: string
): string {
  let prehash = `${path}${method}${timestamp}${nonce}`;
  if (body) {
    prehash += body;
  }
  const hexSignature = crypto
    .createHmac("sha256", secretKey)
    .update(prehash)
    .digest("hex");
  return Buffer.from(hexSignature).toString("base64");
}

export function createAuthHeaders(
  apiKey: string,
  secretKey: string,
  passphrase: string,
  method: string,
  path: string,
  body?: string
): AuthHeaders {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomUUID();
  const sign = generateSignature(secretKey, method, path, timestamp, nonce, body);

  return {
    "ACCESS-KEY": apiKey,
    "ACCESS-SIGN": sign,
    "ACCESS-TIMESTAMP": timestamp,
    "ACCESS-NONCE": nonce,
    "ACCESS-PASSPHRASE": passphrase,
    "Content-Type": "application/json",
  };
}
