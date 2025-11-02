import React, { forwardRef } from "react";
import { WorkflowLayer } from "./workflow-layer/WorkflowLayer";
import { CanvasGrid } from "./CanvasGrid";
import {
  AnnotationLayer,
  type AnnotationLayerHandle,
} from "@/components/main-sections/workflow-studio/annotation-layer/AnnotationLayer";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";
import { useCanvasEventHandlers } from "@/hooks/workflow-studio/useCanvasEventHandlers";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WorkflowCanvasProps {
  annotationLayerRef?: React.MutableRefObject<AnnotationLayerHandle | null>;
}

export const WorkflowCanvas = forwardRef<HTMLDivElement, WorkflowCanvasProps>(
  ({ annotationLayerRef }, ref) => {
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
    } = useCanvasEventHandlers({
      canvasRef: ref as React.RefObject<HTMLDivElement>,
      annotationLayerRef,
    });

    return (
      <motion.div
        ref={ref}
        data-canvas-area="true" // Defines pan boundaries - content cannot be dragged outside this area
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "canvas-container w-full h-full flex-1 relative overflow-hidden bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
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
            nodeHandlers={nodeHandlers}
            edgeHandlers={edgeHandlers}
          />

          {/* Annotation Layer - uses Zustand store for clean state management */}
          <AnnotationLayer
            key="annotation-layer-stable"
            ref={handleAnnotationLayerRef}
            onFinish={handleAnnotationFinish}
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </motion.div>
    );
  }
);

WorkflowCanvas.displayName = "WorkflowCanvas";
