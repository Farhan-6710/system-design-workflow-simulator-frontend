/**
 * Optimized hook for node-specific interactions (drag, select, connect, delete)
 * Separated from canvas coordinate logic for better maintainability
 */

import { useCallback, useRef } from "react";
import { useWorkflowStore } from "@/stores/workflowStore";

interface UseNodeInteractionsProps {
  getCanvasCoordinates: (
    clientX: number,
    clientY: number
  ) => { x: number; y: number };
}

export const useNodeInteractions = ({
  getCanvasCoordinates,
}: UseNodeInteractionsProps) => {
  // Track drag state to prevent selection after drag
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const hasDragged = useRef<boolean>(false);

  // Zustand selectors - subscribe only to what we need
  const nodes = useWorkflowStore((state) => state.nodes);
  const selectedNode = useWorkflowStore((state) => state.selectedNode);
  const draggingNode = useWorkflowStore((state) => state.draggingNode);
  const dragOffset = useWorkflowStore((state) => state.dragOffset);
  const connecting = useWorkflowStore((state) => state.connecting);
  const sidebarRightExpanded = useWorkflowStore(
    (state) => state.sidebarRightExpanded
  );

  // Actions
  const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
  const setSelectedEdge = useWorkflowStore((state) => state.setSelectedEdge);
  const setDraggingNode = useWorkflowStore((state) => state.setDraggingNode);
  const setDragOffset = useWorkflowStore((state) => state.setDragOffset);
  const setConnecting = useWorkflowStore((state) => state.setConnecting);
  const setTempLine = useWorkflowStore((state) => state.setTempLine);
  const setSidebarRightExpanded = useWorkflowStore(
    (state) => state.setSidebarRightExpanded
  );
  const setSelectedTab = useWorkflowStore((state) => state.setSelectedTab);
  const updateNodePosition = useWorkflowStore(
    (state) => state.updateNodePosition
  );
  const addEdge = useWorkflowStore((state) => state.addEdge);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  // Node selection with toggle behavior and logging
  const handleNodeSelect = useCallback(
    (nodeId: number) => {
      // Don't select if a drag just occurred
      if (hasDragged.current) {
        hasDragged.current = false; // Reset for next interaction
        return;
      }

      // Find and log the full node object
      const selectedNodeObject = nodes.find((node) => node.id === nodeId);
      console.log("🎯 Node clicked - Full node object:", selectedNodeObject);

      // If node is already selected, don't deselect it (keep it selected)
      // This prevents deselection when delete button click bubbles up
      if (selectedNode === nodeId) {
        // console.log("🎯 Node Already Selected - Keeping Selection:", nodeId);
        return;
      }

      // Only select if it's a different node
      setSelectedEdge(null); // Clear edge selection when node is selected
      setSelectedNode(nodeId);

      // Expand sidebar and set analytics tab when selecting a new node
      if (!sidebarRightExpanded) {
        setSidebarRightExpanded(true);
      }
      setSelectedTab("selected-edge/node");
    },
    [
      nodes,
      selectedNode,
      setSelectedNode,
      setSelectedEdge,
      sidebarRightExpanded,
      setSidebarRightExpanded,
      setSelectedTab,
    ]
  );

  // Start dragging a node
  const handleNodeDragStart = useCallback(
    (e: React.MouseEvent, nodeId: number) => {
      if (e.button !== 0) return; // Only left click

      e.stopPropagation();
      e.preventDefault();

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      // Track initial mouse position for drag detection
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      hasDragged.current = false;

      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
      setDraggingNode(nodeId);
      setDragOffset({
        x: canvasCoords.x - node.x,
        y: canvasCoords.y - node.y,
      });
    },
    [nodes, setDraggingNode, setDragOffset, getCanvasCoordinates]
  );

  // Update node position during drag
  const handleNodeDrag = useCallback(
    (e: React.MouseEvent) => {
      if (draggingNode === null) return;

      // Check if we've moved enough to consider this a drag operation
      if (dragStartPos.current && !hasDragged.current) {
        const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
        const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
        const dragThreshold = 3; // Minimum pixels to consider as drag

        if (deltaX > dragThreshold || deltaY > dragThreshold) {
          hasDragged.current = true;
        }
      }

      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
      const newX = canvasCoords.x - dragOffset.x;
      const newY = canvasCoords.y - dragOffset.y;

      updateNodePosition(draggingNode, newX, newY);
    },
    [draggingNode, dragOffset, updateNodePosition, getCanvasCoordinates]
  );

  // End node dragging
  const handleNodeDragEnd = useCallback(() => {
    setDraggingNode(null);
    // Note: We don't reset hasDragged here because onClick will fire after this
    // and we need to check if dragging occurred to prevent selection
    dragStartPos.current = null;
  }, [setDraggingNode]);

  // Start connection from node
  const handleConnectionStart = useCallback(
    (e: React.MouseEvent, nodeId: number) => {
      e.stopPropagation();

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      // Start from output port (right side of node)
      const outputPortX = node.x + 28; // w-40 = 160px, so half is 80px
      const outputPortY = node.y;

      setConnecting(nodeId);
      setTempLine({
        x1: outputPortX,
        y1: outputPortY,
        x2: outputPortX,
        y2: outputPortY,
      });
    },
    [nodes, setConnecting, setTempLine]
  );

  // Update connection line during drag
  const handleConnectionDrag = useCallback(
    (e: React.MouseEvent) => {
      if (connecting === null) return;

      const sourceNode = nodes.find((n) => n.id === connecting);
      if (!sourceNode) return;

      // Start from output port (right side of source node)
      const outputPortX = sourceNode.x + 28;
      const outputPortY = sourceNode.y;

      // Get accurate cursor position in canvas coordinates (handles zoom/pan)
      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);

      setTempLine({
        x1: outputPortX,
        y1: outputPortY,
        x2: canvasCoords.x,
        y2: canvasCoords.y,
      });
    },
    [connecting, nodes, setTempLine, getCanvasCoordinates]
  );

  // End connection on target node
  const handleConnectionEnd = useCallback(
    (e: React.MouseEvent, targetId: number) => {
      e.stopPropagation();

      if (connecting !== null && connecting !== targetId) {
        addEdge(connecting, targetId);
      }

      setConnecting(null);
      setTempLine(null);
    },
    [connecting, addEdge, setConnecting, setTempLine]
  );

  // Cancel connection
  const handleConnectionCancel = useCallback(() => {
    setConnecting(null);
    setTempLine(null);
  }, [setConnecting, setTempLine]);

  // Delete node
  const handleNodeDelete = useCallback(
    (nodeId: number) => {
      deleteNode(nodeId);

      console.log("🗑️ Node Deleted Successfully:", nodeId);
    },
    [deleteNode]
  );

  return {
    // State
    draggingNode,
    connecting,

    // Node actions
    handleNodeSelect,
    handleNodeDragStart,
    handleNodeDrag,
    handleNodeDragEnd,
    handleNodeDelete,

    // Connection actions
    handleConnectionStart,
    handleConnectionDrag,
    handleConnectionEnd,
    handleConnectionCancel,
  };
};
