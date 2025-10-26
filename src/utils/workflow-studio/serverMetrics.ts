/**
 * Server metrics calculation utilities
 */

const MAX_RPS = 50000;
const CRITICAL_THRESHOLD = 0.8; // 80%
const WARNING_THRESHOLD = 0.6; // 60%

/**
 * Calculate server load percentage based on current RPS
 * @param currentRPS - Current requests per second
 * @param maxRPS - Maximum RPS capacity (default: 50000)
 * @returns Load percentage (0-100)
 */
export const calculateServerLoad = (
  currentRPS: number,
  maxRPS: number = MAX_RPS
): number => {
  return Math.min(100, Math.round((currentRPS / maxRPS) * 100));
};

/**
 * Get server status based on load percentage
 * @param loadPercentage - Server load percentage
 * @returns Status string and color class
 */
export const getServerStatus = (loadPercentage: number) => {
  if (loadPercentage >= CRITICAL_THRESHOLD * 100) {
    return {
      status: "Overload",
      statusClass: "text-red-500 dark:text-red-400",
      iconClass: "text-red-500",
    };
  } else if (loadPercentage >= WARNING_THRESHOLD * 100) {
    return {
      status: "High Load",
      statusClass: "text-yellow-500 dark:text-yellow-400",
      iconClass: "text-yellow-500",
    };
  } else {
    return {
      status: "Normal",
      statusClass: "text-green-500 dark:text-green-400",
      iconClass: "text-green-500",
    };
  }
};

/**
 * Get load indicator color based on percentage
 * @param loadPercentage - Server load percentage
 * @returns CSS color classes
 */
export const getLoadColor = (loadPercentage: number) => {
  if (loadPercentage >= CRITICAL_THRESHOLD * 100) {
    return "text-red-500 bg-red-50 dark:bg-red-900/20";
  } else if (loadPercentage >= WARNING_THRESHOLD * 100) {
    return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
  } else {
    return "text-green-500 bg-green-50 dark:bg-green-900/20";
  }
};

/**
 * Get RPS indicator color based on value
 * @param rps - Requests per second
 * @returns CSS color classes
 */
export const getRPSColor = (rps: number) => {
  if (rps <= 500) {
    return "text-blue-500";
  } else if (rps <= 5000) {
    return "text-yellow-500";
  } else {
    return "text-red-500";
  }
};
