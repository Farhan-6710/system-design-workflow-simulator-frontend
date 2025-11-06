/**
 * Main annotation canvas hook that orchestrates all canvas functionality
 * This is the primary hook used by AnnotationCanvas component
 */

import { useRef, useCallback } from "react";
import { useAnnotationStore } from "@/stores/annotationStore";
import { useCanvasInitialization } from "./useCanvasInitialization";
import { useCanvasEvents } from "./useCanvasEvents";
import { useCanvasKeyboardShortcuts } from "./useCanvasKeyboardShortcuts";
import { useCanvasHistory } from "./useCanvasHistory";
import { useCanvasTheme } from "./useCanvasTheme";
import { useCanvasResize } from "./useCanvasResize";
import type {
  FabricCanvas,
  FabricObject,
  Point,
  CanvasState,
} from "@/utils/workflow-studio/annotation-layer";

export interface UseAnnotationCanvasProps {
  onFinish?: () => void;
  initialJSON?: CanvasState | null;
}

export interface UseAnnotationCanvasReturn {
  // Refs
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  fabricRef: React.RefObject<FabricCanvas | null>;

  // Drawing state
  drawingRef: React.RefObject<{
    isDrawing: boolean;
    startPoint: Point | null;
    currentShape: FabricObject | null;
  }>;

  // Actions
  handleUndo: () => Promise<void>;
  handleRedo: () => Promise<void>;
  immediateSave: () => void;

  // Canvas operations
  snapshot: () => CanvasState | null;
  load: (json: CanvasState | null) => Promise<void>;
  exportPNG: () => string;
  exportSVG: () => string;
  clear: () => void;
  getCanvas: () => FabricCanvas | null;
}

export const useAnnotationCanvas = ({
  onFinish,
  initialJSON,
}: UseAnnotationCanvasProps): UseAnnotationCanvasReturn => {
  // Store state
  const { activeTool, isLoadingFromHistory } = useAnnotationStore();

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drawing state
  const drawingRef = useRef<{
    isDrawing: boolean;
    startPoint: Point | null;
    currentShape: FabricObject | null;
  }>({
    isDrawing: false,
    startPoint: null,
    currentShape: null,
  });

  // Initialize canvas
  useCanvasInitialization({
    canvasRef,
    fabricRef,
    initialJSON,
  });

  // History management
  const { handleUndo, handleRedo, immediateSave } = useCanvasHistory({
    fabricRef,
    isLoadingFromHistory,
  });

  // Event handling
  useCanvasEvents({
    fabricRef,
    drawingRef,
    activeTool,
    immediateSave,
    onFinish,
  });

  // Theme management
  useCanvasTheme({ fabricRef });

  // Keyboard shortcuts
  useCanvasKeyboardShortcuts({
    fabricRef,
    immediateSave,
    handleUndo,
    handleRedo,
  });

  // Resize handling
  useCanvasResize({ containerRef, fabricRef });

  // Canvas operations
  const snapshot = useCallback((): CanvasState | null => {
    if (!fabricRef.current) return null;

    const canvasJSON = fabricRef.current.toJSON([
      "id",
      "selectable",
      "evented",
    ]);
    return {
      version: "1.0",
      objects: (canvasJSON.objects as Record<string, unknown>[]) || [],
    };
  }, []);

  const load = useCallback(async (json: CanvasState | null): Promise<void> => {
    if (!fabricRef.current || !json) return;

    return new Promise((resolve) => {
      const canvasData = {
        version: json.version || "1.0",
        objects: json.objects,
      };

      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          fabricRef.current?.renderAll();
          resolve();
        }
      }, 300);

      try {
        fabricRef.current!.loadFromJSON(canvasData, () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            fabricRef.current?.renderAll();
            resolve();
          }
        });
      } catch (error) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          console.error("Failed to restore canvas:", error);
          resolve();
        }
      }
    });
  }, []);

  const exportPNG = useCallback((): string => {
    return fabricRef.current?.toDataURL({ format: "png", quality: 1 }) || "";
  }, []);

  const exportSVG = useCallback((): string => {
    return fabricRef.current?.toSVG() || "";
  }, []);

  const clear = useCallback((): void => {
    if (fabricRef.current) {
      try {
        fabricRef.current.clear();
        fabricRef.current.renderAll();
        immediateSave();
      } catch (error) {
        console.warn('[Canvas] Clear operation failed (context may be invalid):', error);
        // Still try to save even if clear failed
        immediateSave();
      }
    }
  }, [immediateSave]);

  const getCanvas = useCallback((): FabricCanvas | null => {
    return fabricRef.current;
  }, []);

  return {
    // Refs
    canvasRef,
    containerRef,
    fabricRef,
    drawingRef,

    // Actions
    handleUndo,
    handleRedo,
    immediateSave,

    // Canvas operations
    snapshot,
    load,
    exportPNG,
    exportSVG,
    clear,
    getCanvas,
  };
};
