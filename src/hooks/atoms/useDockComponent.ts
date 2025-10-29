import { useState, useEffect } from "react";

/**
 * Custom hook for managing DockComponent state and handlers
 */
export const useDockComponent = (
  position: "top" | "bottom" | "left" | "right" | "top-left" | undefined,
  collapsible: boolean,
  direction?: "horizontal" | "vertical",
  onItemClick?: (itemId: string, index: number) => void,
  onMouseEnter?: (index: number) => void,
  onMouseLeave?: () => void
) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isDockVisible, setDockVisible] = useState(!collapsible);
  const [currentPosition, setCurrentPosition] = useState(position);

  // Update position when prop changes
  useEffect(() => {
    setCurrentPosition(position);
  }, [position, collapsible]);

  // Mouse handlers for individual items
  const handleMouseEnter = (index: number) => {
    setHoverIndex(index);
    onMouseEnter?.(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    onMouseLeave?.();
  };

  // Mouse handlers for dock container (collapsible behavior)
  const handleParentMouseEnter = () => {
    if (collapsible) {
      setDockVisible(true);
    }
  };

  const handleParentMouseLeave = () => {
    if (collapsible) {
      setDockVisible(false);
    }
  };

  // Item click handler
  const handleItemClick = (itemId: string, index: number) => {
    onItemClick?.(itemId, index);
  };

  return {
    hoverIndex,
    isDockVisible,
    currentPosition,
    handleMouseEnter,
    handleMouseLeave,
    handleParentMouseEnter,
    handleParentMouseLeave,
    handleItemClick,
  };
};
