import { Node, Edge } from "@/types/workflow-studio";
import {
  buildNodeFromSpec,
  buildEdgesFromPairs,
} from "@/utils/workflow-studio/workflow";

// Nodes are now built from `nodeOptions` through the initializer helpers

// Initial nodes displayed on the workflow canvas
export const initialNodes: Node[] = [
  // Client
  buildNodeFromSpec({
    optionId: "client-app",
    id: 1,
    label: "Client",
    x: 385,
    y: 280,
    position: "start",
  }),
  // API Gateway
  buildNodeFromSpec({
    optionId: "api-gateway",
    id: 2,
    label: "Gateway",
    x: 465,
    y: 280,
  }),
  // Services Layer
  buildNodeFromSpec({
    optionId: "service",
    id: 4,
    label: "Service",
    x: 545,
    y: 280,
  }),
  // Load Balancers Layer
  buildNodeFromSpec({
    optionId: "load-balancer",
    id: 7,
    label: "Load Balancer",
    x: 625,
    y: 280,
  }),
  // Servers Layer
  buildNodeFromSpec({
    optionId: "sync-compute",
    id: 12,
    label: "Server",
    x: 710,
    y: 200,
  }),
  buildNodeFromSpec({
    optionId: "sync-compute",
    id: 13,
    label: "Server",
    x: 710,
    y: 280,
  }),
  buildNodeFromSpec({
    optionId: "sync-compute",
    id: 14,
    label: "Server",
    x: 710,
    y: 360,
  }),
  // Databases Layer
  buildNodeFromSpec({
    optionId: "database",
    id: 19,
    label: "Database",
    x: 800,
    y: 280,
  }),
];

// Initial edges connecting the nodes - using UUID format for consistency
export const initialEdges: Edge[] = buildEdgesFromPairs([
  // Client to Gateway
  [1, 2],
  // Gateway to Services
  [2, 4],
  // Services to Load Balancers
  [4, 7],
  // Load Balancers to Servers
  [7, 12],
  [7, 13],
  [7, 14],
  // Servers to Databases
  [12, 19],
  [13, 19],
  [14, 19],
]);
