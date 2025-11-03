import { Node, Edge } from "@/types/workflow-studio";
import { nodeOptions } from "@/constants/nodeOptions";
import { createEdgeId } from "@/utils/workflow-studio/workflow";

// Helper function to create a node from nodeOptions with position
const createNodeFromOption = (
  nodeOptionId: string,
  id: number,
  label: string,
  x: number,
  y: number,
  position: "start" | "process" | "end" = "process"
): Node => {
  const nodeOption = nodeOptions.find((option) => option.id === nodeOptionId);
  if (!nodeOption) {
    throw new Error(`Node option ${nodeOptionId} not found in nodeOptions`);
  }

  // Get default configurations
  const defaultConfigurations: Record<string, string | number | boolean> = {};
  if (nodeOption.configurations) {
    Object.values(nodeOption.configurations).forEach((field) => {
      defaultConfigurations[field.key] = field.defaultValue;
    });
  }

  return {
    id,
    label,
    x,
    y,
    position,
    icon: nodeOption.icon,
    configurations: defaultConfigurations,
  };
};

// Initial nodes displayed on the workflow canvas
export const initialNodes: Node[] = [
  // Client - keep as is (0px push)
  createNodeFromOption("client-app", 1, "Client", 385, 280, "start"),
  // API Gateway - keep as is (15px push from original)
  createNodeFromOption("api-gateway", 2, "Gateway", 465, 280), // 450 + 15
  // Services Layer - push 40px right (was 20px, now +20px more)
  // createNodeFromOption("service", 3, "Service", 555, 190), // 515 + 40
  createNodeFromOption("service", 4, "Service", 555, 280), // 515 + 40
  // createNodeFromOption("service", 5, "Service", 555, 370), // 515 + 40
  // Load Balancers - push 45px right (was 25px, now +20px more)
  // createNodeFromOption("load-balancer", 6, "User LB", 625, 190), // 580 + 45
  createNodeFromOption("load-balancer", 7, "Order LB", 625, 280), // 580 + 45
  // createNodeFromOption("load-balancer", 8, "Pay LB", 625, 370), // 580 + 45
  // Servers - push 50px right (was 30px, now +20px more)
  // createNodeFromOption("sync-compute", 9, "Server", 695, 160), // 645 + 50
  // createNodeFromOption("sync-compute", 10, "Server", 695, 190), // 645 + 50
  // createNodeFromOption("sync-compute", 11, "Server", 695, 220), // 645 + 50
  createNodeFromOption("sync-compute", 12, "Server", 695, 250), // 645 + 50
  createNodeFromOption("sync-compute", 13, "Server", 695, 280), // 645 + 50
  createNodeFromOption("sync-compute", 14, "Server", 695, 310), // 645 + 50
  // createNodeFromOption("sync-compute", 15, "Server", 695, 340), // 645 + 50
  // createNodeFromOption("sync-compute", 16, "Server", 695, 370), // 645 + 50
  // createNodeFromOption("sync-compute", 17, "Server", 695, 400), // 645 + 50
  // Databases - push 55px right (was 35px, now +20px more)
  // createNodeFromOption("database", 18, "User DB", 760, 190), // 705 + 55
  createNodeFromOption("database", 19, "Order DB", 760, 280), // 705 + 55
  // createNodeFromOption("database", 20, "Pay DB", 760, 370), // 705 + 55
];

// Initial edges connecting the nodes - using UUID format for consistency
export const initialEdges: Edge[] = [
  // Client to Gateway
  { id: createEdgeId(1), source: 1, target: 2 },
  // Gateway to Services
  { id: createEdgeId(2), source: 2, target: 3 },
  { id: createEdgeId(3), source: 2, target: 4 },
  { id: createEdgeId(4), source: 2, target: 5 },
  // Services to Load Balancers
  { id: createEdgeId(5), source: 3, target: 6 },
  { id: createEdgeId(6), source: 4, target: 7 },
  { id: createEdgeId(7), source: 5, target: 8 },
  // Load Balancers to Servers
  { id: createEdgeId(8), source: 6, target: 9 },
  { id: createEdgeId(9), source: 6, target: 10 },
  { id: createEdgeId(10), source: 6, target: 11 },
  { id: createEdgeId(11), source: 7, target: 12 },
  { id: createEdgeId(12), source: 7, target: 13 },
  { id: createEdgeId(13), source: 7, target: 14 },
  { id: createEdgeId(14), source: 8, target: 15 },
  { id: createEdgeId(15), source: 8, target: 16 },
  { id: createEdgeId(16), source: 8, target: 17 },
  // Servers to Databases
  { id: createEdgeId(17), source: 9, target: 18 },
  { id: createEdgeId(18), source: 10, target: 18 },
  { id: createEdgeId(19), source: 11, target: 18 },
  { id: createEdgeId(20), source: 12, target: 19 },
  { id: createEdgeId(21), source: 13, target: 19 },
  { id: createEdgeId(22), source: 14, target: 19 },
  { id: createEdgeId(23), source: 15, target: 20 },
  { id: createEdgeId(24), source: 16, target: 20 },
  { id: createEdgeId(25), source: 17, target: 20 },
];
