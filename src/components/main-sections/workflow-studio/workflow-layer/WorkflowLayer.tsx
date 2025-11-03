import React, { forwardRef } from "react";
import { SvgDefinitions } from "./SvgDefinitions";
import { WorkflowNode } from "./WorkflowNode";
import { WorkflowEdge } from "./WorkflowEdge";
import { TempConnectionLine } from "./TempConnectionLine";
import { useWorkflowAnimation } from "@/hooks/workflow-studio/useWorkflowAnimation";
import { NodeHandlers, EdgeHandlers } from "@/types/workflow-studio/workflow";
import { useWorkflowStore } from "@/stores/workflowStore";
import { NODE_SIZE } from "@/constants/canvas";

interface WorkflowLayerProps {
  nodeHandlers: NodeHandlers;
  edgeHandlers: EdgeHandlers;
  runCode?: boolean;
}

export const WorkflowLayer = forwardRef<HTMLDivElement, WorkflowLayerProps>(
  ({ nodeHandlers, edgeHandlers }, ref) => {
    // Get data from stores directly
    const nodes = useWorkflowStore((state) => state.nodes);
    const edges = useWorkflowStore((state) => state.edges);
    const tempLine = useWorkflowStore((state) => state.tempLine);
    const selectedNode = useWorkflowStore((state) => state.selectedNode);
    const selectedEdge = useWorkflowStore((state) => state.selectedEdge);
    const draggingNode = useWorkflowStore((state) => state.draggingNode);
    const runCode = useWorkflowStore((state) => state.runCode);
    const { globalAnimationStyle } = useWorkflowAnimation();

    // Calculate dynamic bounds for the SVG based on node positions
    const calculateSVGBounds = () => {
      if (nodes.length === 0) {
        return { minX: -1000, minY: -1000, maxX: 1000, maxY: 1000 };
      }

      const padding = 500; // Extra padding around content

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      nodes.forEach((node) => {
        minX = Math.min(minX, node.x - NODE_SIZE / 2);
        minY = Math.min(minY, node.y - NODE_SIZE / 2);
        maxX = Math.max(maxX, node.x + NODE_SIZE / 2);
        maxY = Math.max(maxY, node.y + NODE_SIZE / 2);
      });

      return {
        minX: minX - padding,
        minY: minY - padding,
        maxX: maxX + padding,
        maxY: maxY + padding,
      };
    };

    const bounds = calculateSVGBounds();
    const svgWidth = bounds.maxX - bounds.minX;
    const svgHeight = bounds.maxY - bounds.minY;

    return (
      <div
        ref={ref}
        className="workflow-layer absolute inset-0 w-full h-full"
        style={{ ...globalAnimationStyle }}
      >
        {/* SVG for edges - transform handled by parent container */}
        <svg
          className="SVG-for-edges absolute"
          style={{
            left: `${bounds.minX}px`,
            top: `${bounds.minY}px`,
            width: `${svgWidth}px`,
            height: `${svgHeight}px`,
            zIndex: 5, // Below nodes (10) but above background
          }}
          viewBox={`${bounds.minX} ${bounds.minY} ${svgWidth} ${svgHeight}`}
        >
          <defs>
            <SvgDefinitions />
          </defs>
          <g>
            {/* Existing edges */}
            {edges.map((edge) => {
              const sourceNode = nodes.find((n) => n.id === edge.source);
              const targetNode = nodes.find((n) => n.id === edge.target);

              if (!sourceNode || !targetNode) return null;

              return (
                <WorkflowEdge
                  key={edge.id}
                  edge={edge}
                  sourceNode={sourceNode}
                  targetNode={targetNode}
                  handlers={edgeHandlers}
                  runCode={runCode}
                  isSelected={selectedEdge === edge.id}
                />
              );
            })}

            {/* Temporary connection line */}
            {tempLine && <TempConnectionLine />}
          </g>
        </svg>

        {/* Canvas content - transform handled by parent container */}
        <div className="absolute inset-0 w-full h-full">
          {/* Nodes */}
          {nodes.map((node) => (
            <WorkflowNode
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              isDragging={draggingNode === node.id}
              handlers={nodeHandlers}
            />
          ))}
        </div>
      </div>
    );
  }
);
WorkflowLayer.displayName = "WorkflowLayer";
