import { Node, Edge } from "@/types/workflow-studio";
import {
  buildNodeFromSpec,
  buildEdgesFromPairs,
  createNodeId,
} from "@/utils/workflow-studio/workflow-layer/workflowCoreUtils";

// Nodes are now built from `nodeOptions` through the initializer helpers

// Pre-define consistent node IDs for initial setup - sequential numbering
const node1Id = createNodeId(1); // Client
const node2Id = createNodeId(2); // API Gateway
const node3Id = createNodeId(3); // Service
const node4Id = createNodeId(4); // Load Balancer
const node5Id = createNodeId(5); // Server 1
const node6Id = createNodeId(6); // Server 2
const node7Id = createNodeId(7); // Server 3
const node8Id = createNodeId(8); // Database

// Initial nodes displayed on the workflow canvas
export const initialNodes: Node[] = [
  // Client
  buildNodeFromSpec({
    optionId: "client-app",
    id: node1Id,
    label: "Client",
    x: 385,
    y: 280,
    position: "start",
  }),
  // API Gateway
  buildNodeFromSpec({
    optionId: "api-gateway",
    id: node2Id,
    label: "Gateway",
    x: 465,
    y: 280,
  }),
  // Services Layer
  buildNodeFromSpec({
    optionId: "service",
    id: node3Id,
    label: "Service",
    x: 545,
    y: 280,
  }),
  // Load Balancers Layer
  buildNodeFromSpec({
    optionId: "load-balancer",
    id: node4Id,
    label: "Load Balancer",
    x: 625,
    y: 280,
  }),
  // Servers Layer
  buildNodeFromSpec({
    optionId: "sync-compute",
    id: node5Id,
    label: "Server",
    x: 710,
    y: 200,
  }),
  buildNodeFromSpec({
    optionId: "sync-compute",
    id: node6Id,
    label: "Server",
    x: 710,
    y: 280,
  }),
  buildNodeFromSpec({
    optionId: "sync-compute",
    id: node7Id,
    label: "Server",
    x: 710,
    y: 360,
  }),
  // Databases Layer
  buildNodeFromSpec({
    optionId: "database",
    id: node8Id,
    label: "Database",
    x: 800,
    y: 280,
  }),
];

// Initial edges connecting the nodes - using the same sequential IDs as the nodes
export const initialEdges: Edge[] = buildEdgesFromPairs([
  // Client to Gateway
  [node1Id, node2Id],
  // Gateway to Services
  [node2Id, node3Id],
  // Services to Load Balancers
  [node3Id, node4Id],
  // Load Balancers to Servers
  [node4Id, node5Id],
  [node4Id, node6Id],
  [node4Id, node7Id],
  // Servers to Databases
  [node5Id, node8Id],
  [node6Id, node8Id],
  [node7Id, node8Id],
]);
