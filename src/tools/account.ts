import { z } from "zod";
import { BlofinClient } from "../client.js";

export function registerAccountTools(
  server: { tool: Function },
  client: BlofinClient
) {
  server.tool(
    "get_balance",
    "Get futures account balance details including equity, available balance, frozen amounts.",
    {},
    async () => {
      const result = await client.privateGet("/api/v1/account/balance");
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_positions",
    "Get current open positions.",
    { instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT") },
    async ({ instId }: { instId?: string }) => {
      const params: Record<string, string> = {};
      if (instId) params.instId = instId;
      const result = await client.privateGet("/api/v1/account/positions", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_leverage_info",
    "Get leverage info for an instrument.",
    {
      instId: z.string().describe("Instrument ID, e.g. BTC-USDT"),
      marginMode: z.string().describe("Margin mode: cross or isolated"),
    },
    async ({ instId, marginMode }: { instId: string; marginMode: string }) => {
      const result = await client.privateGet("/api/v1/account/leverage-info", { instId, marginMode });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "set_leverage",
    "Set leverage for an instrument.",
    {
      instId: z.string().describe("Instrument ID, e.g. BTC-USDT"),
      leverage: z.string().describe("Leverage value, e.g. '10'"),
      marginMode: z.string().describe("Margin mode: cross or isolated"),
      positionSide: z.string().optional().describe("Position side: long, short, or net"),
    },
    async ({ instId, leverage, marginMode, positionSide }: { instId: string; leverage: string; marginMode: string; positionSide?: string }) => {
      const body: Record<string, unknown> = { instId, leverage, marginMode };
      if (positionSide) body.positionSide = positionSide;
      const result = await client.privatePost("/api/v1/account/set-leverage", body);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_margin_mode",
    "Get current margin mode for an instrument.",
    { instId: z.string().describe("Instrument ID, e.g. BTC-USDT") },
    async ({ instId }: { instId: string }) => {
      const result = await client.privateGet("/api/v1/account/margin-mode", { instId });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "set_margin_mode",
    "Set margin mode for an instrument.",
    {
      instId: z.string().describe("Instrument ID, e.g. BTC-USDT"),
      marginMode: z.string().describe("Margin mode: cross or isolated"),
    },
    async ({ instId, marginMode }: { instId: string; marginMode: string }) => {
      const result = await client.privatePost("/api/v1/account/set-margin-mode", { instId, marginMode });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_position_mode",
    "Get current position mode (long_short_mode or net_mode).",
    {},
    async () => {
      const result = await client.privateGet("/api/v1/account/position-mode");
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "set_position_mode",
    "Set position mode.",
    { positionMode: z.string().describe("Position mode: long_short_mode or net_mode") },
    async ({ positionMode }: { positionMode: string }) => {
      const result = await client.privatePost("/api/v1/account/set-position-mode", { positionMode });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_account_config",
    "Get account configuration including position mode, account level, etc.",
    {},
    async () => {
      const result = await client.privateGet("/api/v1/account/config");
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
