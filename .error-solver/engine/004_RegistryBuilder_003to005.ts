import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "./001_Config_STARTto002";
import { NodeId, NodeRecord, Registry, Result, IsoDateString, ok, err } from "./types";

/**
 * Build a registry object from parsed nodes
 */
export function buildRegistry(nodes: ReadonlyArray<NodeRecord>): Registry {
  return {
    project_name: path.basename(CONFIG.rootDir),
    total_files: nodes.length,
    generated_at: IsoDateString(new Date().toISOString()),
    nodes: nodes,
  };
}

/**
 * Save registry to disk gracefully returning Result
 */
export function saveRegistry(registry: Registry): Result<true, string> {
  try {
    fs.writeFileSync(CONFIG.registryFile, JSON.stringify(registry, null, 2), "utf8");
    return ok(true);
  } catch (error) {
    return err(`Failed to save registry: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Load registry from disk as Result
 */
export function loadRegistry(): Result<Registry, string> {
  if (!fs.existsSync(CONFIG.registryFile)) {
    return err("registry.json not found. Run build first.");
  }
  try {
    const data = JSON.parse(fs.readFileSync(CONFIG.registryFile, "utf8")) as Registry;
    return ok(data);
  } catch (error) {
    return err(`Failed to parse registry json: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Detect missing numbers in sequence
 */
export function detectGaps(nodes: ReadonlyArray<NodeRecord>): ReadonlyArray<string> {
  const ids = nodes.map((n) => parseInt(n.id, 10)).sort((a, b) => a - b);
  const gaps: string[] = [];

  if (ids.length < 2) return Object.freeze(gaps);

  for (let i = 1; i < ids.length; i++) {
    const diff = ids[i] - ids[i - 1];
    if (diff > 1) {
      for (let g = ids[i - 1] + 1; g < ids[i]; g++) {
        gaps.push(String(g).padStart(3, "0"));
      }
    }
  }

  return Object.freeze(gaps);
}
