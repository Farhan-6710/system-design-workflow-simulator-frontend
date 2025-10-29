import React from "react";
import { motion } from "framer-motion";
import { sidebarRightItems } from "@/data/sidebarRightItems";
import { NavigationDockProps } from "@/types/workflow-studio/sidebar-right";
import DockComponent from "../../../atoms/DockComponent";

const NavigationDock: React.FC<NavigationDockProps> = ({
  sidebarExpanded,
  selectedTab,
  onTabChange,
}) => {
  if (!sidebarExpanded) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-4 overflow-hidden"
    >
      <DockComponent
        position="top"
        collapsible={false}
        items={sidebarRightItems}
        onItemClick={onTabChange}
        activeItem={selectedTab}
        className="relative"
      />
    </motion.div>
  );
};

export default NavigationDock;
