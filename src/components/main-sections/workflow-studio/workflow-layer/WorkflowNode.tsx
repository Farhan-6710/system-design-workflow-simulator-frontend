import React from "react";
import { Trash2 } from "lucide-react";
import { WorkflowNodeProps } from "@/types/workflow-studio";
import {
  getNodeClasses,
  getNodeTextClasses,
} from "@/utils/workflow-studio/workflow";
import { useNodeAnimation } from "@/hooks/workflow-studio/useWorkflowAnimation";
import { getIconComponent, getIconColor } from "./nodeUtils";
import "@/styles/workflowAnimations.css";
import { useWorkflowStore } from "@/stores/workflowStore";

export const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  node,
  isSelected,
  isDragging,
  handlers,
}) => {
  const { glowConfig, shouldGlow } = useNodeAnimation();
  const requestsPerSecond = useWorkflowStore(
    (state) => state.requestsPerSecond
  );

  // Get the glow class when node should glow
  const glowClassName =
    shouldGlow && requestsPerSecond > 0 ? glowConfig.className : "";

  // Get the icon component
  const IconComponent = getIconComponent(node.icon);

  // Get the icon color based on node label
  const iconColor = getIconColor(node.label);

  return (
    <div
      onMouseDown={(e) => handlers.onMouseDown(e, node.id)}
      onClick={(e) => {
        e.stopPropagation();
        handlers.onSelect(node.id);
      }}
      className={`workflow-node ${getNodeClasses(
        node.position,
        isSelected,
        isDragging
      )} ${glowClassName}`}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        transform: "translate(-50%, -50%)",
        zIndex: isSelected ? 50 : 10,
        width: "27.5px",
        height: "27.5px",
        minWidth: "27.5px",
        minHeight: "27.5px",
      }}
    >
      {/* Input port (for connections) - smaller */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => {
          e.stopPropagation();
          handlers.onEndConnection(e, node.id);
        }}
        className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full cursor-crosshair shadow-md hover:shadow-green-500/60 hover:scale-110 transition-all border border-white dark:border-slate-900"
        title="Drop connection here"
      />

      {/* Output port (for connections) - smaller */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          handlers.onStartConnection(e, node.id);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
        }}
        className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full cursor-crosshair shadow-md hover:shadow-blue-500/60 hover:scale-110 transition-all border border-white dark:border-slate-900"
        title="Drag to connect"
      />

      {/* Node content - compact with icon on top */}
      <div className="flex flex-col items-center justify-center h-full p-0.5">
        <IconComponent size={12} className={`${iconColor} mb-0.5`} />
        <p
          className={`text-[4px] font-medium text-center leading-tight ${getNodeTextClasses(
            node.position
          )}`}
        >
          {node.label}
        </p>
      </div>

      {/* Delete button - smaller */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlers.onDelete(node.id);
          }}
          className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 transition-all shadow-md hover:shadow-red-500/50 hover:scale-110"
          style={{ zIndex: 100 }}
        >
          <Trash2 size={6} />
        </button>
      )}
    </div>
  );
};
