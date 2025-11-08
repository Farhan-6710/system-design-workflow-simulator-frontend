import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { nodeOptions } from "@/constants/nodeOptions";
import { EditNodeContentProps } from "@/types/workflow-studio/sidebar-right";
import ConfigurationForm from "./ConfigurationForm";
import { toast } from "sonner";
import { getNodeNumber } from "@/utils/workflow-studio/workflow";

const EditNodeContent: React.FC<EditNodeContentProps> = ({
  nodes,
  onUpdateNode,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<string>("");
  const [configurations, setConfigurations] = useState<
    Record<string, string | number | boolean>
  >({});

  // Load existing configurations when a node is selected
  useEffect(() => {
    if (selectedNodeId) {
      const selectedNode = nodes.find((node) => node.id === selectedNodeId);
      if (selectedNode) {
        // If node has configurations, use them; otherwise use defaults for its current type
        if (selectedNode.configurations) {
          setConfigurations(selectedNode.configurations);
        } else {
          // Get the node's current type and load defaults
          const nodeType = nodeOptions.find(
            (type) => type.label === selectedNode.label
          );
          if (nodeType) {
            const defaultValues: Record<string, string | number | boolean> = {};
            if (nodeType.configurations) {
              Object.values(nodeType.configurations).forEach((field) => {
                defaultValues[field.key] = field.defaultValue;
              });
            }
            setConfigurations(defaultValues);
            setSelectedNodeType(nodeType.id);
          }
        }
      }
    } else {
      setConfigurations({});
    }
  }, [selectedNodeId, nodes]);

  // Load default configurations when node type changes
  useEffect(() => {
    if (selectedNodeType) {
      const nodeOption = nodeOptions.find(
        (option) => option.id === selectedNodeType
      );
      const defaultValues: Record<string, string | number | boolean> = {};
      if (nodeOption?.configurations) {
        Object.values(nodeOption.configurations).forEach((field) => {
          defaultValues[field.key] = field.defaultValue;
        });
      }
      setConfigurations(defaultValues);
    }
  }, [selectedNodeType]);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedNodeType(""); // Reset node type when changing node
    setConfigurations({});
  };

  const handleNodeTypeChange = (nodeTypeId: string) => {
    setSelectedNodeType(nodeTypeId);
  };

  const handleConfigurationChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setConfigurations((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleEditNodeDone = () => {
    const nodeType = nodeOptions.find((type) => type.id === selectedNodeType);
    if (selectedNodeId && nodeType && onUpdateNode) {
      onUpdateNode(selectedNodeId, {
        label: nodeType.label,
        icon: nodeType.icon,
        configurations: configurations,
      });

      // Show success toast
      toast.success("Node updated successfully", {
        description: `Node ${selectedNodeId} has been updated to ${nodeType.label}`,
        duration: 2000,
      });

      // Reset selections after successful update
      setSelectedNodeId(null);
      setSelectedNodeType("");
      setConfigurations({});
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
        Edit Node
      </h3>

      {/* Node Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Select Node to Edit:
        </label>
        <Select onValueChange={handleNodeSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a node..." />
          </SelectTrigger>
          <SelectContent>
            {[...nodes]
              .sort((a, b) => {
                const aNumber = getNodeNumber(a.id);
                const bNumber = getNodeNumber(b.id);
                return aNumber - bNumber;
              })
              .map((node) => (
                <SelectItem key={node.id} value={node.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>Node {getNodeNumber(node.id)}</span>
                    <span className="text-slate-500">- {node.label}</span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Node Type Selection */}
      {selectedNodeId && (
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
                      {/* <span className="text-xs text-slate-500">
                        {nodeType.category}
                      </span> */}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Apply Changes Button */}
          {selectedNodeType && (
            <>
              {/* Configuration Form */}
              {(() => {
                const nodeOption = nodeOptions.find(
                  (option) => option.id === selectedNodeType
                );
                const nodeConfig = nodeOption?.configurations;
                return (
                  nodeConfig && (
                    <div className="mt-4 space-y-4">
                      <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
                        Node Configuration
                      </h4>
                      <div className="border rounded-lg p-4 dark:border-gray-700">
                        <ConfigurationForm
                          configurations={nodeConfig}
                          values={configurations}
                          onChange={handleConfigurationChange}
                        />
                      </div>
                    </div>
                  )
                );
              })()}

              <Button
                onClick={handleEditNodeDone}
                className="w-full bg-gradient-primary text-white mt-3"
              >
                <Check className="w-4 h-4 mr-2" />
                Apply Changes
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EditNodeContent;
