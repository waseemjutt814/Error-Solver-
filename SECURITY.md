# Security Policy

## Supported Scope

Security reports are accepted for the current `main` branch of Error Solver.

Important surfaces:

- TypeScript analyzer code in `.error-solver/engine/`
- recursive source scanning
- archive/report file writing
- GitHub Actions workflows
- package metadata and install scripts

## Reporting A Vulnerability

Do not open a public issue for a vulnerability.

Use GitHub private vulnerability reporting if available. If it is not available, contact the maintainer through the GitHub profile.

Please include:

- affected commit
- reproduction steps
- affected command
- expected impact
- suggested fix, if known

## Trust Boundaries

Error Solver is a local developer tool. It should not require secrets, API keys, background services, or network access for normal audit behavior.

The tool reads files under `src/` and can write:

- `registry.json` through `npm run tool:build`
- `report.txt` through `npm run tool:report`
- `archive/` copies through `npm run tool:archive`

Review generated files before publishing them.
