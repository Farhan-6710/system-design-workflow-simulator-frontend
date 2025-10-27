import React, { useRef, useState, useEffect, useCallback } from "react";
import type {
  AnnotationLayerHandle,
  Tool,
} from "./annotation-layer/AnnotationLayer";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { NodeHandlers, EdgeHandlers } from "@/types/workflow-studio/workflow";
import { WorkflowHeader, WorkflowCanvas, WorkflowFooter } from ".";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useAnnotationStore } from "@/stores/annotationStore";
import { useWorkflowCanvas } from "@/hooks/useWorkflowCanvas";
import { WorkflowProvider } from "@/contexts/WorkflowContext";
import { CanvasControlsProvider } from "@/contexts/CanvasControlsContext";
import {
  FullscreenProvider,
  useFullscreenContext,
} from "@/contexts/FullscreenContext";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";
import { canvasDockItems } from "@/data/canvasDockItems";
import {
  createDockItemHandlers,
  handleDockItemClick,
} from "@/utils/workflow-studio/dockHandlers";
import SidebarRight from "./sidebar-right/SidebarRight";
import DockComponent from "../../atoms/DockComponent";
import RunButton from "./RunButton";
import ZoomIndicator from "./ZoomIndicator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import "@/styles/workflowAnimations.css";

const WorkflowEditorContent: React.FC = () => {
  // Use annotation store instead of local state
  const {
    activeTool,
    selectTool,
    clearHistory: clearAnnotationHistory,
  } = useAnnotationStore();

  // Refs for annotation layer integration
  const annotationLayerRef = useRef<AnnotationLayerHandle>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Clear confirmation dialog state
  const [showClearDialog, setShowClearDialog] = useState(false);

  const { isFullscreen, exitFullscreen, toggleFullscreen } =
    useFullscreenContext();

  /**
   * Handle annotation persistence across fullscreen transitions
   * Simplified since our new annotation store handles persistence automatically
   */
  useEffect(() => {
    // Our new annotation store handles persistence automatically,
    // so we don't need complex manual persistence logic here
    if (annotationLayerRef.current) {
      console.log("Annotation layer ref updated for fullscreen:", isFullscreen);
    }
  }, [isFullscreen]);
  /**
   * Handle fullscreen toggle - save first, then toggle
   */
  const handleFullscreenToggle = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  /**
   * Handle fullscreen exit - save first, then exit
   */
  const handleExitFullscreen = useCallback(() => {
    exitFullscreen();
  }, [exitFullscreen]);

  // Handle confirmed clear action
  const handleConfirmedClear = useCallback(() => {
    annotationLayerRef.current?.clear();
    clearAnnotationHistory();
    // Save state after clear
    setShowClearDialog(false);
  }, [clearAnnotationHistory]);

  // Canvas controls - clean and simple!
  const canvasControls = useCanvasControlsContext();
  const { MIN_ZOOM, MAX_ZOOM } = canvasControls;
  const dockHandlers = createDockItemHandlers(
    canvasControls,
    { toggleFullscreen: handleFullscreenToggle },
    {
      setActiveTool: (tool: Tool) => {
        selectTool(tool); // Use store's selectTool which auto-manages visibility
      },
      undo: () => {
        annotationLayerRef.current?.undo();
      },
      redo: () => {
        annotationLayerRef.current?.redo();
      },
      clearAll: () => {
        // Show confirmation dialog instead of clearing immediately
        setShowClearDialog(true);
      },
    }
  );

  const handleWorkflowDockItemClick = (itemId: string) => {
    handleDockItemClick(itemId, dockHandlers);
  };

  // State management using direct Zustand selectors
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const selectedNode = useWorkflowStore((state) => state.selectedNode);
  const selectedEdge = useWorkflowStore((state) => state.selectedEdge);
  const draggingNode = useWorkflowStore((state) => state.draggingNode);
  const tempLine = useWorkflowStore((state) => state.tempLine);
  const runCode = useWorkflowStore((state) => state.runCode);

  // Actions using direct Zustand selectors
  const addNode = useWorkflowStore((state) => state.addNode);
  const clearSelection = useWorkflowStore((state) => state.clearSelection);
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const setRunCode = useWorkflowStore((state) => state.setRunCode);

  // Optimized interaction handlers using the new hook architecture
  const workflowCanvas = useWorkflowCanvas({ canvasRef });
  const {
    handleNodeSelect,
    handleNodeDragStart,
    handleConnectionStart,
    handleConnectionEnd,
    handleNodeDelete,
  } = workflowCanvas.nodeInteractions;

  const { handleEdgeSelect, handleEdgeDelete } =
    workflowCanvas.edgeInteractions;

  // Handler objects for cleaner prop passing
  const nodeHandlers: NodeHandlers = {
    onMouseDown: handleNodeDragStart,
    onSelect: (nodeId: number) => handleNodeSelect(nodeId),
    onStartConnection: handleConnectionStart,
    onEndConnection: handleConnectionEnd,
    onDelete: (nodeId: number) => handleNodeDelete(nodeId),
  };

  const edgeHandlers: EdgeHandlers = {
    onDelete: (edgeId: string) => handleEdgeDelete(edgeId),
    onSelect: (edgeId: string) => handleEdgeSelect(edgeId),
  };

  // Custom mouse up handler to clear selections when clicking on canvas background
  const handleCanvasMouseUp = () => {
    // Check if we're ending a drag operation before calling the handler
    const wasDragging = draggingNode !== null;

    // Call the original handler (this will clear draggingNode)
    workflowCanvas.handleMouseUp();

    // Only clear selection if we weren't dragging a node
    // This prevents clearing selection when finishing a node drag
    if (!wasDragging) {
      console.log("🖱️ Canvas clicked - Clearing selection");
      clearSelection();
    }
  };

  const workflowContent = (
    <WorkflowProvider>
      <div className="relative flex h-full">
        {/* Main content area - with right margin for sidebar */}
        <div className="flex-1 flex flex-col mr-[74px]">
          {/* Only show header in normal mode, not in fullscreen */}
          {!isFullscreen && <WorkflowHeader onAddNode={addNode} />}

          <div
            className="flex-1 flex flex-col select-none bg-white dark:bg-slate-950 relative"
            onMouseLeave={workflowCanvas.handleMouseUp}
            ref={containerRef}
          >
            {/* Workflow Canvas */}
            <div className="flex-1 flex relative">
              <WorkflowCanvas
                ref={canvasRef}
                nodes={nodes}
                edges={edges}
                tempLine={tempLine}
                selectedNode={selectedNode}
                selectedEdge={selectedEdge}
                draggingNode={draggingNode}
                nodeHandlers={nodeHandlers}
                edgeHandlers={edgeHandlers}
                onMouseMove={workflowCanvas.handleMouseMove}
                onMouseUp={handleCanvasMouseUp}
                runCode={runCode}
                activeTool={activeTool}
                annotationLayerRef={annotationLayerRef}
                onAnnotationToolChange={selectTool}
              />

              {/* Dock Navigation - positioned in top-left of workflow editor */}
              <DockComponent
                collapsible={false}
                position="top-left"
                responsive="top-left"
                items={canvasDockItems}
                onItemClick={handleWorkflowDockItemClick}
                activeItem={activeTool}
              />

              {/* Run Button - positioned below DockNavigation */}
              <div className="absolute bottom-4 right-4 z-20">
                <RunButton runCode={runCode} onToggle={setRunCode} />
              </div>

              {/* Zoom Indicator - positioned on the right side before sidebar */}
              <div className="absolute top-4 right-4 z-20">
                <ZoomIndicator
                  currentZoom={canvasControls.transform.scale}
                  minZoom={MIN_ZOOM}
                  maxZoom={MAX_ZOOM}
                  onZoomChange={canvasControls.setZoom}
                  onResetZoom={canvasControls.resetViewport}
                />
              </div>
            </div>

            {!isFullscreen && (
              <WorkflowFooter
                nodeCount={nodes.length}
                edgeCount={edges.length}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar - now sibling to main content, extends full height */}
        <SidebarRight
          nodes={nodes}
          onAddNode={addNode}
          onUpdateNode={updateNode}
        />
      </div>
    </WorkflowProvider>
  );

  return (
    <>
      {/* Clear All Confirmation Dialog - Always render at top level with high z-index */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Drawings?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your drawings on the canvas. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedClear}>
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Normal workflow content */}
      {!isFullscreen && workflowContent}

      {/* Fullscreen content using Portal */}
      {isFullscreen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950">
            {/* Exit fullscreen button */}
            <button
              onClick={handleExitFullscreen}
              className="fixed top-6 left-24 z-[10000] w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
              title="Exit Fullscreen"
            >
              <X
                size={20}
                className="text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors"
              />
            </button>

            {/* Fullscreen workflow content */}
            {workflowContent}
          </div>,
          document.body
        )}
    </>
  );
};

const WorkflowStudio: React.FC = () => {
  return (
    <FullscreenProvider>
      <CanvasControlsProvider>
        <WorkflowEditorContent />
      </CanvasControlsProvider>
    </FullscreenProvider>
  );
};

export default WorkflowStudio;
