/**
 * Canvas & Viewport Utilities
 * Shared zoom, pan, transform, and coordinate utilities for canvas layers
 */

import { CanvasTransform } from "@/types/workflow-studio/workflow";
import {
  MIN_ZOOM,
  MAX_ZOOM,
  INTERACTIVE_SELECTORS,
  ZOOM_STEP,
  ZOOM_BASELINE,
  PAN_DISABLED_THRESHOLD,
  WORKFLOW_LAYER_INITIAL_SCALE,
} from "@/constants/canvas";

// ============================================================================
// Zoom Constraints
// ============================================================================

export const constrainScale = (scale: number): number =>
  Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));

// ============================================================================
// Interaction Detection
// ============================================================================

export const isInteractiveElement = (target: HTMLElement): boolean =>
  Boolean(target.closest(INTERACTIVE_SELECTORS));

export const isPinchGesture = (event: WheelEvent | React.WheelEvent): boolean =>
  event.ctrlKey || event.metaKey;

export const getTouchDistance = (touches: React.TouchList): number => {
  if (touches.length < 2) return 0;
  const [touch1, touch2] = [touches[0], touches[1]];
  return Math.sqrt(
    Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
  );
};

// ============================================================================
// Transform Styles
// ============================================================================

export const getCanvasTransformStyle = (
  transform: CanvasTransform,
  isPanning: boolean = false
): React.CSSProperties => ({
  transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
  transformOrigin: "center center",
  transition: isPanning ? "none" : "transform 0.15s ease-out",
});

export const getWorkflowTransformStyle = (): React.CSSProperties => ({
  transform: `translate(0px, 0px) scale(${WORKFLOW_LAYER_INITIAL_SCALE})`,
  transformOrigin: "center center",
  transition: "none",
});

// ============================================================================
// Coordinate Conversion
// ============================================================================

export const getCanvasCoordinates = (
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  transform: CanvasTransform
): { x: number; y: number } => {
  const canvasX = clientX - canvasRect.left;
  const canvasY = clientY - canvasRect.top;

  return {
    x: (canvasX - transform.translateX) / transform.scale,
    y: (canvasY - transform.translateY) / transform.scale,
  };
};

// ============================================================================
// Zoom to Fit
// ============================================================================

export const calculateZoomToFit = (
  bounds: { x: number; y: number; width: number; height: number },
  containerWidth: number,
  containerHeight: number,
  padding: number = 50
): CanvasTransform => {
  const scaleX = (containerWidth - padding * 2) / bounds.width;
  const scaleY = (containerHeight - padding * 2) / bounds.height;
  const scale = constrainScale(Math.min(scaleX, scaleY));

  const translateX = containerWidth / 2 - (bounds.x + bounds.width / 2) * scale;
  const translateY =
    containerHeight / 2 - (bounds.y + bounds.height / 2) * scale;

  return { scale, translateX, translateY };
};

// ============================================================================
// Zoom Actions
// ============================================================================

export const createZoomActions = () => ({
  zoomIn: (
    currentTransform: CanvasTransform,
    canvasWidth: number = 800,
    canvasHeight: number = 600
  ): CanvasTransform => {
    const newTransform = {
      ...currentTransform,
      scale: constrainScale(currentTransform.scale + ZOOM_STEP),
    };
    return createZoomActions().constrainPan(
      newTransform,
      canvasWidth,
      canvasHeight
    );
  },

  zoomOut: (
    currentTransform: CanvasTransform,
    canvasWidth: number = 800,
    canvasHeight: number = 600
  ): CanvasTransform => {
    const newTransform = {
      ...currentTransform,
      scale: constrainScale(currentTransform.scale - ZOOM_STEP),
    };
    return createZoomActions().constrainPan(
      newTransform,
      canvasWidth,
      canvasHeight
    );
  },

  setZoom: (
    currentTransform: CanvasTransform,
    scale: number,
    canvasWidth: number = 800,
    canvasHeight: number = 600
  ): CanvasTransform => {
    const newTransform = {
      ...currentTransform,
      scale: constrainScale(scale),
    };
    return createZoomActions().constrainPan(
      newTransform,
      canvasWidth,
      canvasHeight
    );
  },

  resetViewport: (): CanvasTransform => ({
    scale: ZOOM_BASELINE,
    translateX: 0,
    translateY: 0,
  }),

  constrainPan: (
    currentTransform: CanvasTransform,
    canvasWidth: number,
    canvasHeight: number
  ): CanvasTransform => {
    const { scale, translateX, translateY } = currentTransform;

    if (scale <= PAN_DISABLED_THRESHOLD) {
      return { ...currentTransform, translateX: 0, translateY: 0 };
    }

    const scaledWidth = canvasWidth * scale;
    const scaledHeight = canvasHeight * scale;
    const maxTranslateX = (scaledWidth - canvasWidth) / 2;
    const maxTranslateY = (scaledHeight - canvasHeight) / 2;

    const constrainedX = Math.max(
      -maxTranslateX,
      Math.min(maxTranslateX, translateX)
    );
    const constrainedY = Math.max(
      -maxTranslateY,
      Math.min(maxTranslateY, translateY)
    );

    return {
      ...currentTransform,
      translateX: constrainedX,
      translateY: constrainedY,
    };
  },

  zoomToFit: (
    bounds?: { x: number; y: number; width: number; height: number },
    containerWidth: number = 800,
    containerHeight: number = 600
  ): CanvasTransform => {
    if (!bounds) {
      return { scale: 1, translateX: 0, translateY: 0 };
    }
    return calculateZoomToFit(bounds, containerWidth, containerHeight);
  },
});
