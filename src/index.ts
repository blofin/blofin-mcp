#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { BlofinClient } from "./client.js";
import { registerPublicTools } from "./tools/public.js";
import { registerAccountTools } from "./tools/account.js";
import { registerTradingTools } from "./tools/trading.js";
import { registerAssetTools } from "./tools/asset.js";

const DEMO_BASE_URL = "https://demo-trading-openapi.blofin.com";
const PROD_BASE_URL = "https://openapi.blofin.com";
const DEFAULT_BROKER_ID = "dd3511977f23cc87";

function getEnvOrThrow(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

function resolveBrokerId(baseUrl: string): string | undefined {
  // Demo trading does not require broker ID
  if (baseUrl === DEMO_BASE_URL) return undefined;
  const raw = process.env.BLOFIN_BROKER_ID;
  // Transaction API users: set BLOFIN_BROKER_ID=none to disable
  if (raw === "none") return undefined;
  // Custom broker ID: use as-is
  if (raw) return raw;
  // Default: use built-in broker ID for Broker API users
  return DEFAULT_BROKER_ID;
}

async function main() {
  const apiKey = getEnvOrThrow("BLOFIN_API_KEY");
  const secretKey = getEnvOrThrow("BLOFIN_API_SECRET");
  const passphrase = getEnvOrThrow("BLOFIN_PASSPHRASE");
  const baseUrl = process.env.BLOFIN_BASE_URL || DEMO_BASE_URL;
  const brokerId = resolveBrokerId(baseUrl);

  const client = new BlofinClient({ apiKey, secretKey, passphrase, baseUrl, brokerId });

  const server = new McpServer({
    name: "blofin-mcp",
    version: "1.0.0",
  });

  registerPublicTools(server, client);
  registerAccountTools(server, client);
  registerTradingTools(server, client);
  registerAssetTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
