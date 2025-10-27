import React from "react";
import { Plus } from "lucide-react";
import { WorkflowHeaderProps } from "@/types/workflow-studio";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/stores/workflowStore";

export const WorkflowHeader: React.FC<WorkflowHeaderProps> = () => {
  const setSelectedTab = useWorkflowStore((state) => state.setSelectedTab);
  const setSidebarRightExpanded = useWorkflowStore(
    (state) => state.setSidebarRightExpanded
  );

  const handleAddNode = () => {
    setSelectedTab("add-node");
    setSidebarRightExpanded(true);
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
        delay: 0.1,
      }}
      className="bg-gradient-to-r from-white to-gray-50 dark:from-slate-950 dark:to-slate-950 border-b border-gray-200 dark:border-slate-800 px-8 py-5 flex items-center justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
          System Design Canvas
        </h1>
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
          Drag nodes • Drag from output to create connections • Click to select
        </p>
      </div>
      <Button
        onClick={handleAddNode}
        size="lg"
        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/50 font-semibold"
      >
        <Plus size={20} />
        Add Node
      </Button>
    </motion.div>
  );
};
