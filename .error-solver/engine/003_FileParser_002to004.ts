import * as path from "path";
import { FILENAME_REGEX } from "./001_Config_STARTto002";
import { FilePath, NodeId, NodeKind, NodeRecord, NodeStatus } from "./types";

/**
 * Derives the semantic Kind of the node based on inputs/outputs
 */
function deriveNodeKind(input: string, output: string): NodeKind {
  if (input === "START") return "start";
  if (output === "END") return "end";
  if (input === "MULT") return "multiple";
  return "middle";
}

/**
 * Parse a single filename into node metadata
 */
export function parseFileName(fileName: FilePath): NodeRecord | null {
  const base = path.basename(fileName).replace(/\.[^.]+$/, "");
  const match = base.match(FILENAME_REGEX);

  if (!match) return null;

  const inputRaw = match[3];
  const outputRaw = match[4];

  return {
    id: NodeId(match[1]),
    name: match[2],
    input: inputRaw,
    output: outputRaw,
    kind: deriveNodeKind(inputRaw, outputRaw),
    status: "active" as NodeStatus,
    file: fileName,
  };
}

export type ParseResult = Readonly<{
  nodes: ReadonlyArray<NodeRecord>;
  unparsed: ReadonlyArray<FilePath>;
}>;

/**
 * Parse all files and separate into parsed + unparsed
 */
export function parseAllFiles(files: ReadonlyArray<FilePath>): ParseResult {
  const nodes: NodeRecord[] = [];
  const unparsed: FilePath[] = [];

  for (const file of files) {
    const parsed = parseFileName(file);
    if (parsed) {
      nodes.push(parsed);
    } else {
      unparsed.push(file);
    }
  }

  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));

  return {
    nodes: Object.freeze(sortedNodes),
    unparsed: Object.freeze(unparsed),
  };
}
