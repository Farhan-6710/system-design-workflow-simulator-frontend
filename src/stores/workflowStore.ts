/**
 * Zustand store for workflow editor state management
 * Features: localStorage persistence, clean API, optimized performance
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Node, NodeType } from "@/types/workflow-studio/workflow";
import { WorkflowStore, WorkflowStoreState } from "@/types/workflow-studio";
import {
  generateNodeId,
  generateEdgeId,
  generateRandomPosition,
  edgeExists,
  filterEdgesForNode,
} from "@/utils/workflow-studio/workflow";
import { initialNodes, initialEdges } from "@/data/initialNodes";

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
  sidebarRightExpanded: false,
  selectedTab: null,
  requestsPerSecond: 1,
  runCode: false,
  canvasTransform: {
    scale: 1,
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
          const newId = generateNodeId(state.nodes);
          const position = generateRandomPosition();

          const validTypes: NodeType[] = ["start", "process", "end"];
          const nodePositionType =
            nodeType?.type && validTypes.includes(nodeType.type as NodeType)
              ? (nodeType.type as NodeType)
              : "process";

          const newNode: Node = {
            id: newId,
            label: nodeType?.label || `Node ${newId}`,
            x: position.x,
            y: position.y,
            type: nodePositionType,
            icon: nodeType?.icon || "Circle",
            configurations: nodeType?.configurations || {},
          };

          state.nodes.push(newNode);
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
            state.edges.push({
              id: generateEdgeId(state.edges),
              source,
              target,
            });
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

      updateCanvasTransform: (updates) => {
        set((state) => {
          Object.assign(state.canvasTransform, updates);
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
        set(() => ({ ...initialState }));
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
