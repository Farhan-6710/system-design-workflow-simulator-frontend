import {
  RPSValue,
  RPSRange,
  AnimationDuration,
} from "@/types/workflow-studio/workflow";

/**
 * Animation utility functions
 */

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
 * Get RPS range from numeric value
 */
export const getRPSRange = (requestsPerSecond: RPSValue): RPSRange => {
  if (requestsPerSecond <= 500) return RPSRange.LOW;
  if (requestsPerSecond <= 5000) return RPSRange.MEDIUM;
  return RPSRange.HIGH;
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
