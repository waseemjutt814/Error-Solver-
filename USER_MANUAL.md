# Error Solver User Manual

## 1. Concept

Error Solver turns source-file names into an architecture map. Instead of relying only on imports or memory, each important file declares where it starts, where it receives input from, and where it sends control next.

Example:

```text
001_LoginButton_STARTto002.tsx
002_useAuth_001to003.ts
003_AuthAPI_002toEND.ts
```

That creates this flow:

```text
START -> LoginButton -> useAuth -> AuthAPI -> END
```

## 2. Folder Model

Keep application files under `src/`:

```text
src/
  01_components/
  02_hooks/
  03_pages/
  04_services/
  05_utils/
```

The analyzer scans these folders recursively.

## 3. File Name Format

```text
[ID]_[Name]_[INPUT]to[OUTPUT].ext
```

Rules:

- `ID` must be unique and at least 3 digits.
- `Name` should describe the file role.
- `INPUT` is `START`, `MULT`, or one or more IDs.
- `OUTPUT` is `END`, `MULT`, or one or more IDs.
- Use commas for multiple IDs, for example `010to011,012`.

## 4. Commands

Install dependencies:

```bash
npm install
```

Run a live audit:

```bash
npm run audit
```

Write the current flow registry:

```bash
npm run tool:build
```

Generate a text report:

```bash
npm run tool:report
```

Run build, check, and report:

```bash
npm run tool:full
```

Open the dashboard:

```bash
npm run dashboard
```

Then open `.error-solver/dashboard/index.html`.

## 5. Audit Results

The audit reports:

- file count mismatch
- broken input/output links
- duplicate IDs
- orphaned files
- missing registry files
- isolated nodes
- ID gaps
- incomplete START-to-END flows
- loops

## 6. Recommended Workflow

1. Create or rename source files using the Error Solver naming convention.
2. Run `npm run audit`.
3. Fix broken IDs or missing links.
4. Run `npm run tool:build` when you want to refresh `registry.json`.
5. Open the dashboard for a visual review.

## 7. Practical Example

```text
src/01_components/001_LoginButton_STARTto002.tsx
src/02_hooks/002_useAuth_001to003.ts
src/04_services/003_AuthAPI_002toEND.ts
```

Run:

```bash
npm run audit
```

Expected result:

```text
START -> [001] LoginButton -> [002] useAuth -> [003] AuthAPI -> END
```
