/**
 * Clean Fabric.js utilities for annotation canvas
 * Handles canvas operations, shape creation, and serialization
 */

import type { Tool } from "@/components/main-sections/workflow-studio/annotation-layer/AnnotationLayer";

// Fabric.js types
export interface FabricCanvas {
  add(object: FabricObject): void;
  remove(object: FabricObject): void;
  clear(): void;
  dispose(): void;
  renderAll(): void;
  getPointer(e: Event): { x: number; y: number };
  getObjects(): FabricObject[];
  getActiveObjects(): FabricObject[];
  getActiveObject(): FabricObject | null;
  setActiveObject(object: FabricObject): void;
  discardActiveObject(): void;
  setDimensions(dimensions: { width: number; height: number }): void;
  getWidth(): number;
  getHeight(): number;
  toJSON(propertiesToInclude?: string[]): Record<string, unknown>;
  loadFromJSON(json: Record<string, unknown>, callback: () => void): void;
  toDataURL(options?: Record<string, unknown>): string;
  toSVG(): string;

  // Canvas properties
  isDrawingMode: boolean;
  selection: boolean;
  skipTargetFind: boolean;
  defaultCursor: string;
  hoverCursor: string;
  moveCursor: string;
  freeDrawingBrush: {
    width: number;
    color: string;
  } | null;

  // Event methods
  on(eventName: string, handler: (e?: unknown) => void): void;
  off(eventName: string, handler: (e?: unknown) => void): void;
}

export interface FabricObject {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  radius?: number;
  scaleX?: number;
  scaleY?: number;
  type?: string;
  set(options: Record<string, unknown>): void;
  setCoords(): void;
}

export interface Point {
  x: number;
  y: number;
}

export interface CanvasState {
  version: string;
  objects: Record<string, unknown>[];
}

// Fabric.js module import with safety
const getFabric = () => {
  if (typeof window === "undefined") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fabricModule = require("fabric");
    return fabricModule.fabric || fabricModule;
  } catch {
    return null;
  }
};

/**
 * Initialize a new Fabric.js canvas
 */
export function initializeCanvas(
  canvasElement: HTMLCanvasElement
): FabricCanvas | null {
  const fabric = getFabric();
  if (!fabric || !canvasElement) return null;

  // Ensure canvas element has a valid 2D context
  const context = canvasElement.getContext("2d");
  if (!context) {
    console.error("Failed to get 2D context from canvas element");
    return null;
  }

  // Wait a tick to ensure element is properly mounted
  if (!canvasElement.parentElement) {
    console.warn("Canvas element not properly mounted");
    return null;
  }

  const canvas = new fabric.Canvas(canvasElement, {
    width: canvasElement.parentElement?.clientWidth || 800,
    height: canvasElement.parentElement?.clientHeight || 600,
    backgroundColor: "transparent",
    preserveObjectStacking: true,
    selection: true,
    defaultCursor: "default",
    hoverCursor: "default",
    moveCursor: "default",
  });

  // Configure brush for free drawing
  configureBrush(canvas);

  return canvas;
}

/**
 * Configure drawing brush with theme-aware colors
 */
export function configureBrush(canvas: FabricCanvas, color?: string): void {
  if (!canvas) return;

  const fabric = getFabric();
  if (!fabric) return;

  // Ensure brush exists, create if needed
  if (!canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  }

  try {
    const strokeColor = color || getThemeColor();

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = 2;
      canvas.freeDrawingBrush.color = strokeColor;
    }
  } catch (error) {
    console.warn("Error configuring brush:", error);
  }
}

/**
 * Get theme-appropriate color
 */
export function getThemeColor(): string {
  if (typeof window === "undefined") return "#000000";

  const isDark =
    document.documentElement.classList.contains("dark") ||
    (!document.documentElement.classList.contains("light") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return isDark ? "#ffffff" : "#000000";
}

/**
 * Update canvas mode based on selected tool
 */
export function updateCanvasMode(canvas: FabricCanvas, tool: Tool): void {
  if (!canvas) return;

  try {
    if (tool === "freedraw") {
      canvas.isDrawingMode = true;
      canvas.selection = false;
      configureBrush(canvas);
    } else if (tool === "select") {
      canvas.isDrawingMode = false;
      canvas.selection = true;
      // Enable object selection and manipulation
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
      canvas.moveCursor = "move";
    } else {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      // Set cursors for drawing tools
      canvas.defaultCursor = "crosshair";
      canvas.hoverCursor = "crosshair";
      canvas.moveCursor = "crosshair";
    }
  } catch (error) {
    console.error("Error updating canvas mode:", error);
  }
}

/**
 * Create a shape based on tool type
 */
export function createShape(
  tool: Tool,
  startPoint: Point
): FabricObject | null {
  const fabric = getFabric();
  if (!fabric) return null;

  const color = getThemeColor();
  const commonProps = {
    stroke: color,
    strokeWidth: 2,
    fill: "transparent",
    selectable: false,
    evented: false,
  };

  switch (tool) {
    case "rectangle":
      return new fabric.Rect({
        ...commonProps,
        left: startPoint.x,
        top: startPoint.y,
        width: 0,
        height: 0,
      });

    case "circle":
      return new fabric.Circle({
        ...commonProps,
        left: startPoint.x,
        top: startPoint.y,
        radius: 0,
      });

    case "line":
      return new fabric.Line(
        [startPoint.x, startPoint.y, startPoint.x, startPoint.y],
        {
          ...commonProps,
          fill: undefined,
        }
      );

    case "arrow":
      const line = new fabric.Line(
        [startPoint.x, startPoint.y, startPoint.x, startPoint.y],
        {
          ...commonProps,
          fill: undefined,
        }
      );
      (line as unknown as { arrowType: string }).arrowType = "arrow";
      return line;

    case "text":
      return new fabric.Textbox("Type here...", {
        left: startPoint.x,
        top: startPoint.y,
        width: 200,
        fill: color,
        fontSize: 18,
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        selectable: true,
        evented: true,
        editable: true,
        hasBorders: true,
        hasControls: true,
      });

    default:
      return null;
  }
}

/**
 * Update shape during drawing
 */
export function updateShape(
  shape: FabricObject,
  tool: Tool,
  startPoint: Point,
  currentPoint: Point
): void {
  if (!shape) return;

  switch (tool) {
    case "rectangle":
      const left = Math.min(startPoint.x, currentPoint.x);
      const top = Math.min(startPoint.y, currentPoint.y);
      const width = Math.abs(currentPoint.x - startPoint.x);
      const height = Math.abs(currentPoint.y - startPoint.y);
      shape.set({ left, top, width, height });
      break;

    case "circle":
      const deltaX = currentPoint.x - startPoint.x;
      const deltaY = currentPoint.y - startPoint.y;
      const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 2;
      shape.set({
        left: Math.min(startPoint.x, currentPoint.x),
        top: Math.min(startPoint.y, currentPoint.y),
        radius: radius,
      });
      break;

    case "line":
    case "arrow":
      (
        shape as unknown as { set: (props: { x2: number; y2: number }) => void }
      ).set({
        x2: currentPoint.x,
        y2: currentPoint.y,
      });
      break;
  }
}

/**
 * Finalize shape after drawing
 */
export function finalizeShape(
  canvas: FabricCanvas,
  shape: FabricObject,
  tool: Tool
): void {
  if (!shape) return;

  // Make shape selectable and interactive
  shape.set({
    selectable: true,
    evented: true,
    hasBorders: true,
    hasControls: true,
  });
  shape.setCoords();

  // Add arrowhead for arrows
  if (tool === "arrow") {
    addArrowhead(canvas, shape);
  }

  // Handle text editing - only auto-edit if this is a text tool
  if (tool === "text") {
    canvas.setActiveObject(shape);
    setTimeout(() => {
      const textObj = shape as unknown as {
        enterEditing?: () => void;
        hiddenTextarea?: HTMLTextAreaElement;
      };
      if (textObj.enterEditing) {
        textObj.enterEditing();
        if (textObj.hiddenTextarea) {
          textObj.hiddenTextarea.select();
        }
      }
    }, 100);
  }
}

/**
 * Add arrowhead to line
 */
function addArrowhead(canvas: FabricCanvas, lineShape: FabricObject): void {
  const fabric = getFabric();
  if (!fabric) return;

  const line = lineShape as unknown as {
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    stroke?: string;
    strokeWidth?: number;
  };
  const x1 = line.x1 ?? 0;
  const y1 = line.y1 ?? 0;
  const x2 = line.x2 ?? 0;
  const y2 = line.y2 ?? 0;

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLength = 15;
  const headAngle = Math.PI / 6;

  const arrowPoint1X = x2 - headLength * Math.cos(angle - headAngle);
  const arrowPoint1Y = y2 - headLength * Math.sin(angle - headAngle);
  const arrowPoint2X = x2 - headLength * Math.cos(angle + headAngle);
  const arrowPoint2Y = y2 - headLength * Math.sin(angle + headAngle);

  const arrowLine1 = new fabric.Line([x2, y2, arrowPoint1X, arrowPoint1Y], {
    stroke: line.stroke || getThemeColor(),
    strokeWidth: line.strokeWidth || 2,
    selectable: false,
    evented: false,
  });

  const arrowLine2 = new fabric.Line([x2, y2, arrowPoint2X, arrowPoint2Y], {
    stroke: line.stroke || getThemeColor(),
    strokeWidth: line.strokeWidth || 2,
    selectable: false,
    evented: false,
  });

  canvas.add(arrowLine1);
  canvas.add(arrowLine2);
}

/**
 * Serialize canvas to state
 */
export function serializeCanvas(canvas: FabricCanvas): CanvasState {
  const canvasJSON = canvas.toJSON(["id", "selectable", "evented"]);
  return {
    version: "1.0",
    objects: (canvasJSON.objects as Record<string, unknown>[]) || [],
  };
}

/**
 * Restore canvas from state
 */
export function restoreCanvas(
  canvas: FabricCanvas,
  state: CanvasState
): Promise<void> {
  return new Promise((resolve) => {
    if (!state?.objects) {
      resolve();
      return;
    }

    const canvasData = {
      version: state.version || "1.0",
      objects: state.objects,
    };

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        canvas.renderAll();
        resolve();
      }
    }, 300);

    try {
      canvas.loadFromJSON(canvasData, () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          canvas.renderAll();
          resolve();
        }
      });
    } catch (error) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        console.error("Failed to restore canvas:", error);
        resolve();
      }
    }
  });
}

/**
 * Apply theme colors to existing objects
 */
export function applyThemeColors(canvas: FabricCanvas): void {
  const color = getThemeColor();

  canvas.getObjects().forEach((obj) => {
    const objType = obj.type;
    if (objType && ["rect", "circle", "path", "line"].includes(objType)) {
      obj.set({ stroke: color });
    } else if (objType && ["i-text", "text", "textbox"].includes(objType)) {
      obj.set({ fill: color });
    }
  });

  configureBrush(canvas, color);
  canvas.renderAll();
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
