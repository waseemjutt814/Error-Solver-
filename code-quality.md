# Code Quality Guide

Error Solver is intentionally small. The quality bar is simple: every module should make the architecture easier to understand.

## TypeScript Standards

- Prefer explicit domain types.
- Use branded strings for IDs and file paths where they prevent accidental mixing.
- Return `Result<T, E>` for expected operational errors.
- Avoid `any`.
- Keep functions focused on one task.
- Keep IO at the boundary and pure logic in small helpers.

## Analyzer Rules

- Scanning should be deterministic.
- Parsing should not throw for malformed user filenames.
- Audit commands should give actionable messages.
- `npm run audit` should not mutate user files.
- Mutating commands should be explicit, such as `tool:build`, `tool:archive`, and `tool:report`.

## Documentation Rules

- Commands shown in docs must exist in `package.json`.
- Examples should use real filenames that the parser accepts.
- Avoid exaggerated claims; describe implemented behavior.
- Keep README focused on quick understanding.
- Keep `USER_MANUAL.md` focused on workflow details.

## Release Hygiene

- Do not commit `node_modules/`.
- Do not commit local `.env` files.
- Do not commit generated archives.
- Review `registry.json` and `report.txt` before publishing updates.
