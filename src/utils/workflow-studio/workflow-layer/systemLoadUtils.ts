/**
 * System Load Utilities
 * Server load calculations and UI styling based on RPS
 */

import {
  MAX_SERVER_CAPACITY,
  WARNING_THRESHOLD,
  CRITICAL_THRESHOLD,
} from "@/constants/canvas";
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

export type LoadLevel = "BLUE" | "YELLOW" | "RED";

export function calculateServerLoad(rps: number): number {
  return Math.round((rps / MAX_SERVER_CAPACITY) * 100);
}

export function getLoadLevel(rps: number): LoadLevel {
  const loadPercentage = rps / MAX_SERVER_CAPACITY;
  if (loadPercentage >= CRITICAL_THRESHOLD) return "RED";
  if (loadPercentage >= WARNING_THRESHOLD) return "YELLOW";
  return "BLUE";
}

export function getServerStatus(serverLoad: number) {
  const criticalPercentage = CRITICAL_THRESHOLD * 100;
  const warningPercentage = WARNING_THRESHOLD * 100;

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

export function getLoadColor(serverLoad: number): string {
  const criticalPercentage = CRITICAL_THRESHOLD * 100;
  const warningPercentage = WARNING_THRESHOLD * 100;

  if (serverLoad >= criticalPercentage) return "text-red-500 bg-red-100";
  if (serverLoad >= warningPercentage) return "text-yellow-500 bg-yellow-100";
  return "text-green-500 bg-green-100";
}

export function getRPSColor(rps: number): string {
  const serverLoad = calculateServerLoad(rps);
  const criticalPercentage = CRITICAL_THRESHOLD * 100;
  const warningPercentage = WARNING_THRESHOLD * 100;

  if (serverLoad >= criticalPercentage) return "text-red-500";
  if (serverLoad >= warningPercentage) return "text-yellow-500";
  return "text-blue-500";
}

export const calculateAnimationDuration = (
  requestsPerSecond: RPSValue
): AnimationDuration => {
  const minDuration = 0.067;
  const maxDuration = 0.666;
  const logMin = Math.log(1);
  const logMax = Math.log(50000);
  const logRPS = Math.log(Math.max(1, requestsPerSecond));

  const normalizedLog = (logRPS - logMin) / (logMax - logMin);
  return Math.max(
    0.05,
    maxDuration - normalizedLog * (maxDuration - minDuration)
  );
};

export const getRPSRange = (requestsPerSecond: RPSValue): RPSRange => {
  const loadLevel = getLoadLevel(requestsPerSecond);

  switch (loadLevel) {
    case "RED":
      return RPSRange.HIGH;
    case "YELLOW":
      return RPSRange.MEDIUM;
    case "BLUE":
    default:
      return RPSRange.LOW;
  }
};

export const getAnimationSpeed = (rpsRange: RPSRange): number => {
  switch (rpsRange) {
    case RPSRange.LOW:
      return 1.0;
    case RPSRange.MEDIUM:
      return 1.33;
    case RPSRange.HIGH:
      return 2.0;
    default:
      return 1.0;
  }
};

export const getEdgeStyle = (rps: number): EdgeStyle => {
  const loadLevel = getLoadLevel(rps);

  switch (loadLevel) {
    case "RED":
      return {
        gradient: EdgeGradientType.RED,
        className: "animated-edge-red" as EdgeAnimationClass,
      };
    case "YELLOW":
      return {
        gradient: EdgeGradientType.YELLOW,
        className: "animated-edge-yellow" as EdgeAnimationClass,
      };
    case "BLUE":
    default:
      return {
        gradient: EdgeGradientType.BLUE,
        className: "animated-edge" as EdgeAnimationClass,
      };
  }
};

export const getEdgeStyleByRPS = (
  requestsPerSecond: number
): { gradient: string; className: string } => {
  const loadLevel = getLoadLevel(requestsPerSecond);

  switch (loadLevel) {
    case "RED":
      return {
        gradient: "url(#flowGradientRed)",
        className: "animated-edge-red",
      };
    case "YELLOW":
      return {
        gradient: "url(#flowGradientYellow)",
        className: "animated-edge-yellow",
      };
    case "BLUE":
    default:
      return {
        gradient: "url(#flowGradient)",
        className: "animated-edge",
      };
  }
};

export const getNodeGlowClass = (rps: number): string => {
  const loadLevel = getLoadLevel(rps);

  switch (loadLevel) {
    case "RED":
      return "node-glow-red";
    case "YELLOW":
      return "node-glow-yellow";
    case "BLUE":
    default:
      return "node-glow-blue";
  }
};

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
