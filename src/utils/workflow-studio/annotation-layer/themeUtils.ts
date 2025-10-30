/**
 * Theme utilities for annotation canvas
 * Handles color detection and theme-aware styling
 */

import type { FabricCanvas } from "./types";
import { getFabric } from "./fabricLoader";

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
 * Apply theme colors to existing canvas objects
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
