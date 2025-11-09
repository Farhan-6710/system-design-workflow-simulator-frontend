/**
 * Zustand store for workflow editor state management
 * Clean, optimized store with separated concerns
 * Features: localStorage persistence, Immer integration, minimal store logic
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { CanvasTransform } from "@/types/workflow-studio/workflow";
import { WorkflowStore, WorkflowStoreState } from "@/types/workflow-studio";
import {
  edgeExists,
  filterEdgesForNode,
} from "@/utils/workflow-studio/workflow-layer/workflowCoreUtils";
import { createZoomActions } from "@/utils/workflow-studio/canvasViewportUtils";
import { createNode, createEdge } from "@/utils/store/workflowStoreHelpers";
import { initialEdges, initialNodes } from "@/constants/initialNodesAndEdges";
import { ZOOM_BASELINE } from "@/constants/canvas";

// Re-export constants for backward compatibility
export { MIN_ZOOM, MAX_ZOOM, ZOOM_BASELINE } from "@/constants/canvas";

// Create zoom action utilities
const zoomActions = createZoomActions();

// Initial state
const initialState: WorkflowStoreState = {
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  selectedEdge: null,
  draggingNode: null,
  dragOffset: { x: 0, y: 0 },
  connecting: null,
  tempLine: null,
  isFullScreen: false,
  sidebarRightExpanded: false,
  selectedTab: null,
  requestsPerSecond: 1,
  runCode: false,
  canvasTransform: {
    scale: ZOOM_BASELINE, // Start at baseline (displays as 100% to user)
    translateX: 0,
    translateY: 0,
  },
};

// Create the Zustand store with Immer and localStorage persistence
export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    immer((set) => ({
      // Initial state
      ...initialState,

      // Node actions
      addNode: (nodeType) => {
        set((state) => {
          const node = createNode(state.nodes, nodeType);
          state.nodes.push(node);
        });
      },

      deleteNode: (id) => {
        set((state) => {
          state.nodes = state.nodes.filter((n) => n.id !== id);
          state.edges = filterEdgesForNode(state.edges, id);
          if (state.selectedNode === id) {
            state.selectedNode = null;
          }
        });
      },

      updateNode: (nodeId, updates) => {
        set((state) => {
          const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId);
          if (nodeIndex !== -1) {
            Object.assign(state.nodes[nodeIndex], updates);
          }
        });
      },

      updateNodePosition: (nodeId, x, y) => {
        set((state) => {
          const node = state.nodes.find((n) => n.id === nodeId);
          if (node) {
            node.x = x;
            node.y = y;
          }
        });
      },

      // Edge actions
      addEdge: (source, target) => {
        set((state) => {
          if (!edgeExists(state.edges, source, target)) {
            state.edges.push(createEdge(state.edges, source, target));
          }
        });
      },

      deleteEdge: (edgeId) => {
        set((state) => {
          state.edges = state.edges.filter((e) => e.id !== edgeId);
        });
      },

      // UI state setters
      setSelectedNode: (id) => {
        set((state) => {
          state.selectedNode = id;
        });
      },

      setSelectedEdge: (id) => {
        set((state) => {
          state.selectedEdge = id;
        });
      },

      setDraggingNode: (id) => {
        set((state) => {
          state.draggingNode = id;
        });
      },

      setDragOffset: (offset) => {
        set((state) => {
          state.dragOffset = offset;
        });
      },

      setConnecting: (id) => {
        set((state) => {
          state.connecting = id;
        });
      },

      setTempLine: (line) => {
        set((state) => {
          state.tempLine = line;
        });
      },

      // Sidebar setters
      setSidebarRightExpanded: (expanded) => {
        set((state) => {
          state.sidebarRightExpanded = expanded;
        });
      },

      setSelectedTab: (tab) => {
        set((state) => {
          state.selectedTab = tab;
        });
      },

      // Simulation setters
      setRequestsPerSecond: (value) => {
        set((state) => {
          state.requestsPerSecond = value;
        });
      },

      setRunCode: (value) => {
        set((state) => {
          state.runCode = value;
        });
      },

      // Canvas actions
      setCanvasTransform: (transform) => {
        set((state) => {
          state.canvasTransform = transform;
        });
      },

      // Set canvas transform with boundary constraints
      setCanvasTransformConstrained: (
        transform: CanvasTransform,
        canvasWidth = 800,
        canvasHeight = 600
      ) => {
        set((state) => {
          state.canvasTransform = zoomActions.constrainPan(
            transform,
            canvasWidth,
            canvasHeight
          );
        });
      },

      updateCanvasTransform: (updates) => {
        set((state) => {
          Object.assign(state.canvasTransform, updates);
        });
      },

      // Zoom actions - using clean utility functions
      zoomIn: (canvasWidth = 800, canvasHeight = 600) => {
        set((state) => {
          state.canvasTransform = zoomActions.zoomIn(
            state.canvasTransform,
            canvasWidth,
            canvasHeight
          );
        });
      },

      zoomOut: (canvasWidth = 800, canvasHeight = 600) => {
        set((state) => {
          state.canvasTransform = zoomActions.zoomOut(
            state.canvasTransform,
            canvasWidth,
            canvasHeight
          );
        });
      },

      setZoom: (scale, canvasWidth = 800, canvasHeight = 600) => {
        set((state) => {
          state.canvasTransform = zoomActions.setZoom(
            state.canvasTransform,
            scale,
            canvasWidth,
            canvasHeight
          );
        });
      },

      resetViewport: () => {
        set((state) => {
          state.canvasTransform = zoomActions.resetViewport();
        });
      },

      zoomToFit: (bounds) => {
        set((state) => {
          state.canvasTransform = zoomActions.zoomToFit(bounds);
        });
      },

      // Bulk operations
      setNodes: (nodes) => {
        set((state) => {
          state.nodes = nodes;
        });
      },

      setEdges: (edges) => {
        set((state) => {
          state.edges = edges;
        });
      },

      // Utility actions
      reset: () => {
        set((state) => ({ ...initialState, isFullScreen: state.isFullScreen }));
      },

      clearSelection: () => {
        set((state) => {
          state.selectedNode = null;
          state.selectedEdge = null;
          state.draggingNode = null;
          state.connecting = null;
          state.tempLine = null;
          // Also collapse sidebar when clearing all selections
          state.sidebarRightExpanded = false;
          state.selectedTab = null;
        });
      },

      // Fullscreen actions
      toggleFullScreen: () => {
        set((state) => {
          state.isFullScreen = !state.isFullScreen;
        });
      },

      setFullScreen: (isFullScreen) => {
        set((state) => {
          state.isFullScreen = isFullScreen;
        });
      },
    })),
    {
      name: "workflow-editor-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data, not temporary UI state
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        requestsPerSecond: state.requestsPerSecond,
        runCode: state.runCode, // Persist run code as user preference
        canvasTransform: state.canvasTransform, // Persist zoom and pan position
        // Note: dragOffset is for individual node dragging (temporary), not persisted
        isFullScreen: state.isFullScreen,
      }),
      // Reset temporary UI state on rehydration (keep persistent preferences)
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reset temporary UI state
          state.selectedNode = null;
          state.draggingNode = null;
          state.dragOffset = { x: 0, y: 0 };
          state.connecting = null;
          state.tempLine = null;
          // Keep runCode and canvasTransform as they are persistent user preferences
        }
      },
    }
  )
);
