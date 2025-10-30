/**
 * Workflow Event Handlers
 * Core mouse/touch interaction handlers for nodes, edges, and canvas
 * Handles dragging, connecting, selection, and coordinate transformations
 */

import React from "react";
import { useWorkflowStore } from "@/stores/workflowStore";
import { OUTPUT_PORT_OFFSET_X, OUTPUT_PORT_OFFSET_Y } from "@/constants/canvas";

// ============================================================================
// Canvas Mouse & Touch Handlers
// ============================================================================

export const createCanvasHandlers = (coordinateUtils?: {
  getCanvasCoordinates: (
    clientX: number,
    clientY: number
  ) => { x: number; y: number };
}) => {
  return {
    onMouseMove: (event: React.MouseEvent) => {
      const {
        draggingNode,
        dragOffset,
        connecting,
        tempLine,
        nodes,
        setNodes,
        setTempLine,
      } = useWorkflowStore.getState();

      if (draggingNode !== null) {
        // Handle node dragging
        const canvasCoords = coordinateUtils?.getCanvasCoordinates(
          event.clientX,
          event.clientY
        );
        if (canvasCoords) {
          const updatedNodes = nodes.map((node) =>
            node.id === draggingNode
              ? {
                  ...node,
                  x: canvasCoords.x - dragOffset.x,
                  y: canvasCoords.y - dragOffset.y,
                }
              : node
          );
          setNodes(updatedNodes);
        }
      } else if (connecting !== null && tempLine) {
        // Handle connection line drawing
        const canvasCoords = coordinateUtils?.getCanvasCoordinates(
          event.clientX,
          event.clientY
        );
        if (canvasCoords) {
          setTempLine({
            ...tempLine,
            x2: canvasCoords.x,
            y2: canvasCoords.y,
          });
        }
      }
    },

    onMouseUp: () => {
      const { setDraggingNode, setConnecting, setTempLine } =
        useWorkflowStore.getState();
      setDraggingNode(null);
      setConnecting(null);
      setTempLine(null);
    },

    onClick: () => {
      const { setSelectedNode, setSelectedEdge, setSidebarRightExpanded } =
        useWorkflowStore.getState();

      // Clear all selections when clicking on empty canvas
      setSelectedNode(null);
      setSelectedEdge(null);
      setSidebarRightExpanded(false);
    },
  };
};

// ============================================================================
// Node Interaction Handlers
// ============================================================================

export const createNodeHandlers = (coordinateUtils?: {
  getCanvasCoordinates: (
    clientX: number,
    clientY: number
  ) => { x: number; y: number };
}) => {
  return {
    onMouseDown: (event: React.MouseEvent, nodeId: number) => {
      event.stopPropagation();
      const { setDraggingNode, setDragOffset } = useWorkflowStore.getState();

      // Use canvas coordinates if available, otherwise fall back to element coordinates
      let dragOffset;
      if (coordinateUtils) {
        const canvasCoords = coordinateUtils.getCanvasCoordinates(
          event.clientX,
          event.clientY
        );
        const { nodes } = useWorkflowStore.getState();
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          dragOffset = {
            x: canvasCoords.x - node.x,
            y: canvasCoords.y - node.y,
          };
        } else {
          dragOffset = { x: 0, y: 0 };
        }
      } else {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        dragOffset = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      }

      setDraggingNode(nodeId);
      setDragOffset(dragOffset);
    },

    onSelect: (nodeId: number) => {
      const {
        setSelectedNode,
        setSelectedEdge,
        setSidebarRightExpanded,
        setSelectedTab,
      } = useWorkflowStore.getState();

      // Clear edge selection first, then set node selection
      setSelectedEdge(null);
      setSelectedNode(nodeId);
      setSidebarRightExpanded(true);
      setSelectedTab("selected-edge/node");
    },

    onStartConnection: (event: React.MouseEvent, nodeId: number) => {
      event.stopPropagation();
      const { setConnecting, setTempLine, nodes } = useWorkflowStore.getState();

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      // Calculate output port position
      // Node is 55px x 55px with center at node.x, node.y
      // Output port is positioned at right edge and center vertically
      const outputPortX = node.x + OUTPUT_PORT_OFFSET_X;
      const outputPortY = node.y + OUTPUT_PORT_OFFSET_Y;

      setConnecting(nodeId);
      setTempLine({
        x1: outputPortX,
        y1: outputPortY,
        x2: outputPortX,
        y2: outputPortY,
      });
    },

    onEndConnection: (event: React.MouseEvent, targetNodeId: number) => {
      event.stopPropagation();
      const { connecting, addEdge, setConnecting, setTempLine } =
        useWorkflowStore.getState();

      if (connecting && connecting !== targetNodeId) {
        addEdge(connecting, targetNodeId);
      }

      setConnecting(null);
      setTempLine(null);
    },

    onDelete: (nodeId: number) => {
      const { deleteNode } = useWorkflowStore.getState();
      deleteNode(nodeId);
    },
  };
};

// ============================================================================
// Edge Interaction Handlers
// ============================================================================

export const createEdgeHandlers = () => {
  return {
    onSelect: (edgeId: string) => {
      const {
        setSelectedEdge,
        setSelectedNode,
        setSidebarRightExpanded,
        setSelectedTab,
      } = useWorkflowStore.getState();

      // Clear node selection first, then set edge selection
      setSelectedNode(null);
      setSelectedEdge(edgeId);
      setSidebarRightExpanded(true);
      setSelectedTab("selected-edge/node");
    },

    onDelete: (edgeId: string) => {
      const { deleteEdge } = useWorkflowStore.getState();
      deleteEdge(edgeId);
    },
  };
};
