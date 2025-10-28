import { Node, Edge } from "@/types/workflow-studio/workflow";
import { v4 as uuidv4 } from "uuid";

// ============================================================================
// ID Generation
// ============================================================================

export const generateNodeId = (existingNodes: Node[]): number => {
  return Math.max(...existingNodes.map((n) => n.id), 0) + 1;
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
  return `${uuid}-${nextEdgeNumber}`;
};

export const createEdgeId = (edgeNumber: number): string => {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 12);
  return `${uuid}-${edgeNumber}`;
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
  const outputPortX = sourceX + 27.5; // Half node width
  const outputPortY = sourceY;
  const inputPortX = targetX - 27.5;
  const inputPortY = targetY;

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
  source: number,
  target: number
): boolean => {
  return edges.some((e) => e.source === source && e.target === target);
};

export const filterEdgesForNode = (edges: Edge[], nodeId: number): Edge[] => {
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
    ? "absolute w-40 rounded-2xl transform cursor-grabbing"
    : "absolute w-40 rounded-2xl transition-all transform cursor-grab active:cursor-grabbing";

  const dragClasses = isDragging ? "active:scale-105" : "";
  const selectionClasses = isSelected
    ? "ring-2 ring-blue-500 shadow-2xl shadow-blue-500/50"
    : "shadow-lg hover:shadow-xl";

  const backgroundClasses =
    nodeType === "start" || nodeType === "end"
      ? "bg-gradient-to-br from-violet-600 to-blue-600"
      : "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-800 dark:to-slate-900";

  const borderClasses = isSelected
    ? "border-2 border-blue-500"
    : "border-2 border-slate-400 dark:border-slate-500";

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
  selectedNodeId: number | null,
  nodes: Node[]
) => {
  if (!selectedNodeId) return null;
  return nodes.find((n) => n.id === selectedNodeId);
};
