import * as fs from "fs";
import { C, CONFIG } from "./001_Config_STARTto002";
import { ConnectivityResult } from "./005_ConnectivityChecker_004to006";
import { DuplicateResult } from "./006_DuplicateDetector_005to007";
import { FlowTraceResult } from "./008_FlowTracer_007to009";
import { ConnectionMapRow, FilePath, NodeRecord, Registry, Result, ok, err } from "./types";

// ─── PRINT HELPERS ──────────────────────────────────────────────────────────

export function header(text: string): void {
  const line = "═".repeat(60);
  console.log(`\n${C.cyan}╔${line}╗${C.reset}`);
  console.log(`${C.cyan}║${C.bold}${C.white}  ${text.padEnd(58)}${C.reset}${C.cyan}║${C.reset}`);
  console.log(`${C.cyan}╚${line}╝${C.reset}`);
}

export function section(num: string, text: string): void {
  console.log(`\n  ${C.bold}${C.blue}[${num}] ${text} ${"─".repeat(Math.max(0, 48 - text.length))}${C.reset}\n`);
}

export const logOK = (msg: string): void => console.log(`  ✅ ${C.green}${msg}${C.reset}`);
export const logERR = (msg: string): void => console.log(`  ❌ ${C.red}${msg}${C.reset}`);
export const logWARN = (msg: string): void => console.log(`  ⚠️  ${C.yellow}${msg}${C.reset}`);
export const logINFO = (msg: string): void => console.log(`  ℹ️  ${C.cyan}${msg}${C.reset}`);

// ─── FULL REPORT ────────────────────────────────────────────────────────────

export type ReportData = Readonly<{
  registry: Registry;
  diskFiles: ReadonlyArray<FilePath>;
  connectivity: ConnectivityResult;
  duplicates: DuplicateResult;
  orphans: ReadonlyArray<FilePath>;
  missing: ReadonlyArray<NodeRecord>;
  isolated: ReadonlyArray<NodeRecord>;
  gaps: ReadonlyArray<string>;
  flows: FlowTraceResult;
  connectionMap: ReadonlyArray<ConnectionMapRow>;
}>;

export type ReportResult = Readonly<{
  errors: number;
  warnings: number;
}>;

export function printReport(data: ReportData): ReportResult {
  let errors = 0;
  let warnings = 0;

  // 1. File Count
  section("1", "FILE COUNT CHECK");
  logINFO(`Registry: ${data.registry.total_files} | Disk: ${data.diskFiles.length}`);
  if (data.registry.total_files === data.diskFiles.length) {
    logOK(`File count matches! (${data.diskFiles.length} files)`);
  } else {
    logERR(`MISMATCH! Registry=${data.registry.total_files}, Disk=${data.diskFiles.length}`);
    errors++;
  }

  // 2. Connectivity
  section("2", "CONNECTIVITY CHECK");
  if (data.connectivity.brokenLinks.length === 0) {
    logOK(`All connections valid! (${data.registry.nodes.length} nodes)`);
  } else {
    data.connectivity.brokenLinks.forEach((b) => {
      logERR(b.message);
      errors++;
    });
  }

  // 3. Orphans & Missing
  section("3", "ORPHAN & MISSING FILE CHECK");
  if (data.orphans.length === 0) logOK("No orphans — all disk files registered");
  else data.orphans.forEach((f) => { logWARN(`Orphan: ${f}`); warnings++; });

  if (data.missing.length === 0) logOK("No missing files — all registry entries exist");
  else data.missing.forEach((n) => { logERR(`Missing: [${n.id}] ${n.file}`); errors++; });

  // 4. Duplicates
  section("4", "DUPLICATE ID CHECK");
  if (data.duplicates.count === 0) {
    logOK(`No duplicate IDs (${data.duplicates.uniqueIds} unique)`);
  } else {
    data.duplicates.groups.forEach((g) => {
      logERR(`Duplicate ID "${g.id}" in ${g.nodes.length} files:`);
      g.nodes.forEach((n) => console.log(`         ${C.dim}→ ${n.file}${C.reset}`));
      errors++;
    });
  }

  // 5. Isolated
  section("5", "DEAD END & ISOLATED NODE CHECK");
  if (data.isolated.length === 0) logOK("No isolated nodes");
  else data.isolated.forEach((n) => { logWARN(`[${n.id}] ${n.name} isolated`); warnings++; });

  // 6. Gaps
  section("6", "ID GAP CHECK");
  if (data.gaps.length === 0) logOK("No gaps — IDs are sequential");
  else data.gaps.forEach((g) => { logWARN(`Gap: missing ID ${g}`); warnings++; });

  // 7. Flow Sequence
  section("7", "FLOW SEQUENCE CHECK");
  logINFO(`Starts: ${data.flows.startCount} | Ends: ${data.flows.endCount}`);
  if (data.flows.startCount === 0) { logERR("No START node!"); errors++; }
  if (data.flows.endCount === 0) { logERR("No END node!"); errors++; }

  data.flows.paths.forEach((p) => {
    const chain = p.chain.map((c) => `[${c.id}] ${c.name}`).join(" → ");
    if (p.isComplete) logOK(`START → ${chain} → END`);
    else if (p.hasLoop) { logERR(`LOOP: ${chain} ↻`); errors++; }
    else { logWARN(`BROKEN: START → ${chain} → ❌`); warnings++; }
  });

  // 8. Connection Map
  section("8", "CONNECTION MAP");
  console.log(`  ${C.dim}${"─".repeat(60)}${C.reset}`);
  console.log(`  ${C.bold}  #   │ File Name            │ ← FROM            │ → TO${C.reset}`);
  console.log(`  ${C.dim}${"─".repeat(60)}${C.reset}`);

  data.connectionMap.forEach((row, i) => {
    const num = String(i + 1).padStart(3, " ");
    const name = `[${row.id}] ${row.name}`.padEnd(20);
    const from = row.fromDisplay.padEnd(18);
    console.log(`  ${C.white} ${num} ${C.dim}│${C.reset} ${C.cyan}${name}${C.reset}${C.dim}│${C.reset} ${C.green}${from}${C.reset}${C.dim}│${C.reset} ${C.magenta}${row.toDisplay}${C.reset}`);
  });
  console.log(`  ${C.dim}${"─".repeat(60)}${C.reset}`);

  // Summary
  const line = "═".repeat(60);
  console.log(`\n${C.cyan}╔${line}╗${C.reset}`);
  console.log(`${C.cyan}║${C.bold}${C.white}  FINAL SUMMARY                                              ${C.reset}${C.cyan}║${C.reset}`);
  console.log(`${C.cyan}╚${line}╝${C.reset}\n`);

  logINFO(`Files on disk: ${data.diskFiles.length} | Registry: ${data.registry.total_files}`);

  if (errors === 0 && warnings === 0) {
    console.log(`  ${C.bgGreen}${C.bold}${C.white} ✅ ALL CLEAR — No errors, no warnings! Pipeline is healthy. ${C.reset}`);
  } else if (errors === 0) {
    console.log(`  ${C.bgYellow}${C.bold} ⚠️  ${warnings} warnings, 0 errors. ${C.reset}`);
  } else {
    console.log(`  ${C.bgRed}${C.bold}${C.white} ❌ ${errors} errors, ${warnings} warnings. Pipeline has problems! ${C.reset}`);
  }
  console.log("");

  return { errors, warnings };
}

export function saveTextReport(data: Pick<ReportData, "registry" | "flows" | "connectionMap">): Result<true, string> {
  const lines: string[] = [];

  lines.push("╔════════════════════════════════════════════════════╗");
  lines.push("║        ERROR SOLVER - PROJECT REPORT               ║");
  lines.push("╚════════════════════════════════════════════════════╝");
  lines.push("");
  lines.push(`Project     : ${data.registry.project_name}`);
  lines.push(`Total Files : ${data.registry.total_files}`);
  lines.push(`Generated   : ${data.registry.generated_at}`);
  lines.push("");

  lines.push("── FLOW ──────────────────────────────────────────");
  data.flows.paths.forEach((p) => {
    const chain = p.chain.map((c) => `[${c.id}] ${c.name}`).join(" → ");
    lines.push(`  ${p.isComplete ? "✅" : "❌"} START → ${chain} → ${p.isComplete ? "END" : "BROKEN"}`);
  });
  lines.push("");

  lines.push("── CONNECTION MAP ─────────────────────────────────");
  lines.push("");
  data.connectionMap.forEach((row, i) => {
    lines.push(`  ${String(i + 1).padStart(3)}. [${row.id}] ${row.name}`);
    lines.push(`       File   : ${row.file}`);
    lines.push(`       ← FROM : ${row.fromDisplay}`);
    lines.push(`       → TO   : ${row.toDisplay}`);
    lines.push("");
  });

  try {
    fs.writeFileSync(CONFIG.reportFile, lines.join("\n"), "utf8");
    return ok(true);
  } catch (e) {
    return err(`Failed to write text report: ${e instanceof Error ? e.message : String(e)}`);
  }
}
