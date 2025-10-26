import React from "react";
import {
  Trash2,
  Smartphone,
  Router,
  Users,
  ShoppingCart,
  CreditCard,
  Network,
  Server,
  Database,
  Globe,
  Shield,
  Search,
  HardDrive,
  Zap,
  Monitor,
  Activity,
  Link,
  Circle,
} from "lucide-react";
import { WorkflowNodeProps } from "@/types/workflow-studio";
import {
  getNodeClasses,
  getNodeTextClasses,
} from "@/utils/workflow-studio/workflow";
import { useNodeAnimation } from "@/hooks/useWorkflowAnimation";
import { shouldNodeGlow } from "@/utils/workflow-studio/stylingUtils";
import "@/styles/workflowAnimations.css";

// Icon mapping for dynamic icon rendering
const getIconComponent = (iconName: string) => {
  const iconMap = {
    Smartphone,
    Router,
    Users,
    ShoppingCart,
    CreditCard,
    Network,
    Server,
    Database,
    Globe,
    Shield,
    Search,
    HardDrive,
    Zap,
    Monitor,
    Activity,
    Link,
    Circle,
  };
  return iconMap[iconName as keyof typeof iconMap] || Circle;
};

// Function to get icon color based on node label/type
const getIconColor = (nodeLabel: string): string => {
  // Exact matches for initial workflow nodes
  const exactColors: Record<string, string> = {
    // Initial workflow labels
    Client: "text-white",
    Gateway: "text-purple-600",
    "User Service": "text-violet-500",
    "Order Service": "text-orange-500",
    Payment: "text-pink-500",
    "User LB": "text-orange-600",
    "Order LB": "text-orange-600",
    "Pay LB": "text-orange-600",
    "User S1": "text-blue-500",
    "User S2": "text-blue-500",
    "User S3": "text-blue-500",
    "Order S1": "text-blue-500",
    "Order S2": "text-blue-500",
    "Order S3": "text-blue-500",
    "Pay S1": "text-blue-500",
    "Pay S2": "text-blue-500",
    "Pay S3": "text-blue-500",
    "User DB": "text-green-500",
    "Order DB": "text-green-500",
    "Pay DB": "text-green-500",

    // nodeTypeOptions labels
    "Client / User Node": "text-blue-600",
    "DNS Resolver": "text-green-600",
    "API Gateway": "text-purple-600",
    "Load Balancer": "text-orange-600",
    "Synchronous Compute Node": "text-blue-500",
    "Asynchronous Compute Node": "text-yellow-500",
    "Message Queue": "text-red-500",
    Database: "text-green-500",
    Cache: "text-blue-400",
    "Object Storage": "text-gray-500",
    "Search Service": "text-indigo-500",
    CDN: "text-cyan-500",
    "Authentication Service": "text-emerald-600",
    "Monitoring Node": "text-slate-600",
    "Network Link": "text-gray-400",
    "Payment Service": "text-pink-500",
  };

  // Try exact match first
  if (exactColors[nodeLabel]) {
    return exactColors[nodeLabel];
  }

  // Pattern matching fallbacks
  if (nodeLabel.includes("Client")) return "text-blue-600";
  if (nodeLabel.includes("Gateway")) return "text-purple-600";
  if (nodeLabel.includes("LB") || nodeLabel.includes("Load"))
    return "text-orange-600";
  if (nodeLabel.includes("DB") || nodeLabel.includes("Database"))
    return "text-green-500";
  if (nodeLabel.includes("S") && /\d/.test(nodeLabel)) return "text-blue-500"; // Server instances
  if (nodeLabel.includes("Service")) return "text-violet-500";
  if (nodeLabel.includes("Payment")) return "text-pink-500";
  if (nodeLabel.includes("Server")) return "text-blue-500";
  if (nodeLabel.includes("Network")) return "text-gray-400";

  return "text-slate-600 dark:text-slate-300";
};

export const WorkflowNode: React.FC<WorkflowNodeProps> = ({
  node,
  isSelected,
  isDragging,
  handlers,
}) => {
  const { glowConfig } = useNodeAnimation(node.label);
  const nodeNeedsGlow = shouldNodeGlow(node.label);

  // Get the glow class directly for Database nodes
  const glowClassName = nodeNeedsGlow ? glowConfig.className : "";

  // Get the icon component
  const IconComponent = getIconComponent(node.icon);

  // Get the icon color based on node label
  const iconColor = getIconColor(node.label);

  return (
    <div
      onMouseDown={(e) => handlers.onMouseDown(e, node.id)}
      onClick={() => handlers.onSelect(node.id)}
      className={`workflow-node ${getNodeClasses(
        node.type,
        isSelected,
        isDragging
      )} ${glowClassName}`}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        transform: "translate(-50%, -50%)",
        zIndex: isSelected ? 50 : 10,
        width: "55px",
        height: "55px",
        minWidth: "55px",
        minHeight: "55px",
      }}
    >
      {/* Input port (for connections) - smaller */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => {
          e.stopPropagation();
          handlers.onEndConnection(e, node.id);
        }}
        className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full cursor-crosshair shadow-md hover:shadow-green-500/60 hover:scale-110 transition-all border border-white dark:border-slate-900"
        title="Drop connection here"
      />

      {/* Output port (for connections) - smaller */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          handlers.onStartConnection(e, node.id);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
        }}
        className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full cursor-crosshair shadow-md hover:shadow-blue-500/60 hover:scale-110 transition-all border border-white dark:border-slate-900"
        title="Drag to connect"
      />

      {/* Node content - compact with icon on top */}
      <div className="flex flex-col items-center justify-center h-full p-1">
        <IconComponent size={24} className={`${iconColor} mb-1`} />
        <p
          className={`text-[8px] font-medium text-center leading-tight ${getNodeTextClasses(
            node.type
          )}`}
        >
          {node.label}
        </p>
      </div>

      {/* Delete button - smaller */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlers.onDelete(node.id);
          }}
          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-all shadow-md hover:shadow-red-500/50 hover:scale-110"
          style={{ zIndex: 100 }}
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
};
