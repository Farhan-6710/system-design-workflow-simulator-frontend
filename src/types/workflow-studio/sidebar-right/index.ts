/**
 * ======================================================================
 * SIDEBAR RIGHT - COMPONENT TYPE DEFINITIONS
 * ======================================================================
 *
 * Types specific to the right sidebar components and their functionality.
 * Maintains separation from core workflow types while importing needed types.
 */

import { Node, NodeConfiguration } from "../workflow";

// ======================================================================
// SIDEBAR STRUCTURE TYPES
// ======================================================================

// Right Sidebar Navigation Item
export interface SidebarRightItem {
  id: string;
  name: string;
  tooltip: string;
  route?: string;
  component: React.ReactNode;
}

// ======================================================================
// MAIN SIDEBAR PROPS
// ======================================================================

// Main SidebarRight Props
export interface SidebarRightProps {
  onAddNode?: (nodeType: {
    label: string;
    icon: string;
    type?: string;
  }) => void;
  onUpdateNode?: (
    nodeId: number,
    updates: { label: string; icon: string }
  ) => void;
}

// ======================================================================
// SIDEBAR LAYOUT COMPONENT PROPS
// ======================================================================

// Header Component Props
export interface SidebarHeaderProps {
  sidebarExpanded: boolean;
}

// Navigation Dock Props
export interface NavigationDockProps {
  sidebarExpanded: boolean;
  selectedTab: string | null;
  onTabChange: (tabId: string) => void;
}

// Main Content Area Props
export interface MainContentAreaProps {
  sidebarExpanded: boolean;
  selectedTab: string | null;
  nodes: Node[];
  onAddNode?: (nodeType: {
    label: string;
    icon: string;
    type?: string;
  }) => void;
  onUpdateNode?: (
    nodeId: number,
    updates: { label: string; icon: string }
  ) => void;
  onTabChange: (tabId: string) => void;
}

// Add Node Content Props
export interface AddNodeContentProps {
  onAddNode?: (nodeType: {
    label: string;
    icon: string;
    type?: string;
    configurations?: Record<string, string | number | boolean>;
  }) => void;
}

// Edit Node Content Props
export interface EditNodeContentProps {
  nodes: Node[];
  onUpdateNode?: (
    nodeId: number,
    updates: {
      label: string;
      icon: string;
      configurations?: Record<string, string | number | boolean>;
    }
  ) => void;
}

// Analytics Content Props
export interface AnalyticsContentProps {
  // Future analytics props will be added here
  placeholder?: never; // Temporary to avoid empty interface
}

// Metrics Content Props
export interface MetricsContentProps {
  requestsPerSecond: number;
  onRequestsPerSecondChange: (value: number) => void;
}

// Collapsed State Props
export interface CollapsedStateProps {
  onTabChange: (tabId: string) => void;
}

// Toggle Button Props
export interface ToggleButtonProps {
  sidebarExpanded: boolean;
  onToggle: () => void;
}

// Footer Settings Props
export interface FooterSettingsProps {
  sidebarExpanded: boolean;
}

// ======================================================================
// FORM COMPONENT PROPS
// ======================================================================

// Configuration Form Props (sidebar-right specific)
export interface ConfigurationFormProps {
  configurations: NodeConfiguration;
  values: Record<string, string | number | boolean>;
  onChange: (key: string, value: string | number | boolean) => void;
  twoCols?: boolean; // Optional prop to enable 2-column layout
  title?: string; // Optional custom title
}
