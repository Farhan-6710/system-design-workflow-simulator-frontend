import React from "react";
import { useWorkflowStore } from "@/stores/workflowStore";
import { getEdgeNumber } from "@/utils/workflow-studio/workflow";
import NoSelectionView from "./NoSelectionView";
import EdgeDetailsView from "./EdgeDetailsView";
import NodeDetailsView from "./NodeDetailsView";
import DebugView from "./DebugView";

const SelectedEdgeNodeSummary: React.FC = () => {
  const selectedEdge = useWorkflowStore((state) => state.selectedEdge);
  const selectedNode = useWorkflowStore((state) => state.selectedNode);
  const edges = useWorkflowStore((state) => state.edges);
  const nodes = useWorkflowStore((state) => state.nodes);

  // Get selected edge details
  const getSelectedEdgeDetails = () => {
    if (!selectedEdge) return null;

    const edge = edges.find((e) => e.id === selectedEdge);
    if (!edge) return null;

    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    const edgeNumber = getEdgeNumber(edge.id);

    return {
      edge,
      sourceNode,
      targetNode,
      edgeNumber,
    };
  };

  // Get selected node details
  const getSelectedNodeDetails = () => {
    if (!selectedNode) return null;
    return nodes.find((n) => n.id === selectedNode);
  };

  const edgeDetails = getSelectedEdgeDetails();
  const nodeDetails = getSelectedNodeDetails();

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
        edgeNumber={edgeDetails.edgeNumber}
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
