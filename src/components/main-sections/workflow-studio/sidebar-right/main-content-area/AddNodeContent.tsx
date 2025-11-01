import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { nodeOptions, nodeCategories } from "@/constants/nodeOptions";
import { AddNodeContentProps } from "@/types/workflow-studio/sidebar-right";
import ConfigurationForm from "./ConfigurationForm";

const AddNodeContent: React.FC<AddNodeContentProps> = ({ onAddNode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedNewNodeType, setSelectedNewNodeType] = useState<string>("");
  const [configurations, setConfigurations] = useState<
    Record<string, string | number | boolean>
  >({});

  // Load default configurations when node type changes
  useEffect(() => {
    if (selectedNewNodeType) {
      const nodeOption = nodeOptions.find(
        (option) => option.id === selectedNewNodeType
      );
      if (nodeOption?.configurations) {
        const defaultValues: Record<string, string | number | boolean> = {};
        Object.values(nodeOption.configurations).forEach((field) => {
          defaultValues[field.key] = field.defaultValue;
        });
        setConfigurations(defaultValues);
      } else {
        setConfigurations({});
      }
    } else {
      setConfigurations({});
    }
  }, [selectedNewNodeType]);

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedNewNodeType("");
    setConfigurations({});
  };

  const handleNewNodeTypeChange = (nodeTypeId: string) => {
    setSelectedNewNodeType(nodeTypeId);
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

  const handleAddNode = () => {
    if (selectedNewNodeType) {
      const nodeType = nodeOptions.find(
        (type) => type.id === selectedNewNodeType
      );

      if (nodeType && onAddNode) {
        const nodeData = {
          label: nodeType.label,
          icon: nodeType.icon,
          type: nodeType.position, // Use predefined type from nodeOptions
          configurations: configurations,
        };

        onAddNode(nodeData);
      }

      // Reset all selections after adding
      setSelectedCategory("");
      setSelectedNewNodeType("");
      setConfigurations({});
    }
  };

  // Get filtered node types based on selected category
  const filteredNodeTypes = selectedCategory
    ? nodeOptions.filter((nodeType) => nodeType.category === selectedCategory)
    : [];

  // Check if both dropdowns are selected
  const allSelectionsMade = selectedCategory && selectedNewNodeType;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
        Add Node
      </h3>
      {/* Step 1: Category Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Step 1: Select Category
        </label>
        <Select onValueChange={handleCategoryChange} value={selectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a category..." />
          </SelectTrigger>
          <SelectContent>
            {nodeCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Step 2: Node Type Selection */}
      {selectedCategory && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Step 2: Select Node Type
          </label>
          <Select
            onValueChange={handleNewNodeTypeChange}
            value={selectedNewNodeType}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a node type..." />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {filteredNodeTypes.map((nodeType) => (
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
      )}
      {/* Step 3: Configuration */}
      {selectedNewNodeType &&
        (() => {
          const nodeOption = nodeOptions.find(
            (option) => option.id === selectedNewNodeType
          );
          const nodeConfig = nodeOption?.configurations;
          return (
            nodeConfig && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Step 3: Configure Node
                </h3>
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
        })()}{" "}
      {/* Add Node Button */}
      <Button
        onClick={handleAddNode}
        disabled={!allSelectionsMade}
        className={`w-full ${
          allSelectionsMade
            ? "bg-gradient-primary text-white"
            : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
        } transition-colors`}
      >
        <Plus className="w-4 h-4 mr-2" />
        {allSelectionsMade ? "Add New Node" : "Complete All Steps First"}
      </Button>
      {/* Progress indicator */}
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Progress: {selectedCategory ? "1" : "0"}/3 steps completed
        {selectedNewNodeType && " → 2/3"}
        {selectedNewNodeType && " → 3/3 ✓"}
      </div>
    </div>
  );
};

export default AddNodeContent;
