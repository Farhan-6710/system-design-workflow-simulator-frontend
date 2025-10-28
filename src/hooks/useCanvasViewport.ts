/**
 * Enhanced canvas controls with improved performance and cleaner API
 * Optimized for zoom, pan, and viewport management
 */

import { useCallback, useRef, useEffect, useState } from "react";
import { useWorkflowStore } from "@/stores/workflowStore";

// Constants
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.1;
const ZOOM_SENSITIVITY = 0.001;

// Interactive elements that should not trigger panning
const INTERACTIVE_SELECTORS = [
  ".workflow-node",
  ".dock-navigation",
  ".workflow-header",
  "[data-no-pan]",
].join(", ");

// Utility functions
const constrainScale = (scale: number): number =>
  Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));

const isInteractiveElement = (target: HTMLElement): boolean =>
  Boolean(target.closest(INTERACTIVE_SELECTORS));

const isPinchGesture = (event: WheelEvent | React.WheelEvent): boolean =>
  event.ctrlKey || event.metaKey;

const getTouchDistance = (touches: React.TouchList): number => {
  if (touches.length < 2) return 0;
  const [touch1, touch2] = [touches[0], touches[1]];
  return Math.sqrt(
    Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
  );
};

export const useCanvasViewport = () => {
  // Store state and actions
  const transform = useWorkflowStore((state) => state.canvasTransform);
  const setCanvasTransform = useWorkflowStore(
    (state) => state.setCanvasTransform
  );
  const updateCanvasTransform = useWorkflowStore(
    (state) => state.updateCanvasTransform
  );

  // Local interaction state
  const [isPanning, setIsPanning] = useState(false);

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

  // Zoom controls
  const zoomIn = useCallback(() => {
    updateCanvasTransform({
      scale: constrainScale(transform.scale + ZOOM_STEP),
    });
  }, [transform.scale, updateCanvasTransform]);

  const zoomOut = useCallback(() => {
    updateCanvasTransform({
      scale: constrainScale(transform.scale - ZOOM_STEP),
    });
  }, [transform.scale, updateCanvasTransform]);

  const setZoom = useCallback(
    (scale: number) => {
      updateCanvasTransform({ scale: constrainScale(scale) });
    },
    [updateCanvasTransform]
  );

  const resetViewport = useCallback(() => {
    setCanvasTransform({ scale: 1, translateX: 0, translateY: 0 });
  }, [setCanvasTransform]);

  // Zoom to fit content (future enhancement)
  const zoomToFit = useCallback(
    (bounds?: { x: number; y: number; width: number; height: number }) => {
      // Implementation for zoom to fit functionality
      // This would calculate optimal zoom and pan to fit all content
      console.log("zoomToFit", bounds);
    },
    []
  );

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

      setCanvasTransform({
        ...transformRef.current,
        translateX: panStartTransform.current.translateX + deltaX,
        translateY: panStartTransform.current.translateY + deltaY,
      });
    },
    [isPanning, setCanvasTransform] // Removed transform dependency - using transformRef.current
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
          const newScale = constrainScale(
            touchState.current.initialScale * scaleFactor
          );
          updateCanvasTransform({ scale: newScale });
        }
      } else if (event.touches.length === 1 && isPanning) {
        // Pan
        event.preventDefault();
        const touch = event.touches[0];
        const deltaX = touch.clientX - lastPosition.current.x;
        const deltaY = touch.clientY - lastPosition.current.y;

        setCanvasTransform({
          ...transformRef.current,
          translateX: panStartTransform.current.translateX + deltaX,
          translateY: panStartTransform.current.translateY + deltaY,
        });
      }
    },
    [isPanning, setCanvasTransform, updateCanvasTransform]
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
      const newScale = constrainScale(transform.scale * (1 + zoomFactor));

      updateCanvasTransform({ scale: newScale });
    },
    [transform.scale, updateCanvasTransform]
  );

  // Generate transform style
  const getCanvasTransformStyle = useCallback(
    (): React.CSSProperties => ({
      transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
      transformOrigin: "center center",
      transition: isPanning ? "none" : "transform 0.15s ease-out",
    }),
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
    getCanvasTransformStyle,

    // Constants for external use
    MIN_ZOOM,
    MAX_ZOOM,
  };
};
