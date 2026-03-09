# Contributing

Thanks for your interest in contributing to `blofin-mcp`.

## Development Setup

1. Fork and clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Build and type-check:

```bash
npm run typecheck
npm run build
```

## Local Run

Set required environment variables before running:

- `BLOFIN_API_KEY`
- `BLOFIN_API_SECRET`
- `BLOFIN_PASSPHRASE`
- Optional: `BLOFIN_BASE_URL`, `BLOFIN_BROKER_ID`

Then run:

```bash
npm run build
npm run start
```

## Pull Request Guidelines

- Keep PRs focused and small.
- Add or update docs when behavior changes.
- Preserve backwards compatibility for existing tool names whenever possible.
- Include clear test/verification steps in the PR description.

## Commit Guidance

Use clear commit messages that explain the reason for the change, not only the code diff.

## Reporting Issues

Please use GitHub Issues and include:

- Environment (Node version, MCP client)
- Reproduction steps
- Expected behavior
- Actual behavior
- Logs and request parameters (remove secrets)
