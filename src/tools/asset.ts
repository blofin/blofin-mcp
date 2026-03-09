import { z } from "zod";
import { BlofinClient } from "../client.js";

export function registerAssetTools(
  server: { tool: Function },
  client: BlofinClient
) {
  server.tool(
    "get_asset_balances",
    "Get asset balances across different account types (funding, futures, etc.).",
    {
      accountType: z.string().describe("Account type: funding, futures, copy_trading, earn, spot"),
      currency: z.string().optional().describe("Currency, e.g. USDT"),
    },
    async ({ accountType, currency }: { accountType: string; currency?: string }) => {
      const params: Record<string, string> = {};
      if (accountType) params.accountType = accountType;
      if (currency) params.currency = currency;
      const result = await client.privateGet("/api/v1/asset/balances", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "fund_transfer",
    "Transfer funds between accounts (funding, futures, copy_trading, earn, spot).",
    {
      currency: z.string().describe("Currency, e.g. USDT"),
      amount: z.string().describe("Transfer amount"),
      fromAccount: z.string().describe("Source account: funding, futures, copy_trading, earn, spot"),
      toAccount: z.string().describe("Destination account: funding, futures, copy_trading, earn, spot"),
      clientId: z.string().optional().describe("Client-supplied transfer ID"),
    },
    async ({ currency, amount, fromAccount, toAccount, clientId }: { currency: string; amount: string; fromAccount: string; toAccount: string; clientId?: string }) => {
      const body: Record<string, unknown> = { currency, amount, fromAccount, toAccount };
      if (clientId) body.clientId = clientId;
      const result = await client.privatePost("/api/v1/asset/transfer", body);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_fund_transfer_history",
    "Get fund transfer history between accounts.",
    {
      currency: z.string().optional().describe("Currency, e.g. USDT"),
      fromAccount: z.string().optional().describe("Source account filter"),
      toAccount: z.string().optional().describe("Destination account filter"),
      before: z.string().optional().describe("Pagination - records newer than this timestamp (ms)"),
      after: z.string().optional().describe("Pagination - records earlier than this timestamp (ms)"),
      limit: z.string().optional().describe("Number of results, max 100. Default 100."),
    },
    async ({ currency, fromAccount, toAccount, before, after, limit }: { currency?: string; fromAccount?: string; toAccount?: string; before?: string; after?: string; limit?: string }) => {
      const params: Record<string, string> = {};
      if (currency) params.currency = currency;
      if (fromAccount) params.fromAccount = fromAccount;
      if (toAccount) params.toAccount = toAccount;
      if (before) params.before = before;
      if (after) params.after = after;
      if (limit) params.limit = limit;
      const result = await client.privateGet("/api/v1/asset/bills", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_deposit_history",
    "Get deposit history.",
    {
      currency: z.string().optional().describe("Currency, e.g. USDT"),
      state: z.string().optional().describe("Status: 0=pending, 1=done, 2=failed, 3=kyt"),
      before: z.string().optional().describe("Pagination - records newer than this timestamp (ms)"),
      after: z.string().optional().describe("Pagination - records earlier than this timestamp (ms)"),
      limit: z.string().optional().describe("Number of results, max 100. Default 20."),
    },
    async ({ currency, state, before, after, limit }: { currency?: string; state?: string; before?: string; after?: string; limit?: string }) => {
      const params: Record<string, string> = {};
      if (currency) params.currency = currency;
      if (state) params.state = state;
      if (before) params.before = before;
      if (after) params.after = after;
      if (limit) params.limit = limit;
      const result = await client.privateGet("/api/v1/asset/deposit-history", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_withdrawal_history",
    "Get withdrawal history.",
    {
      currency: z.string().optional().describe("Currency, e.g. USDT"),
      state: z.string().optional().describe("Status: 0=waiting review, 2=failed, 3=success, 4=canceled, 7=processing"),
      before: z.string().optional().describe("Pagination - records newer than this timestamp (ms)"),
      after: z.string().optional().describe("Pagination - records earlier than this timestamp (ms)"),
      limit: z.string().optional().describe("Number of results, max 100. Default 20."),
    },
    async ({ currency, state, before, after, limit }: { currency?: string; state?: string; before?: string; after?: string; limit?: string }) => {
      const params: Record<string, string> = {};
      if (currency) params.currency = currency;
      if (state) params.state = state;
      if (before) params.before = before;
      if (after) params.after = after;
      if (limit) params.limit = limit;
      const result = await client.privateGet("/api/v1/asset/withdrawal-history", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_apikey_info",
    "Get API key information including permissions, IP whitelist, and expiration.",
    {},
    async () => {
      const result = await client.privateGet("/api/v1/user/query-apikey");
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
