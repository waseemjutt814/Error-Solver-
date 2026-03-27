import { SPECIAL_INPUTS, SPECIAL_OUTPUTS } from "./001_Config_STARTto002";
import { ConnectionIssue, NodeId, NodeRecord } from "./types";

export type ConnectivityResult = Readonly<{
  validConnections: number;
  brokenLinks: ReadonlyArray<ConnectionIssue>;
}>;

/**
 * Check all connections in registry nodes
 * Pure function: compares expected IDs against actual keys
 */
export function checkConnectivity(nodes: ReadonlyArray<NodeRecord>): ConnectivityResult {
  const validIds = new Set<NodeId>(nodes.map((n) => n.id));
  const brokenLinks: ConnectionIssue[] = [];
  let validCount = 0;

  for (const node of nodes) {
    let nodeHasBrokenLink = false;

    // Validate Input
    if (!SPECIAL_INPUTS.includes(node.input)) {
      const inputs = node.input.split(",").map((s) => s.trim());
      for (const input of inputs) {
        if (!validIds.has(NodeId(input))) {
          brokenLinks.push({
            nodeId: node.id,
            nodeName: node.name,
            direction: "input",
            target: input,
            message: `[${node.id}] ${node.name} — input "${input}" does NOT exist`,
          });
          nodeHasBrokenLink = true;
        }
      }
    }

    // Validate Output
    if (!SPECIAL_OUTPUTS.includes(node.output)) {
      const outputs = node.output.split(",").map((s) => s.trim());
      for (const output of outputs) {
        if (!validIds.has(NodeId(output))) {
          brokenLinks.push({
            nodeId: node.id,
            nodeName: node.name,
            direction: "output",
            target: output,
            message: `[${node.id}] ${node.name} — output "${output}" does NOT exist`,
          });
          nodeHasBrokenLink = true;
        }
      }
    }

    if (!nodeHasBrokenLink) {
      validCount++;
    }
  }

  return {
    validConnections: validCount,
    brokenLinks: Object.freeze(brokenLinks),
  };
}
