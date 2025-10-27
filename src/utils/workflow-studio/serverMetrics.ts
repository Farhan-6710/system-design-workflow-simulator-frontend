/**
 * Server metrics utilities - UI display only
 *
 * Note: Animation/glow logic moved to animationUtils.ts for better organization
 */

import {
  MAX_SERVER_CAPACITY,
  WARNING_THRESHOLD,
  CRITICAL_THRESHOLD,
} from "./animationUtils";

/**
 * Calculate server load percentage (0-100)
 */
export function calculateServerLoad(rps: number): number {
  return Math.round((rps / MAX_SERVER_CAPACITY) * 100);
}

/**
 * Get server status info for UI display (uses shared thresholds)
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
 * Get load color classes for UI display (uses shared thresholds)
 */
export function getLoadColor(serverLoad: number): string {
  const criticalPercentage = CRITICAL_THRESHOLD * 100; // 80%
  const warningPercentage = WARNING_THRESHOLD * 100; // 50%

  if (serverLoad >= criticalPercentage) return "text-red-500 bg-red-100";
  if (serverLoad >= warningPercentage) return "text-yellow-500 bg-yellow-100";
  return "text-green-500 bg-green-100";
}

/**
 * Get RPS color classes for UI display (uses shared thresholds)
 */
export function getRPSColor(rps: number): string {
  const serverLoad = calculateServerLoad(rps);
  const criticalPercentage = CRITICAL_THRESHOLD * 100; // 80%
  const warningPercentage = WARNING_THRESHOLD * 100; // 50%

  if (serverLoad >= criticalPercentage) return "text-red-500";
  if (serverLoad >= warningPercentage) return "text-yellow-500";
  return "text-blue-500";
}
