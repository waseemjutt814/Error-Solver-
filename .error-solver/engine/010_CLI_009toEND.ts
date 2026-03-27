import { C } from "./001_Config_STARTto002";
import { scanSourceFiles } from "./002_FileScanner_001to003";
import { parseAllFiles } from "./003_FileParser_002to004";
import { buildRegistry, detectGaps, loadRegistry, saveRegistry } from "./004_RegistryBuilder_003to005";
import { checkConnectivity } from "./005_ConnectivityChecker_004to006";
import { findDuplicates } from "./006_DuplicateDetector_005to007";
import { archiveOrphans, findIsolated, findMissing, findOrphans } from "./007_OrphanFinder_006to008";
import { buildConnectionMap, traceFlows } from "./008_FlowTracer_007to009";
import { header, logERR, logINFO, logOK, logWARN, printReport, saveTextReport } from "./009_ReportGenerator_008to010";

// ─── COMMAND ROUTING USING EXHAUSTIVE TYPE ──────────────────────────────────

type CLICommand = "build" | "check" | "archive" | "report" | "full" | "help";

function parseCommand(cmd: string | undefined): CLICommand {
  switch (cmd) {
    case "build":
    case "check":
    case "archive":
    case "report":
    case "full":
    case "help":
      return cmd;
    default:
      return "help";
  }
}

// ─── COMMAND IMPLEMENTATIONS ────────────────────────────────────────────────

function cmdBuild(): void {
  console.log(`\n${C.bold}${C.magenta}  🔧 ERROR SOLVER ENGINE (TS) v2.0.0${C.reset}\n`);
  header("Building Registry from src/ files");

  const scanResult = scanSourceFiles();
  if (!scanResult.ok) {
    logERR(scanResult.error);
    process.exit(1);
    return;
  }

  const files = scanResult.data;
  logINFO(`Found ${files.length} source files`);

  const { nodes, unparsed } = parseAllFiles(files);
  nodes.forEach((n) => logOK(`[${n.id}] ${n.name} — ${n.input} → ${n.output}`));
  unparsed.forEach((f) => logWARN(`Could not parse: ${f}`));

  const registry = buildRegistry(nodes);
  const saveRes = saveRegistry(registry);
  
  if (!saveRes.ok) {
    logERR(saveRes.error);
    process.exit(1);
    return;
  }

  logOK(`registry.json saved with ${nodes.length} nodes`);

  const gaps = detectGaps(nodes);
  if (gaps.length === 0) {
    logOK("No ID gaps — numbering is sequential");
  } else {
    gaps.forEach((g) => logWARN(`Gap: missing ID ${g}`));
  }

  console.log(`\n  ${C.bold}${C.green}✅ Done! Run: npm run tool:check${C.reset}\n`);
}

function cmdCheck(): void {
  console.log(`\n${C.bold}${C.magenta}  🔍 ERROR SOLVER CHECKER (TS) v2.0.0${C.reset}`);
  console.log(`  ${C.dim}Scanning your project for errors...${C.reset}`);
  header("Full Audit Report");

  const regResult = loadRegistry();
  if (!regResult.ok) {
    logERR(regResult.error);
    process.exit(1);
    return;
  }
  const registry = regResult.data;

  const scanResult = scanSourceFiles();
  if (!scanResult.ok) {
    logERR(scanResult.error);
    process.exit(1);
    return;
  }
  const diskFiles = scanResult.data;

  // Run ALL pipelines
  const connectivity = checkConnectivity(registry.nodes);
  const duplicates = findDuplicates(registry.nodes);
  const orphans = findOrphans(registry.nodes, diskFiles);
  const missing = findMissing(registry.nodes, diskFiles);
  const isolated = findIsolated(registry.nodes);
  const gaps = detectGaps(registry.nodes);
  const flows = traceFlows(registry.nodes);
  const connectionMap = buildConnectionMap(registry.nodes);

  // Print
  printReport({
    registry,
    diskFiles,
    connectivity,
    duplicates,
    orphans,
    missing,
    isolated,
    gaps,
    flows,
    connectionMap,
  });
}

function cmdArchive(): void {
  console.log(`\n${C.bold}${C.magenta}  📦 ARCHIVING ORPHAN FILES${C.reset}\n`);

  const regResult = loadRegistry();
  if (!regResult.ok) {
    logERR(regResult.error);
    process.exit(1);
    return;
  }

  const scanResult = scanSourceFiles();
  if (!scanResult.ok) {
    logERR(scanResult.error);
    process.exit(1);
    return;
  }

  const orphans = findOrphans(regResult.data.nodes, scanResult.data);

  if (orphans.length === 0) {
    logOK("No orphan files to archive");
  } else {
    const arcResult = archiveOrphans(orphans);
    if (!arcResult.ok) {
      logERR(arcResult.error);
    } else {
      logOK(`Archived ${arcResult.data} orphan file(s) to archive/`);
    }
  }
  console.log("");
}

function cmdReport(): void {
  console.log(`\n${C.bold}${C.magenta}  📝 GENERATING TEXT REPORT${C.reset}\n`);

  const regResult = loadRegistry();
  if (!regResult.ok) {
    logERR(regResult.error);
    process.exit(1);
    return;
  }
  const registry = regResult.data;

  const flows = traceFlows(registry.nodes);
  const connectionMap = buildConnectionMap(registry.nodes);

  const repResult = saveTextReport({ registry, flows, connectionMap });
  if (!repResult.ok) {
    logERR(repResult.error);
  } else {
    logOK("Report saved to report.txt");
  }
  console.log("");
}

function cmdFull(): void {
  cmdBuild();
  console.log("\n" + "─".repeat(60) + "\n");
  cmdCheck();
  console.log("\n" + "─".repeat(60) + "\n");
  cmdReport();
}

function showHelp(): void {
  console.log(`
${C.bold}${C.cyan}  🔗 ERROR SOLVER (TS) v2.0.0${C.reset}
  ${C.dim}God-Tier Code Flow Analyzer${C.reset}

  ${C.bold}Usage:${C.reset}
    npm run tool:<command>

  ${C.bold}Commands:${C.reset}
    ${C.green}build${C.reset}     Scan src/ and create registry.json
    ${C.green}check${C.reset}     Run full audit (7 checks)
    ${C.green}archive${C.reset}   Move orphan files to archive/
    ${C.green}report${C.reset}    Generate text report
    ${C.green}full${C.reset}      Run everything: build + check + report
  `);
}

// ─── EXHAUSTIVE ROUTER ──────────────────────────────────────────────────────

const commandInput = process.argv[2];
const command = parseCommand(commandInput);

switch (command) {
  case "build":
    cmdBuild();
    break;
  case "check":
    cmdCheck();
    break;
  case "archive":
    cmdArchive();
    break;
  case "report":
    cmdReport();
    break;
  case "full":
    cmdFull();
    break;
  case "help":
    showHelp();
    break;
  default: {
    // This block ensures Exhuastive pattern matching.
    const _exhaustiveCheck: never = command;
    throw new Error(`Unhandled command routing: ${_exhaustiveCheck}`);
  }
}
