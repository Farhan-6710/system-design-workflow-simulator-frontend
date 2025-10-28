import React, { useRef, useState, useCallback } from "react";
import type { AnnotationLayerHandle } from "./annotation-layer/AnnotationLayer";
import { WorkflowHeader, WorkflowCanvas, WorkflowFooter } from ".";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useAnnotationStore } from "@/stores/annotationStore";
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
} from "@/utils/workflow-studio/workflowActions";
import DockComponent from "../../atoms/DockComponent";
import SidebarRight from "./sidebar-right/SidebarRight";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/atoms/ConfirmationModal";
import RunButton from "./RunButton";
import ZoomIndicator from "./ZoomIndicator";
import { MAX_ZOOM, MIN_ZOOM } from "@/hooks/useCanvasViewport";

const WorkflowEditorContent: React.FC = () => {
  // Use annotation store
  const {
    activeTool,
    selectTool,
    clearHistory: clearAnnotationHistory,
  } = useAnnotationStore();

  // Refs for workspace and annotation integration
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const annotationLayerRef = useRef<AnnotationLayerHandle>(null);

  // Dialog states
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);

  // Fullscreen context
  const { isFullscreen, toggleFullscreen } = useFullscreenContext();

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  // Get workflow data from store
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const runCode = useWorkflowStore((state) => state.runCode);
  const setRunCode = useWorkflowStore((state) => state.setRunCode);

  // Get workflow actions from store
  const addNode = useWorkflowStore((state) => state.addNode);
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const resetWorkflowStore = useWorkflowStore((state) => state.reset);

  // Canvas controls
  const canvasControls = useCanvasControlsContext();

  // Create dock handlers
  const dockHandlers = createDockItemHandlers(
    canvasControls,
    { toggleFullscreen: handleFullscreenToggle },
    {
      setActiveTool: (tool) => {
        selectTool(tool);
      },
      annotationLayerRef:
        annotationLayerRef as React.RefObject<AnnotationLayerHandle>,
    },
    {
      showClearDialog: () => setShowClearDialog(true),
      showRefreshDialog: () => setShowRefreshDialog(true),
    }
  );

  // Handle dock item clicks
  const handleWorkflowDockItemClick = (itemId: string) => {
    handleDockItemClick(itemId, dockHandlers);
  };

  // Confirmation handlers
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

  const workflowContent = (
    <WorkflowProvider>
      <div className="relative flex h-full">
        {/* Main content area - with right margin for sidebar */}
        <div className="flex-1 flex flex-col mr-[74px]">
          {/* Only show header in normal mode, not in fullscreen */}
          {!isFullscreen && <WorkflowHeader onAddNode={addNode} />}

          <div
            className="flex-1 flex flex-col select-none bg-white dark:bg-slate-950 relative"
            ref={containerRef}
          >
            {/* Workflow Canvas */}
            <div className="flex-1 flex relative">
              <WorkflowCanvas
                ref={canvasRef}
                annotationLayerRef={annotationLayerRef}
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
      {workflowContent}

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Annotations</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all annotations from the canvas. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearConfirm}>
              Clear All
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refresh Confirmation Modal */}
      <ConfirmationModal
        open={showRefreshDialog}
        onOpenChange={setShowRefreshDialog}
        title="Reset Everything"
        description="This will reset the entire workflow and clear all annotations. This action cannot be undone."
        confirmText="Reset All"
        onConfirm={handleRefreshConfirm}
        variant="destructive"
      />
    </>
  );
};

// Main Workflow Studio Component
const WorkflowStudio: React.FC = () => {
  return (
    <FullscreenProvider>
      <CanvasControlsProvider>
        <div className="workflow-studio h-full">
          <WorkflowEditorContent />
        </div>
      </CanvasControlsProvider>
    </FullscreenProvider>
  );
};

export default WorkflowStudio;
