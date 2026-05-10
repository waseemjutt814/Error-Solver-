import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "./001_Config_STARTto002";
import { FilePath, Result, err, ok } from "./types";

function scanDirectoryRecursive(dir: string, baseDir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectoryRecursive(fullPath, baseDir, files);
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!CONFIG.supportedExtensions.includes(ext)) continue;

    files.push(path.relative(baseDir, fullPath));
  }

  return files;
}

export function scanSourceFiles(): Result<ReadonlyArray<FilePath>, string> {
  if (!fs.existsSync(CONFIG.srcDir)) {
    return err(`src/ folder not found at: ${CONFIG.srcDir}`);
  }

  try {
    const sortedPaths = scanDirectoryRecursive(CONFIG.srcDir, CONFIG.srcDir).sort().map(FilePath);
    return ok(sortedPaths);
  } catch (error) {
    return err(`Failed to read directory: ${error instanceof Error ? error.message : String(error)}`);
  }
}
