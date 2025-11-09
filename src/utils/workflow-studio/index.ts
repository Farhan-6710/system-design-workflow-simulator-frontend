/**
 * Canvas utilities barrel export
 * Re-exports from consolidated workflow utilities
 */

// Canvas and zoom utilities - now consolidated in workflow.ts
export {
  constrainScale,
  isInteractiveElement,
  isPinchGesture,
  getTouchDistance,
  getCanvasTransformStyle,
  calculateZoomToFit,
  getCanvasCoordinates,
  createZoomActions,
} from "@/utils/workflow-studio/canvasViewportUtils";

// Re-export constants for convenience
export {
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_STEP,
  ZOOM_SENSITIVITY,
  INTERACTIVE_SELECTORS,
  PAN_THRESHOLD,
  TOUCH_TAP_TIMEOUT,
  TRANSFORM_TRANSITION,
  CANVAS_BACKGROUND_TRANSITION,
  GRID_SIZE,
  GRID_DOT_SIZE,
  GRID_OPACITY,
} from "@/constants/canvas";
