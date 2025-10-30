/**
 * Canvas keyboard shortcuts hook
 * Handles keyboard events for canvas operations (undo, redo, delete, escape)
 */

import { useEffect } from "react";
import type { FabricCanvas } from "@/utils/workflow-studio/annotation-layer";

export interface UseCanvasKeyboardShortcutsProps {
  fabricRef: React.RefObject<FabricCanvas | null>;
  immediateSave: () => void;
  handleUndo: () => Promise<void>;
  handleRedo: () => Promise<void>;
}

export const useCanvasKeyboardShortcuts = ({
  fabricRef,
  immediateSave,
  handleUndo,
  handleRedo,
}: UseCanvasKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input fields
      if (
        ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")
      ) {
        return;
      }

      if (e.key === "Escape") {
        if (fabricRef.current) {
          fabricRef.current.discardActiveObject();
          fabricRef.current.renderAll();
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (fabricRef.current) {
          const activeObjects = fabricRef.current.getActiveObjects();
          activeObjects.forEach((obj) => fabricRef.current?.remove(obj));
          fabricRef.current.discardActiveObject();
          fabricRef.current.renderAll();
          immediateSave();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [fabricRef, immediateSave, handleUndo, handleRedo]);

  return null; // This hook doesn't return anything
};
