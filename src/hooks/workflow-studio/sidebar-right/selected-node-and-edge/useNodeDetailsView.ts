import { useState, useEffect } from "react";
import { Node } from "@/types/workflow-studio/workflow";
import { useWorkflowStore } from "@/stores/workflowStore";
import { nodeOptions } from "@/constants/nodeOptions";
import { toast } from "sonner";

/**
 * Custom hook for managing main node details view state
 * Handles node configuration, saving, and deletion from the main view
 */
export const useNodeDetailsView = (node: Node) => {
  // Get store actions
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const nodes = useWorkflowStore((state) => state.nodes);

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Node editing state
  const [configurations, setConfigurations] = useState<
    Record<string, string | number | boolean>
  >({});
  const [editingLabel, setEditingLabel] = useState<string>("");

  // Load existing configurations and label when a node is selected
  useEffect(() => {
    if (node.configurations) {
      setConfigurations(node.configurations);
    } else {
      setConfigurations({});
    }
    setEditingLabel(node.label);
  }, [node]);

  // Reset editing label when modal opens to current node label
  useEffect(() => {
    if (isEditModalOpen) {
      const currentNode = nodes.find((n) => n.id === node.id);
      if (currentNode) {
        setEditingLabel(currentNode.label);
      }
    }
  }, [isEditModalOpen, node.id, nodes]);

  // Configuration handlers
  const handleConfigurationChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setConfigurations((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handler to replace configurations completely
  const replaceConfigurations = (
    newConfigurations: Record<string, string | number | boolean>
  ) => {
    setConfigurations(newConfigurations);
  };

  // Save handlers
  const handleSave = () => {
    if (updateNode) {
      updateNode(node.id, {
        label: editingLabel,
        configurations: configurations,
      });
    }
    setIsEditModalOpen(false);

    // Show success toast
    toast.success("Node saved successfully", {
      description: `Changes to "${editingLabel}" have been saved`,
      duration: 2000,
    });
  };

  // Delete handlers for main component
  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    deleteNode(node.id);
    setShowDeleteConfirmation(false);
    setIsEditModalOpen(false); // Close the modal after deletion
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };

  // Modal handlers
  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  return {
    // State
    isEditModalOpen,
    showDeleteConfirmation,
    configurations,
    editingLabel,

    // State setters
    setEditingLabel,
    setConfigurations,

    // Configuration handlers
    handleConfigurationChange,
    replaceConfigurations,

    // Save handlers
    handleSave,

    // Delete handlers (main component)
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,

    // Modal handlers
    openEditModal,
    closeEditModal,
  };
};

/**
 * Custom hook for managing node edit modal specific state
 * Handles node type changes and modal-specific delete operations
 * This hook is called within the modal to avoid unnecessary parent re-renders
 */
export const useNodeEditModal = (
  isOpen: boolean,
  node: Node,
  onLabelChange: (label: string) => void,
  onConfigurationChange: (
    key: string,
    value: string | number | boolean
  ) => void,
  replaceConfigurations: (
    newConfigurations: Record<string, string | number | boolean>
  ) => void,
  onClose?: () => void
) => {
  // Get store actions for modal-specific operations
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  // NodeEditModal specific state
  const [selectedNodeType, setSelectedNodeType] = useState<string>("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Reset node type selection and delete confirmation when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedNodeType("");
      setShowDeleteConfirmation(false);
    }
  }, [isOpen]);

  // Node type change handler - automatically brings its own configurations
  const handleNodeTypeChange = (nodeType: string) => {
    setSelectedNodeType(nodeType);

    // Find the new node type configuration
    const nodeOption = nodeOptions.find((option) => option.id === nodeType);
    if (nodeOption) {
      // Update the label to match the new node type
      onLabelChange(nodeOption.label);

      // Automatically replace with new node type's default configurations
      if (nodeOption.configurations) {
        const defaultConfigs: Record<string, string | number | boolean> = {};
        Object.entries(nodeOption.configurations).forEach(([key, config]) => {
          defaultConfigs[key] = config.defaultValue;
        });
        // Replace all configurations with the new node type's defaults
        replaceConfigurations(defaultConfigs);
      } else {
        // If no configurations, clear all configurations
        replaceConfigurations({});
      }
    }
  };

  // Delete handlers for edit modal
  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    deleteNode(node.id);
    setShowDeleteConfirmation(false);
    // Close the modal after deletion
    if (onClose) {
      onClose();
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };

  return {
    // State
    selectedNodeType,
    showDeleteConfirmation,

    // Handlers
    handleNodeTypeChange,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
};
