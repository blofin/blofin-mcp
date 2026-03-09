# Security Policy

## Supported Versions

Only the latest released version is officially supported with security fixes.

## Reporting a Vulnerability

Please do not open public issues for security vulnerabilities.

Report vulnerabilities through:

- GitHub private vulnerability reporting (preferred), or
- Email: `security@blofin.com`

When reporting, include:

- Affected version
- Impact and attack scenario
- Reproduction steps or proof of concept
- Suggested remediation if available

We will acknowledge reports as soon as possible and coordinate a responsible disclosure timeline.

## Secret Handling

This project uses API credentials (`BLOFIN_API_KEY`, `BLOFIN_API_SECRET`, `BLOFIN_PASSPHRASE`).
Never commit secrets to source control, issue comments, or pull requests.
