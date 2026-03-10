# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.4] - 2026-03-10

### Changed

- Aligned account, asset, and trading tool parameter schemas with BloFin REST API requirements.
- Updated payload definitions for account-level margin mode and transfer/deposit/withdraw query filters.
- Expanded trading request fields for TPSL and algo order scenarios to match exchange-side parameters.

## [1.1.3] - 2026-03-09

### Changed

- Expanded `README.md` tool documentation to enumerate the full implemented tool set for clearer usage reference.
- Switched project license from `ISC` to `Apache-2.0` in both `LICENSE` and package metadata.
- Released `1.1.3` with CI-required TypeScript type definition dependencies and synchronized lockfile metadata.

## [1.1.2] - 2026-03-09

### Added

- Initial public release metadata and packaging setup.
- Broad BloFin MCP tool coverage for market data, account, trading, and asset APIs.

### Notes

- API and tool behavior is currently aligned with BloFin REST endpoint wrappers.
- See README for supported tools and environment configuration.
