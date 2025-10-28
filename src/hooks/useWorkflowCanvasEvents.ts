/**
 * Custom hook for WorkflowCanvas event handling
 * Extracts complex event logic from the component
 */

import { useEffect, useRef, useCallback } from "react";
import { useAnnotationStore } from "@/stores/annotationStore";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";
import { useCanvasCoordinates } from "@/hooks/useCanvasCoordinates";
import {
  createNodeHandlers,
  createEdgeHandlers,
  createCanvasHandlers,
} from "@/utils/workflow-studio/canvasHandlers";
import type { AnnotationLayerHandle } from "@/components/main-sections/workflow-studio/annotation-layer/AnnotationLayer";

interface UseWorkflowCanvasEventsProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  annotationLayerRef?: React.MutableRefObject<AnnotationLayerHandle | null>;
}

export const useWorkflowCanvasEvents = ({
  canvasRef,
  annotationLayerRef,
}: UseWorkflowCanvasEventsProps) => {
  // Store state
  const activeTool = useAnnotationStore((state) => state.activeTool);
  const selectTool = useAnnotationStore((state) => state.selectTool);

  // Canvas controls
  const {
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
  } = useCanvasControlsContext();

  // Coordinate utilities
  const { getCanvasCoordinates } = useCanvasCoordinates({
    canvasRef,
  });

  // Create handlers
  const coordinateUtils = { getCanvasCoordinates };
  const nodeHandlers = createNodeHandlers(coordinateUtils);
  const edgeHandlers = createEdgeHandlers();
  const canvasHandlers = createCanvasHandlers(coordinateUtils);

  // Internal ref for annotation layer
  const internalAnnotationRef = useRef<AnnotationLayerHandle | null>(null);

  // Connect internal ref to parent ref
  useEffect(() => {
    if (annotationLayerRef) {
      annotationLayerRef.current = internalAnnotationRef.current;
    }
  }, [annotationLayerRef]);

  // Callback ref for annotation layer
  const handleAnnotationLayerRef = useCallback(
    (element: AnnotationLayerHandle | null) => {
      internalAnnotationRef.current = element;
      if (annotationLayerRef) {
        annotationLayerRef.current = element;
      }
    },
    [annotationLayerRef]
  );

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool !== "select") return;
      handlePanStart(event);
    },
    [activeTool, handlePanStart]
  );

  const handleMouseMoveCanvas = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool !== "select") {
        canvasHandlers.onMouseMove(event);
        return;
      }
      handlePanMove(event);
      canvasHandlers.onMouseMove(event);
    },
    [activeTool, handlePanMove, canvasHandlers]
  );

  const handleMouseUpCanvas = useCallback(() => {
    if (activeTool !== "select") {
      canvasHandlers.onMouseUp();
      return;
    }
    handlePanEnd();
    canvasHandlers.onMouseUp();
  }, [activeTool, handlePanEnd, canvasHandlers]);

  // Touch event setup
  useEffect(() => {
    const canvasDiv = canvasRef.current;
    if (!canvasDiv) return;

    const nativeTouchStart = (e: TouchEvent) => {
      handleTouchStart(e as unknown as React.TouchEvent<Element>);
    };

    const nativeTouchMove = (e: TouchEvent) => {
      handleTouchMove(e as unknown as React.TouchEvent<Element>);
    };

    const nativeTouchEnd = (e: TouchEvent) => {
      handleTouchEnd(e as unknown as React.TouchEvent<Element>);
    };

    canvasDiv.addEventListener("touchstart", nativeTouchStart, {
      passive: false,
    });
    canvasDiv.addEventListener("touchmove", nativeTouchMove, {
      passive: false,
    });
    canvasDiv.addEventListener("touchend", nativeTouchEnd, {
      passive: false,
    });

    return () => {
      canvasDiv.removeEventListener("touchstart", nativeTouchStart);
      canvasDiv.removeEventListener("touchmove", nativeTouchMove);
      canvasDiv.removeEventListener("touchend", nativeTouchEnd);
    };
  }, [canvasRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Wheel event handler
  const handleWheelEvent = useCallback(
    (e: React.WheelEvent) => {
      if (activeTool !== "select") return;
      handleWheel(e);
    },
    [activeTool, handleWheel]
  );

  // Canvas click handler
  const handleCanvasClick = useCallback(() => {
    canvasHandlers.onClick();
  }, [canvasHandlers]);

  // Annotation finish handler
  const handleAnnotationFinish = useCallback(() => {
    selectTool("select");
  }, [selectTool]);

  return {
    // Event handlers
    handleMouseDown,
    handleMouseMoveCanvas,
    handleMouseUpCanvas,
    handleWheelEvent,
    handleCanvasClick,
    handleAnnotationFinish,
    handleAnnotationLayerRef,

    // Business logic handlers
    nodeHandlers,
    edgeHandlers,
    canvasHandlers,

    // State
    activeTool,
  };
};
