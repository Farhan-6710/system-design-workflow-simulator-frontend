/**
 * Canvas setup and configuration utilities
 * Handles canvas initialization and mode management
 */

import type { FabricCanvas, Tool } from "./types";
import { getFabric } from "./fabricLoader";
import { configureBrush } from "./themeUtils";

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
