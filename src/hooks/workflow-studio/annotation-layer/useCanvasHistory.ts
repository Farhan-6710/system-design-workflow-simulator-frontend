/**
 * Canvas history management hook
 * Handles undo/redo functionality and save operations
 */

import { useRef, useEffect, useCallback } from "react";
import { useAnnotationStore } from "@/stores/annotationStore";
import {
  serializeCanvas,
  restoreCanvas,
  debounce,
  type FabricCanvas,
} from "@/utils/workflow-studio/annotation-layer";

export interface UseCanvasHistoryProps {
  fabricRef: React.RefObject<FabricCanvas | null>;
  isLoadingFromHistory: boolean;
}

export const useCanvasHistory = ({
  fabricRef,
  isLoadingFromHistory,
}: UseCanvasHistoryProps) => {
  const {
    canvasState,
    saveToHistory,
    undo: storeUndo,
    redo: storeRedo,
    setCanvasState,
  } = useAnnotationStore();

  // Debounced save function
  const debouncedSaveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    debouncedSaveRef.current = debounce(() => {
      if (fabricRef.current && !isLoadingFromHistory) {
        const state = serializeCanvas(fabricRef.current);
        saveToHistory(state);
      }
    }, 300);
  }, [fabricRef, saveToHistory, isLoadingFromHistory]);

  // Immediate save function
  const immediateSave = useCallback(() => {
    if (fabricRef.current && !isLoadingFromHistory) {
      const state = serializeCanvas(fabricRef.current);
      saveToHistory(state);
    }
  }, [fabricRef, saveToHistory, isLoadingFromHistory]);

  // Undo/Redo handlers
  const handleUndo = useCallback(async () => {
    const state = storeUndo();
    if (state && fabricRef.current) {
      await restoreCanvas(fabricRef.current, state);
      setCanvasState(state);
    }
  }, [fabricRef, storeUndo, setCanvasState]);

  const handleRedo = useCallback(async () => {
    const state = storeRedo();
    if (state && fabricRef.current) {
      await restoreCanvas(fabricRef.current, state);
      setCanvasState(state);
    }
  }, [fabricRef, storeRedo, setCanvasState]);

  // Restore canvas when store state changes (for undo/redo)
  useEffect(() => {
    if (!fabricRef.current || !canvasState || !isLoadingFromHistory) return;

    restoreCanvas(fabricRef.current, canvasState).catch(console.error);
  }, [fabricRef, canvasState, isLoadingFromHistory]);

  return {
    handleUndo,
    handleRedo,
    immediateSave,
    debouncedSave: debouncedSaveRef.current,
  };
};
