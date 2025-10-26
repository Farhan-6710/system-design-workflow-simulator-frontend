import {
  RPSRange,
  GlowType,
  EdgeStyle,
  NodeGlowConfig,
  EdgeGradientType,
  EdgeAnimationClass,
  NodeGlowClass,
} from "@/types/workflow-studio/workflow";

/**
 * Styling utility functions
 */

/**
 * Get edge style configuration based on RPS range
 */
export const getEdgeStyle = (rpsRange: RPSRange): EdgeStyle => {
  switch (rpsRange) {
    case RPSRange.LOW:
      return {
        gradient: EdgeGradientType.BLUE,
        className: "animated-edge" as EdgeAnimationClass,
      };
    case RPSRange.MEDIUM:
      return {
        gradient: EdgeGradientType.YELLOW,
        className: "animated-edge-yellow" as EdgeAnimationClass,
      };
    case RPSRange.HIGH:
      return {
        gradient: EdgeGradientType.RED,
        className: "animated-edge-red" as EdgeAnimationClass,
      };
    default:
      return {
        gradient: EdgeGradientType.BLUE,
        className: "animated-edge" as EdgeAnimationClass,
      };
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
        className: "database-glow-blue" as NodeGlowClass,
      };
    case GlowType.YELLOW:
      return {
        glowType: GlowType.YELLOW,
        className: "database-glow-yellow" as NodeGlowClass,
      };
    case GlowType.RED:
      return {
        glowType: GlowType.RED,
        className: "database-glow-red" as NodeGlowClass,
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
 * Check if a node should have glow effect
 */
export const shouldNodeGlow = (nodeLabel: string): boolean => {
  return nodeLabel === "Database" || nodeLabel.includes("DB");
};

/**
 * Get glow type from RPS range
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
