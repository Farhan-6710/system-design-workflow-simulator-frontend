/**
 * ======================================================================
 * WORKFLOW STUDIO - COMPREHENSIVE TYPE DEFINITIONS
 * ======================================================================
 *
 * This file contains all type definitions for the workflow studio system,
 * organized by functional areas for better maintainability.
 */

import { ReactNode } from "react";

// ======================================================================
// CORE WORKFLOW TYPES
// ======================================================================

// Basic node position types
export type NodeType = "start" | "process" | "end";

// Node definition with all properties
export interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
  type: NodeType;
  icon: string;
  configurations?: Record<string, string | number | boolean>;
}

// Edge connection between nodes
export interface Edge {
  id: string;
  source: number;
  target: number;
}

// Temporary connection line during drag operations
export interface TempLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Drag offset for node positioning
export interface DragOffset {
  x: number;
  y: number;
}

// ======================================================================
// NODE CONFIGURATION TYPES
// ======================================================================

// Configuration field definition for node properties
export interface NodeConfigField {
  key: string;
  label: string;
  type: "number" | "text" | "select" | "boolean";
  unit?: string;
  options?: { value: string; label: string }[];
  defaultValue: string | number | boolean;
  min?: number;
  max?: number;
}

// Collection of configuration fields for a node
export interface NodeConfiguration {
  [key: string]: NodeConfigField;
}

// Complete node option definition with all metadata
export interface NodeOption {
  id: string;
  label: string;
  icon: string;
  category: string;
  type: NodeType;
  component: ReactNode;
  configurations: NodeConfiguration;
}

// Node definition for available node types in the sidebar
export interface NodeDefinition {
  id: string;
  label: string;
  description: string;
}

// Node category definitions
export type NodeCategory =
  | "Entry Layer"
  | "Routing & Compute"
  | "Data & Storage"
  | "Performance & Access"
  | "Monitoring & Infra";

// Configuration field utility types
export type ConfigFieldType = NodeConfigField["type"];
export type ConfigFieldValue = NodeConfigField["defaultValue"];

// Selection option for select-type config fields
export interface ConfigSelectOption {
  value: string;
  label: string;
}

// ======================================================================
// CANVAS & VIEWPORT TYPES
// ======================================================================

// Canvas transformation state
export interface CanvasTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

// Canvas controls hook interface
export interface CanvasControlsHook {
  transform: CanvasTransform;
  isPanning: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (scale: number) => void;
  resetViewport: () => void;
  zoomToFit: (bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  handlePanStart: (event: React.MouseEvent) => void;
  handlePanMove: (event: React.MouseEvent) => void;
  handlePanEnd: () => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handleTouchMove: (event: React.TouchEvent) => void;
  handleTouchEnd: (event: React.TouchEvent) => void;
  handleWheel: (event: React.WheelEvent) => void;
  getCanvasTransformStyle: () => React.CSSProperties;
  MIN_ZOOM: number;
  MAX_ZOOM: number;
}

// ======================================================================
// ANIMATION & STYLING TYPES
// ======================================================================

// RPS Range definitions with better type safety
export enum RPSRange {
  LOW = "LOW", // 0-500 RPS
  MEDIUM = "MEDIUM", // 500-5000 RPS
  HIGH = "HIGH", // 5000-50000 RPS
}

// Glow types for components
export enum GlowType {
  NONE = "NONE",
  BLUE = "BLUE",
  YELLOW = "YELLOW",
  RED = "RED",
}

// Edge gradient types
export enum EdgeGradientType {
  BLUE = "url(#flowGradient)",
  YELLOW = "url(#flowGradientYellow)",
  RED = "url(#flowGradientRed)",
}

// Animation class types
export type EdgeAnimationClass =
  | "animated-edge"
  | "animated-edge-yellow"
  | "animated-edge-red";

export type NodeGlowClass =
  | "node-glow-blue"
  | "node-glow-yellow"
  | "node-glow-red"
  | "";

// RPS utility types
export type RPSValue = number;
export type AnimationDuration = number;

// Style configuration interfaces
export interface EdgeStyle {
  gradient: EdgeGradientType;
  className: EdgeAnimationClass;
}

export interface NodeGlowConfig {
  glowType: GlowType;
  className: NodeGlowClass;
}

// ======================================================================
// STATE MANAGEMENT TYPES (ZUSTAND STORE)
// ======================================================================

// Store state interface (legacy - kept for compatibility)
export interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: number | null;
  selectedEdge: string | null;
  draggingNode: number | null;
  dragOffset: DragOffset;
  connecting: number | null;
  tempLine: TempLine | null;
}

// Enhanced store state interface
export interface WorkflowStoreState {
  // Core data
  nodes: Node[];
  edges: Edge[];

  // UI state
  selectedNode: number | null;
  selectedEdge: string | null;
  draggingNode: number | null;
  dragOffset: DragOffset;
  connecting: number | null;
  tempLine: TempLine | null;
  isFullScreen: boolean;

  // Sidebar state
  sidebarRightExpanded: boolean;
  selectedTab: string | null;

  // Simulation state
  requestsPerSecond: number;
  runCode: boolean;

  // Canvas state
  canvasTransform: CanvasTransform;
}

// Store actions interface
export interface WorkflowActions {
  // Node actions
  addNode: (nodeType?: {
    label: string;
    icon: string;
    type?: string;
    configurations?: Record<string, string | number | boolean>;
  }) => void;
  deleteNode: (id: number) => void;
  updateNode: (nodeId: number, updates: Partial<Node>) => void;
  updateNodePosition: (nodeId: number, x: number, y: number) => void;

  // Edge actions
  addEdge: (source: number, target: number) => void;
  deleteEdge: (edgeId: string) => void;

  // UI state setters
  setSelectedNode: (id: number | null) => void;
  setSelectedEdge: (id: string | null) => void;
  setDraggingNode: (id: number | null) => void;
  setDragOffset: (offset: DragOffset) => void;
  setConnecting: (id: number | null) => void;
  setTempLine: (line: TempLine | null) => void;

  // Sidebar setters
  setSidebarRightExpanded: (expanded: boolean) => void;
  setSelectedTab: (tab: string | null) => void;

  // Simulation setters
  setRequestsPerSecond: (value: number) => void;
  setRunCode: (value: boolean) => void;

  // Canvas actions
  setCanvasTransform: (transform: CanvasTransform) => void;
  setCanvasTransformConstrained: (
    transform: CanvasTransform,
    canvasWidth?: number,
    canvasHeight?: number
  ) => void;
  updateCanvasTransform: (updates: Partial<CanvasTransform>) => void;

  // Zoom actions
  zoomIn: (canvasWidth?: number, canvasHeight?: number) => void;
  zoomOut: (canvasWidth?: number, canvasHeight?: number) => void;
  setZoom: (scale: number, canvasWidth?: number, canvasHeight?: number) => void;
  resetViewport: () => void;
  zoomToFit: (bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;

  // Bulk operations
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;

  // Utility actions
  reset: () => void;
  clearSelection: () => void;

  // Fullscreen actions
  toggleFullScreen: () => void;
  setFullScreen: (isFullScreen: boolean) => void;
}

// Combined store interface
export interface WorkflowStore extends WorkflowStoreState, WorkflowActions {}

// Persistence configuration
export interface WorkflowPersistConfig {
  name: string;
  version: number;
  partialize?: (state: WorkflowStore) => Partial<WorkflowStore>;
  onRehydrateStorage?: () => void;
}

// ======================================================================
// EVENT HANDLER TYPES
// ======================================================================

// Node event handlers
export interface NodeHandlers {
  onMouseDown: (e: React.MouseEvent, nodeId: number) => void;
  onSelect: (nodeId: number) => void;
  onStartConnection: (e: React.MouseEvent, nodeId: number) => void;
  onEndConnection: (e: React.MouseEvent, targetId: number) => void;
  onDelete: (nodeId: number) => void;
}

// Edge event handlers
export interface EdgeHandlers {
  onDelete: (edgeId: string) => void;
  onSelect: (edgeId: string) => void;
}

// ======================================================================
// COMPONENT PROPS TYPES
// ======================================================================

// Canvas Component Props
export interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  tempLine: TempLine | null;
  selectedNode: number | null;
  selectedEdge: string | null;
  draggingNode: number | null;
  nodeHandlers: NodeHandlers;
  edgeHandlers: EdgeHandlers;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  runCode?: boolean;
}

// Node Component Props
export interface WorkflowNodeProps {
  node: Node;
  isSelected: boolean;
  isDragging: boolean;
  handlers: NodeHandlers;
}

// Edge Component Props
export interface WorkflowEdgeProps {
  edge: Edge;
  sourceNode: Node;
  targetNode: Node;
  handlers: EdgeHandlers;
  runCode?: boolean;
  isSelected?: boolean;
}

// Temp Connection Line Props
export interface TempConnectionLineProps {
  tempLine: TempLine;
}

// Header Component Props
export interface WorkflowHeaderProps {
  onAddNode: (nodeType?: {
    label: string;
    icon: string;
    type?: string;
  }) => void;
}

// Footer Component Props
export interface WorkflowFooterProps {
  nodeCount: number;
  edgeCount: number;
}

// Workflow Editor Summary Props
export interface WorkflowEditorSummaryProps {
  value: number;
  onChange: (value: number) => void;
}

// ======================================================================
// HOOK PROPS TYPES
// ======================================================================

// Node Interactions Hook Props
export interface UseNodeInteractionsProps {
  getCanvasCoordinates: (
    clientX: number,
    clientY: number
  ) => { x: number; y: number };
}

// Legacy Hook Props (Deprecated - kept for backward compatibility)
export interface UseWorkflowInteractionsProps {
  nodes: Node[];
  draggingNode: number | null;
  connecting: number | null;
  dragOffset: DragOffset;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  setSelectedNode: (id: number | null) => void;
  setDraggingNode: (id: number | null) => void;
  setDragOffset: (offset: DragOffset) => void;
  setConnecting: (id: number | null) => void;
  setTempLine: (line: TempLine | null) => void;
  updateNodePosition: (nodeId: number, x: number, y: number) => void;
  addEdge: (source: number, target: number) => void;
  deleteNode: (id: number) => void;
}

// ======================================================================
// DOCK NAVIGATION TYPES
// ======================================================================

// Dock Navigation Props
export interface DockNavigationProps {
  // Future dock navigation props will be added here
  placeholder?: never;
}
