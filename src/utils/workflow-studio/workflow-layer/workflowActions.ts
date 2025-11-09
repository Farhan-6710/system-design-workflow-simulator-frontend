/**
 * Workflow Actions & High-Level Operations
 * Focused on business logic and workflow management
 */

import React from "react";
import { CanvasControlsHook } from "@/types/workflow-studio/workflow";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useAnnotationStore } from "@/stores/annotationStore";
import type {
  Tool,
  AnnotationLayerHandle,
} from "@/components/main-sections/workflow-studio/annotation-layer/AnnotationLayer";

// ============================================================================
// Workflow Store Actions
// ============================================================================

export const createWorkflowActions = () => {
  return {
    resetAllStores: () => {
      const { reset } = useWorkflowStore.getState();
      const { clearHistory } = useAnnotationStore.getState();

      reset();
      clearHistory();
    },

    clearWorkflow: () => {
      const { reset } = useWorkflowStore.getState();
      reset();
    },

    addNode: (nodeType: {
      label: string;
      icon: string;
      type?: string;
      configurations?: Record<string, string | number | boolean>;
    }) => {
      const { addNode } = useWorkflowStore.getState();
      addNode(nodeType);
    },

    updateNode: (nodeId: string, updates: { label: string; icon: string }) => {
      const { updateNode } = useWorkflowStore.getState();
      updateNode(nodeId, updates);
    },
  };
};

// ============================================================================
// Dock Item Handlers
// ============================================================================

interface DockItemHandlers {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleResetZoom: () => void;
  handleFullscreen: () => void;
  handleAnnotationTool: (tool: Tool) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleClearAll: () => void;
  handleRefresh: () => void;
}

export const createDockItemHandlers = (
  canvasControls: CanvasControlsHook,
  fullscreenHandlers?: {
    toggleFullScreen: () => void;
  },
  annotationHandlers?: {
    setActiveTool: (tool: Tool) => void;
    annotationLayerRef?: React.RefObject<AnnotationLayerHandle>;
  },
  confirmationHandlers?: {
    showClearDialog: () => void;
    showRefreshDialog: () => void;
  }
): DockItemHandlers => {
  const { zoomIn, zoomOut, resetViewport } = canvasControls;

  return {
    handleZoomIn: zoomIn,
    handleZoomOut: zoomOut,
    handleResetZoom: resetViewport,
    handleFullscreen: fullscreenHandlers?.toggleFullScreen || (() => {}),
    handleAnnotationTool: annotationHandlers?.setActiveTool || (() => {}),
    handleUndo: () => {
      annotationHandlers?.annotationLayerRef?.current?.undo();
    },
    handleRedo: () => {
      annotationHandlers?.annotationLayerRef?.current?.redo();
    },
    handleClearAll: confirmationHandlers?.showClearDialog || (() => {}),
    handleRefresh: confirmationHandlers?.showRefreshDialog || (() => {}),
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
      handlers.handleClearAll();
      break;
    case "refresh":
      handlers.handleRefresh();
      break;
    case "fullscreen":
      handlers.handleFullscreen();
      break;
    // Annotation tools - Fixed to match actual dock item IDs
    case "select":
      handlers.handleAnnotationTool("select");
      break;
    case "rectangle":
      handlers.handleAnnotationTool("rectangle");
      break;
    case "circle":
      handlers.handleAnnotationTool("circle");
      break;
    case "freedraw":
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
      console.log(`Clicked dock item: ${itemId}`);
      break;
  }
};
