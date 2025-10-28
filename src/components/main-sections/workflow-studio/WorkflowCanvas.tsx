import React, { forwardRef } from "react";
import { WorkflowLayer } from "./workflow-layer/WorkflowLayer";
import { CanvasGrid } from "./CanvasGrid";
import {
  AnnotationLayer,
  type AnnotationLayerHandle,
} from "@/components/main-sections/workflow-studio/annotation-layer/AnnotationLayer";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useWorkflowCanvasEvents } from "@/hooks/useWorkflowCanvasEvents";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WorkflowCanvasProps {
  annotationLayerRef?: React.MutableRefObject<AnnotationLayerHandle | null>;
}

export const WorkflowCanvas = forwardRef<HTMLDivElement, WorkflowCanvasProps>(
  ({ annotationLayerRef }, ref) => {
    // Get data from stores directly
    const nodes = useWorkflowStore((state) => state.nodes);
    const edges = useWorkflowStore((state) => state.edges);
    const tempLine = useWorkflowStore((state) => state.tempLine);
    const selectedNode = useWorkflowStore((state) => state.selectedNode);
    const selectedEdge = useWorkflowStore((state) => state.selectedEdge);
    const draggingNode = useWorkflowStore((state) => state.draggingNode);
    const runCode = useWorkflowStore((state) => state.runCode);

    // Canvas controls
    const { getCanvasTransformStyle } = useCanvasControlsContext();

    // Use custom hook for event handling
    const {
      handleMouseDown,
      handleMouseMoveCanvas,
      handleMouseUpCanvas,
      handleWheelEvent,
      handleCanvasClick,
      handleAnnotationFinish,
      handleAnnotationLayerRef,
      nodeHandlers,
      edgeHandlers,
      activeTool,
    } = useWorkflowCanvasEvents({
      canvasRef: ref as React.RefObject<HTMLDivElement>,
      annotationLayerRef,
    });

    return (
      <motion.div
        ref={ref}
        data-canvas-area="true"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "canvas-container flex-1 relative overflow-hidden bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
          activeTool !== "select"
            ? "cursor-crosshair"
            : "cursor-grab active:cursor-grabbing"
        )}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        onWheel={handleWheelEvent}
      >
        {/* Fixed background grid */}
        <CanvasGrid />

        {/* Transform container - only workflow layer scales/moves */}
        <div
          className="flex justify-center items-center workflow-and-annotation-container absolute z-20 inset-0"
          style={getCanvasTransformStyle()}
        >
          {/* Workflow Layer - handles nodes, edges */}
          <WorkflowLayer
            nodes={nodes}
            edges={edges}
            tempLine={tempLine}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            draggingNode={draggingNode}
            nodeHandlers={nodeHandlers}
            edgeHandlers={edgeHandlers}
            runCode={runCode}
          />

          {/* Annotation Layer - uses Zustand store for clean state management */}
          <AnnotationLayer
            key="annotation-layer-stable"
            ref={handleAnnotationLayerRef}
            activeTool={activeTool}
            onFinish={handleAnnotationFinish}
            className={cn(
              "absolute inset-0 w-full h-full",
              activeTool === "select"
                ? "pointer-events-none"
                : "pointer-events-auto"
            )}
          />
        </div>
      </motion.div>
    );
  }
);

WorkflowCanvas.displayName = "WorkflowCanvas";
