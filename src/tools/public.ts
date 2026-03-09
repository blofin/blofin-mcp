import { z } from "zod";
import { BlofinClient } from "../client.js";

export function registerPublicTools(
  server: { tool: Function },
  client: BlofinClient
) {
  server.tool(
    "get_instruments",
    "Get available trading instruments. Returns contract specifications including min size, tick size, leverage limits.",
    { instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT") },
    async ({ instId }: { instId?: string }) => {
      const params: Record<string, string> = {};
      if (instId) params.instId = instId;
      const result = await client.publicGet("/api/v1/market/instruments", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_tickers",
    "Get latest price snapshot, best bid/ask, and 24h trading volume for instruments.",
    { instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT. If omitted, returns all tickers.") },
    async ({ instId }: { instId?: string }) => {
      const params: Record<string, string> = {};
      if (instId) params.instId = instId;
      const result = await client.publicGet("/api/v1/market/tickers", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_orderbook",
    "Get order book depth for an instrument.",
    {
      instId: z.string().describe("Instrument ID, e.g. BTC-USDT"),
      size: z.string().optional().describe("Depth per side, max 100. Default 1."),
    },
    async ({ instId, size }: { instId: string; size?: string }) => {
      const params: Record<string, string> = { instId };
      if (size) params.size = size;
      const result = await client.publicGet("/api/v1/market/books", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_trades",
    "Get recent trades for an instrument.",
    {
      instId: z.string().describe("Instrument ID, e.g. BTC-USDT"),
      limit: z.string().optional().describe("Number of results, max 100. Default 100."),
    },
    async ({ instId, limit }: { instId: string; limit?: string }) => {
      const params: Record<string, string> = { instId };
      if (limit) params.limit = limit;
      const result = await client.publicGet("/api/v1/market/trades", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_mark_price",
    "Get mark price and index price for instruments.",
    { instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT") },
    async ({ instId }: { instId?: string }) => {
      const params: Record<string, string> = {};
      if (instId) params.instId = instId;
      const result = await client.publicGet("/api/v1/market/mark-price", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_candlesticks",
    "Get candlestick/kline data for an instrument.",
    {
      instId: z.string().describe("Instrument ID, e.g. BTC-USDT"),
      bar: z.string().optional().describe("Bar size, e.g. 1m, 5m, 15m, 30m, 1H, 4H, 1D, 1W, 1M. Default 1m."),
      after: z.string().optional().describe("Pagination - return records earlier than this timestamp (ms)"),
      before: z.string().optional().describe("Pagination - return records newer than this timestamp (ms)"),
      limit: z.string().optional().describe("Number of results, max 300. Default 100."),
    },
    async ({ instId, bar, after, before, limit }: { instId: string; bar?: string; after?: string; before?: string; limit?: string }) => {
      const params: Record<string, string> = { instId };
      if (bar) params.bar = bar;
      if (after) params.after = after;
      if (before) params.before = before;
      if (limit) params.limit = limit;
      const result = await client.publicGet("/api/v1/market/candles", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_funding_rate",
    "Get current funding rate for instruments.",
    { instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT") },
    async ({ instId }: { instId?: string }) => {
      const params: Record<string, string> = {};
      if (instId) params.instId = instId;
      const result = await client.publicGet("/api/v1/market/funding-rate", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_funding_rate_history",
    "Get historical funding rate data.",
    {
      instId: z.string().describe("Instrument ID, e.g. BTC-USDT"),
      after: z.string().optional().describe("Pagination - return records earlier than this timestamp (ms)"),
      before: z.string().optional().describe("Pagination - return records newer than this timestamp (ms)"),
      limit: z.string().optional().describe("Number of results, max 100. Default 100."),
    },
    async ({ instId, after, before, limit }: { instId: string; after?: string; before?: string; limit?: string }) => {
      const params: Record<string, string> = { instId };
      if (after) params.after = after;
      if (before) params.before = before;
      if (limit) params.limit = limit;
      const result = await client.publicGet("/api/v1/market/funding-rate-history", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
