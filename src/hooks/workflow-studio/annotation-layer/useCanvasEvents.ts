/**
 * Canvas events hook
 * Handles mouse events, drawing operations, and canvas event listeners
 */

import { useEffect, useCallback } from "react";
import {
  createShape,
  updateShape,
  finalizeShape,
  type FabricCanvas,
  type FabricObject,
  type Point,
} from "@/utils/workflow-studio/annotation-layer";
import type { Tool } from "@/components/main-sections/workflow-studio/annotation-layer/AnnotationLayer";

export interface UseCanvasEventsProps {
  fabricRef: React.RefObject<FabricCanvas | null>;
  drawingRef: React.RefObject<{
    isDrawing: boolean;
    startPoint: Point | null;
    currentShape: FabricObject | null;
  }>;
  activeTool: Tool;
  immediateSave: () => void;
  onFinish?: () => void;
}

export const useCanvasEvents = ({
  fabricRef,
  drawingRef,
  activeTool,
  immediateSave,
  onFinish,
}: UseCanvasEventsProps) => {
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
      if (shape && drawingRef.current) {
        fabricRef.current.add(shape);
        drawingRef.current.isDrawing = true;
        drawingRef.current.startPoint = pointer;
        drawingRef.current.currentShape = shape;
      }
    },
    [fabricRef, drawingRef, activeTool, immediateSave]
  );

  const handleMouseMove = useCallback(
    (e?: unknown) => {
      const event = e as { e: Event };
      if (
        !fabricRef.current ||
        !drawingRef.current?.isDrawing ||
        !drawingRef.current?.startPoint ||
        !drawingRef.current?.currentShape ||
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
    [fabricRef, drawingRef, activeTool]
  );

  const handleMouseUp = useCallback(() => {
    if (
      !fabricRef.current ||
      !drawingRef.current?.isDrawing ||
      !drawingRef.current?.currentShape
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

    // Reset drawing state
    if (drawingRef.current) {
      drawingRef.current.isDrawing = false;
      drawingRef.current.startPoint = null;
      drawingRef.current.currentShape = null;
    }
  }, [fabricRef, drawingRef, activeTool, immediateSave, onFinish]);

  // Setup canvas events
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // History events with unified tool completion handling
    const handlePathCreated = () => {
      immediateSave();
      // Auto-switch back to select tool after any drawing completion
      onFinish?.();
    };

    const handleObjectModified = () => {
      immediateSave();
      // Auto-switch back to select tool after object modification
      onFinish?.();
    };

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

    // Add event listeners
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("path:created", handlePathCreated);
    canvas.on("object:modified", handleObjectModified);
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
    fabricRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    immediateSave,
    onFinish,
  ]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
