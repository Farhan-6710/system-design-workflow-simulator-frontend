/**
 * Custom hook for WorkflowCanvas event handling
 * Handles canvas events, coordinate transformations, and business logic integration
 */

import { useEffect, useRef, useCallback } from "react";
import { useAnnotationStore } from "@/stores/annotationStore";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";
import {
  createNodeHandlers,
  createEdgeHandlers,
  createCanvasHandlers,
} from "@/utils/workflow-studio/eventHandlers";
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
  const canvasTransform = useWorkflowStore((state) => state.canvasTransform);

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

  // Coordinate transformation utilities (merged from useCanvasCoordinates)
  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) {
        return { x: clientX, y: clientY };
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;

      const {
        scale = 1,
        translateX = 0,
        translateY = 0,
      } = canvasTransform ?? {};

      // Reverse canvas transform to get actual canvas coordinates
      const canvasX = (rawX - translateX) / scale;
      const canvasY = (rawY - translateY) / scale;

      // No additional scaling needed since WorkflowLayer has no scale transform applied
      return { x: canvasX, y: canvasY };
    },
    [canvasRef, canvasTransform]
  );

  const getViewportCoordinates = useCallback(
    (canvasX: number, canvasY: number) => {
      if (!canvasRef.current) {
        return { x: canvasX, y: canvasY };
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const {
        scale = 1,
        translateX = 0,
        translateY = 0,
      } = canvasTransform ?? {};

      const viewportX = canvasX * scale + translateX + rect.left;
      const viewportY = canvasY * scale + translateY + rect.top;

      return { x: viewportX, y: viewportY };
    },
    [canvasRef, canvasTransform]
  );

  const isPointVisible = useCallback(
    (canvasX: number, canvasY: number, margin = 0) => {
      if (!canvasRef.current) return true;

      const rect = canvasRef.current.getBoundingClientRect();
      const {
        scale = 1,
        translateX = 0,
        translateY = 0,
      } = canvasTransform ?? {};

      const viewportX = canvasX * scale + translateX;
      const viewportY = canvasY * scale + translateY;

      return (
        viewportX >= -margin &&
        viewportY >= -margin &&
        viewportX <= rect.width + margin &&
        viewportY <= rect.height + margin
      );
    },
    [canvasRef, canvasTransform]
  );

  // Create handlers with coordinate utilities
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

    // Coordinate utilities (merged from useCanvasCoordinates)
    getCanvasCoordinates,
    getViewportCoordinates,
    isPointVisible,

    // State
    activeTool,
  };
};
