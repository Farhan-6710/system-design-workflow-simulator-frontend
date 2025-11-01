import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { WorkflowHeader, WorkflowCanvas, WorkflowFooter } from ".";
import { useWorkflowStore } from "@/stores/workflowStore";
import { useAnnotationStore } from "@/stores/annotationStore";
import { WorkflowProvider } from "@/contexts/WorkflowContext";
import { CanvasControlsProvider } from "@/contexts/CanvasControlsContext";
import { useCanvasControlsContext } from "@/contexts/CanvasControlsContext";
import { canvasDockItems } from "@/constants/canvasDockItems";
import { useWorkflowDialogs } from "@/hooks/workflow-studio/useWorkflowDialogs";
import { useWorkflowDock } from "@/hooks/workflow-studio/useWorkflowDock";
import { ConfirmationModal } from "@/components/atoms/ConfirmationModal";
import DockComponent from "../../atoms/DockComponent";
import SidebarRight from "./sidebar-right/SidebarRight";
import RunButton from "./RunButton";
import ZoomIndicator from "./ZoomIndicator";
import { MAX_ZOOM, MIN_ZOOM } from "@/stores/workflowStore";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const WorkflowEditorContent: React.FC = () => {
  // Direct store selectors for better performance (single subscriptions)
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const runCode = useWorkflowStore((state) => state.runCode);
  const addNode = useWorkflowStore((state) => state.addNode);
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const setRunCode = useWorkflowStore((state) => state.setRunCode);
  const activeTool = useAnnotationStore((state) => state.activeTool);
  const isFullScreen = useWorkflowStore((state) => state.isFullScreen);
  const setFullScreen = useWorkflowStore((state) => state.setFullScreen);
  const isSidebarRightExpanded = useWorkflowStore((state) => state.sidebarRightExpanded);

  console.log("nodes:", nodes);
  console.log("edges", edges);

  // Computed values
  const nodeCount = nodes.length;
  const edgeCount = useWorkflowStore((state) => state.edges.length);

  // Custom hooks for complex logic (keep these as they provide value)
  const {
    showClearDialog,
    showRefreshDialog,
    showClearConfirmation,
    showRefreshConfirmation,
    handleClearConfirm,
    handleRefreshConfirm,
    handleClearCancel,
    handleRefreshCancel,
  } = useWorkflowDialogs();

  const { annotationLayerRef, handleWorkflowDockItemClick } = useWorkflowDock({
    showClearConfirmation,
    showRefreshConfirmation,
  });

  // Simple refs for DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Context hooks
  const canvasControls = useCanvasControlsContext();

  // Exit fullscreen handler
  const handleExitFullScreen = () => {
    setFullScreen(false);
  };

  // Confirmation modals component to be reused
  const confirmationModals = (
    <>
      <ConfirmationModal
        open={showClearDialog}
        onOpenChange={handleClearCancel}
        title="Clear All Annotations"
        description="This will clear all annotations from the canvas. This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleClearConfirm}
        variant="destructive"
      />

      <ConfirmationModal
        open={showRefreshDialog}
        onOpenChange={handleRefreshCancel}
        title="Reset Everything"
        description="This will reset the entire workflow and clear all annotations. This action cannot be undone."
        confirmText="Reset All"
        cancelText="Cancel"
        onConfirm={handleRefreshConfirm}
        variant="destructive"
      />
    </>
  );

  const workflowContent = (
    <WorkflowProvider>
      <div className="relative flex h-full">
        {/* Main content area - simplified structure */}
        <div
          className="flex-1 flex flex-col select-none bg-white dark:bg-slate-950"
          ref={containerRef}
        >
          {/* Header */}
          {!isFullScreen && <WorkflowHeader onAddNode={addNode} />}

          {/* Workflow Canvas - takes remaining space */}
          <div className="flex-1 flex relative">
            <WorkflowCanvas
              ref={canvasRef}
              annotationLayerRef={annotationLayerRef}
            />

            {/* Dock Navigation */}
            <DockComponent
              collapsible={false}
              position="top-left"
              direction="vertical"
              tooltipPosition="right"
              items={canvasDockItems}
              onItemClick={handleWorkflowDockItemClick}
              activeItem={activeTool}
            />

            {/* Run Button */}
            <div className="absolute bottom-4 right-4 z-20">
              <RunButton runCode={runCode} onToggle={setRunCode} />
            </div>

            {/* Zoom Indicator */}
            <div
              className={cn(
                isFullScreen ? "top-24" : "top-4",
                "absolute right-4 z-20"
              )}
            >
              <ZoomIndicator
                currentZoom={canvasControls.transform.scale}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                onZoomChange={canvasControls.setZoom}
                onResetZoom={canvasControls.resetViewport}
              />
            </div>
          </div>

          {/* Footer */}
          {!isFullScreen && (
            <WorkflowFooter nodeCount={nodeCount} edgeCount={edgeCount} />
          )}
        </div>

        {/* Right Sidebar - overlay */}
        <SidebarRight onAddNode={addNode} onUpdateNode={updateNode} />
      </div>
    </WorkflowProvider>
  );

  return (
    <>
      {/* Normal workflow content */}
      {!isFullScreen && (
        <>
          {workflowContent}
          {/* Confirmation modals for normal mode */}
          {confirmationModals}
        </>
      )}

      {/* Fullscreen content using Portal */}
      {isFullScreen &&
        createPortal(
          <div className="fixed inset-0 z-40 bg-white dark:bg-slate-950">
            {/* Exit fullscreen button */}
            <button
              onClick={handleExitFullScreen}
              className={cn(
                "fixed top-6 z-40 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all ease-in-out duration-300 flex items-center justify-center group",
                isSidebarRightExpanded ? "right-88" : "right-24"
              )}
              title="Exit Fullscreen"
            >
              <X
                size={20}
                className="text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors"
              />
            </button>

            {/* Fullscreen workflow content */}
            {workflowContent}

            {/* Confirmation modals for fullscreen mode */}
            {confirmationModals}
          </div>,
          document.body
        )}
    </>
  );
};

// Main Workflow Studio Component
const WorkflowStudio: React.FC = () => {
  return (
    <CanvasControlsProvider>
      <div className="workflow-studio h-full">
        <WorkflowEditorContent />
      </div>
    </CanvasControlsProvider>
  );
};

export default WorkflowStudio;
