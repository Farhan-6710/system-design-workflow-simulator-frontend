/**
 * Canvas initialization hook
 * Handles canvas setup, initial state loading, and cleanup
 */

import { useEffect } from "react";
import { useAnnotationStore } from "@/stores/annotationStore";
import {
  initializeCanvas as initCanvas,
  updateCanvasMode,
  restoreCanvas,
  type FabricCanvas,
  type CanvasState,
} from "@/utils/workflow-studio/annotation-layer";

export interface UseCanvasInitializationProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fabricRef: React.RefObject<FabricCanvas | null>;
  initialJSON?: CanvasState | null;
}

export const useCanvasInitialization = ({
  canvasRef,
  fabricRef,
  initialJSON,
}: UseCanvasInitializationProps) => {
  const { activeTool, canvasState } = useAnnotationStore();

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = initCanvas(canvasRef.current);
    if (!canvas) return;

    fabricRef.current = canvas;

    // Load initial state if provided
    if (initialJSON) {
      restoreCanvas(canvas, initialJSON).catch(console.error);
    } else if (canvasState) {
      restoreCanvas(canvas, canvasState).catch(console.error);
    }

    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, [canvasRef, fabricRef, initialJSON, canvasState]);

  // Update canvas mode when tool changes
  useEffect(() => {
    if (fabricRef.current) {
      updateCanvasMode(fabricRef.current, activeTool);
    }
  }, [fabricRef, activeTool]);

  // Handle visibility changes and ensure state restoration
  useEffect(() => {
    if (fabricRef.current && canvasState) {
      restoreCanvas(fabricRef.current, canvasState).catch(console.error);
    }
  }, [fabricRef, canvasState]);

  return {
    initializeCanvas: () => {
      if (!canvasRef.current || fabricRef.current) return null;
      const canvas = initCanvas(canvasRef.current);
      if (canvas) {
        fabricRef.current = canvas;
      }
      return canvas;
    },
  };
};
