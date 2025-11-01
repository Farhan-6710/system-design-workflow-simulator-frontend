/**
 * Canvas and viewport constants
 * Centralized configuration for consistent zoom/pan behavior across the application
 *
 * ZOOM SYSTEM OVERVIEW:
 * - Users see: 67% (min) → 100% (default) → 200% (max)
 * - Internally: 1.0 (min) → 1.5 (baseline) → 3.0 (max)
 * - Visual faking allows smooth zoom-out while maintaining boundaries
 */

// ============================================================================
// ZOOM SYSTEM EXPLANATION
// ============================================================================
// We use a "Visual Faking" system to give users zoom-out capability while maintaining boundaries:
//
// INTERNAL SCALE    →    DISPLAY TO USER
// 1.0               →    67% (minimum zoom out)
// 1.5               →    100% (default/baseline)
// 3.0               →    200% (maximum zoom in)
//
// Why? Starting at 1.5x internally (ZOOM_BASELINE = 1.5) gives users room to zoom out to 67%
// while keeping content boundaries intact and providing smooth zoom experience.
// ============================================================================

// ============================================================================
// CORE ZOOM CONSTANTS (in logical order)
// ============================================================================

// Zoom baseline - the internal scale that displays as 100% to users (MOST IMPORTANT - DEFAULT UI STATE)
export const ZOOM_BASELINE = 1.5;

// Workflow visual scale - for static workflow display (WHAT USER SEES INITIALLY)
export const WORKFLOW_LAYER_INITIAL_SCALE = 0.5; // Makes workflow content render at proper visual size

// Zoom range constraints (internal values)
export const MIN_ZOOM = 1.0; // Shows as 67% to user (1.0 ÷ 1.5 ≈ 0.67 = 67%) - No panning
export const MAX_ZOOM = 5.0; // Shows as 200% to user (3.0 ÷ 1.5 = 2.0 = 200%) - Full panning

// Zoom interaction settings
export const ZOOM_STEP = 0.1; // Amount to zoom in/out per step
export const ZOOM_SENSITIVITY = 0.01; // Mouse wheel zoom sensitivity

// ============================================================================
// PANNING SETTINGS
// ============================================================================

// Panning threshold - scale level below which panning is disabled
export const PAN_DISABLED_THRESHOLD = 1.0; // No panning when scale <= 1.0 (67% display)

// Pan interaction settings
export const PAN_THRESHOLD = 2; // Minimum movement before starting pan
export const TOUCH_TAP_TIMEOUT = 200; // Maximum time for touch tap detection

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper functions for zoom conversion
export const internalToDisplayZoom = (internalScale: number): number => {
  return (internalScale / ZOOM_BASELINE) * 100; // Convert to percentage
};

export const displayToInternalZoom = (displayPercentage: number): number => {
  return (displayPercentage / 100) * ZOOM_BASELINE; // Convert from percentage
};

// ============================================================================
// INTERACTION SETTINGS
// ============================================================================

// Canvas interaction settings
export const INTERACTIVE_SELECTORS = [
  ".workflow-node",
  ".dock-navigation",
  ".workflow-header",
  "[data-no-pan]",
].join(", ");

// ============================================================================
// ANIMATION & VISUAL SETTINGS
// ============================================================================

// Animation and transition settings
export const TRANSFORM_TRANSITION = "transform 0.15s ease-out";
export const CANVAS_BACKGROUND_TRANSITION = "background-color 0.3s ease";

// Grid settings
export const GRID_SIZE = 20;
export const GRID_DOT_SIZE = 1;
export const GRID_OPACITY = 0.3;

// ============================================================================
// NODE POSITIONING & CONNECTION CONSTANTS
// ============================================================================

// Node dimensions
export const NODE_SIZE = 55; // Node width and height in pixels

// Output port positioning (for starting connections)
export const OUTPUT_PORT_OFFSET_X = 27.5; // Half of NODE_SIZE (right edge center)
export const OUTPUT_PORT_OFFSET_Y = 0; // Vertical center of node

// Input port positioning (for ending connections)
export const INPUT_PORT_OFFSET_X = -27.5; // Negative half of NODE_SIZE (left edge center)
export const INPUT_PORT_OFFSET_Y = 0; // Vertical center of node

// Temp line constants (for connection previews)
export const TEMP_LINE_START_OFFSET_X = OUTPUT_PORT_OFFSET_X; // Same as output port
export const TEMP_LINE_START_OFFSET_Y = OUTPUT_PORT_OFFSET_Y; // Same as output port
export const TEMP_LINE_END_OFFSET_X = 0; // Follows cursor exactly
export const TEMP_LINE_END_OFFSET_Y = 0; // Follows cursor exactly
