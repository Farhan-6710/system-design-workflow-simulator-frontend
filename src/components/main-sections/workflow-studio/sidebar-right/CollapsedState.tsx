import React from "react";
import { motion } from "framer-motion";
import { sidebarRightItems } from "@/constants/sidebarRightItems";
import { CollapsedStateProps } from "@/types/workflow-studio/sidebar-right";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const CollapsedState: React.FC<CollapsedStateProps> = ({ onTabChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center space-y-2 py-4 overflow-hidden"
    >
      {/* Vertical Navigation with Tooltips */}
      {sidebarRightItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.2,
            delay: index * 0.05,
            ease: "easeOut",
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-12 h-12 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => onTabChange(item.id)}
                aria-label={item.tooltip}
              >
                {item.component}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={8}>
              {item.tooltip}
            </TooltipContent>
          </Tooltip>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default CollapsedState;
