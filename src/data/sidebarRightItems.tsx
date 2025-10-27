import { Plus, Edit3, BarChart3, Sparkles } from "lucide-react";
import { SidebarRightItem } from "@/types/workflow-studio/sidebar-right";

export const sidebarRightItems: SidebarRightItem[] = [
  {
    id: "add-node",
    name: "Add Node",
    tooltip: "Add Node",
    component: <Plus size={16} className="text-slate-700 dark:text-white" />,
  },
  {
    id: "edit-node",
    name: "Edit Node",
    tooltip: "Edit Node",
    component: <Edit3 size={16} className="text-slate-700 dark:text-white" />,
  },
  {
    id: "selected-edge/node",
    name: "Selected Edge/Node",
    tooltip: "Selected Edge/Node",
    component: (
      <BarChart3 size={16} className="text-slate-700 dark:text-white" />
    ),
  },
  {
    id: "ai-assistant",
    name: "AI Assistant",
    tooltip: "AI Assistant",
    component: (
      <Sparkles size={16} className="text-slate-700 dark:text-white" />
    ),
  },
];
