import { C } from "./001_Config_STARTto002";
import { scanSourceFiles } from "./002_FileScanner_001to003";
import { parseAllFiles } from "./003_FileParser_002to004";
import { buildRegistry, detectGaps, loadRegistry, saveRegistry } from "./004_RegistryBuilder_003to005";
import { checkConnectivity } from "./005_ConnectivityChecker_004to006";
import { findDuplicates } from "./006_DuplicateDetector_005to007";
import { archiveOrphans, findIsolated, findMissing, findOrphans } from "./007_OrphanFinder_006to008";
import { buildConnectionMap, traceFlows } from "./008_FlowTracer_007to009";
import { header, logERR, logINFO, logOK, logWARN, printReport, saveTextReport } from "./009_ReportGenerator_008to010";

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

function cmdBuild(): void {
  console.log(`\n${C.bold}${C.magenta}  ERROR SOLVER ENGINE v2.0.0${C.reset}\n`);
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
  nodes.forEach((node) => logOK(`[${node.id}] ${node.name} - ${node.input} -> ${node.output}`));
  unparsed.forEach((file) => logWARN(`Could not parse: ${file}`));

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
    logOK("No ID gaps; numbering is sequential");
  } else {
    gaps.forEach((gap) => logWARN(`Gap: missing ID ${gap}`));
  }
}

function cmdCheck(): void {
  console.log(`\n${C.bold}${C.magenta}  ERROR SOLVER CHECKER v2.0.0${C.reset}`);
  console.log(`  ${C.dim}Scanning your project for code-flow problems...${C.reset}`);
  header("Full Audit Report");

  const scanResult = scanSourceFiles();
  if (!scanResult.ok) {
    logERR(scanResult.error);
    process.exit(1);
    return;
  }

  const diskFiles = scanResult.data;
  const { nodes, unparsed } = parseAllFiles(diskFiles);
  const registry = buildRegistry(nodes);

  unparsed.forEach((file) => logWARN(`Ignored because it does not match the naming convention: ${file}`));

  const connectivity = checkConnectivity(registry.nodes);
  const duplicates = findDuplicates(registry.nodes);
  const orphans = findOrphans(registry.nodes, diskFiles);
  const missing = findMissing(registry.nodes, diskFiles);
  const isolated = findIsolated(registry.nodes);
  const gaps = detectGaps(registry.nodes);
  const flows = traceFlows(registry.nodes);
  const connectionMap = buildConnectionMap(registry.nodes);

  const result = printReport({
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

  if (result.errors > 0) {
    process.exit(1);
  }
}

function cmdArchive(): void {
  console.log(`\n${C.bold}${C.magenta}  ARCHIVING ORPHAN FILES${C.reset}\n`);

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
      process.exit(1);
      return;
    }
    logOK(`Archived ${arcResult.data} orphan file(s) to archive/`);
  }
}

function cmdReport(): void {
  console.log(`\n${C.bold}${C.magenta}  GENERATING TEXT REPORT${C.reset}\n`);

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
    process.exit(1);
    return;
  }
  logOK("Report saved to report.txt");
}

function cmdFull(): void {
  cmdBuild();
  console.log("\n" + "-".repeat(60) + "\n");
  cmdCheck();
  console.log("\n" + "-".repeat(60) + "\n");
  cmdReport();
}

function showHelp(): void {
  console.log(`
${C.bold}${C.cyan}  ERROR SOLVER v2.0.0${C.reset}
  ${C.dim}Code-flow analyzer for numbered source pipelines${C.reset}

  ${C.bold}Usage:${C.reset}
    npm run tool:<command>

  ${C.bold}Commands:${C.reset}
    ${C.green}build${C.reset}     Scan src/ and write registry.json
    ${C.green}check${C.reset}     Run a live audit without mutating registry.json
    ${C.green}archive${C.reset}   Copy orphan files to archive/
    ${C.green}report${C.reset}    Generate report.txt from registry.json
    ${C.green}full${C.reset}      Run build + check + report
`);
}

const command = parseCommand(process.argv[2]);

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
    const exhaustive: never = command;
    throw new Error(`Unhandled command: ${exhaustive}`);
  }
}
