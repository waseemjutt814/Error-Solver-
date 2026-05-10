import * as fs from "fs";
import { C, CONFIG } from "./001_Config_STARTto002";
import { ConnectivityResult } from "./005_ConnectivityChecker_004to006";
import { DuplicateResult } from "./006_DuplicateDetector_005to007";
import { FlowTraceResult } from "./008_FlowTracer_007to009";
import { ConnectionMapRow, FilePath, NodeRecord, Registry, Result, err, ok } from "./types";

export function header(text: string): void {
  const line = "=".repeat(60);
  console.log(`\n${C.cyan}+${line}+${C.reset}`);
  console.log(`${C.cyan}|${C.bold}${C.white}  ${text.padEnd(58)}${C.reset}${C.cyan}|${C.reset}`);
  console.log(`${C.cyan}+${line}+${C.reset}`);
}

export function section(num: string, text: string): void {
  console.log(`\n  ${C.bold}${C.blue}[${num}] ${text} ${"-".repeat(Math.max(0, 48 - text.length))}${C.reset}\n`);
}

export const logOK = (msg: string): void => console.log(`  [OK] ${C.green}${msg}${C.reset}`);
export const logERR = (msg: string): void => console.log(`  [ERR] ${C.red}${msg}${C.reset}`);
export const logWARN = (msg: string): void => console.log(`  [WARN] ${C.yellow}${msg}${C.reset}`);
export const logINFO = (msg: string): void => console.log(`  [INFO] ${C.cyan}${msg}${C.reset}`);

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
  const hasPipelineNodes = data.registry.nodes.length > 0;

  section("1", "FILE COUNT CHECK");
  logINFO(`Registry: ${data.registry.total_files} | Disk: ${data.diskFiles.length}`);
  if (data.registry.total_files === data.diskFiles.length) {
    logOK(`File count matches (${data.diskFiles.length} files)`);
  } else {
    logERR(`Mismatch: registry=${data.registry.total_files}, disk=${data.diskFiles.length}`);
    errors++;
  }

  section("2", "CONNECTIVITY CHECK");
  if (data.connectivity.brokenLinks.length === 0) {
    logOK(`All connections valid (${data.registry.nodes.length} nodes)`);
  } else {
    data.connectivity.brokenLinks.forEach((brokenLink) => {
      logERR(brokenLink.message);
      errors++;
    });
  }

  section("3", "ORPHAN AND MISSING FILE CHECK");
  if (data.orphans.length === 0) {
    logOK("No orphans; all scanned files are registered");
  } else {
    data.orphans.forEach((file) => {
      logWARN(`Orphan: ${file}`);
      warnings++;
    });
  }

  if (data.missing.length === 0) {
    logOK("No missing files; all registry entries exist");
  } else {
    data.missing.forEach((node) => {
      logERR(`Missing: [${node.id}] ${node.file}`);
      errors++;
    });
  }

  section("4", "DUPLICATE ID CHECK");
  if (data.duplicates.count === 0) {
    logOK(`No duplicate IDs (${data.duplicates.uniqueIds} unique)`);
  } else {
    data.duplicates.groups.forEach((group) => {
      logERR(`Duplicate ID "${group.id}" in ${group.nodes.length} files:`);
      group.nodes.forEach((node) => console.log(`         ${C.dim}-> ${node.file}${C.reset}`));
      errors++;
    });
  }

  section("5", "DEAD END AND ISOLATED NODE CHECK");
  if (data.isolated.length === 0) {
    logOK("No isolated nodes");
  } else {
    data.isolated.forEach((node) => {
      logWARN(`[${node.id}] ${node.name} is isolated`);
      warnings++;
    });
  }

  section("6", "ID GAP CHECK");
  if (data.gaps.length === 0) {
    logOK("No gaps; IDs are sequential");
  } else {
    data.gaps.forEach((gap) => {
      logWARN(`Gap: missing ID ${gap}`);
      warnings++;
    });
  }

  section("7", "FLOW SEQUENCE CHECK");
  if (!hasPipelineNodes) {
    logINFO("No numbered source files found yet. Add files like 001_Button_STARTto002.tsx to enable flow validation.");
  } else {
    logINFO(`Starts: ${data.flows.startCount} | Ends: ${data.flows.endCount}`);
    if (data.flows.startCount === 0) {
      logERR("No START node found");
      errors++;
    }
    if (data.flows.endCount === 0) {
      logERR("No END node found");
      errors++;
    }

    data.flows.paths.forEach((path) => {
      const chain = path.chain.map((node) => `[${node.id}] ${node.name}`).join(" -> ");
      if (path.isComplete) {
        logOK(`START -> ${chain} -> END`);
      } else if (path.hasLoop) {
        logERR(`Loop: ${chain}`);
        errors++;
      } else {
        logWARN(`Broken: START -> ${chain} -> MISSING`);
        warnings++;
      }
    });
  }

  section("8", "CONNECTION MAP");
  if (data.connectionMap.length === 0) {
    logINFO("No connection map rows yet");
  } else {
    console.log(`  ${C.dim}${"-".repeat(72)}${C.reset}`);
    console.log(`  ${C.bold}  #   | File Name            | From               | To${C.reset}`);
    console.log(`  ${C.dim}${"-".repeat(72)}${C.reset}`);

    data.connectionMap.forEach((row, index) => {
      const num = String(index + 1).padStart(3, " ");
      const name = `[${row.id}] ${row.name}`.padEnd(20);
      const from = row.fromDisplay.padEnd(18);
      console.log(`  ${C.white} ${num} ${C.dim}|${C.reset} ${C.cyan}${name}${C.reset}${C.dim}|${C.reset} ${C.green}${from}${C.reset}${C.dim}|${C.reset} ${C.magenta}${row.toDisplay}${C.reset}`);
    });
    console.log(`  ${C.dim}${"-".repeat(72)}${C.reset}`);
  }

  const line = "=".repeat(60);
  console.log(`\n${C.cyan}+${line}+${C.reset}`);
  console.log(`${C.cyan}|${C.bold}${C.white}  FINAL SUMMARY                                              ${C.reset}${C.cyan}|${C.reset}`);
  console.log(`${C.cyan}+${line}+${C.reset}\n`);

  logINFO(`Files on disk: ${data.diskFiles.length} | Registry: ${data.registry.total_files}`);

  if (errors === 0 && warnings === 0) {
    console.log(`  ${C.bgGreen}${C.bold}${C.white} ALL CLEAR: no errors, no warnings. Pipeline is healthy. ${C.reset}`);
  } else if (errors === 0) {
    console.log(`  ${C.bgYellow}${C.bold} ${warnings} warnings, 0 errors. ${C.reset}`);
  } else {
    console.log(`  ${C.bgRed}${C.bold}${C.white} ${errors} errors, ${warnings} warnings. Pipeline has problems. ${C.reset}`);
  }
  console.log("");

  return { errors, warnings };
}

export function saveTextReport(data: Pick<ReportData, "registry" | "flows" | "connectionMap">): Result<true, string> {
  const lines: string[] = [];

  lines.push("ERROR SOLVER - PROJECT REPORT");
  lines.push("================================");
  lines.push("");
  lines.push(`Project     : ${data.registry.project_name}`);
  lines.push(`Total Files : ${data.registry.total_files}`);
  lines.push(`Generated   : ${data.registry.generated_at}`);
  lines.push("");

  lines.push("FLOW");
  lines.push("----");
  if (data.flows.paths.length === 0) {
    lines.push("  No flow paths found.");
  } else {
    data.flows.paths.forEach((path) => {
      const chain = path.chain.map((node) => `[${node.id}] ${node.name}`).join(" -> ");
      lines.push(`  ${path.isComplete ? "[OK]" : "[ERR]"} START -> ${chain} -> ${path.isComplete ? "END" : "BROKEN"}`);
    });
  }
  lines.push("");

  lines.push("CONNECTION MAP");
  lines.push("--------------");
  if (data.connectionMap.length === 0) {
    lines.push("  No connection map rows found.");
  } else {
    data.connectionMap.forEach((row, index) => {
      lines.push(`  ${String(index + 1).padStart(3)}. [${row.id}] ${row.name}`);
      lines.push(`       File : ${row.file}`);
      lines.push(`       From : ${row.fromDisplay}`);
      lines.push(`       To   : ${row.toDisplay}`);
      lines.push("");
    });
  }

  try {
    fs.writeFileSync(CONFIG.reportFile, lines.join("\n"), "utf8");
    return ok(true);
  } catch (error) {
    return err(`Failed to write text report: ${error instanceof Error ? error.message : String(error)}`);
  }
}
