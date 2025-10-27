import React from "react";
import { Node } from "@/types/workflow-studio/workflow";
import { useWorkflowStore } from "@/stores/workflowStore";
import MetricsContent from "../MetricsContent";

interface NodeDetailsConfigurationProps {
  node: Node;
}

const NodeDetailsConfiguration: React.FC<NodeDetailsConfigurationProps> = ({
  node,
}) => {
  // Get requestsPerSecond from workflow store for client-app metrics
  const requestsPerSecond = useWorkflowStore(
    (state) => state.requestsPerSecond
  );
  const setRequestsPerSecond = useWorkflowStore(
    (state) => state.setRequestsPerSecond
  );

  // Check if this is a client-app node (based on the Smartphone icon)
  const isClientApp = node.icon === "Smartphone";

  // If no configurations and not a client app, don't render anything
  const hasConfigurations =
    node.configurations && Object.keys(node.configurations).length > 0;
  if (!hasConfigurations && !isClientApp) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Current Configuration Section */}
      {hasConfigurations && (
        <div className="space-y-2">
          <h4 className="text-md font-medium text-slate-700 dark:text-slate-300">
            Current Configuration
          </h4>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="space-y-2">
              {Object.entries(node.configurations!).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}:
                  </span>
                  <span className="text-sm text-slate-800 dark:text-slate-200">
                    {typeof value === "boolean"
                      ? value
                        ? "Yes"
                        : "No"
                      : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Metrics Section - Only for Client App nodes */}
      {isClientApp && (
        <div className="space-y-2">
          <MetricsContent
            requestsPerSecond={requestsPerSecond}
            onRequestsPerSecondChange={setRequestsPerSecond}
          />
        </div>
      )}
    </div>
  );
};

export default NodeDetailsConfiguration;
