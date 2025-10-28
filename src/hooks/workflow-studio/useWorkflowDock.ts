/**
 * Custom hook for WorkflowStudio dock integration
 * Handles dock handlers creation and item click logic
 */

import { useCallback, useRef } from "react";
import { useAnnotationStore } from "@/stores/annotationStore";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";
import {
  createDockItemHandlers,
  handleDockItemClick,
} from "@/utils/workflow-studio/workflowActions";
import type { AnnotationLayerHandle } from "@/components/main-sections/workflow-studio/annotation-layer/AnnotationLayer";

interface UseWorkflowDockProps {
  showClearConfirmation: () => void;
  showRefreshConfirmation: () => void;
}

export const useWorkflowDock = ({
  showClearConfirmation,
  showRefreshConfirmation,
}: UseWorkflowDockProps) => {
  // Store and context hooks
  const { selectTool } = useAnnotationStore();
  const canvasControls = useCanvasControlsContext();
  const toggleFullscreen = useWorkflowStore((state) => state.toggleFullscreen);

  // Refs
  const annotationLayerRef = useRef<AnnotationLayerHandle>(null);

  // Fullscreen handler
  const handleFullscreenToggle = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  // Create dock handlers
  const dockHandlers = createDockItemHandlers(
    canvasControls,
    { toggleFullscreen: handleFullscreenToggle },
    {
      setActiveTool: selectTool,
      annotationLayerRef:
        annotationLayerRef as React.RefObject<AnnotationLayerHandle>,
    },
    {
      showClearDialog: showClearConfirmation,
      showRefreshDialog: showRefreshConfirmation,
    }
  );

  // Handle dock item clicks
  const handleWorkflowDockItemClick = useCallback(
    (itemId: string) => {
      handleDockItemClick(itemId, dockHandlers);
    },
    [dockHandlers]
  );

  return {
    annotationLayerRef,
    handleWorkflowDockItemClick,
  };
};
