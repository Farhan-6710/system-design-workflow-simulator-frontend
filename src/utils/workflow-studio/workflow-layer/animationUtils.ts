import {
  RPSValue,
  RPSRange,
  AnimationDuration,
  EdgeStyle,
  NodeGlowConfig,
  GlowType,
  EdgeGradientType,
  EdgeAnimationClass,
  NodeGlowClass,
} from "@/types/workflow-studio/workflow";

/**
 * CONSOLIDATED ANIMATION, STYLING & SERVER METRICS UTILITIES
 *
 * All server load, animation, and UI styling logic consolidated in one place.
 * Uses 50% warning and 80% critical server load thresholds.
 */

// =============================================================================
// SHARED CONSTANTS - Single source of truth for all thresholds
// =============================================================================

export const MAX_SERVER_CAPACITY = 50000; // Max requests per second
export const WARNING_THRESHOLD = 0.5; // 50% load threshold
export const CRITICAL_THRESHOLD = 0.8; // 80% load threshold

export type LoadLevel = "BLUE" | "YELLOW" | "RED";

/**
 * Calculate server load percentage (0-100)
 */
export function calculateServerLoad(rps: number): number {
  return Math.round((rps / MAX_SERVER_CAPACITY) * 100);
}

/**
 * Get load level based on RPS (core logic for all animations)
 */
export function getLoadLevel(rps: number): LoadLevel {
  const loadPercentage = rps / MAX_SERVER_CAPACITY;

  if (loadPercentage >= CRITICAL_THRESHOLD) return "RED"; // ≥80%
  if (loadPercentage >= WARNING_THRESHOLD) return "YELLOW"; // ≥50%
  return "BLUE"; // <50%
}

// =============================================================================
// SERVER STATUS & UI DISPLAY
// =============================================================================

/**
 * Get server status info for UI display
 */
export function getServerStatus(serverLoad: number) {
  const criticalPercentage = CRITICAL_THRESHOLD * 100; // 80%
  const warningPercentage = WARNING_THRESHOLD * 100; // 50%

  if (serverLoad >= criticalPercentage) {
    return {
      status: "CRITICAL",
      statusClass: "text-red-500",
      iconClass: "text-red-500 border-red-500",
    };
  } else if (serverLoad >= warningPercentage) {
    return {
      status: "WARNING",
      statusClass: "text-yellow-500",
      iconClass: "text-yellow-500 border-yellow-500",
    };
  } else {
    return {
      status: "NORMAL",
      statusClass: "text-green-500",
      iconClass: "text-green-500 border-green-500",
    };
  }
}

/**
 * Get load color classes for UI display
 */
export function getLoadColor(serverLoad: number): string {
  const criticalPercentage = CRITICAL_THRESHOLD * 100; // 80%
  const warningPercentage = WARNING_THRESHOLD * 100; // 50%

  if (serverLoad >= criticalPercentage) return "text-red-500 bg-red-100";
  if (serverLoad >= warningPercentage) return "text-yellow-500 bg-yellow-100";
  return "text-green-500 bg-green-100";
}

/**
 * Get RPS color classes for UI display
 */
export function getRPSColor(rps: number): string {
  const serverLoad = calculateServerLoad(rps);
  const criticalPercentage = CRITICAL_THRESHOLD * 100; // 80%
  const warningPercentage = WARNING_THRESHOLD * 100; // 50%

  if (serverLoad >= criticalPercentage) return "text-red-500";
  if (serverLoad >= warningPercentage) return "text-yellow-500";
  return "text-blue-500";
}

// =============================================================================
// ANIMATION DURATION & SPEED
// =============================================================================

/**
 * Calculate animation duration based on requests per second using logarithmic scaling
 */
export const calculateAnimationDuration = (
  requestsPerSecond: RPSValue
): AnimationDuration => {
  // Logarithmic scaling: 1 RPS = 0.666s, 50000 RPS = 0.067s
  const minDuration = 0.067; // Speed for 50000 RPS
  const maxDuration = 0.666; // Speed for 1 RPS
  const logMin = Math.log(1); // log(1) = 0
  const logMax = Math.log(50000); // log(50000)
  const logRPS = Math.log(Math.max(1, requestsPerSecond));

  // Interpolate between min and max duration using logarithmic scale
  const normalizedLog = (logRPS - logMin) / (logMax - logMin);
  return Math.max(
    0.05,
    maxDuration - normalizedLog * (maxDuration - minDuration)
  );
};

/**
 * Get RPS range from numeric value (for backwards compatibility)
 */
export const getRPSRange = (requestsPerSecond: RPSValue): RPSRange => {
  const loadLevel = getLoadLevel(requestsPerSecond);

  switch (loadLevel) {
    case "RED": // ≥80% server load
      return RPSRange.HIGH;
    case "YELLOW": // ≥50% server load
      return RPSRange.MEDIUM;
    case "BLUE":
    default:
      return RPSRange.LOW; // <50% server load
  }
};

/**
 * Get animation speed multiplier based on RPS range
 */
export const getAnimationSpeed = (rpsRange: RPSRange): number => {
  switch (rpsRange) {
    case RPSRange.LOW:
      return 1.0; // Normal speed
    case RPSRange.MEDIUM:
      return 1.33; // 33% faster
    case RPSRange.HIGH:
      return 2.0; // 2x faster
    default:
      return 1.0;
  }
};

// =============================================================================
// EDGE ANIMATIONS & STYLING
// =============================================================================

/**
 * Get edge style configuration based on server load (MAIN EDGE FUNCTION)
 */
export const getEdgeStyle = (rps: number): EdgeStyle => {
  const loadLevel = getLoadLevel(rps);

  switch (loadLevel) {
    case "RED": // ≥80% server load
      return {
        gradient: EdgeGradientType.RED,
        className: "animated-edge-red" as EdgeAnimationClass,
      };
    case "YELLOW": // ≥50% server load
      return {
        gradient: EdgeGradientType.YELLOW,
        className: "animated-edge-yellow" as EdgeAnimationClass,
      };
    case "BLUE": // <50% server load
    default:
      return {
        gradient: EdgeGradientType.BLUE,
        className: "animated-edge" as EdgeAnimationClass,
      };
  }
};

/**
 * Get edge gradient and class (alternative format for backwards compatibility)
 */
export const getEdgeStyleByRPS = (
  requestsPerSecond: number
): { gradient: string; className: string } => {
  const loadLevel = getLoadLevel(requestsPerSecond);

  switch (loadLevel) {
    case "RED": // ≥80% server load
      return {
        gradient: "url(#flowGradientRed)",
        className: "animated-edge-red",
      };
    case "YELLOW": // ≥50% server load
      return {
        gradient: "url(#flowGradientYellow)",
        className: "animated-edge-yellow",
      };
    case "BLUE": // <50% server load
    default:
      return {
        gradient: "url(#flowGradient)",
        className: "animated-edge",
      };
  }
};

// =============================================================================
// NODE GLOW ANIMATIONS & STYLING
// =============================================================================

/**
 * Get node glow class based on server load (MAIN NODE FUNCTION)
 */
export const getNodeGlowClass = (rps: number): string => {
  const loadLevel = getLoadLevel(rps);

  switch (loadLevel) {
    case "RED":
      return "node-glow-red"; // ≥80% server load
    case "YELLOW":
      return "node-glow-yellow"; // ≥50% server load
    case "BLUE":
    default:
      return "node-glow-blue"; // <50% server load
  }
};

/**
 * Get node glow configuration based on glow type
 */
export const getNodeGlowConfig = (glowType: GlowType): NodeGlowConfig => {
  switch (glowType) {
    case GlowType.BLUE:
      return {
        glowType: GlowType.BLUE,
        className: "node-glow-blue" as NodeGlowClass,
      };
    case GlowType.YELLOW:
      return {
        glowType: GlowType.YELLOW,
        className: "node-glow-yellow" as NodeGlowClass,
      };
    case GlowType.RED:
      return {
        glowType: GlowType.RED,
        className: "node-glow-red" as NodeGlowClass,
      };
    case GlowType.NONE:
    default:
      return {
        glowType: GlowType.NONE,
        className: "" as NodeGlowClass,
      };
  }
};

/**
 * Get node glow configuration directly from RPS
 */
export const getNodeGlowConfigFromRPS = (rps: number): NodeGlowConfig => {
  const loadLevel = getLoadLevel(rps);

  switch (loadLevel) {
    case "RED":
      return getNodeGlowConfig(GlowType.RED);
    case "YELLOW":
      return getNodeGlowConfig(GlowType.YELLOW);
    case "BLUE":
    default:
      return getNodeGlowConfig(GlowType.BLUE);
  }
};

// =============================================================================
// UTILITY CONVERTERS
// =============================================================================

/**
 * Convert RPS range to GlowType (for backwards compatibility)
 */
export const getGlowTypeFromRPS = (rpsRange: RPSRange): GlowType => {
  switch (rpsRange) {
    case RPSRange.LOW:
      return GlowType.BLUE;
    case RPSRange.MEDIUM:
      return GlowType.YELLOW;
    case RPSRange.HIGH:
      return GlowType.RED;
    default:
      return GlowType.NONE;
  }
};
