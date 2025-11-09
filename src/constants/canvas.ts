/**
 * Canvas and viewport constants
 * Centralized configuration for zoom, pan, and workflow behavior
 */

// ============================================================================
// Zoom Constants
// ============================================================================

export const ZOOM_BASELINE = 1.75;
export const WORKFLOW_LAYER_INITIAL_SCALE = 0.5;
export const MIN_ZOOM = 1.0;
export const MAX_ZOOM = 7;
export const ZOOM_STEP = 0.1;
export const ZOOM_SENSITIVITY = 0.01;

// ============================================================================
// Panning Constants
// ============================================================================

export const PAN_DISABLED_THRESHOLD = 1.0;
export const PAN_THRESHOLD = 2;
export const TOUCH_TAP_TIMEOUT = 200;

// ============================================================================
// Zoom Conversion Helpers
// ============================================================================

export const internalToDisplayZoom = (internalScale: number): number => {
  return (internalScale / ZOOM_BASELINE) * 100;
};

export const displayToInternalZoom = (displayPercentage: number): number => {
  return (displayPercentage / 100) * ZOOM_BASELINE;
};

// ============================================================================
// Interaction Constants
// ============================================================================

export const INTERACTIVE_SELECTORS = [
  ".workflow-node",
  ".dock-navigation",
  ".workflow-header",
  "[data-no-pan]",
].join(", ");

// ============================================================================
// Animation & Visual Constants
// ============================================================================

export const TRANSFORM_TRANSITION = "transform 0.15s ease-out";
export const CANVAS_BACKGROUND_TRANSITION = "background-color 0.3s ease";
export const GRID_SIZE = 20;
export const GRID_DOT_SIZE = 1;
export const GRID_OPACITY = 0.3;

// ============================================================================
// Node & Connection Constants
// ============================================================================

export const NODE_SIZE = 27.5;
export const OUTPUT_PORT_OFFSET_X = 13.75;
export const OUTPUT_PORT_OFFSET_Y = 0;
export const INPUT_PORT_OFFSET_X = -13.75;
export const INPUT_PORT_OFFSET_Y = 0;
export const TEMP_LINE_START_OFFSET_X = OUTPUT_PORT_OFFSET_X;
export const TEMP_LINE_START_OFFSET_Y = OUTPUT_PORT_OFFSET_Y;
export const TEMP_LINE_END_OFFSET_X = 0;
export const TEMP_LINE_END_OFFSET_Y = 0;

// ============================================================================
// Server Load Constants
// ============================================================================

export const MAX_SERVER_CAPACITY = 50000;
export const WARNING_THRESHOLD = 0.5;
export const CRITICAL_THRESHOLD = 0.8;
