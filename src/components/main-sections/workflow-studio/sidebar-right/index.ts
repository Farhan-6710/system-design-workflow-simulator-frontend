// Main component exports
export { default as SidebarHeader } from "./SidebarHeader";
export { default as NavigationTabs } from "./NavigationDock";
export { default as MainContentArea } from "./main-content-area/MainContentArea";
export { default as ToggleButton } from "./ToggleButton";
export { default as FooterSettings } from "./FooterSettings";

// Content component exports
export { default as AddNodeContent } from "./main-content-area/AddNodeContent";
export { default as EditNodeContent } from "./main-content-area/EditNodeContent";
export { default as AnalyticsContent } from "./main-content-area/selected-node-and-edge/SelectedEdgeNodeSummary";
export { default as MetricsContent } from "./main-content-area/MetricsContent";
export { default as CollapsedState } from "./CollapsedState";

// Type exports
export * from "@/types/workflow-studio/sidebar-right";
