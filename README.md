# Error Solver

Error Solver is a TypeScript code-flow analyzer for projects that use numbered source-file pipelines. It scans `src/`, parses filenames such as `001_LoginButton_STARTto002.tsx`, and reports broken links, duplicate IDs, orphaned files, missing endpoints, ID gaps, and incomplete START-to-END flows.

The tool is intentionally simple: your product code stays in `src/`, while the analyzer engine and dashboard live inside `.error-solver/`.

## What It Solves

Large projects become difficult to debug when file relationships are implicit. Error Solver makes flow explicit through filenames, then audits those relationships before bugs reach runtime.

It is useful for:

- React, Next.js, Node, and TypeScript projects
- tutorial or template projects that need readable architecture
- beginner-friendly codebases where flow should be obvious
- small teams that want a lightweight static architecture check
- visualizing source pipelines without introducing a framework

## Core Features

| Feature | Description |
| --- | --- |
| Recursive source scan | Reads supported files under `src/` and its subfolders |
| Filename parser | Extracts ID, name, input, and output from strict file names |
| Connectivity check | Detects inputs or outputs that point to missing IDs |
| Duplicate detector | Finds repeated numeric IDs |
| Orphan finder | Reports scanned files that do not map into the registry |
| Gap detector | Finds missing numbers in a sequence |
| Flow tracer | Walks START-to-END chains and detects broken paths or loops |
| Dashboard | Ships a static HTML dashboard under `.error-solver/dashboard/` |

## Naming Convention

Every source file that should participate in the flow must use this format:

```text
[ID]_[Name]_[INPUT]to[OUTPUT].ext
```

Examples:

```text
001_LoginButton_STARTto002.tsx
002_useAuth_001to003.ts
003_AuthAPI_002toEND.ts
500_FormatDate_MULTtoMULT.ts
```

Meaning:

| Token | Meaning |
| --- | --- |
| `001` | Unique file ID, minimum 3 digits |
| `LoginButton` | Human-readable file role |
| `START` | Entry point |
| `END` | Exit point |
| `MULT` | Shared file used by many nodes |
| `001to003` | This file receives from `001` and sends to `003` |

## Project Layout

```text
.error-solver/
  engine/        TypeScript analyzer
  dashboard/     Static visual dashboard
src/
  01_components/
  02_hooks/
  03_pages/
  04_services/
  05_utils/
registry.json    Generated registry snapshot
report.txt       Optional text report output
```

## Quick Start

Install dependencies:

```bash
npm install
```

Run a live audit:

```bash
npm run audit
```

Write or refresh `registry.json`:

```bash
npm run tool:build
```

Generate `report.txt` from `registry.json`:

```bash
npm run tool:report
```

Run the complete local workflow:

```bash
npm run tool:full
```

Open the dashboard:

```bash
npm run dashboard
```

Then open:

```text
.error-solver/dashboard/index.html
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run audit` | Live audit of the current `src/` tree |
| `npm run test` | Alias for `npm run audit` |
| `npm run tool:build` | Scan `src/` and write `registry.json` |
| `npm run tool:check` | Run audit without mutating `registry.json` |
| `npm run tool:archive` | Copy orphan files into `archive/` |
| `npm run tool:report` | Generate `report.txt` from `registry.json` |
| `npm run tool:full` | Build registry, check, and generate report |

## Supported Source Extensions

```text
.js .ts .jsx .tsx .py .java .cpp .c .go .rs .rb .php .vue .svelte .dart
```

## Current Template Status

This repository is a starter template. The default `src/` folders contain README placeholders only, so `npm run audit` should pass even before application files are added. Once you add numbered source files, Error Solver begins enforcing the flow graph.

## License

MIT. See [LICENSE](LICENSE).
