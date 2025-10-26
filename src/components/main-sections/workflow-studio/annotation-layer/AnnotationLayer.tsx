/**
 * AnnotationLayer - Clean replacement for the complex annotation-layer folder
 * Provides the same API as the original but with simplified, Zustand-based implementation
 */

"use client";

import React, { forwardRef } from "react";
import { useAnnotationStore } from "@/stores/annotationStore";
import {
  AnnotationCanvas,
  type AnnotationCanvasHandle,
  type CanvasState,
} from "./AnnotationCanvas";

export interface AnnotationLayerProps {
  /** Currently active tool, controlled by parent */
  activeTool?: Tool;
  /** Called when a drawing operation completes */
  onFinish?: () => void;
  /** Called when export operation is triggered */
  onExport?: (dataUrl: string) => void;
  /** Optional initial state to load */
  initialJSON?: CanvasState | null;
  /** Additional CSS classes */
  className?: string;
  /** Container styles */
  style?: React.CSSProperties;
}

export interface AnnotationLayerHandle {
  /** Returns current canvas state as JSON */
  snapshot(): CanvasState | null;
  /** Loads canvas state from JSON */
  load(json: CanvasState | null): Promise<void>;
  /** Exports canvas as PNG data URL */
  exportPNG(): string;
  /** Exports canvas as SVG string */
  exportSVG(): string;
  /** Clears all annotations */
  clear(): void;
  /** Undoes last action */
  undo(): void;
  /** Redoes last undone action */
  redo(): void;
  /** Gets canvas instance for advanced operations */
  getCanvas(): unknown;
  /** Exports entire history stack for persistence */
  exportHistory(): { history: CanvasState[]; currentIndex: number } | null;
  /** Imports entire history stack from persistence */
  importHistory(
    data: { history: CanvasState[]; currentIndex: number } | null
  ): void;
}

export type Tool =
  | "select"
  | "rectangle"
  | "circle"
  | "freedraw"
  | "arrow"
  | "line"
  | "text";

/**
 * Clean AnnotationLayer component that maintains the same API as the original
 * but uses the simplified Zustand + Fabric.js architecture
 */
export const AnnotationLayer = forwardRef<
  AnnotationLayerHandle,
  AnnotationLayerProps
>(({ activeTool, onFinish, onExport, initialJSON, className, style }, ref) => {
  const {
    history,
    historyIndex,
    selectTool,
    clearHistory,
    setCanvasState,
    canvasState,
  } = useAnnotationStore();
  const canvasRef = React.useRef<AnnotationCanvasHandle>(null);

  // Sync external activeTool prop with store and auto-show layer
  React.useEffect(() => {
    if (activeTool !== undefined) {
      selectTool(activeTool); // This will auto-show/hide the layer
    }
  }, [activeTool, selectTool]);

  // Expose the same API as the original AnnotationLayer
  React.useImperativeHandle(
    ref,
    () => ({
      snapshot: () => canvasRef.current?.snapshot() || null,
      load: async (json: CanvasState | null) => {
        if (json) {
          await canvasRef.current?.load(json);
          setCanvasState(json);
        }
      },
      exportPNG: () => {
        const result = canvasRef.current?.exportPNG() || "";
        if (result && onExport) {
          onExport(result);
        }
        return result;
      },
      exportSVG: () => canvasRef.current?.exportSVG() || "",
      clear: () => {
        canvasRef.current?.clear();
        clearHistory();
      },
      undo: () => canvasRef.current?.undo(),
      redo: () => canvasRef.current?.redo(),
      getCanvas: () => canvasRef.current?.getCanvas(),
      exportHistory: () => {
        return {
          history: history,
          currentIndex: historyIndex,
        };
      },
      importHistory: (
        data: { history: CanvasState[]; currentIndex: number } | null
      ) => {
        if (data && data.history.length > 0) {
          // Import history into store and restore current state
          const currentState =
            data.currentIndex >= 0 && data.currentIndex < data.history.length
              ? data.history[data.currentIndex]
              : null;

          if (currentState) {
            canvasRef.current?.load(currentState);
            setCanvasState(currentState);
          }
        }
      },
    }),
    [history, historyIndex, onExport, clearHistory, setCanvasState]
  );

  return (
    <AnnotationCanvas
      ref={canvasRef}
      className={className}
      style={style}
      onFinish={onFinish}
      initialJSON={initialJSON || canvasState}
    />
  );
});

AnnotationLayer.displayName = "AnnotationLayer";

export default AnnotationLayer;

// Re-export types for backward compatibility
export type {
  CanvasState,
  AnnotationLayerProps as AnnotationLayerPropsLegacy,
  AnnotationLayerHandle as AnnotationLayerHandleLegacy,
};
