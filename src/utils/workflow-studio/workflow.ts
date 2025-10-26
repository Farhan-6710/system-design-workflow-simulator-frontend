import { Node, Edge } from "@/types/workflow-studio/workflow";

/**
 * Generates a unique ID for new nodes
 */
export const generateNodeId = (existingNodes: Node[]): number => {
  return Math.max(...existingNodes.map((n) => n.id), 0) + 1;
};

/**
 * Generates a unique ID for new edges with number
 */
export const generateEdgeId = (existingEdges: Edge[]): string => {
  const edgeNumber = existingEdges.length + 1;
  return `e${Date.now()}-${edgeNumber}`;
};

/**
 * Extracts edge number from edge ID
 * Handles both old format (e{timestamp}) and new format (e{timestamp}-{number})
 */
export const getEdgeNumber = (edgeId: string, allEdges?: Edge[]): number => {
  const parts = edgeId.split("-");
  if (parts.length > 1) {
    // New format: e{timestamp}-{number}
    return parseInt(parts[1]);
  } else {
    // Old format: e{timestamp} - assign number based on position in array
    if (allEdges) {
      const index = allEdges.findIndex((edge) => edge.id === edgeId);
      return index >= 0 ? index + 1 : 1;
    }
    return 1;
  }
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

/**
 * Gets edge gradient and class based on requests per second
 */
export const getEdgeStyleByRPS = (
  requestsPerSecond: number
): { gradient: string; className: string } => {
  if (requestsPerSecond <= 500) {
    return {
      gradient: "url(#flowGradient)",
      className: "animated-edge",
    };
  } else if (requestsPerSecond <= 5000) {
    return {
      gradient: "url(#flowGradientYellow)",
      className: "animated-edge-yellow",
    };
  } else {
    return {
      gradient: "url(#flowGradientRed)",
      className: "animated-edge-red",
    };
  }
};

/**
 * Gets database node glow class based on requests per second
 */
export const getDatabaseGlowClass = (requestsPerSecond: number): string => {
  if (requestsPerSecond <= 500) {
    return "database-glow-blue";
  } else if (requestsPerSecond <= 5000) {
    return "database-glow-yellow";
  } else {
    return "database-glow-red";
  }
};
