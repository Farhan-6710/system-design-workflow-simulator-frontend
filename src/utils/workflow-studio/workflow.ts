import { Node, Edge, CanvasTransform } from "@/types/workflow-studio/workflow";
import { v4 as uuidv4 } from "uuid";
import {
  MIN_ZOOM,
  MAX_ZOOM,
  INTERACTIVE_SELECTORS,
  ZOOM_STEP,
  ZOOM_BASELINE,
  PAN_DISABLED_THRESHOLD,
  WORKFLOW_LAYER_INITIAL_SCALE,
  OUTPUT_PORT_OFFSET_X,
  OUTPUT_PORT_OFFSET_Y,
  INPUT_PORT_OFFSET_X,
  INPUT_PORT_OFFSET_Y,
} from "@/constants/canvas";

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
  const outputPortX = sourceX + OUTPUT_PORT_OFFSET_X;
  const outputPortY = sourceY + OUTPUT_PORT_OFFSET_Y;
  const inputPortX = targetX + INPUT_PORT_OFFSET_X; // INPUT_PORT_OFFSET_X is negative (-27.5)
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

// ============================================================================
// CANVAS & VIEWPORT UTILITIES
// ============================================================================

// Zoom constraint utility
export const constrainScale = (scale: number): number =>
  Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));

// Interactive element detection for pan prevention
export const isInteractiveElement = (target: HTMLElement): boolean =>
  Boolean(target.closest(INTERACTIVE_SELECTORS));

// Pinch gesture detection for zoom
export const isPinchGesture = (event: WheelEvent | React.WheelEvent): boolean =>
  event.ctrlKey || event.metaKey;

// Touch distance calculation for pinch zoom
export const getTouchDistance = (touches: React.TouchList): number => {
  if (touches.length < 2) return 0;
  const [touch1, touch2] = [touches[0], touches[1]];
  return Math.sqrt(
    Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
  );
};

// Generate canvas transform CSS style
export const getCanvasTransformStyle = (
  transform: CanvasTransform,
  isPanning: boolean = false
): React.CSSProperties => ({
  transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
  transformOrigin: "center center",
  transition: isPanning ? "none" : "transform 0.15s ease-out",
});

// Static workflow transform style - always 100% zoom, no pan
export const getWorkflowTransformStyle = (): React.CSSProperties => ({
  transform: `translate(0px, 0px) scale(${WORKFLOW_LAYER_INITIAL_SCALE})`,
  transformOrigin: "center center",
  transition: "none",
});

// Calculate optimal zoom and position to fit content bounds
export const calculateZoomToFit = (
  bounds: { x: number; y: number; width: number; height: number },
  containerWidth: number,
  containerHeight: number,
  padding: number = 50
): CanvasTransform => {
  const scaleX = (containerWidth - padding * 2) / bounds.width;
  const scaleY = (containerHeight - padding * 2) / bounds.height;
  const scale = constrainScale(Math.min(scaleX, scaleY));

  // Center the content
  const translateX = containerWidth / 2 - (bounds.x + bounds.width / 2) * scale;
  const translateY =
    containerHeight / 2 - (bounds.y + bounds.height / 2) * scale;

  return { scale, translateX, translateY };
};

// Convert client coordinates to canvas coordinates
export const getCanvasCoordinates = (
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  transform: CanvasTransform
): { x: number; y: number } => {
  const canvasX = clientX - canvasRect.left;
  const canvasY = clientY - canvasRect.top;

  return {
    x: (canvasX - transform.translateX) / transform.scale,
    y: (canvasY - transform.translateY) / transform.scale,
  };
};

// ============================================================================
// ZOOM ACTION CREATORS
// ============================================================================

// Zoom action creators - pure functions that return state updates
export const createZoomActions = () => ({
  // Zoom in by step amount
  zoomIn: (
    currentTransform: CanvasTransform,
    canvasWidth: number = 800,
    canvasHeight: number = 600
  ): CanvasTransform => {
    const newTransform = {
      ...currentTransform,
      scale: constrainScale(currentTransform.scale + ZOOM_STEP),
    };
    // Apply boundary constraints after zoom change
    return createZoomActions().constrainPan(
      newTransform,
      canvasWidth,
      canvasHeight
    );
  },

  // Zoom out by step amount
  zoomOut: (
    currentTransform: CanvasTransform,
    canvasWidth: number = 800,
    canvasHeight: number = 600
  ): CanvasTransform => {
    const newTransform = {
      ...currentTransform,
      scale: constrainScale(currentTransform.scale - ZOOM_STEP),
    };
    // Apply boundary constraints after zoom change
    return createZoomActions().constrainPan(
      newTransform,
      canvasWidth,
      canvasHeight
    );
  },

  // Set specific zoom level
  setZoom: (
    currentTransform: CanvasTransform,
    scale: number,
    canvasWidth: number = 800,
    canvasHeight: number = 600
  ): CanvasTransform => {
    const newTransform = {
      ...currentTransform,
      scale: constrainScale(scale),
    };
    // Apply boundary constraints after zoom change
    return createZoomActions().constrainPan(
      newTransform,
      canvasWidth,
      canvasHeight
    );
  },

  // Reset viewport to default state
  resetViewport: (): CanvasTransform => ({
    scale: ZOOM_BASELINE, // Reset to baseline (displays as 100% to user)
    translateX: 0,
    translateY: 0,
  }),

  // Constrain pan within canvas boundaries
  constrainPan: (
    currentTransform: CanvasTransform,
    canvasWidth: number,
    canvasHeight: number
  ): CanvasTransform => {
    const { scale, translateX, translateY } = currentTransform;

    // Allow panning when content is scaled larger than canvas
    // At ZOOM_BASELINE (10.0) and above, content is larger than canvas
    if (scale <= PAN_DISABLED_THRESHOLD) {
      return { ...currentTransform, translateX: 0, translateY: 0 };
    }

    // Calculate the scaled content dimensions
    const scaledWidth = canvasWidth * scale;
    const scaledHeight = canvasHeight * scale;

    // Calculate maximum allowed translation to keep content within bounds
    const maxTranslateX = (scaledWidth - canvasWidth) / 2;
    const maxTranslateY = (scaledHeight - canvasHeight) / 2;

    // Constrain translation within boundaries
    const constrainedX = Math.max(
      -maxTranslateX,
      Math.min(maxTranslateX, translateX)
    );
    const constrainedY = Math.max(
      -maxTranslateY,
      Math.min(maxTranslateY, translateY)
    );

    return {
      ...currentTransform,
      translateX: constrainedX,
      translateY: constrainedY,
    };
  },

  // Zoom to fit content bounds (with container dimensions)
  zoomToFit: (
    bounds?: { x: number; y: number; width: number; height: number },
    containerWidth: number = 800,
    containerHeight: number = 600
  ): CanvasTransform => {
    if (!bounds) {
      // If no bounds provided, reset to default
      return { scale: 1, translateX: 0, translateY: 0 };
    }

    return calculateZoomToFit(bounds, containerWidth, containerHeight);
  },
});
