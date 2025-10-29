/**
 * Utility functions for DockComponent styling and positioning
 */

export type DockPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | undefined;
export type TooltipPosition = "left" | "right" | "top" | "bottom";

/**
 * Calculate item transform animations based on hover state and dock position
 */
export const getItemTransform = (
  index: number,
  hoverIndex: number | null,
  currentPosition: DockPosition
) => {
  // Disable transform animations when no position is specified (in document flow)
  if (!currentPosition) {
    return hoverIndex === index
      ? { scale: 1.1, x: 0, y: 0 }
      : { scale: 1, x: 0, y: 0 };
  }

  if (hoverIndex === index) {
    switch (currentPosition) {
      case "left":
        return { scale: 1.2, x: 3, y: 0 };
      case "right":
        return { scale: 1.2, x: -3, y: 0 };
      case "top":
        return { scale: 1.2, x: 0, y: 3 };
      case "bottom":
        return { scale: 1.2, x: 0, y: -3 };
      case "top-left":
        return { scale: 1.2, x: 3, y: 3 }; // Move slightly right and down from corner
      default:
        return { scale: 1.2, x: 0, y: 0 };
    }
  } else if (hoverIndex !== null && Math.abs(hoverIndex - index) === 1) {
    return { scale: 1.12, x: 0, y: 0 };
  } else {
    return { scale: 1, x: 0, y: 0 };
  }
};

/**
 * Get CSS classes for the dock container positioning
 */
export const getContainerClasses = (currentPosition: DockPosition) => {
  // If no position is defined, use relative positioning (flow with document)
  if (!currentPosition) {
    return "relative z-20";
  }

  const baseClasses = "absolute z-20";
  switch (currentPosition) {
    case "left":
      return `${baseClasses} left-4 top-1/2 -translate-y-1/2`;
    case "right":
      return `${baseClasses} right-4 top-1/2 -translate-y-1/2`;
    case "top":
      return `${baseClasses} top-4 left-1/2 -translate-x-1/2`;
    case "bottom":
      return `${baseClasses} bottom-4 left-1/2 -translate-x-1/2`;
    case "top-left":
      return `${baseClasses} top-4 left-4`;
    default:
      return baseClasses;
  }
};

/**
 * Get CSS classes for the dock layout and styling
 */
export const getDockClasses = (
  direction: "horizontal" | "vertical" | undefined,
  currentPosition: DockPosition
) => {
  const baseClasses =
    "flex items-center justify-center p-2 gap-[6px] bg-white/20 bg-white/20 dark:bg-slate-900/10 backdrop-blur-md border border-slate-900/5 border-slate-900/20 dark:border-white/10 rounded-xl shadow-l dark:shadow-2xl";

  // Determine layout direction
  let layoutClass;
  if (direction) {
    // Use explicit direction prop if provided
    layoutClass = direction === "vertical" ? "flex-col" : "flex-row";
  } else {
    // Fall back to position-based logic
    layoutClass =
      currentPosition === "left" ||
      currentPosition === "right" ||
      currentPosition === "top-left"
        ? "flex-col"
        : "flex-row"; // Default to flex-row when no position or horizontal positions
  }

  return `${baseClasses} ${layoutClass}`;
};

/**
 * Determine tooltip position based on dock position and explicit tooltip position
 */
export const getTooltipPosition = (
  tooltipPosition: TooltipPosition | undefined,
  currentPosition: DockPosition
): TooltipPosition => {
  // Use explicit tooltipPosition if provided
  if (tooltipPosition) {
    return tooltipPosition;
  }

  // Fall back to position-based logic when no explicit tooltipPosition
  if (!currentPosition) {
    return "top";
  }

  switch (currentPosition) {
    case "left":
    case "top-left":
      return "right";
    case "right":
      return "left";
    case "top":
      return "bottom";
    case "bottom":
      return "top";
    default:
      return "top";
  }
};
