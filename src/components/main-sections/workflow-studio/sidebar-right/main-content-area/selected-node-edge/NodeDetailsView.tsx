import React, { useState, useEffect } from "react";
import { Node } from "@/types/workflow-studio/workflow";
import { useWorkflowStore } from "@/stores/workflowStore";
import { nodeOptions } from "@/data/nodeOptions";
import NodeDetailsHeader from "./NodeDetailsHeader";
import NodeDetailsConfiguration from "./NodeDetailsConfiguration";
import NodeEditModal from "./NodeEditModal";
import { ConfirmationModal } from "@/components/atoms/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface NodeDetailsViewProps {
  node: Node;
}

const NodeDetailsView: React.FC<NodeDetailsViewProps> = ({ node }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const updateNode = useWorkflowStore((state) => state.updateNode);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const nodes = useWorkflowStore((state) => state.nodes);

  // Node editing state
  const [configurations, setConfigurations] = useState<
    Record<string, string | number | boolean>
  >({});
  const [editingLabel, setEditingLabel] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleConfigurationChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setConfigurations((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = (nodeType?: string) => {
    if (updateNode) {
      const updateData: Partial<Node> = {
        label: editingLabel,
        configurations: configurations,
      };

      // If changing node type, add the type information
      if (nodeType) {
        const selectedNodeOption = nodeOptions.find(
          (option) => option.id === nodeType
        );
        if (selectedNodeOption) {
          // Update label to the new node type label
          updateData.label = selectedNodeOption.label;
          // Note: You might want to add a nodeTypeId field to track the actual node type
        }
      }

      updateNode(node.id, updateData);
    }
    setIsEditModalOpen(false);
  };

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

  return (
    <div className="space-y-4">
      <NodeDetailsHeader
        node={node}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      <NodeDetailsConfiguration node={node} />

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

      <NodeEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        node={node}
        editingLabel={editingLabel}
        onLabelChange={setEditingLabel}
        configurations={configurations}
        onConfigurationChange={handleConfigurationChange}
        onSave={handleSave}
        handleDeleteClick={handleDeleteClick}
        handleDeleteConfirm={handleDeleteConfirm}
        handleDeleteCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default NodeDetailsView;
