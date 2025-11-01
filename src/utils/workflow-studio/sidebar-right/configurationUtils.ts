import { Node, NodeConfigField } from "@/types/workflow-studio/workflow";
import { nodeOptions } from "@/constants/nodeOptions";

/**
 * Result type for configuration display logic
 */
export interface ConfigurationDisplayResult {
  configurationsToShow: Record<string, NodeConfigField> | undefined;
  configTitle: string;
}

/**
 * Determines which configurations to show in the edit modal and what title to display.
 * This function handles two scenarios:
 * 1. When user selects a new node type - shows new node configurations
 * 2. When no new type is selected - shows current node configurations
 *
 * @param selectedNodeType - The ID of the newly selected node type (if any)
 * @param currentNode - The current node being edited
 * @returns Object containing configurations to show and appropriate title
 */
export function getConfigurationDisplay(
  selectedNodeType: string | undefined,
  currentNode: Node
): ConfigurationDisplayResult {
  // Case 1: User selected a new node type
  if (selectedNodeType) {
    const node = nodeOptions.find((option) => option.id === selectedNodeType);

    return {
      configurationsToShow: node?.configurations,
      configTitle: "New Node Configuration",
    };
  }

  // Case 2: Show current node configurations
  if (
    !currentNode.configurations ||
    Object.keys(currentNode.configurations).length === 0
  ) {
    return {
      configurationsToShow: undefined,
      configTitle: "Current Configuration",
    };
  }

  // Convert current node configurations back to proper configuration format
  const configurationsToShow: Record<string, NodeConfigField> = {};

  Object.entries(currentNode.configurations).forEach(([key, value]) => {
    // Try to find the original configuration structure from nodeOptions
    const originalNode = nodeOptions.find(
      (option) => option.label === currentNode.label
    );
    const originalConfig = originalNode?.configurations?.[key];

    if (originalConfig) {
      // Use the original configuration structure
      configurationsToShow[key] = originalConfig;
    } else {
      // Create a basic configuration structure as fallback
      configurationsToShow[key] = createFallbackConfig(key, value);
    }
  });

  return {
    configurationsToShow,
    configTitle: "Current Configuration",
  };
}

/**
 * Creates a basic configuration structure when original config is not found
 *
 * @param key - Configuration key
 * @param value - Configuration value
 * @returns Basic NodeConfigField structure
 */
function createFallbackConfig(
  key: string,
  value: string | number | boolean
): NodeConfigField {
  // Convert camelCase to readable label
  const label = key.replace(/([A-Z])/g, " $1").trim();

  // Determine field type based on value type
  const fieldType: "text" | "number" | "boolean" =
    typeof value === "boolean"
      ? "boolean"
      : typeof value === "number"
      ? "number"
      : "text";

  return {
    key,
    label,
    type: fieldType,
    defaultValue: value,
  };
}
