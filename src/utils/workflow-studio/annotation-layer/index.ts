/**
 * Annotation Layer Utilities
 * Clean, modular utilities for canvas annotation functionality
 *
 * This is the main entry point that re-exports all annotation layer utilities
 * for easy importing throughout the application.
 */

// Types
export type {
  FabricCanvas,
  FabricObject,
  Point,
  CanvasState,
  Tool,
} from "./types";

// Fabric.js loader
export { getFabric, isFabricAvailable } from "./fabricLoader";

// Canvas setup and configuration
export { initializeCanvas, updateCanvasMode } from "./canvasSetup";

// Shape creation and manipulation
export { createShape, updateShape, finalizeShape } from "./shapeCreation";

// Canvas state management
export { serializeCanvas, restoreCanvas } from "./canvasState";

// Theme utilities
export { getThemeColor, applyThemeColors, configureBrush } from "./themeUtils";

// General utilities
export {
  debounce,
  generateId,
  isPointInBounds,
  calculateDistance,
} from "./utilities";
