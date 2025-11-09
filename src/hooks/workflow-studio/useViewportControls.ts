/**
 * Canvas Controls Hook
 * Handles zoom, pan, viewport management and touch/wheel interactions
 * Optimized for performance with cleaner API
 */

import { useCallback, useRef, useEffect, useState } from "react";
import { useWorkflowStore } from "@/stores/workflowStore";
import { MIN_ZOOM, MAX_ZOOM, ZOOM_SENSITIVITY } from "@/constants/canvas";
import {
  isInteractiveElement,
  isPinchGesture,
  getTouchDistance,
  getCanvasTransformStyle,
} from "@/utils/workflow-studio/canvasViewportUtils";

export const useCanvasControls = () => {
  // Store state and actions
  const transform = useWorkflowStore((state) => state.canvasTransform);
  const setCanvasTransformConstrained = useWorkflowStore(
    (state) => state.setCanvasTransformConstrained
  );

  // Zoom actions from store - cleaner architecture
  const zoomInStore = useWorkflowStore((state) => state.zoomIn);
  const zoomOutStore = useWorkflowStore((state) => state.zoomOut);
  const setZoomStore = useWorkflowStore((state) => state.setZoom);
  const resetViewport = useWorkflowStore((state) => state.resetViewport);
  const zoomToFit = useWorkflowStore((state) => state.zoomToFit);

  // Local interaction state
  const [isPanning, setIsPanning] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 800,
    height: 600,
  });

  // Wrap zoom functions to automatically pass canvas dimensions
  const zoomIn = useCallback(() => {
    zoomInStore(canvasDimensions.width, canvasDimensions.height);
  }, [zoomInStore, canvasDimensions.width, canvasDimensions.height]);

  const zoomOut = useCallback(() => {
    zoomOutStore(canvasDimensions.width, canvasDimensions.height);
  }, [zoomOutStore, canvasDimensions.width, canvasDimensions.height]);

  const setZoom = useCallback(
    (scale: number) => {
      setZoomStore(scale, canvasDimensions.width, canvasDimensions.height);
    },
    [setZoomStore, canvasDimensions.width, canvasDimensions.height]
  );

  // Interaction tracking refs
  const lastPosition = useRef({ x: 0, y: 0 });
  const panStartTransform = useRef(transform);
  const touchState = useRef({
    initialDistance: 0,
    initialScale: 1,
    startTransform: transform,
  });

  // Keep current transform in ref for stable access in callbacks
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // Helper to get canvas dimensions from data-canvas-area element
  const updateCanvasDimensions = useCallback(() => {
    const canvasElement = document.querySelector(
      '[data-canvas-area="true"]'
    ) as HTMLElement;
    if (canvasElement) {
      const rect = canvasElement.getBoundingClientRect();
      setCanvasDimensions({ width: rect.width, height: rect.height });
    }
  }, []);

  // Update canvas dimensions on mount and resize
  useEffect(() => {
    updateCanvasDimensions();

    const handleResize = () => updateCanvasDimensions();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [updateCanvasDimensions]);

  // Pan controls
  const handlePanStart = useCallback(
    (event: React.MouseEvent) => {
      if (isInteractiveElement(event.target as HTMLElement)) return;

      setIsPanning(true);
      lastPosition.current = { x: event.clientX, y: event.clientY };
      panStartTransform.current = { ...transformRef.current };
      event.preventDefault();
    },
    [] // Removed transform dependency - using transformRef.current for stable access
  );

  const handlePanMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isPanning) return;

      const deltaX = event.clientX - lastPosition.current.x;
      const deltaY = event.clientY - lastPosition.current.y;

      const newTransform = {
        ...transformRef.current,
        translateX: panStartTransform.current.translateX + deltaX,
        translateY: panStartTransform.current.translateY + deltaY,
      };

      // Use constrained transform to keep content within boundaries
      setCanvasTransformConstrained(
        newTransform,
        canvasDimensions.width,
        canvasDimensions.height
      );
    },
    [
      isPanning,
      setCanvasTransformConstrained,
      canvasDimensions.width,
      canvasDimensions.height,
    ]
  );

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Touch controls for mobile
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (isInteractiveElement(event.target as HTMLElement)) return;

      if (event.touches.length === 2) {
        // Pinch zoom
        event.preventDefault();
        touchState.current = {
          initialDistance: getTouchDistance(event.touches),
          initialScale: transformRef.current.scale,
          startTransform: { ...transformRef.current },
        };
      } else if (event.touches.length === 1) {
        // Pan
        const touch = event.touches[0];
        setIsPanning(true);
        lastPosition.current = { x: touch.clientX, y: touch.clientY };
        panStartTransform.current = { ...transformRef.current };
        event.preventDefault();
      }
    },
    [] // Removed transform dependency - using transformRef.current for stable access
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (event.touches.length === 2) {
        // Pinch zoom
        event.preventDefault();
        const currentDistance = getTouchDistance(event.touches);

        if (touchState.current.initialDistance > 0) {
          const scaleFactor =
            currentDistance / touchState.current.initialDistance;
          const newScale = touchState.current.initialScale * scaleFactor;
          setZoom(newScale); // Use store method which handles constraints
        }
      } else if (event.touches.length === 1 && isPanning) {
        // Pan
        event.preventDefault();
        const touch = event.touches[0];
        const deltaX = touch.clientX - lastPosition.current.x;
        const deltaY = touch.clientY - lastPosition.current.y;

        const newTransform = {
          ...transformRef.current,
          translateX: panStartTransform.current.translateX + deltaX,
          translateY: panStartTransform.current.translateY + deltaY,
        };

        // Use constrained transform to keep content within boundaries
        setCanvasTransformConstrained(
          newTransform,
          canvasDimensions.width,
          canvasDimensions.height
        );
      }
    },
    [
      isPanning,
      setCanvasTransformConstrained,
      setZoom,
      canvasDimensions.width,
      canvasDimensions.height,
    ]
  );

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 0) {
      setIsPanning(false);
      touchState.current.initialDistance = 0;
    } else if (event.touches.length === 1) {
      touchState.current.initialDistance = 0;
    }
  }, []);

  // Wheel zoom
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      if (!isPinchGesture(event)) return;

      event.preventDefault();
      event.stopPropagation();

      const zoomFactor = -event.deltaY * ZOOM_SENSITIVITY;
      const newScale = transform.scale * (1 + zoomFactor);
      setZoom(newScale); // Use store method which handles constraints
    },
    [transform.scale, setZoom]
  );

  // Generate transform style using utility function
  const getCanvasTransformStyleHook = useCallback(
    (): React.CSSProperties => getCanvasTransformStyle(transform, isPanning),
    [transform, isPanning]
  );

  // Global event cleanup
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isPanning) handlePanEnd();
    };

    const handleGlobalWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('[data-canvas-area="true"]') &&
        isPinchGesture(event)
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    document.addEventListener("wheel", handleGlobalWheel, { passive: false });

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("wheel", handleGlobalWheel);
    };
  }, [isPanning, handlePanEnd]);

  return {
    // State
    transform,
    isPanning,

    // Zoom controls
    zoomIn,
    zoomOut,
    setZoom,
    resetViewport,
    zoomToFit,

    // Pan controls
    handlePanStart,
    handlePanMove,
    handlePanEnd,

    // Touch controls
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    // Wheel control
    handleWheel,

    // Style utility
    getCanvasTransformStyle: getCanvasTransformStyleHook,

    // Constants for external use
    MIN_ZOOM,
    MAX_ZOOM,
  };
};
