"use client";

import { TooltipComponentProps } from "@/types/atoms/types";
import React from "react";

/**
 * A reusable tooltip component that wraps children with hover tooltip functionality.
 *
 * @example
 * ```tsx
 * <TooltipComponent tooltip="Save file" position="top">
 *   <button>💾</button>
 * </TooltipComponent>
 * ```
 */

const TooltipComponent: React.FC<TooltipComponentProps> = ({
  children,
  tooltip,
  position = "top",
  className = "",
}) => {
  // Get tooltip position classes
  const getTooltipClasses = () => {
    const baseClasses =
      "opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none absolute z-[99999999] bg-gray-100/95 bg-gray-100/95 dark:bg-gray-900/90 backdrop-blur-sm text-gray-800 text-gray-800 dark:text-white text-xs px-2 py-1 rounded font-medium whitespace-nowrap shadow-lg border border-slate-900/20 border-slate-900/20 dark:border-white/10";

    switch (position) {
      case "left":
        return `${baseClasses} right-full mr-2 top-1/2 -translate-y-1/2`;
      case "right":
        return `${baseClasses} left-full ml-2 top-1/2 -translate-y-1/2`;
      case "top":
        return `${baseClasses} bottom-full mb-2 left-1/2 -translate-x-1/2`;
      case "bottom":
        return `${baseClasses} top-full mt-2 left-1/2 -translate-x-1/2`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={`group relative ${className}`}>
      {children}
      {/* Tooltip - only render if tooltip text is provided */}
      {tooltip && <div className={getTooltipClasses()}>{tooltip}</div>}
    </div>
  );
};

export default TooltipComponent;
