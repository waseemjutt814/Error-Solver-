import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "./001_Config_STARTto002";
import { FilePath, NodeId, NodeRecord, Result, ok, err } from "./types";

/**
 * Find orphan files (on disk, not in registry)
 */
export function findOrphans(
  nodes: ReadonlyArray<NodeRecord>,
  diskFiles: ReadonlyArray<FilePath>
): ReadonlyArray<FilePath> {
  const registeredFiles = new Set<FilePath>(nodes.map((n) => n.file));
  const orphans = diskFiles.filter((f) => !registeredFiles.has(f));
  return Object.freeze(orphans);
}

/**
 * Find missing files (in registry, not on disk)
 */
export function findMissing(
  nodes: ReadonlyArray<NodeRecord>,
  diskFiles: ReadonlyArray<FilePath>
): ReadonlyArray<NodeRecord> {
  const diskSet = new Set<FilePath>(diskFiles);
  const missing = nodes.filter((n) => !diskSet.has(n.file));
  return Object.freeze(missing);
}

/**
 * Find isolated nodes (nobody points to them)
 */
export function findIsolated(nodes: ReadonlyArray<NodeRecord>): ReadonlyArray<NodeRecord> {
  const targetedIds = new Set<NodeId>();

  for (const node of nodes) {
    if (node.output !== "END") {
      const outputs = node.output.split(",").map((o) => NodeId(o.trim()));
      for (const o of outputs) {
        targetedIds.add(o);
      }
    }
  }

  const isolated = nodes.filter((node) => {
    return node.input !== "START" && !targetedIds.has(node.id);
  });

  return Object.freeze(isolated);
}

/**
 * Archive orphan files to archive/ folder
 * Impure function handling I/O safely with Result pattern
 */
export function archiveOrphans(orphans: ReadonlyArray<FilePath>): Result<number, string> {
  if (orphans.length === 0) return ok(0);

  try {
    if (!fs.existsSync(CONFIG.archiveDir)) {
      fs.mkdirSync(CONFIG.archiveDir, { recursive: true });
    }

    let archiveCount = 0;
    for (const f of orphans) {
      const src = path.join(CONFIG.srcDir, f);
      const dest = path.join(CONFIG.archiveDir, f);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        archiveCount++;
      }
    }

    return ok(archiveCount);
  } catch (error) {
    return err(`Failed to archive orphans: ${error instanceof Error ? error.message : String(error)}`);
  }
}
