import { Node, Edge } from "@/types/workflow-studio/workflow";
import { v4 as uuidv4 } from "uuid";

/**
 * Generates a unique ID for new nodes
 */
export const generateNodeId = (existingNodes: Node[]): number => {
  return Math.max(...existingNodes.map((n) => n.id), 0) + 1;
};

/**
 * Generates a unique ID for new edges with UUID and monotonic counter
 * Uses the highest existing edge number + 1 to prevent duplicates after deletions
 */
export const generateEdgeId = (existingEdges: Edge[]): string => {
  // Find the highest edge number from existing edges
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

/**
 * Creates an edge ID with UUID and specific number (for initial data)
 */
export const createEdgeId = (edgeNumber: number): string => {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 12);
  return `${uuid}-${edgeNumber}`;
};

/**
 * Extracts edge number from edge ID
 * Handles UUID format: {uuid}-{number}
 */
export const getEdgeNumber = (edgeId: string): number => {
  const parts = edgeId.split("-");
  if (parts.length > 1) {
    // UUID format: {uuid}-{number}
    const number = parseInt(parts[parts.length - 1]);
    return isNaN(number) ? 1 : number;
  }
  // Fallback for any unexpected format
  return 1;
};

/**
 * Generates random position for new nodes
 */
export const generateRandomPosition = (): { x: number; y: number } => {
  return {
    x: Math.random() * 400 + 200,
    y: Math.random() * 300 + 100,
  };
};

/**
 * Calculates quadratic curve path for SVG
 */
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

/**
 * Calculates quadratic curve path from output port to input port
 */
export const calculatePortToPortPath = (
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): string => {
  // Calculate output port position (right side of source node)
  const outputPortX = sourceX + 27.5; // Half of node width (55px/2) = 27.5px to the right
  const outputPortY = sourceY;

  // Calculate input port position (left side of target node)
  const inputPortX = targetX - 27.5; // Half of node width (55px/2) = 27.5px to the left
  const inputPortY = targetY;

  // Calculate control points for smooth curve
  const dx = inputPortX - outputPortX;
  const dy = inputPortY - outputPortY;
  const controlX = outputPortX + dx * 0.5;
  const controlY = outputPortY + dy * 0.5 + Math.abs(dx) * 0.2;

  return `M${outputPortX},${outputPortY} Q${controlX},${controlY} ${inputPortX},${inputPortY}`;
};

/**
 * Checks if an edge already exists between two nodes
 */
export const edgeExists = (
  edges: Edge[],
  source: number,
  target: number
): boolean => {
  return edges.some((e) => e.source === source && e.target === target);
};

/**
 * Filters edges connected to a specific node
 */
export const filterEdgesForNode = (edges: Edge[], nodeId: number): Edge[] => {
  return edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
};

/**
 * Gets node style classes based on type and state
 */
export const getNodeClasses = (
  nodeType: string,
  isSelected: boolean,
  isDragging: boolean
): string => {
  const baseClasses = isDragging
    ? "absolute w-40 rounded-2xl transform cursor-grabbing" // No transitions when dragging
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

/**
 * Gets text color classes based on node type
 */
export const getNodeTextClasses = (nodeType: string): string => {
  return nodeType === "start" || nodeType === "end"
    ? "text-white"
    : "text-slate-800 dark:text-slate-200";
};

/**
 * Gets secondary text color classes based on node type
 */
export const getNodeSecondaryTextClasses = (nodeType: string): string => {
  return nodeType === "start" || nodeType === "end"
    ? "text-slate-200"
    : "text-slate-800 dark:text-slate-200";
};
