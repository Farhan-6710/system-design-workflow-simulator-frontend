import React, { useRef } from "react";
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
import { useWorkflowDialogs } from "@/hooks/useWorkflowDialogs";
import { useWorkflowDock } from "@/hooks/useWorkflowDock";
import { ConfirmationModal } from "@/components/atoms/ConfirmationModal";
import DockComponent from "../../atoms/DockComponent";
import SidebarRight from "./sidebar-right/SidebarRight";
import RunButton from "./RunButton";
import ZoomIndicator from "./ZoomIndicator";
import { MAX_ZOOM, MIN_ZOOM } from "@/hooks/useCanvasViewport";

const WorkflowEditorContent: React.FC = () => {
  // Direct store selectors for better performance (single subscriptions)
  const nodes = useWorkflowStore((state) => state.nodes);
  const runCode = useWorkflowStore((state) => state.runCode);
  const addNode = useWorkflowStore((state) => state.addNode);
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const setRunCode = useWorkflowStore((state) => state.setRunCode);
  const activeTool = useAnnotationStore((state) => state.activeTool);

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
  const { isFullscreen } = useFullscreenContext();
  const canvasControls = useCanvasControlsContext();

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
              <WorkflowFooter nodeCount={nodeCount} edgeCount={edgeCount} />
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

      {/* Confirmation Dialogs */}
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
