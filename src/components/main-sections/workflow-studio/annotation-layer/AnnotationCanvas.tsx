


/**
 * Refactored AnnotationCanvas component using modular hooks
 * Clean, maintainable, and well-organized canvas component
 */

"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useAnnotationCanvas } from "@/hooks/workflow-studio/annotation-layer/useAnnotationCanvas";
import type { 
  CanvasState as CanvasStateType, 
  FabricCanvas 
} from "@/utils/workflow-studio/annotation-layer";

export interface AnnotationCanvasHandle {
  snapshot: () => CanvasStateType | null;
  load: (json: CanvasStateType | null) => Promise<void>;
  exportPNG: () => string;
  exportSVG: () => string;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  getCanvas: () => FabricCanvas | null;
}

// Keep local interface for backward compatibility
export interface CanvasState {
  version: string;
  objects: Record<string, unknown>[];
}

interface AnnotationCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  onFinish?: () => void;
  initialJSON?: CanvasStateType | null;
}

export const AnnotationCanvas = forwardRef<
  AnnotationCanvasHandle,
  AnnotationCanvasProps
>(({ className = "", style, onFinish, initialJSON }, ref) => {
  // Get fullscreen state from workflow store
  const isFullScreen = useWorkflowStore((state) => state.isFullScreen);

  // Use the main annotation canvas hook
  const {
    canvasRef,
    containerRef,
    handleUndo,
    handleRedo,
    snapshot,
    load,
    exportPNG,
    exportSVG,
    clear,
    getCanvas,
  } = useAnnotationCanvas({
    onFinish,
    initialJSON,
  });

  // Imperative handle for external access
  useImperativeHandle(
    ref,
    () => ({
      snapshot,
      load,
      exportPNG,
      exportSVG,
      clear,
      undo: handleUndo,
      redo: handleRedo,
      getCanvas,
    }),
    [handleUndo, handleRedo, snapshot, load, exportPNG, exportSVG, clear, getCanvas]
  );

  return (
    <div
      ref={containerRef}
      className={`annotation-canvas-container absolute inset-0 w-full h-full overflow-hidden ${
        isFullScreen ? "z-50" : "z-20"
      } ${className}`}
      style={style}
      tabIndex={0}
      role="application"
      aria-label="Drawing canvas"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
});

AnnotationCanvas.displayName = "AnnotationCanvas";

export default AnnotationCanvas;