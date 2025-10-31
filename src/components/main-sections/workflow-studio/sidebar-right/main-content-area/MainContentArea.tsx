import React from "react";
import { motion } from "framer-motion";
import AddNodeContent from "./AddNodeContent";
import EditNodeContent from "./EditNodeContent";
import CollapsedState from "../CollapsedState";
import { MainContentAreaProps } from "@/types/workflow-studio/sidebar-right";
import SelectedEdgeNodeSummary from "./selected-node-edge/SelectedEdgeNodeSummary";
import AiAssistantContent from "./AiAssistantContent";
import NotFoundContent from "./NotFoundContent";

const MainContentArea: React.FC<MainContentAreaProps> = ({
  sidebarExpanded,
  selectedTab,
  nodes,
  onAddNode,
  onUpdateNode,
  onTabChange,
}) => {
  const getSelectedTabContent = () => {
    if (!selectedTab) {
      return null; // No content when no tab is selected
    }

    switch (selectedTab) {
      case "add-node":
        return <AddNodeContent onAddNode={onAddNode} />;

      case "edit-node":
        return <EditNodeContent nodes={nodes} onUpdateNode={onUpdateNode} />;

      case "selected-edge/node":
        return <SelectedEdgeNodeSummary />;

      case "ai-assistant":
        return <AiAssistantContent />;

      default:
        // Fallback for unknown tabs
        return <NotFoundContent selectedTab={selectedTab} />;
    }
  };

  return (
    <div className="flex-1 p-4 relative overflow-hidden">
      {/* Collapsed State */}
      {!sidebarExpanded && <CollapsedState onTabChange={onTabChange} />}

      {/* Expanded Content */}
      {sidebarExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.3,
            duration: 0.25,
            ease: "easeOut",
          }}
          className={`space-y-4 h-full ${
            selectedTab === "ai-assistant" ? "" : "overflow-y-auto"
          }`}
        >
          {/* Selected Tab Content */}
          <div
            className={`bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600 min-h-0 ${
              selectedTab === "ai-assistant" ? "flex flex-col h-full" : ""
            }`}
          >
            {getSelectedTabContent()}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MainContentArea;
