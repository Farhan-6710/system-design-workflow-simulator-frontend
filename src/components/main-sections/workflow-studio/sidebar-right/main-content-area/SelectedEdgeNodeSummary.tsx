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
import { useWorkflowStore } from "@/stores/workflowStore";
import { getEdgeNumber } from "@/utils/workflow-studio/workflow";
import { nodeOptions } from "@/data/nodeOptions";
import ConfigurationForm from "./ConfigurationForm";

const SelectedEdgeNodeSummary: React.FC = () => {
  const selectedEdge = useWorkflowStore((state) => state.selectedEdge);
  const selectedNode = useWorkflowStore((state) => state.selectedNode);
  const edges = useWorkflowStore((state) => state.edges);
  const nodes = useWorkflowStore((state) => state.nodes);
  const updateNode = useWorkflowStore((state) => state.updateNode);

  // Node editing state
  const [selectedNodeType, setSelectedNodeType] = useState<string>("");
  const [configurations, setConfigurations] = useState<
    Record<string, string | number | boolean>
  >({});

  // Load existing configurations when a node is selected
  useEffect(() => {
    if (selectedNode) {
      const currentNode = nodes.find((node) => node.id === selectedNode);
      if (currentNode) {
        // If node has configurations, use them; otherwise use defaults for its current type
        if (currentNode.configurations) {
          setConfigurations(currentNode.configurations);
        } else {
          // Get the node's current type and load defaults
          const nodeType = nodeOptions.find(
            (type) => type.label === currentNode.label
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
      setSelectedNodeType("");
    }
  }, [selectedNode, nodes]);

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

  const handleApplyChanges = () => {
    const nodeType = nodeOptions.find((type) => type.id === selectedNodeType);
    if (selectedNode && nodeType && updateNode) {
      updateNode(selectedNode, {
        label: nodeType.label,
        icon: nodeType.icon,
        configurations: configurations,
      });
    }
  };

  // Get selected edge details
  const getSelectedEdgeDetails = () => {
    if (!selectedEdge) return null;

    const edge = edges.find((e) => e.id === selectedEdge);
    if (!edge) return null;

    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    const edgeNumber = getEdgeNumber(edge.id, edges);

    return {
      edge,
      sourceNode,
      targetNode,
      edgeNumber,
    };
  };

  // Get selected node details
  const getSelectedNodeDetails = () => {
    if (!selectedNode) return null;
    return nodes.find((n) => n.id === selectedNode);
  };

  const edgeDetails = getSelectedEdgeDetails();
  const nodeDetails = getSelectedNodeDetails();

  // If no selection, show default message
  if (!selectedEdge && !selectedNode) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Selected Edge/Node Summary
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select an edge or node to view its details and configuration.
        </p>
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            No edge or node selected
          </p>
        </div>
      </div>
    );
  }

  // Show edge details
  if (selectedEdge && edgeDetails) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Edge Details
        </h3>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Edge Number:
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Edge {edgeDetails.edgeNumber}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Edge ID:
            </span>
            <span className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
              {edgeDetails.edge.id}
            </span>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Connection:
              </span>
            </div>
            <div className="text-sm text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {edgeDetails.sourceNode?.label}
                </span>
                <span className="text-slate-500">→</span>
                <span className="font-semibold">
                  {edgeDetails.targetNode?.label}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Node {edgeDetails.edge.source} → Node {edgeDetails.edge.target}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show node details
  if (selectedNode && nodeDetails) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Node Details
        </h3>

        {/* Node Selection Info */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Selected Node:
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Node {nodeDetails.id} - {nodeDetails.label}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Node ID:
            </span>
            <span className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
              {nodeDetails.id}
            </span>
          </div>
        </div>

        {/* Current Node Configuration */}
        {nodeDetails.configurations &&
          Object.keys(nodeDetails.configurations).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
                Current Configuration
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <div className="space-y-2">
                  {Object.entries(nodeDetails.configurations).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </span>
                        <span className="text-sm text-slate-800 dark:text-slate-200">
                          {typeof value === "boolean"
                            ? value
                              ? "Yes"
                              : "No"
                            : value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

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
                        onChange={handleConfigurationChange}
                      />
                    </div>
                  </div>
                )
              );
            })()}

          {/* Apply Changes Button */}
          {selectedNodeType && (
            <Button
              onClick={handleApplyChanges}
              className="w-full bg-gradient-primary text-white mt-3"
            >
              <Check className="w-4 h-4 mr-2" />
              Apply Changes
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Fallback debug render
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
        Debug Info
      </h3>
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-600 dark:text-red-400">
          selectedEdge: {selectedEdge || "null"}
        </p>
        <p className="text-sm text-red-600 dark:text-red-400">
          selectedNode: {selectedNode || "null"}
        </p>
        <p className="text-sm text-red-600 dark:text-red-400">
          edgeDetails: {edgeDetails ? "found" : "null"}
        </p>
        <p className="text-sm text-red-600 dark:text-red-400">
          nodeDetails: {nodeDetails ? "found" : "null"}
        </p>
      </div>
    </div>
  );
};

export default SelectedEdgeNodeSummary;
