import { CanvasControlsHook } from "@/types/workflow-studio/workflow";
import type { Tool } from "@/components/main-sections/workflow-studio/annotation-layer/AnnotationLayer";

export interface DockItemHandlers {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleResetZoom: () => void;
  handleFullscreen: () => void;
  handleAnnotationTool: (tool: Tool) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleClearAll: () => void;
}

export const createDockItemHandlers = (
  canvasControls: CanvasControlsHook,
  fullscreenHandlers?: {
    toggleFullscreen: () => void;
  },
  annotationHandlers?: {
    setActiveTool: (tool: Tool) => void;
    undo?: () => void;
    redo?: () => void;
    clearAll?: () => void;
  }
): DockItemHandlers => {
  const { zoomIn, zoomOut, resetViewport } = canvasControls;

  return {
    handleZoomIn: zoomIn,
    handleZoomOut: zoomOut,
    handleResetZoom: resetViewport,
    handleFullscreen: fullscreenHandlers?.toggleFullscreen || (() => {}),
    handleAnnotationTool: annotationHandlers?.setActiveTool || (() => {}),
    handleUndo: annotationHandlers?.undo || (() => {}),
    handleRedo: annotationHandlers?.redo || (() => {}),
    handleClearAll: annotationHandlers?.clearAll || (() => {}),
  };
};

export const handleDockItemClick = (
  itemId: string,
  handlers: DockItemHandlers
): void => {
  switch (itemId) {
    case "zoom-in":
      handlers.handleZoomIn();
      break;
    case "zoom-out":
      handlers.handleZoomOut();
      break;
    case "undo":
      handlers.handleUndo();
      break;
    case "redo":
      handlers.handleRedo();
      break;
    case "clear-all":
      // Confirmation is now handled in the WorkflowEditor component via AlertDialog
      handlers.handleClearAll();
      break;
    case "fullscreen":
      handlers.handleFullscreen();
      break;
    // Annotation tools
    case "selection-tool":
      handlers.handleAnnotationTool("select");
      break;
    case "rectangle-tool":
      handlers.handleAnnotationTool("rectangle");
      break;
    case "ellipse-tool":
      handlers.handleAnnotationTool("circle");
      break;
    case "free-draw":
      handlers.handleAnnotationTool("freedraw");
      break;
    case "arrow":
      handlers.handleAnnotationTool("arrow");
      break;
    case "line":
      handlers.handleAnnotationTool("line");
      break;
    case "text":
      handlers.handleAnnotationTool("text");
      break;
    default:
      // Handle other dock items here
      console.log(`Clicked dock item: ${itemId}`);
      break;
  }
};
