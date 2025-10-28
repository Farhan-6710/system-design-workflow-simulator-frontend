/**
 * Custom hook for WorkflowStudio dialog management
 * Handles all dialog state and confirmation logic
 */

import { useState } from "react";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useAnnotationStore } from "@/stores/annotationStore";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";

export const useWorkflowDialogs = () => {
  // Dialog states
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);

  // Store actions
  const resetWorkflowStore = useWorkflowStore((state) => state.reset);
  const { clearHistory: clearAnnotationHistory } = useAnnotationStore();
  const canvasControls = useCanvasControlsContext();

  // Simple dialog handlers - no useCallback needed for simple setters
  const showClearConfirmation = () => setShowClearDialog(true);
  const showRefreshConfirmation = () => setShowRefreshDialog(true);
  const handleClearCancel = () => setShowClearDialog(false);
  const handleRefreshCancel = () => setShowRefreshDialog(false);

  // Business logic handlers - these do more work
  const handleClearConfirm = () => {
    clearAnnotationHistory();
    setShowClearDialog(false);
  };

  const handleRefreshConfirm = () => {
    resetWorkflowStore();
    clearAnnotationHistory();
    canvasControls.resetViewport();
    setShowRefreshDialog(false);
  };

  return {
    // Dialog states
    showClearDialog,
    showRefreshDialog,

    // Dialog triggers
    showClearConfirmation,
    showRefreshConfirmation,

    // Confirmation handlers
    handleClearConfirm,
    handleRefreshConfirm,
    handleClearCancel,
    handleRefreshCancel,
  };
};
