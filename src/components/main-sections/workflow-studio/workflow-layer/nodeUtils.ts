/**
 * Node Utility Functions
 * Icon mapping and color utilities for workflow nodes
 */

import {
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
  Box,
} from "lucide-react";

// Icon mapping for dynamic icon rendering
export const getIconComponent = (iconName: string) => {
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
    Box,
  };
  return iconMap[iconName as keyof typeof iconMap] || Circle;
};

// Function to get icon color based on node label/type
export const getIconColor = (nodeLabel: string): string => {
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
