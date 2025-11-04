import { Node, NodeType, Edge } from "@/types/workflow-studio/workflow";
import {
  generateNodeId,
  generateEdgeId,
} from "@/utils/workflow-studio/workflow";

export type NodeCreateOptions = Partial<Pick<Node, "label" | "icon">> & {
  type?: string;
  configurations?: Record<string, string | number | boolean>;
};

export const createNode = (
  existingNodes: Node[],
  nodeType?: NodeCreateOptions
): Node => {
  const newId = generateNodeId(existingNodes);
  const validTypes: NodeType[] = ["start", "process", "end"];
  const nodePositionType =
    nodeType?.type && validTypes.includes(nodeType.type as NodeType)
      ? (nodeType.type as NodeType)
      : "process";

  const position = {
    x: Math.random() * 400 + 200,
    y: Math.random() * 300 + 100,
  };

  return {
    id: newId,
    label: nodeType?.label || `Node ${newId}`,
    x: position.x,
    y: position.y,
    position: nodePositionType,
    icon: nodeType?.icon || "Circle",
    configurations: nodeType?.configurations || {},
  };
};

export const createEdge = (
  existingEdges: Edge[],
  source: number,
  target: number
): Edge => {
  return {
    id: generateEdgeId(existingEdges),
    source,
    target,
  };
};
