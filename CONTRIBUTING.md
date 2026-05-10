# Contributing

Thanks for improving Error Solver. Contributions should keep the project small, readable, and useful as a template.

## Development Setup

```bash
npm install
npm run audit
```

## Contribution Rules

- Keep the analyzer dependency-light.
- Keep `src/` as the user workspace.
- Keep `.error-solver/engine/` focused on flow analysis.
- Update `README.md` and `USER_MANUAL.md` when commands or behavior change.
- Do not commit local secrets, logs, generated caches, or `node_modules/`.
- Prefer clear TypeScript types over broad `any`.

## Pull Request Checklist

- `npm run audit` passes.
- Relevant docs are updated.
- GitHub metadata and package metadata remain accurate.
- New behavior is described with an example when useful.

## Security

Please do not report vulnerabilities in public issues. Follow [SECURITY.md](SECURITY.md).
