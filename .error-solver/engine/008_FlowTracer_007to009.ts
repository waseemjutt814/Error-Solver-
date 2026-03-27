import { ConnectionMapRow, FlowPath, FlowPathNode, NodeId, NodeRecord } from "./types";

export type FlowTraceResult = Readonly<{
  paths: ReadonlyArray<FlowPath>;
  startCount: number;
  endCount: number;
  hasAnyLoop: boolean;
}>;

/**
 * Trace all flow paths from START to END
 */
export function traceFlows(nodes: ReadonlyArray<NodeRecord>): FlowTraceResult {
  const nodeMap = new Map<NodeId, NodeRecord>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  const startNodes = nodes.filter((n) => n.input === "START");
  const endNodes = nodes.filter((n) => n.output === "END");

  const paths: FlowPath[] = [];

  for (const start of startNodes) {
    const pathNodes: FlowPathNode[] = [];
    const visited = new Set<NodeId>();
    let current: NodeRecord | undefined = start;
    let isBroken = false;
    let hasLoop = false;

    while (current) {
      if (visited.has(current.id)) {
        hasLoop = true;
        pathNodes.push({ id: current.id, name: current.name, status: "loop" });
        break;
      }

      visited.add(current.id);
      pathNodes.push({ id: current.id, name: current.name, status: "ok" });

      if (current.output === "END") {
        break;
      }

      const nextIdRaw = current.output.split(",")[0].trim();
      const nextId = NodeId(nextIdRaw);

      const nextNode = nodeMap.get(nextId);
      if (!nextNode) {
        // Mutate the last node to show it's broken
        const lastIndex = pathNodes.length - 1;
        pathNodes[lastIndex] = { ...pathNodes[lastIndex], status: "broken" };
        pathNodes.push({ id: nextId, name: "???", status: "missing" });
        isBroken = true;
        break;
      }

      current = nextNode;
    }

    paths.push({
      startId: start.id,
      chain: Object.freeze(pathNodes),
      isComplete: !isBroken && !hasLoop,
      isBroken,
      hasLoop,
    });
  }

  return {
    paths: Object.freeze(paths),
    startCount: startNodes.length,
    endCount: endNodes.length,
    hasAnyLoop: paths.some((p) => p.hasLoop),
  };
}

/**
 * Build a connection map: for each node show FROM and TO
 */
export function buildConnectionMap(nodes: ReadonlyArray<NodeRecord>): ReadonlyArray<ConnectionMapRow> {
  const nodeMap = new Map<NodeId, NodeRecord>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  const mapRows: ConnectionMapRow[] = [];

  for (const node of nodes) {
    let fromDisplay = "";
    if (node.input === "START") {
      fromDisplay = "START (entry point)";
    } else if (node.input === "MULT") {
      fromDisplay = "MULTIPLE files";
    } else {
      const fromNode = nodeMap.get(NodeId(node.input));
      fromDisplay = fromNode
        ? `[${node.input}] ${fromNode.name}`
        : `[${node.input}] ❌ MISSING`;
    }

    let toDisplay = "";
    if (node.output === "END") {
      toDisplay = "END (exit point)";
    } else {
      const toNode = nodeMap.get(NodeId(node.output));
      toDisplay = toNode
        ? `[${node.output}] ${toNode.name}`
        : `[${node.output}] ❌ MISSING`;
    }

    mapRows.push({
      id: node.id,
      name: node.name,
      file: node.file,
      fromDisplay,
      toDisplay,
    });
  }

  return Object.freeze(mapRows);
}
