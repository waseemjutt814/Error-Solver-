/**
 * Error Solver domain types.
 */

export type NodeId = string & { readonly __brand: "NodeId" };
export type FilePath = string & { readonly __brand: "FilePath" };
export type IsoDateString = string & { readonly __brand: "IsoDateString" };

export const NodeId = (id: string): NodeId => id as NodeId;
export const FilePath = (path: string): FilePath => path as FilePath;
export const IsoDateString = (date: string): IsoDateString => date as IsoDateString;

export type Result<T, E = Error> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export type NodeKind = "middle" | "start" | "end" | "multiple";
export type NodeStatus = "active" | "broken" | "orphan" | "duplicate";

export type NodeRecord = Readonly<{
  id: NodeId;
  name: string;
  file: FilePath;
  input: string;
  output: string;
  kind: NodeKind;
  status: NodeStatus;
}>;

export type Registry = Readonly<{
  project_name: string;
  total_files: number;
  generated_at: IsoDateString;
  nodes: ReadonlyArray<NodeRecord>;
}>;

export type Config = Readonly<{
  rootDir: FilePath;
  srcDir: FilePath;
  registryFile: FilePath;
  archiveDir: FilePath;
  reportFile: FilePath;
  supportedExtensions: ReadonlyArray<string>;
}>;

export type ConnectionIssue = Readonly<{
  nodeId: NodeId;
  nodeName: string;
  direction: "input" | "output";
  target: string;
  message: string;
}>;

export type DuplicateGroup = Readonly<{
  id: NodeId;
  nodes: ReadonlyArray<NodeRecord>;
}>;

export type FlowPathNode = Readonly<{
  id: NodeId;
  name: string;
  status: "ok" | "loop" | "broken" | "missing";
}>;

export type FlowPath = Readonly<{
  startId: NodeId;
  chain: ReadonlyArray<FlowPathNode>;
  isComplete: boolean;
  hasLoop: boolean;
  isBroken: boolean;
}>;

export type ConnectionMapRow = Readonly<{
  id: NodeId;
  name: string;
  file: FilePath;
  fromDisplay: string;
  toDisplay: string;
}>;
