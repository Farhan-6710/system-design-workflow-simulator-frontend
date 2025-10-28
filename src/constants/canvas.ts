/**
 * Canvas and viewport constants
 * Centralized configuration for consistent behavior across the application
 */

// Zoom constraints
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3.0;
export const ZOOM_STEP = 0.1;
export const ZOOM_SENSITIVITY = 0.001;

// Canvas interaction settings
export const INTERACTIVE_SELECTORS = [
  ".workflow-node",
  ".dock-navigation",
  ".workflow-header",
  "[data-no-pan]",
].join(", ");

// Pan and touch settings
export const PAN_THRESHOLD = 2; // Minimum movement before starting pan
export const TOUCH_TAP_TIMEOUT = 200; // Maximum time for touch tap detection

// Animation and transition settings
export const TRANSFORM_TRANSITION = "transform 0.15s ease-out";
export const CANVAS_BACKGROUND_TRANSITION = "background-color 0.3s ease";

// Grid settings
export const GRID_SIZE = 20;
export const GRID_DOT_SIZE = 1;
export const GRID_OPACITY = 0.3;
