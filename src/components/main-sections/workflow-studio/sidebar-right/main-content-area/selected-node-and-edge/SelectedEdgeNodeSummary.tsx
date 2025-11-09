import React from "react";
import { useWorkflowStore } from "@/stores/workflowStore";
import {
  getSelectedEdgeDetails,
  getSelectedNodeDetails,
} from "@/utils/workflow-studio/workflow-layer/workflowCoreUtils";
import NoSelectionView from "./NoSelectionView";
import EdgeDetailsView from "./EdgeDetailsView";
import NodeDetailsView from "./NodeDetailsView";
import DebugView from "./DebugView";

const SelectedEdgeNodeSummary: React.FC = () => {
  const selectedEdge = useWorkflowStore((state) => state.selectedEdge);
  const selectedNode = useWorkflowStore((state) => state.selectedNode);
  const edges = useWorkflowStore((state) => state.edges);
  const nodes = useWorkflowStore((state) => state.nodes);

  // Use utility functions to get details
  const edgeDetails = getSelectedEdgeDetails(selectedEdge, edges, nodes);
  const nodeDetails = getSelectedNodeDetails(selectedNode, nodes);

  // If no selection, show default message
  if (!selectedEdge && !selectedNode) {
    return <NoSelectionView />;
  }

  // Show edge details
  if (selectedEdge && edgeDetails) {
    return (
      <EdgeDetailsView
        edge={edgeDetails.edge}
        sourceNode={edgeDetails.sourceNode}
        targetNode={edgeDetails.targetNode}
      />
    );
  }

  // Show node details
  if (selectedNode && nodeDetails) {
    return <NodeDetailsView node={nodeDetails} />;
  }

  // Fallback debug render
  return (
    <DebugView
      selectedEdge={selectedEdge}
      selectedNode={selectedNode}
      edgeDetails={edgeDetails}
      nodeDetails={nodeDetails || null}
    />
  );
};

export default SelectedEdgeNodeSummary;
