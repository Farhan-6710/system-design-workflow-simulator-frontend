"use client";

import React, {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useAnnotationStore } from "@/stores/annotationStore";
import { useWorkflowStore } from "@/stores/workflowStore";
import {
  initializeCanvas,
  updateCanvasMode,
  createShape,
  updateShape,
  finalizeShape,
  serializeCanvas,
  restoreCanvas,
  applyThemeColors,
  debounce,
  type FabricCanvas,
  type FabricObject,
  type Point,
} from "@/utils/workflow-studio/AnnotationLayerUtils";

export interface AnnotationCanvasHandle {
  snapshot: () => CanvasState | null;
  load: (json: CanvasState | null) => Promise<void>;
  exportPNG: () => string;
  exportSVG: () => string;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  getCanvas: () => FabricCanvas | null;
}

export interface CanvasState {
  version: string;
  objects: Record<string, unknown>[];
}

interface AnnotationCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  onFinish?: () => void;
  initialJSON?: CanvasState | null;
}

export const AnnotationCanvas = forwardRef<
  AnnotationCanvasHandle,
  AnnotationCanvasProps
>(({ className = "", style, onFinish, initialJSON }, ref) => {
  const {
    activeTool,
    canvasState,
    saveToHistory,
    undo: storeUndo,
    redo: storeRedo,
    setCanvasState,
    isLoadingFromHistory,
  } = useAnnotationStore();
  const isFullScreen = useWorkflowStore((state) => state.isFullScreen);

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
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = initializeCanvas(canvasRef.current);
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
  }, [initialJSON, canvasState]);

  // Update canvas mode when tool changes
  useEffect(() => {
    if (fabricRef.current) {
      updateCanvasMode(fabricRef.current, activeTool);
    }
  }, [activeTool]);

  // Handle visibility changes and ensure state restoration
  useEffect(() => {
    if (fabricRef.current && canvasState) {
      // When canvas becomes visible again, ensure state is properly restored
      restoreCanvas(fabricRef.current, canvasState).catch(console.error);
    }
  }, [canvasState]);

  // Apply theme changes
  useEffect(() => {
    if (!fabricRef.current) return;

    applyThemeColors(fabricRef.current);

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      if (fabricRef.current) {
        applyThemeColors(fabricRef.current);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      if (fabricRef.current) {
        applyThemeColors(fabricRef.current);
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  // Debounced save function
  const debouncedSaveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    debouncedSaveRef.current = debounce(() => {
      if (fabricRef.current && !isLoadingFromHistory) {
        const state = serializeCanvas(fabricRef.current);
        saveToHistory(state);
      }
    }, 300);
  }, [saveToHistory, isLoadingFromHistory]);

  // Immediate save function
  const immediateSave = useCallback(() => {
    if (fabricRef.current && !isLoadingFromHistory) {
      const state = serializeCanvas(fabricRef.current);
      saveToHistory(state);
    }
  }, [saveToHistory, isLoadingFromHistory]);

  // Undo/Redo handlers
  const handleUndo = useCallback(async () => {
    const state = storeUndo();
    if (state && fabricRef.current) {
      await restoreCanvas(fabricRef.current, state);
      setCanvasState(state);
    }
  }, [storeUndo, setCanvasState]);

  const handleRedo = useCallback(async () => {
    const state = storeRedo();
    if (state && fabricRef.current) {
      await restoreCanvas(fabricRef.current, state);
      setCanvasState(state);
    }
  }, [storeRedo, setCanvasState]);

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e?: unknown) => {
      const event = e as { e: Event; target?: FabricObject };
      if (
        !fabricRef.current ||
        !activeTool ||
        activeTool === "select" ||
        activeTool === "freedraw" || // Freedraw uses built-in Fabric.js drawing mode
        !event?.e
      )
        return;

      // If we clicked on an existing object, don't create a new one
      if (event.target) {
        return;
      }

      // If there's an active object selected, don't create a new one
      if (fabricRef.current.getActiveObject()) {
        return;
      }

      const pointer = fabricRef.current.getPointer(event.e);

      if (activeTool === "text") {
        const textShape = createShape(activeTool, pointer);
        if (textShape) {
          fabricRef.current.add(textShape);
          finalizeShape(fabricRef.current, textShape, activeTool);
          immediateSave();
        }
        return;
      }

      const shape = createShape(activeTool, pointer);
      if (shape) {
        fabricRef.current.add(shape);
        drawingRef.current = {
          isDrawing: true,
          startPoint: pointer,
          currentShape: shape,
        };
      }
    },
    [activeTool, immediateSave]
  );

  const handleMouseMove = useCallback(
    (e?: unknown) => {
      const event = e as { e: Event };
      if (
        !fabricRef.current ||
        !drawingRef.current.isDrawing ||
        !drawingRef.current.startPoint ||
        !drawingRef.current.currentShape ||
        !event?.e
      ) {
        return;
      }

      const pointer = fabricRef.current.getPointer(event.e);
      updateShape(
        drawingRef.current.currentShape,
        activeTool,
        drawingRef.current.startPoint,
        pointer
      );
      fabricRef.current.renderAll();
    },
    [activeTool]
  );

  const handleMouseUp = useCallback(() => {
    if (
      !fabricRef.current ||
      !drawingRef.current.isDrawing ||
      !drawingRef.current.currentShape
    ) {
      return;
    }

    finalizeShape(
      fabricRef.current,
      drawingRef.current.currentShape,
      activeTool
    );
    immediateSave();
    onFinish?.();

    drawingRef.current = {
      isDrawing: false,
      startPoint: null,
      currentShape: null,
    };
  }, [activeTool, immediateSave, onFinish]);

  // Setup canvas events
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !debouncedSaveRef.current) return;

    const debouncedSave = debouncedSaveRef.current;

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    // History events with unified tool completion handling
    const handlePathCreated = () => {
      debouncedSave();
      // Auto-switch back to select tool after any drawing completion
      onFinish?.();
    };

    const handleObjectModified = () => {
      debouncedSave();
      // Auto-switch back to select tool after object modification
      onFinish?.();
    };

    canvas.on("path:created", handlePathCreated);
    canvas.on("object:modified", handleObjectModified);

    // Text editing events
    const handleTextEditingExited = (e?: unknown) => {
      const event = e as { target?: { type?: string } };
      if (
        event?.target?.type === "textbox" ||
        event?.target?.type === "i-text"
      ) {
        immediateSave();
      }
    };
    canvas.on("text:editing:exited", handleTextEditingExited);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("path:created", handlePathCreated);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("text:editing:exited", handleTextEditingExited);
    };
  }, [
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    immediateSave,
    onFinish,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input fields
      if (
        ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")
      ) {
        return;
      }

      if (e.key === "Escape") {
        if (fabricRef.current) {
          fabricRef.current.discardActiveObject();
          fabricRef.current.renderAll();
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (fabricRef.current) {
          const activeObjects = fabricRef.current.getActiveObjects();
          activeObjects.forEach((obj) => fabricRef.current?.remove(obj));
          fabricRef.current.discardActiveObject();
          fabricRef.current.renderAll();
          immediateSave();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [immediateSave, handleUndo, handleRedo]);

  // Restore canvas when store state changes (for undo/redo)
  useEffect(() => {
    if (!fabricRef.current || !canvasState || !isLoadingFromHistory) return;

    restoreCanvas(fabricRef.current, canvasState).catch(console.error);
  }, [canvasState, isLoadingFromHistory]);

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current || !fabricRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && fabricRef.current) {
        const { width, height } = entry.contentRect;
        fabricRef.current.setDimensions({ width, height });
        fabricRef.current.renderAll();
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Imperative handle
  useImperativeHandle(
    ref,
    () => ({
      snapshot: () => {
        return fabricRef.current ? serializeCanvas(fabricRef.current) : null;
      },
      load: async (json: CanvasState | null) => {
        if (fabricRef.current && json) {
          await restoreCanvas(fabricRef.current, json);
          setCanvasState(json);
        }
      },
      exportPNG: () => {
        return (
          fabricRef.current?.toDataURL({ format: "png", quality: 1 }) || ""
        );
      },
      exportSVG: () => {
        return fabricRef.current?.toSVG() || "";
      },
      clear: () => {
        if (fabricRef.current) {
          fabricRef.current.clear();
          fabricRef.current.renderAll();
          immediateSave();
        }
      },
      undo: handleUndo,
      redo: handleRedo,
      getCanvas: () => fabricRef.current,
    }),
    [handleUndo, handleRedo, immediateSave, setCanvasState]
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