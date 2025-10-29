"use client";

import { motion } from "framer-motion";
import { SidebarRightItem } from "@/types/workflow-studio/sidebar-right";
import TooltipComponent from "./TooltipComponent";
import { DockComponentProps } from "@/types/atoms/types";
import { useDockComponent } from "@/hooks/atoms/useDockComponent";
import {
  getItemTransform,
  getContainerClasses,
  getDockClasses,
  getTooltipPosition,
} from "@/utils/atoms/dockUtils";

// Map external dock item ids to internal activeItem identifiers
// Keeping this at module scope avoids re-allocating the object on every render & within each map iteration.
const TOOL_ID_MAP: Record<string, string> = {
  "selection-tool": "select",
  "rectangle-tool": "rectangle",
  "ellipse-tool": "circle",
  "free-draw": "freedraw",
};

const DockComponent: React.FC<DockComponentProps> = ({
  activeItem,
  position = "top",
  collapsible = false,
  direction = "horizontal",
  tooltipPosition = "bottom",
  items,
  onItemClick,
  onMouseEnter,
  onMouseLeave,
  className = "",
  idMapping = {},
}) => {
  const {
    hoverIndex,
    isDockVisible,
    currentPosition,
    handleMouseEnter,
    handleMouseLeave,
    handleParentMouseEnter,
    handleParentMouseLeave,
    handleItemClick,
  } = useDockComponent(
    position,
    collapsible,
    onItemClick,
    onMouseEnter,
    onMouseLeave
  );

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -20,
      }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: 0.2 }}
      className={`${getContainerClasses(
        currentPosition
      )} dock-navigation ${className}`}
      onMouseEnter={handleParentMouseEnter}
      onMouseLeave={handleParentMouseLeave}
    >
      <motion.div
        className={getDockClasses(direction, currentPosition)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isDockVisible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {items.map((item: SidebarRightItem, index: number) => {
          // Determine if current item matches active tool
          const mappingToUse = idMapping || TOOL_ID_MAP;
          const isActive =
            (!!activeItem && mappingToUse[item.id] === activeItem) ||
            item.id === activeItem;
          return (
            <TooltipComponent
              key={item.id}
              tooltip={item.tooltip}
              position={getTooltipPosition(tooltipPosition, currentPosition)}
            >
              <motion.div
                className={
                  "relative flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer " +
                  (isActive
                    ? "bg-primary dark:bg-primary border-purple-700 dark:border-primary shadow-lg !text-white dark:text-slate-900"
                    : "bg-white/30 dark:bg-white/10 backdrop-blur-sm border border-slate-900/20 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/20 hover:border-slate-900/30 dark:hover:border-white/30 text-slate-700 dark:text-white")
                }
                animate={getItemTransform(index, hoverIndex, currentPosition)}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleItemClick(item.id, index)}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {item.component}
                </div>
              </motion.div>
            </TooltipComponent>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default DockComponent;
