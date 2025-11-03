import React from "react";
import { NodeDetailsViewProps } from "@/types/workflow-studio/sidebar-right/selected-node-and-edge";
import { useNodeDetailsView } from "@/hooks/workflow-studio/sidebar-right/selected-node-and-edge/useNodeDetailsView";
import NodeDetailsHeader from "./NodeDetailsHeader";
import NodeDetailsConfiguration from "./NodeDetailsConfiguration";
import NodeEditModal from "./NodeEditModal";
import { ConfirmationModal } from "@/components/atoms/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const NodeDetailsView: React.FC<NodeDetailsViewProps> = ({ node }) => {
  const {
    // State
    isEditModalOpen,
    showDeleteConfirmation,
    configurations,
    editingLabel,

    // State setters
    setEditingLabel,

    // Configuration handlers
    handleConfigurationChange,

    // Save handlers
    handleSave,

    // Delete handlers (main component)
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,

    // Modal handlers
    openEditModal,
    closeEditModal,
  } = useNodeDetailsView(node);

  return (
    <div className="space-y-4">
      <NodeDetailsHeader node={node} onEditClick={openEditModal} />

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
        onOpenChange={handleDeleteCancel}
        title="Delete Node"
        description={`Are you sure you want to delete "${node.label}" (ID: ${node.id})? This action cannot be undone and will also remove all connected edges.`}
        confirmText="Delete Node"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="destructive"
        toastMessage="Node deleted successfully"
        toastDescription={`"${node.label}" (ID: ${node.id}) has been removed from the workflow`}
      />

      <NodeEditModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        node={node}
        editingLabel={editingLabel}
        onLabelChange={setEditingLabel}
        configurations={configurations}
        onConfigurationChange={handleConfigurationChange}
        onSave={handleSave}
      />
    </div>
  );
};

export default NodeDetailsView;
