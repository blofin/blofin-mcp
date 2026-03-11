import { z } from "zod";
import { BlofinClient } from "../client.js";

function applyBrokerId(body: Record<string, unknown>, paramBrokerId: string | undefined, client: BlofinClient): void {
  const id = paramBrokerId || client.brokerId;
  if (id) body.brokerId = id;
}

export function registerTradingTools(
  server: { tool: Function },
  client: BlofinClient
) {
  server.tool(
    "place_order",
    "Place a new futures order. Supports limit, market, post_only, fok, ioc order types.",
    {
      instId: z.string().describe("Instrument ID, e.g. BTC-USDT"),
      marginMode: z.string().describe("Margin mode: cross or isolated"),
      positionSide: z.string().describe("Position side: net (One-way Mode), long or short (Hedge Mode)"),
      side: z.string().describe("Order side: buy or sell"),
      orderType: z.string().describe("Order type: market, limit, post_only, fok, ioc"),
      price: z.string().optional().describe("Price (required for limit orders, not applicable to market)"),
      size: z.string().describe("Order size in contracts"),
      reduceOnly: z.string().optional().describe("Whether reduce-only order: 'true' or 'false'. Default 'false'."),
      clientOrderId: z.string().optional().describe("Client-supplied order ID"),
      tpTriggerPrice: z.string().optional().describe("Take profit trigger price"),
      tpOrderPrice: z.string().optional().describe("Take profit order price. -1 for market price."),
      slTriggerPrice: z.string().optional().describe("Stop loss trigger price"),
      slOrderPrice: z.string().optional().describe("Stop loss order price. -1 for market price."),
      brokerId: z.string().optional().describe("Broker ID"),
    },
    async (params: {
      instId: string; marginMode: string; positionSide: string; side: string;
      orderType: string; price?: string; size: string; reduceOnly?: string;
      clientOrderId?: string; tpTriggerPrice?: string; tpOrderPrice?: string;
      slTriggerPrice?: string; slOrderPrice?: string; brokerId?: string;
    }) => {
      const body: Record<string, unknown> = {
        instId: params.instId,
        marginMode: params.marginMode,
        positionSide: params.positionSide,
        side: params.side,
        orderType: params.orderType,
        size: params.size,
      };
      if (params.price) body.price = params.price;
      if (params.reduceOnly) body.reduceOnly = params.reduceOnly;
      if (params.clientOrderId) body.clientOrderId = params.clientOrderId;
      if (params.tpTriggerPrice) body.tpTriggerPrice = params.tpTriggerPrice;
      if (params.tpOrderPrice) body.tpOrderPrice = params.tpOrderPrice;
      if (params.slTriggerPrice) body.slTriggerPrice = params.slTriggerPrice;
      if (params.slOrderPrice) body.slOrderPrice = params.slOrderPrice;
      applyBrokerId(body, params.brokerId, client);
      const result = await client.privatePost("/api/v1/trade/order", body);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "cancel_order",
    "Cancel an existing order.",
    {
      instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT"),
      orderId: z.string().describe("Order ID"),
      clientOrderId: z.string().optional().describe("Client-supplied order ID"),
    },
    async ({ instId, orderId, clientOrderId }: { instId?: string; orderId: string; clientOrderId?: string }) => {
      const body: Record<string, unknown> = { orderId };
      if (instId) body.instId = instId;
      if (clientOrderId) body.clientOrderId = clientOrderId;
      const result = await client.privatePost("/api/v1/trade/cancel-order", body);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "batch_orders",
    "Place multiple orders at once (up to 20). All must share same instId and marginMode.",
    {
      orders: z.string().describe("JSON array string of order objects. Each needs: instId, marginMode, side, orderType, size, and optionally price, positionSide, etc."),
    },
    async ({ orders }: { orders: string }) => {
      const parsed = JSON.parse(orders);
      const result = await client.privatePost("/api/v1/trade/batch-orders", parsed);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "cancel_batch_orders",
    "Cancel multiple orders at once.",
    {
      orders: z.string().describe("JSON array string of cancel objects. Each needs: instId, orderId or clientOrderId."),
    },
    async ({ orders }: { orders: string }) => {
      const parsed = JSON.parse(orders);
      const result = await client.privatePost("/api/v1/trade/cancel-batch-orders", parsed);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "close_position",
    "Close a position for an instrument via a market order.",
    {
      instId: z.string().describe("Instrument ID, e.g. BTC-USDT"),
      marginMode: z.string().describe("Margin mode: cross or isolated"),
      positionSide: z.string().describe("Position side: net (One-way Mode), long or short (Hedge Mode)"),
      clientOrderId: z.string().optional().describe("Client-supplied order ID"),
      brokerId: z.string().optional().describe("Broker ID provided by BloFin"),
    },
    async ({ instId, marginMode, positionSide, clientOrderId, brokerId }: { instId: string; marginMode: string; positionSide: string; clientOrderId?: string; brokerId?: string }) => {
      const body: Record<string, unknown> = { instId, marginMode, positionSide };
      if (clientOrderId) body.clientOrderId = clientOrderId;
      applyBrokerId(body, brokerId, client);
      const result = await client.privatePost("/api/v1/trade/close-position", body);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_open_orders",
    "Get list of currently open/pending orders.",
    {
      instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT"),
      orderType: z.string().optional().describe("Order type filter: market, limit, post_only, fok, ioc"),
      state: z.string().optional().describe("State filter: live, partially_filled"),
      after: z.string().optional().describe("Pagination - records earlier than this orderId"),
      before: z.string().optional().describe("Pagination - records newer than this orderId"),
      limit: z.string().optional().describe("Number of results, max 100. Default 20."),
    },
    async ({ instId, orderType, state, after, before, limit }: { instId?: string; orderType?: string; state?: string; after?: string; before?: string; limit?: string }) => {
      const params: Record<string, string> = {};
      if (instId) params.instId = instId;
      if (orderType) params.orderType = orderType;
      if (state) params.state = state;
      if (after) params.after = after;
      if (before) params.before = before;
      if (limit) params.limit = limit;
      const result = await client.privateGet("/api/v1/trade/orders-pending", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_order_history",
    "Get order history.",
    {
      instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT"),
      orderType: z.string().optional().describe("Order type filter: market, limit, post_only, fok, ioc"),
      state: z.string().optional().describe("State filter: canceled, filled, partially_canceled"),
      after: z.string().optional().describe("Pagination - records earlier than this orderId"),
      before: z.string().optional().describe("Pagination - records newer than this orderId"),
      begin: z.string().optional().describe("Filter begin timestamp (ms)"),
      end: z.string().optional().describe("Filter end timestamp (ms)"),
      limit: z.string().optional().describe("Number of results, max 100. Default 20."),
    },
    async ({ instId, orderType, state, after, before, begin, end, limit }: { instId?: string; orderType?: string; state?: string; after?: string; before?: string; begin?: string; end?: string; limit?: string }) => {
      const params: Record<string, string> = {};
      if (instId) params.instId = instId;
      if (orderType) params.orderType = orderType;
      if (state) params.state = state;
      if (after) params.after = after;
      if (before) params.before = before;
      if (begin) params.begin = begin;
      if (end) params.end = end;
      if (limit) params.limit = limit;
      const result = await client.privateGet("/api/v1/trade/orders-history", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_order_detail",
    "Get details of a specific order. Either orderId or clientOrderId or algoClientOrderId is required.",
    {
      instId: z.string().describe("Instrument ID, e.g. BTC-USDT"),
      orderId: z.string().optional().describe("Order ID (takes priority if all provided)"),
      clientOrderId: z.string().optional().describe("Client-supplied order ID"),
      algoClientOrderId: z.string().optional().describe("Algo client order ID"),
    },
    async ({ instId, orderId, clientOrderId, algoClientOrderId }: { instId: string; orderId?: string; clientOrderId?: string; algoClientOrderId?: string }) => {
      const params: Record<string, string> = { instId };
      if (orderId) params.orderId = orderId;
      if (clientOrderId) params.clientOrderId = clientOrderId;
      if (algoClientOrderId) params.algoClientOrderId = algoClientOrderId;
      const result = await client.privateGet("/api/v1/trade/orders-detail", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_fills_history",
    "Get trade fill history for futures.",
    {
      instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT"),
      orderId: z.string().optional().describe("Order ID"),
      after: z.string().optional().describe("Pagination - records earlier than this tradeId"),
      before: z.string().optional().describe("Pagination - records newer than this tradeId"),
      begin: z.string().optional().describe("Filter begin timestamp (ms)"),
      end: z.string().optional().describe("Filter end timestamp (ms)"),
      limit: z.string().optional().describe("Number of results, max 100. Default 20."),
    },
    async ({ instId, orderId, after, before, begin, end, limit }: { instId?: string; orderId?: string; after?: string; before?: string; begin?: string; end?: string; limit?: string }) => {
      const params: Record<string, string> = {};
      if (instId) params.instId = instId;
      if (orderId) params.orderId = orderId;
      if (after) params.after = after;
      if (before) params.before = before;
      if (begin) params.begin = begin;
      if (end) params.end = end;
      if (limit) params.limit = limit;
      const result = await client.privateGet("/api/v1/trade/fills-history", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "place_tpsl",
    "Place take-profit/stop-loss order for a position. Either tpTriggerPrice or slTriggerPrice (or both) must be provided.",
    {
      instId: z.string().describe("Instrument ID, e.g. BTC-USDT"),
      marginMode: z.string().describe("Margin mode: cross or isolated"),
      positionSide: z.string().describe("Position side: net (One-way Mode), long or short (Hedge Mode). Must be sent in Hedge Mode."),
      side: z.string().describe("Order side: buy or sell"),
      tpTriggerPrice: z.string().optional().describe("Take-profit trigger price. If provided, tpOrderPrice should also be filled. Either tpTriggerPrice or slTriggerPrice must be provided."),
      tpOrderPrice: z.string().optional().describe("Take-profit order price. If provided, tpTriggerPrice should also be filled. -1 for market price."),
      slTriggerPrice: z.string().optional().describe("Stop-loss trigger price. If provided, slOrderPrice should also be filled. Either tpTriggerPrice or slTriggerPrice must be provided."),
      slOrderPrice: z.string().optional().describe("Stop-loss order price. If provided, slTriggerPrice should also be filled. -1 for market price."),
      size: z.string().describe("Quantity in contracts. -1 for entire position."),
      reduceOnly: z.string().optional().describe("Whether orders can only reduce position size: 'true' or 'false'. Default 'false'. When true and opposite order exceeds position size, position is fully closed without opening a new one."),
      clientOrderId: z.string().optional().describe("Client Order ID. Up to 32 case-sensitive alphanumeric characters."),
      brokerId: z.string().optional().describe("Broker ID provided by BloFin. Up to 16 case-sensitive alphanumeric characters."),
    },
    async (params: {
      instId: string; marginMode: string; positionSide: string; side: string;
      tpTriggerPrice?: string; tpOrderPrice?: string;
      slTriggerPrice?: string; slOrderPrice?: string; size: string;
      reduceOnly?: string; clientOrderId?: string; brokerId?: string;
    }) => {
      const body: Record<string, unknown> = {
        instId: params.instId,
        marginMode: params.marginMode,
        positionSide: params.positionSide,
        side: params.side,
        size: params.size,
      };
      if (params.tpTriggerPrice) body.tpTriggerPrice = params.tpTriggerPrice;
      if (params.tpOrderPrice) body.tpOrderPrice = params.tpOrderPrice;
      if (params.slTriggerPrice) body.slTriggerPrice = params.slTriggerPrice;
      if (params.slOrderPrice) body.slOrderPrice = params.slOrderPrice;
      if (params.reduceOnly) body.reduceOnly = params.reduceOnly;
      if (params.clientOrderId) body.clientOrderId = params.clientOrderId;
      applyBrokerId(body, params.brokerId, client);
      const result = await client.privatePost("/api/v1/trade/order-tpsl", body);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "cancel_tpsl",
    "Cancel take-profit/stop-loss orders. Accepts a JSON array of cancel objects.",
    {
      orders: z.string().describe("JSON array string of cancel objects. Each needs: instId, tpslId. Optional: clientOrderId. E.g. [{\"instId\":\"BTC-USDT\",\"tpslId\":\"123\"}]"),
    },
    async ({ orders }: { orders: string }) => {
      const parsed = JSON.parse(orders);
      const result = await client.privatePost("/api/v1/trade/cancel-tpsl", parsed);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_pending_tpsl",
    "Get pending take-profit/stop-loss orders.",
    {
      instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT"),
      tpslId: z.string().optional().describe("TPSL order ID"),
      clientOrderId: z.string().optional().describe("Client-supplied order ID"),
      after: z.string().optional().describe("Pagination - records earlier than this tpslId"),
      before: z.string().optional().describe("Pagination - records newer than this tpslId"),
      limit: z.string().optional().describe("Number of results, max 100. Default 20."),
    },
    async ({ instId, tpslId, clientOrderId, after, before, limit }: { instId?: string; tpslId?: string; clientOrderId?: string; after?: string; before?: string; limit?: string }) => {
      const params: Record<string, string> = {};
      if (instId) params.instId = instId;
      if (tpslId) params.tpslId = tpslId;
      if (clientOrderId) params.clientOrderId = clientOrderId;
      if (after) params.after = after;
      if (before) params.before = before;
      if (limit) params.limit = limit;
      const result = await client.privateGet("/api/v1/trade/orders-tpsl-pending", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_tpsl_history",
    "Get take-profit/stop-loss order history.",
    {
      instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT"),
      tpslId: z.string().optional().describe("TPSL order ID"),
      after: z.string().optional().describe("Pagination - records earlier than this ID"),
      before: z.string().optional().describe("Pagination - records newer than this ID"),
      limit: z.string().optional().describe("Number of results, max 100. Default 20."),
    },
    async ({ instId, tpslId, after, before, limit }: { instId?: string; tpslId?: string; after?: string; before?: string; limit?: string }) => {
      const params: Record<string, string> = {};
      if (instId) params.instId = instId;
      if (tpslId) params.tpslId = tpslId;
      if (after) params.after = after;
      if (before) params.before = before;
      if (limit) params.limit = limit;
      const result = await client.privateGet("/api/v1/trade/orders-tpsl-history", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "place_algo_order",
    "Place an algo order (trigger order).",
    {
      instId: z.string().describe("Instrument ID, e.g. BTC-USDT"),
      marginMode: z.string().describe("Margin mode: cross or isolated"),
      positionSide: z.string().describe("Position side: net (One-way Mode), long or short (Hedge Mode)"),
      side: z.string().describe("Order side: buy or sell"),
      orderType: z.string().describe("Algo type: trigger"),
      size: z.string().describe("Size in contracts. -1 for entire position."),
      triggerPrice: z.string().describe("Trigger price"),
      triggerPriceType: z.string().optional().describe("Trigger price type: last (last price). Default last."),
      orderPrice: z.string().optional().describe("Order price after trigger. -1 for market."),
      reduceOnly: z.string().optional().describe("Whether reduce-only order: 'true' or 'false'. Default 'false'."),
      clientOrderId: z.string().optional().describe("Client-supplied order ID"),
      attachAlgoOrders: z.string().optional().describe("JSON array string of attached TP/SL orders. Each can have: tpTriggerPrice, tpOrderPrice, tpTriggerPriceType, slTriggerPrice, slOrderPrice, slTriggerPriceType"),
      brokerId: z.string().optional().describe("Broker ID provided by BloFin"),
    },
    async (params: {
      instId: string; marginMode: string; positionSide: string; side: string;
      orderType: string; size: string; triggerPrice: string; triggerPriceType?: string;
      orderPrice?: string; reduceOnly?: string; clientOrderId?: string;
      attachAlgoOrders?: string; brokerId?: string;
    }) => {
      const body: Record<string, unknown> = {
        instId: params.instId,
        marginMode: params.marginMode,
        positionSide: params.positionSide,
        side: params.side,
        orderType: params.orderType,
        size: params.size,
        triggerPrice: params.triggerPrice,
      };
      if (params.triggerPriceType) body.triggerPriceType = params.triggerPriceType;
      if (params.orderPrice) body.orderPrice = params.orderPrice;
      if (params.reduceOnly) body.reduceOnly = params.reduceOnly;
      if (params.clientOrderId) body.clientOrderId = params.clientOrderId;
      if (params.attachAlgoOrders) body.attachAlgoOrders = JSON.parse(params.attachAlgoOrders);
      applyBrokerId(body, params.brokerId, client);
      const result = await client.privatePost("/api/v1/trade/order-algo", body);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "cancel_algo_order",
    "Cancel an algo order.",
    {
      instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT"),
      algoId: z.string().optional().describe("Algo order ID"),
      clientOrderId: z.string().optional().describe("Client-supplied order ID"),
    },
    async ({ instId, algoId, clientOrderId }: { instId?: string; algoId?: string; clientOrderId?: string }) => {
      const body: Record<string, unknown> = {};
      if (instId) body.instId = instId;
      if (algoId) body.algoId = algoId;
      if (clientOrderId) body.clientOrderId = clientOrderId;
      const result = await client.privatePost("/api/v1/trade/cancel-algo", body);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_pending_algo_orders",
    "Get pending algo orders.",
    {
      instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT"),
      algoId: z.string().optional().describe("Algo order ID"),
      clientOrderId: z.string().optional().describe("Client-supplied order ID"),
      orderType: z.string().optional().describe("Algo type filter: trigger"),
      after: z.string().optional().describe("Pagination - records earlier than this algoId"),
      before: z.string().optional().describe("Pagination - records newer than this algoId"),
      limit: z.string().optional().describe("Number of results, max 100. Default 20."),
    },
    async ({ instId, algoId, clientOrderId, orderType, after, before, limit }: { instId?: string; algoId?: string; clientOrderId?: string; orderType?: string; after?: string; before?: string; limit?: string }) => {
      const params: Record<string, string> = {};
      if (instId) params.instId = instId;
      if (algoId) params.algoId = algoId;
      if (clientOrderId) params.clientOrderId = clientOrderId;
      if (orderType) params.orderType = orderType;
      if (after) params.after = after;
      if (before) params.before = before;
      if (limit) params.limit = limit;
      const result = await client.privateGet("/api/v1/trade/orders-algo-pending", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_algo_order_history",
    "Get algo order history.",
    {
      instId: z.string().optional().describe("Instrument ID, e.g. BTC-USDT"),
      algoId: z.string().optional().describe("Algo order ID"),
      after: z.string().optional().describe("Pagination - records earlier than this ID"),
      before: z.string().optional().describe("Pagination - records newer than this ID"),
      limit: z.string().optional().describe("Number of results, max 100. Default 20."),
    },
    async ({ instId, algoId, after, before, limit }: { instId?: string; algoId?: string; after?: string; before?: string; limit?: string }) => {
      const params: Record<string, string> = {};
      if (instId) params.instId = instId;
      if (algoId) params.algoId = algoId;
      if (after) params.after = after;
      if (before) params.before = before;
      if (limit) params.limit = limit;
      const result = await client.privateGet("/api/v1/trade/orders-algo-history", params);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    }
  );
}
