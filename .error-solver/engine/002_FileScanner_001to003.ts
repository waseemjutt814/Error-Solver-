import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "./001_Config_STARTto002";
import { FilePath, Result, ok, err } from "./types";

/**
 * Scan src/ directory and return all source files
 * Pure function: Does not throw, returns explicit Result
 */
export function scanSourceFiles(): Result<ReadonlyArray<FilePath>, string> {
  if (!fs.existsSync(CONFIG.srcDir)) {
    return err(`src/ folder not found at: ${CONFIG.srcDir}`);
  }

  try {
    const allFiles = fs.readdirSync(CONFIG.srcDir).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return CONFIG.supportedExtensions.includes(ext);
    });

    const sortedPaths = allFiles.sort().map(FilePath);
    return ok(sortedPaths);
  } catch (error) {
    return err(`Failed to read directory: ${error instanceof Error ? error.message : String(error)}`);
  }
}
