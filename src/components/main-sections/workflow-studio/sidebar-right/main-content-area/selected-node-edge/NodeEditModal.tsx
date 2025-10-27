import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/atoms/Modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConfigurationForm from "../ConfigurationForm";
import { Node } from "@/types/workflow-studio/workflow";
import { nodeOptions } from "@/data/nodeOptions";

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
}) => {
  const [selectedNodeType, setSelectedNodeType] = useState<string>("");

  // Reset node type selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedNodeType("");
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
      <div className="space-y-6">
        {/* Node Label Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Node Label:
          </label>
          <input
            type="text"
            value={editingLabel}
            onChange={(e) => onLabelChange(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter node label"
          />
        </div>

        {/* Node ID Display (non-editable) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Node ID:
          </label>
          <div className="px-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded">
            <span className="font-mono text-slate-800 dark:text-slate-200">
              {node.id}
            </span>
          </div>
        </div>

        {/* Change Node Type */}
        <div className="space-y-2">
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
                      <span className="text-xs text-slate-500">
                        {nodeType.category}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Configuration Form */}
        {selectedNodeType &&
          (() => {
            const nodeOption = nodeOptions.find(
              (option) => option.id === selectedNodeType
            );
            const nodeConfig = nodeOption?.configurations;
            return (
              nodeConfig && (
                <div className="mt-4 space-y-4">
                  <div className="border rounded-lg p-4 dark:border-gray-700">
                    <ConfigurationForm
                      configurations={nodeConfig}
                      values={configurations}
                      onChange={onConfigurationChange}
                    />
                  </div>
                </div>
              )
            );
          })()}

        {/* Current Configuration Form (if no new node type selected) */}
        {!selectedNodeType &&
          node.configurations &&
          Object.keys(node.configurations).length > 0 && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
                Configuration Settings
              </h4>
              <div className="border rounded-lg p-4 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(node.configurations).map(([key, value]) => (
                    <div key={key} className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </label>
                      {typeof value === "boolean" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={configurations[key] as boolean}
                            onChange={(e) =>
                              onConfigurationChange(key, e.target.checked)
                            }
                            className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-1 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {configurations[key] ? "Yes" : "No"}
                          </span>
                        </div>
                      ) : typeof value === "number" ? (
                        <input
                          type="number"
                          value={configurations[key] as number}
                          onChange={(e) => {
                            const numValue =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            onConfigurationChange(key, numValue);
                          }}
                          className="w-full px-2 py-1 text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min="0"
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(configurations[key] || "")}
                          onChange={(e) =>
                            onConfigurationChange(key, e.target.value)
                          }
                          className="w-full px-2 py-1 text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
      </div>
    </Modal>
  );
};

export default NodeEditModal;
