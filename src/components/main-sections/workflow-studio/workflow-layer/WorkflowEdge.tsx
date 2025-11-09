import { WorkflowEdgeProps } from "@/types/workflow-studio";
import { calculatePortToPortPath } from "@/utils/workflow-studio/workflow";
import { useEdgeAnimation } from "@/hooks/workflow-studio/useWorkflowAnimation";
import "@/styles/workflowAnimations.css";
import { useWorkflowStore } from "@/stores/workflowStore";

export const WorkflowEdge: React.FC<WorkflowEdgeProps> = ({
  edge,
  sourceNode,
  targetNode,
  handlers,
  runCode = false,
  isSelected = false,
}) => {
  const requestsPerSecond = useWorkflowStore(
    (state) => state.requestsPerSecond
  );

  const path = calculatePortToPortPath(
    sourceNode.x,
    sourceNode.y,
    targetNode.x,
    targetNode.y
  );

  const { edgeStyle, animationStyle } = useEdgeAnimation();

  // Handle edge click - same pattern as nodes
  const handleEdgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handlers.onSelect(edge.id);
  };

  return (
    <g
      style={animationStyle}
      className={`workflow-edge ${isSelected ? "selected" : ""}`}
    >
      {/* Selection indicator - wider stroke when selected */}
      {isSelected && (
        <path
          d={path}
          stroke="#3b82f6"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeOpacity="0.2"
          pointerEvents="none"
          filter="url(#edgeSelectionGlow)"
        />
      )}

      {/* Hover indicator - shows on hover, red when selected */}
      <path
        d={path}
        stroke={isSelected ? "#ef4444" : "#60a5fa"}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeOpacity="0"
        pointerEvents="none"
        className="workflow-edge-hover"
      />

      {/* Invisible wider stroke for easier clicking */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        onClick={handleEdgeClick}
        style={{
          cursor: "pointer",
        }}
        className={`workflow-edge-clickable ${
          isSelected ? "cursor-pointer" : ""
        }`}
      />

      {/* Background line */}
      <path
        d={path}
        stroke={
          isSelected
            ? "#3b82f6" // Blue when selected
            : runCode
            ? "var(--edge-bg-stroke)"
            : "#8851e0"
        }
        strokeWidth={isSelected ? "2" : "1.5"}
        fill="none"
        strokeLinecap="round"
        pointerEvents="none"
        className="workflow-edge-background"
      />

      {/* Animated flowing line - only render if runCode is true */}
      {runCode && requestsPerSecond > 0 && (
        <path
          d={path}
          className={edgeStyle.className}
          stroke={edgeStyle.gradient}
          strokeWidth="1.25"
          fill="none"
          strokeLinecap="round"
          pointerEvents="none"
        />
      )}
    </g>
  );
};
