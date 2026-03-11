# BloFin MCP Server

A Model Context Protocol (MCP) server for the [BloFin](https://blofin.com/) cryptocurrency exchange API. Provides tools for market data, account management, and trading operations.

## Features

### Public Data (no authentication required)
- `get_instruments` - Get available trading instruments and contract specs
- `get_tickers` - Get latest prices, bid/ask, 24h volume
- `get_orderbook` - Get order book depth
- `get_trades` - Get recent trades
- `get_mark_price` - Get mark/index prices
- `get_candlesticks` - Get OHLCV candlestick data
- `get_funding_rate` - Get current funding rates
- `get_funding_rate_history` - Get historical funding rates

### Account (authentication required)
- `get_balance` - Get futures account balance
- `get_positions` - Get open positions
- `get_leverage_info` - Get leverage info for an instrument
- `set_leverage` - Set leverage for an instrument
- `get_margin_mode` - Get current margin mode for an instrument
- `set_margin_mode` - Set margin mode for an instrument
- `get_position_mode` - Get current position mode
- `set_position_mode` - Set position mode
- `get_account_config` - Get account configuration

### Trading (authentication required)
- `place_order` - Place a new order (market, limit, post_only, fok, ioc)
- `cancel_order` - Cancel an order
- `batch_orders` - Place multiple orders at once
- `cancel_batch_orders` - Cancel multiple orders at once
- `close_position` - Close a position
- `get_open_orders` - Get pending orders
- `get_order_history` - Get order history
- `get_order_detail` - Get specific order details
- `get_fills_history` - Get trade fill history
- `place_tpsl` - Place take-profit/stop-loss order
- `cancel_tpsl` - Cancel a take-profit/stop-loss order
- `get_pending_tpsl` - Get pending TP/SL orders
- `get_tpsl_history` - Get TP/SL order history
- `place_algo_order` - Place an algo order (trigger/conditional)
- `cancel_algo_order` - Cancel algo orders
- `get_pending_algo_orders` - Get pending algo orders
- `get_algo_order_history` - Get algo order history

### Asset Management (authentication required)
- `get_asset_balances` - Get balances across account types
- `fund_transfer` - Transfer funds between accounts
- `get_fund_transfer_history` - Get transfer history
- `get_deposit_history` - Get deposit history
- `get_withdrawal_history` - Get withdrawal history
- `get_apikey_info` - Get API key information

## Important Risk Notice

- Trading tools can place and cancel real orders.
- Use demo environment first, then switch to production only when ready.
- Create API keys with least privilege and restrict by IP whenever possible.
- Never share your API key, secret, or passphrase.

## Tool Coverage

Current implementation registers **40 tools** in total:

- Public Market Data: 8 tools
- Account: 9 tools
- Trading: 17 tools
- Asset Management: 6 tools

## Getting Your API Key

1. Go to [blofin.com](https://blofin.com/) and log in (or create an account)
2. Navigate to **APIs** page
3. Click **Create API Key** and select **BloFin MCP** as the API type
4. Set your permissions (read-only for market data, or enable trading as needed)
5. Save your **API Key**, **Secret Key**, and **Passphrase** — you'll need them for configuration below

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BLOFIN_API_KEY` | Yes | Your BloFin API key |
| `BLOFIN_API_SECRET` | Yes | Your BloFin API secret |
| `BLOFIN_PASSPHRASE` | Yes | Your BloFin API passphrase |
| `BLOFIN_BASE_URL` | No | API base URL (defaults to demo trading) |

### Base URLs

- Demo Trading: `https://demo-trading-openapi.blofin.com` (default)
- Production: `https://openapi.blofin.com`

## Install and Build

```bash
npm install
npm run typecheck
npm run build
```

## MCP Client Configuration

### Claude Desktop

Add to your Claude Desktop config (`Settings → Developer → Edit Config`):

```json
{
  "mcpServers": {
    "blofin": {
      "command": "npx",
      "args": ["-y", "blofin-mcp"],
      "env": {
        "BLOFIN_API_KEY": "your-api-key",
        "BLOFIN_API_SECRET": "your-api-secret",
        "BLOFIN_PASSPHRASE": "your-passphrase",
        "BLOFIN_BASE_URL": "https://openapi.blofin.com"
      }
    }
  }
}
```

### Cursor / Windsurf / Cline

Same configuration format as above. Add to each client's MCP settings.

### OpenClaw

Add `"mcpServers"` to your `~/.openclaw/openclaw.json` (top-level field, alongside `identity`, `agent`, etc.):

```json5
{
  "identity": { "name": "Clawd", "emoji": "🦞" },
  "agent": { "workspace": "~/.openclaw/workspace" },

  // Add this section ↓
  "mcpServers": {
    "blofin": {
      "command": "npx",
      "args": ["-y", "blofin-mcp"],
      "env": {
        "BLOFIN_API_KEY": "your-api-key",
        "BLOFIN_API_SECRET": "your-api-secret",
        "BLOFIN_PASSPHRASE": "your-passphrase",
        "BLOFIN_BASE_URL": "https://openapi.blofin.com"
      }
    }
  }
}
```

If your `openclaw.json` already has a `"mcpServers"` section with other servers, just add `"blofin": { ... }` inside it.

Restart OpenClaw after saving. The agent will automatically discover the 40 BloFin tools.


## Open Source Project Files

- License: `LICENSE`
- Contributing guide: `CONTRIBUTING.md`
- Security policy: `SECURITY.md`
- Community behavior policy: `CODE_OF_CONDUCT.md`
- Change history: `CHANGELOG.md`

## Reporting and Support

- Bug reports and feature requests: GitHub Issues
- Security issues: follow `SECURITY.md`
- API reference: [BloFin API Docs](https://docs.blofin.com/index.html)
