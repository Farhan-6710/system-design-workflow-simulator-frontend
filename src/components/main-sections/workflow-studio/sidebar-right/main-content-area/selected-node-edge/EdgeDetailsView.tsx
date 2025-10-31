import React, { useState } from "react";
import { Node, Edge } from "@/types/workflow-studio/workflow";
import { useWorkflowStore } from "@/stores/workflowStore";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ConfirmationModal } from "@/components/atoms/ConfirmationModal";

interface EdgeDetailsViewProps {
  edge: Edge;
  sourceNode?: Node;
  targetNode?: Node;
  edgeNumber: number;
}

const EdgeDetailsView: React.FC<EdgeDetailsViewProps> = ({
  edge,
  sourceNode,
  targetNode,
  edgeNumber,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteEdge = useWorkflowStore((state) => state.deleteEdge);
  const setSelectedEdge = useWorkflowStore((state) => state.setSelectedEdge);

  const handleDeleteEdge = () => {
    deleteEdge(edge.id);
    setSelectedEdge(null); // Clear selection after deletion
    console.log("🗑️ Edge Deleted Successfully:", edge.id);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Edge Details
        </h3>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Edge Number:
          </span>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Edge {edgeNumber}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Edge ID:
          </span>
          <span className="text-xs text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">
            {edge.id}
          </span>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Connection:
            </span>
          </div>
          <div className="text-sm text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{sourceNode?.label}</span>
              <span className="text-slate-500">→</span>
              <span className="font-semibold">{targetNode?.label}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Node {edge.source} → Node {edge.target}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <Button
          onClick={handleDeleteClick}
          variant="destructive"
          size="sm"
          className="flex items-center gap-2 w-full"
        >
          <Trash2 size={16} />
          Delete Edge
        </Button>
      </div>

      <ConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Edge"
        description={`Are you sure you want to delete this edge? This will remove the connection between "${sourceNode?.label}" and "${targetNode?.label}".`}
        confirmText="Delete Edge"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteEdge}
      />
    </div>
  );
};

export default EdgeDetailsView;
