/**
 * Zustand store for annotation layer state management
 * Simple, clean state management for drawing tools and canvas state
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Tool } from "@/components/main-sections/workflow-studio/annotation-layer/AnnotationLayer";

export interface CanvasState {
  version: string;
  objects: Record<string, unknown>[];
}

interface AnnotationState {
  // UI State
  activeTool: Tool;
  isFullscreen: boolean;

  // Canvas State
  canvasState: CanvasState | null;

  // History State
  history: CanvasState[];
  historyIndex: number;
  isLoadingFromHistory: boolean;

  // Actions
  setActiveTool: (tool: Tool) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setCanvasState: (state: CanvasState | null) => void;

  // History Actions
  saveToHistory: (state: CanvasState) => void;
  undo: () => CanvasState | null;
  redo: () => CanvasState | null;
  clearHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Simple tool selection
  selectTool: (tool: Tool) => void;
}

export const useAnnotationStore = create<AnnotationState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeTool: "select",
      isFullscreen: false,
      canvasState: null,

      // History state
      history: [],
      historyIndex: -1,
      isLoadingFromHistory: false,

      // Basic setters
      setActiveTool: (tool) => set({ activeTool: tool }),
      setFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
      setCanvasState: (state) => set({ canvasState: state }),

      // History management
      saveToHistory: (state) => {
        const { history, historyIndex, isLoadingFromHistory } = get();

        // Don't save during undo/redo operations
        if (isLoadingFromHistory) return;

        // Trim history at current index and add new state
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(state);

        // Keep only last 50 states for memory management
        const trimmedHistory =
          newHistory.length > 50 ? newHistory.slice(-50) : newHistory;
        const newIndex = trimmedHistory.length - 1;

        set({
          history: trimmedHistory,
          historyIndex: newIndex,
          canvasState: state,
        });
      },

      undo: () => {
        const { history, historyIndex } = get();

        if (historyIndex < 0) return null;

        const newIndex = historyIndex - 1;

        const emptyState: CanvasState = { version: "1.0", objects: [] };
        const stateToRestore = newIndex >= 0 ? history[newIndex] : emptyState;

        set({
          historyIndex: newIndex,
          canvasState: stateToRestore,
          isLoadingFromHistory: true,
        });

        // Reset loading flag after a short delay
        setTimeout(() => set({ isLoadingFromHistory: false }), 10);

        return stateToRestore;
      },

      redo: () => {
        const { history, historyIndex } = get();

        if (historyIndex >= history.length - 1) return null;

        const newIndex = historyIndex + 1;
        const state = history[newIndex];

        set({
          historyIndex: newIndex,
          canvasState: state,
          isLoadingFromHistory: true,
        });

        // Reset loading flag after a short delay
        setTimeout(() => set({ isLoadingFromHistory: false }), 10);

        return state;
      },

      clearHistory: () => {
        set({
          history: [],
          historyIndex: -1,
          canvasState: { version: "1.0", objects: [] },
        });
      },

      canUndo: () => {
        const { historyIndex } = get();
        return historyIndex > 0;
      },

      canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
      },

      // Simple tool selection
      selectTool: (tool) => {
        set({
          activeTool: tool,
        });
      },
    }),
    {
      name: "annotation-store",
      // Persist canvas state and history, not UI state
      partialize: (state) => ({
        canvasState: state.canvasState,
        history: state.history,
        historyIndex: state.historyIndex,
      }),
    }
  )
);
