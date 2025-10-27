import React from "react";
import { Node, Edge } from "@/types/workflow-studio/workflow";

interface EdgeDetails {
  edge: Edge;
  sourceNode?: Node;
  targetNode?: Node;
  edgeNumber: number;
}

interface DebugViewProps {
  selectedEdge: string | null;
  selectedNode: number | null;
  edgeDetails: EdgeDetails | null;
  nodeDetails: Node | null | undefined;
}

const DebugView: React.FC<DebugViewProps> = ({
  selectedEdge,
  selectedNode,
  edgeDetails,
  nodeDetails,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
        Debug Info
      </h3>
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-600 dark:text-red-400">
          selectedEdge: {selectedEdge || "null"}
        </p>
        <p className="text-sm text-red-600 dark:text-red-400">
          selectedNode: {selectedNode || "null"}
        </p>
        <p className="text-sm text-red-600 dark:text-red-400">
          edgeDetails: {edgeDetails ? "found" : "null"}
        </p>
        <p className="text-sm text-red-600 dark:text-red-400">
          nodeDetails: {nodeDetails ? "found" : "null"}
        </p>
      </div>
    </div>
  );
};

export default DebugView;