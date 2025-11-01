import React, { useState, useEffect } from "react";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/atoms/Modal";
import { ConfirmationModal } from "@/components/atoms/ConfirmationModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfigurationForm from "../ConfigurationForm";
import { Node } from "@/types/workflow-studio/workflow";
import { nodeOptions } from "@/constants/nodeOptions";
import { getConfigurationDisplay } from "@/utils/workflow-studio/sidebar-right/configurationUtils";

interface NodeEditModalProps {
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
  onSave: (nodeType?: string) => void;
  handleDeleteClick: () => void;
  handleDeleteConfirm: () => void;
  handleDeleteCancel: () => void;
}

const NodeEditModal: React.FC<NodeEditModalProps> = ({
  isOpen,
  onClose,
  node,
  editingLabel,
  onLabelChange,
  configurations,
  onConfigurationChange,
  onSave,
  handleDeleteClick,
  handleDeleteConfirm,
  handleDeleteCancel,
}) => {
  const [selectedNodeType, setSelectedNodeType] = useState<string>("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Reset node type selection and delete confirmation when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedNodeType("");
      setShowDeleteConfirmation(false);
    }
  }, [isOpen]);

  const handleNodeTypeChange = (nodeType: string) => {
    setSelectedNodeType(nodeType);

    // Set default configurations for the selected node type
    const nodeOption = nodeOptions.find((option) => option.id === nodeType);
    if (nodeOption && nodeOption.configurations) {
      const defaultConfigs: Record<string, string | number | boolean> = {};
      Object.entries(nodeOption.configurations).forEach(([key, config]) => {
        defaultConfigs[key] = config.defaultValue;
      });
      // Apply all default configurations at once
      Object.entries(defaultConfigs).forEach(([key, value]) => {
        onConfigurationChange(key, value);
      });
    }
  };

  const handleSave = () => {
    onSave(selectedNodeType || undefined);
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      title="Edit Node"
      description="Modify node details and configuration settings"
    >
      <div className="flex flex-col gap-4">
        {/* Node Label Input with ID */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Node Label:
            </label>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              ID: {node.id}
            </span>
          </div>
          <input
            type="text"
            value={editingLabel}
            onChange={(e) => onLabelChange(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter node label"
          />
        </div>

        {/* Change Node Type */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Change Node To:
          </label>
          <Select onValueChange={handleNodeTypeChange} value={selectedNodeType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select new node type..." />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {nodeOptions.map((nodeType) => (
                <SelectItem key={nodeType.id} value={nodeType.id}>
                  <div className="flex items-center gap-2 py-1">
                    {nodeType.component}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {nodeType.label}
                      </span>
                      {/* <span className="text-xs text-slate-500">
                        {nodeType.category}
                      </span> */}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Unified Configuration Form */}
        {(() => {
          // Get configuration display data using utility function
          const { configurationsToShow, configTitle } = getConfigurationDisplay(
            selectedNodeType || undefined,
            node
          );

          return (
            configurationsToShow &&
            Object.keys(configurationsToShow).length > 0 && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <ConfigurationForm
                    configurations={configurationsToShow}
                    values={configurations}
                    onChange={onConfigurationChange}
                    twoCols={true}
                    title={configTitle}
                  />
                </div>
              </div>
            )
          );
        })()}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-primary text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
        <div className="w-full">
          <Button
            onClick={handleDeleteClick}
            variant="destructive"
            className="flex-1 w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Node
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        title="Delete Node"
        description={`Are you sure you want to delete "${node.label}" (ID: ${node.id})? This action cannot be undone and will also remove all connected edges.`}
        confirmText="Delete Node"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="destructive"
      />
    </Modal>
  );
};

export default NodeEditModal;
