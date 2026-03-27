import { DuplicateGroup, NodeId, NodeRecord } from "./types";

export type DuplicateResult = Readonly<{
  count: number;
  groups: ReadonlyArray<DuplicateGroup>;
  uniqueIds: number;
  totalNodes: number;
}>;

/**
 * Find duplicate IDs
 * Pure function: Groups nodes by ID and flags duplicates
 */
export function findDuplicates(nodes: ReadonlyArray<NodeRecord>): DuplicateResult {
  const idMap = new Map<NodeId, NodeRecord[]>();

  for (const node of nodes) {
    const list = idMap.get(node.id) || [];
    list.push(node);
    idMap.set(node.id, list);
  }

  const groups: DuplicateGroup[] = [];
  let count = 0;

  for (const [id, nodeList] of idMap.entries()) {
    if (nodeList.length > 1) {
      groups.push({
        id,
        nodes: Object.freeze([...nodeList]),
      });
      count++;
    }
  }

  return {
    count,
    groups: Object.freeze(groups),
    uniqueIds: idMap.size,
    totalNodes: nodes.length,
  };
}
