import React, { createContext, useContext, ReactNode } from "react";
import { RPSValue, RPSRange, GlowType } from "@/types/workflow-studio/workflow";
import { useWorkflowStore } from "@/stores/workflowStore";

// Context interface
interface WorkflowContextType {
  requestsPerSecond: RPSValue;
  setRequestsPerSecond: (rps: RPSValue) => void;
  rpsRange: RPSRange;
  globalGlowType: GlowType;
}

// Create context
const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
);

// Helper function to determine RPS range
const getRPSRange = (rps: RPSValue): RPSRange => {
  if (rps <= 500) return RPSRange.LOW;
  if (rps <= 5000) return RPSRange.MEDIUM;
  return RPSRange.HIGH;
};

// Helper function to determine global glow type
const getGlowType = (rpsRange: RPSRange): GlowType => {
  switch (rpsRange) {
    case RPSRange.LOW:
      return GlowType.BLUE;
    case RPSRange.MEDIUM:
      return GlowType.YELLOW;
    case RPSRange.HIGH:
      return GlowType.RED;
    default:
      return GlowType.NONE;
  }
};

// Provider component
interface WorkflowProviderProps {
  children: ReactNode;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({
  children,
}) => {
  // Get RPS data from Zustand store instead of props
  const requestsPerSecond = useWorkflowStore(
    (state) => state.requestsPerSecond
  );
  const setRequestsPerSecond = useWorkflowStore(
    (state) => state.setRequestsPerSecond
  );

  const rpsRange = getRPSRange(requestsPerSecond);
  const globalGlowType = getGlowType(rpsRange);

  const value: WorkflowContextType = {
    requestsPerSecond,
    setRequestsPerSecond,
    rpsRange,
    globalGlowType,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

// Custom hook to use workflow context
export const useWorkflowContext = (): WorkflowContextType => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error(
      "useWorkflowContext must be used within a WorkflowProvider"
    );
  }
  return context;
};

// Export context for advanced usage
export { WorkflowContext };
