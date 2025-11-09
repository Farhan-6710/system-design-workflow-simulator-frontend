/**
 * Workflow Core Utilities
 * Node/Edge operations, ID generation, styling, and selection helpers
 */

import { Node, Edge } from "@/types/workflow-studio/workflow";
import { nodeOptions } from "@/constants/nodeOptions";
import { v4 as uuidv4 } from "uuid";
import {
  OUTPUT_PORT_OFFSET_X,
  OUTPUT_PORT_OFFSET_Y,
  INPUT_PORT_OFFSET_X,
  INPUT_PORT_OFFSET_Y,
} from "@/constants/canvas";

// ============================================================================
// ID Generation
// ============================================================================

export const generateNodeId = (existingNodes: Node[]): string => {
  let maxNodeNumber = 0;
  existingNodes.forEach((node) => {
    const nodeNumber = getNodeNumber(node.id);
    if (nodeNumber > maxNodeNumber) {
      maxNodeNumber = nodeNumber;
    }
  });

  const nextNodeNumber = maxNodeNumber + 1;
  const uuid = uuidv4().replace(/-/g, "").substring(0, 12);
  return `${uuid}-N${nextNodeNumber}`;
};

export const createNodeId = (nodeNumber: number): string => {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 12);
  return `${uuid}-N${nodeNumber}`;
};

export const getNodeNumber = (nodeId: string): number => {
  const parts = nodeId.split("-");
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    if (lastPart.startsWith("N")) {
      const number = parseInt(lastPart.substring(1));
      return isNaN(number) ? 1 : number;
    }
  }
  return 1;
};

export const generateEdgeId = (existingEdges: Edge[]): string => {
  let maxEdgeNumber = 0;
  existingEdges.forEach((edge) => {
    const edgeNumber = getEdgeNumber(edge.id);
    if (edgeNumber > maxEdgeNumber) {
      maxEdgeNumber = edgeNumber;
    }
  });

  const nextEdgeNumber = maxEdgeNumber + 1;
  const uuid = uuidv4().replace(/-/g, "").substring(0, 12);
  return `${uuid}-E${nextEdgeNumber}`;
};

export const createEdgeId = (edgeNumber: number): string => {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 12);
  return `${uuid}-E${edgeNumber}`;
};

export const getEdgeNumber = (edgeId: string): number => {
  const parts = edgeId.split("-");
  if (parts.length > 1) {
    const number = parseInt(parts[parts.length - 1]);
    return isNaN(number) ? 1 : number;
  }
  return 1;
};

// ============================================================================
// Node/Edge Initialization
// ============================================================================

const nodeOptionsMap = new Map(nodeOptions.map((n) => [n.id, n]));

export interface NodeSpec {
  optionId: string;
  id: string;
  label: string;
  x: number;
  y: number;
  position?: "process" | "end" | "start";
}

export function buildNodeFromSpec(spec: NodeSpec): Node {
  const opt = nodeOptionsMap.get(spec.optionId);
  if (!opt) throw new Error(`Node option ${spec.optionId} not found`);

  const configurations: Record<string, string | number | boolean> = {};
  if (opt.configurations) {
    Object.values(opt.configurations).forEach((f) => {
      configurations[f.key] = f.defaultValue;
    });
  }

  return {
    id: spec.id,
    label: spec.label,
    x: spec.x,
    y: spec.y,
    position: spec.position || opt.position || "process",
    icon: opt.icon,
    configurations,
  };
}

export function buildEdgesFromPairs(
  pairs: Array<[string, string]>,
  startIndex: number = 1
): Edge[] {
  return pairs.map(([s, t], idx) => {
    const edgeNumber = startIndex + idx;
    return {
      id: createEdgeId(edgeNumber),
      source: s,
      target: t,
      edgeNumber,
    };
  });
}

// ============================================================================
// Position & Path Calculation
// ============================================================================

export const generateRandomPosition = (): { x: number; y: number } => {
  return {
    x: Math.random() * 400 + 200,
    y: Math.random() * 300 + 100,
  };
};

export const calculateCurvePath = (
  sx: number,
  sy: number,
  tx: number,
  ty: number
): string => {
  const dx = tx - sx;
  const dy = ty - sy;
  const controlX = sx + dx * 0.5;
  const controlY = sy + dy * 0.5 + Math.abs(dx) * 0.2;

  return `M${sx},${sy} Q${controlX},${controlY} ${tx},${ty}`;
};

export const calculatePortToPortPath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): string => {
  const outputPortX = sourceX + OUTPUT_PORT_OFFSET_X;
  const outputPortY = sourceY + OUTPUT_PORT_OFFSET_Y;
  const inputPortX = targetX + INPUT_PORT_OFFSET_X;
  const inputPortY = targetY + INPUT_PORT_OFFSET_Y;

  const dx = inputPortX - outputPortX;
  const dy = inputPortY - outputPortY;
  const controlX = outputPortX + dx * 0.5;
  const controlY = outputPortY + dy * 0.5 + Math.abs(dx) * 0.2;

  return `M${outputPortX},${outputPortY} Q${controlX},${controlY} ${inputPortX},${inputPortY}`;
};

// ============================================================================
// Edge Operations
// ============================================================================

export const edgeExists = (
  edges: Edge[],
  source: string,
  target: string
): boolean => {
  return edges.some((e) => e.source === source && e.target === target);
};

export const filterEdgesForNode = (edges: Edge[], nodeId: string): Edge[] => {
  return edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
};

// ============================================================================
// Node Styling
// ============================================================================

export const getNodeClasses = (
  nodeType: string,
  isSelected: boolean,
  isDragging: boolean
): string => {
  const baseClasses = isDragging
    ? "absolute w-20 rounded-lg transform cursor-grabbing"
    : "absolute w-20 rounded-md transition-all transform cursor-grab active:cursor-grabbing";

  const dragClasses = isDragging ? "active:scale-105" : "";
  const selectionClasses = isSelected
    ? "ring-1 ring-blue-500 shadow-xl shadow-blue-500/50"
    : "shadow-md hover:shadow-lg";

  const backgroundClasses =
    nodeType === "start" || nodeType === "end"
      ? "bg-gradient-to-br from-violet-600 to-blue-600"
      : "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-800 dark:to-slate-900";

  const borderClasses = isSelected
    ? "border border-blue-500"
    : "border border-slate-400 dark:border-slate-500";

  return `${baseClasses} ${dragClasses} ${selectionClasses} ${backgroundClasses} ${borderClasses}`;
};

export const getNodeTextClasses = (nodeType: string): string => {
  return nodeType === "start" || nodeType === "end"
    ? "text-white"
    : "text-slate-800 dark:text-slate-200";
};

export const getNodeSecondaryTextClasses = (nodeType: string): string => {
  return nodeType === "start" || nodeType === "end"
    ? "text-slate-200"
    : "text-slate-800 dark:text-slate-200";
};

// ============================================================================
// Selection Helpers
// ============================================================================

export const getSelectedEdgeDetails = (
  selectedEdgeId: string | null,
  edges: Edge[],
  nodes: Node[]
) => {
  if (!selectedEdgeId) return null;

  const edge = edges.find((e) => e.id === selectedEdgeId);
  if (!edge) return null;

  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);
  const edgeNumber = getEdgeNumber(edge.id);

  return {
    edge,
    sourceNode,
    targetNode,
    edgeNumber,
  };
};

export const getSelectedNodeDetails = (
  selectedNodeId: string | null,
  nodes: Node[]
) => {
  if (!selectedNodeId) return null;
  return nodes.find((n) => n.id === selectedNodeId);
};
