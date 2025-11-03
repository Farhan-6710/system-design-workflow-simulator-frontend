import { Node } from "@/types/workflow-studio/workflow";

/**
 * Props interface for NodeEditModal component
 * Defines the required props for editing node details and configurations
 */
export interface NodeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node;
  editingLabel: string;
  onLabelChange: (label: string) => void;
  configurations: Record<string, string | number | boolean>;
  onConfigurationChange: (
    key: string,
    value: string | number | boolean
  ) => void;
  onSave: () => void;
}

/**
 * Props interface for NodeDetailsView component
 * Defines the required props for displaying node details
 */
export interface NodeDetailsViewProps {
  node: Node;
}
