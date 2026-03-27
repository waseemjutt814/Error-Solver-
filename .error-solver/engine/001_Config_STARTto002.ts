import * as path from "path";
import { Config, FilePath } from "./types";

// ─── PURE CONFIGURATION ─────────────────────────────────────────────────────

const ROOT_DIR_PATH = path.join(__dirname, "..", "..");

export const CONFIG: Config = Object.freeze({
  rootDir: FilePath(ROOT_DIR_PATH),
  srcDir: FilePath(path.join(ROOT_DIR_PATH, "src")),
  registryFile: FilePath(path.join(ROOT_DIR_PATH, "registry.json")),
  archiveDir: FilePath(path.join(ROOT_DIR_PATH, "archive")),
  reportFile: FilePath(path.join(ROOT_DIR_PATH, "report.txt")),
  supportedExtensions: Object.freeze([
    ".js", ".ts", ".jsx", ".tsx",
    ".py", ".java", ".cpp", ".c",
    ".go", ".rs", ".rb", ".php",
    ".vue", ".svelte", ".dart"
  ]),
});

// ─── TERMINAL COLORS ────────────────────────────────────────────────────────

type ColorCode = string & { readonly __brand: "ColorCode" };
const Color = (code: string): ColorCode => code as ColorCode;

export const C = Object.freeze({
  reset:     Color("\x1b[0m"),
  red:       Color("\x1b[31m"),
  green:     Color("\x1b[32m"),
  yellow:    Color("\x1b[33m"),
  blue:      Color("\x1b[34m"),
  magenta:   Color("\x1b[35m"),
  cyan:      Color("\x1b[36m"),
  white:     Color("\x1b[37m"),
  bold:      Color("\x1b[1m"),
  dim:       Color("\x1b[2m"),
  bgGreen:   Color("\x1b[42m"),
  bgRed:     Color("\x1b[41m"),
  bgYellow:  Color("\x1b[43m"),
  bgBlue:    Color("\x1b[44m"),
});

// ─── DOMAIN CONSTANTS ───────────────────────────────────────────────────────

export const SPECIAL_INPUTS = Object.freeze(["START", "MULT"]);
export const SPECIAL_OUTPUTS = Object.freeze(["END"]);

// Matches: 001_Name_INPUTtoOUTPUT.ext
export const FILENAME_REGEX = /^(\d{3,})_([^_]+)_(.+?)to(.+)$/i;
