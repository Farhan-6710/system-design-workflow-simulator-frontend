import React from "react";
import { Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Node } from "@/types/workflow-studio/workflow";

interface NodeDetailsHeaderProps {
  node: Node;
  onEditClick: () => void;
}

const NodeDetailsHeader: React.FC<NodeDetailsHeaderProps> = ({
  node,
  onEditClick,
}) => {
  console.log("📝 Rendering NodeDetailsHeader for Node ID:", node);
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Node Details
        </h3>
        <Button
          onClick={onEditClick}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          Edit Node
        </Button>
      </div>

      {/* Node Selection Info */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Selected Node:
          </span>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {node.label}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Node ID:
          </span>
          <span className="text-xs text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">
            {node.id}
          </span>
        </div>
      </div>
    </>
  );
};

export default NodeDetailsHeader;