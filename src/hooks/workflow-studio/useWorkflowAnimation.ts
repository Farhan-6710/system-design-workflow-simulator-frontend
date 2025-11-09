import { useMemo } from "react";
import { useWorkflowContext } from "@/contexts/WorkflowContext";
import { useWorkflowStore } from "@/stores/workflowStore";
import { EdgeStyle, NodeGlowConfig, GlowType } from "@/types/workflow-studio";
import {
  calculateAnimationDuration,
  getEdgeStyle,
  getNodeGlowConfig,
  getNodeGlowConfigFromRPS,
} from "@/utils/workflow-studio/workflow-layer/animationUtils";

/**
 * Custom hook for edge animations
 */
export const useEdgeAnimation = () => {
  const { requestsPerSecond } = useWorkflowContext();

  const edgeStyle = useMemo((): EdgeStyle => {
    return getEdgeStyle(requestsPerSecond);
  }, [requestsPerSecond]);

  const animationDuration = useMemo((): number => {
    return calculateAnimationDuration(requestsPerSecond);
  }, [requestsPerSecond]);

  const animationStyle = useMemo(() => {
    return {
      "--flow-animation-duration": `${animationDuration}s`,
    } as React.CSSProperties;
  }, [animationDuration]);

  return {
    edgeStyle,
    animationDuration,
    animationStyle,
  };
};

/**
 * Custom hook for node animations (OPTIMIZED)
 */
export const useNodeAnimation = () => {
  const { requestsPerSecond } = useWorkflowContext();
  const runCode = useWorkflowStore((state) => state.runCode);

  const shouldGlow = useMemo((): boolean => {
    // Only glow when code is running
    return runCode;
  }, [runCode]);

  const glowConfig = useMemo((): NodeGlowConfig => {
    if (!shouldGlow) {
      return getNodeGlowConfig(GlowType.NONE);
    }

    // Use RPS directly instead of converting through range
    return getNodeGlowConfigFromRPS(requestsPerSecond);
  }, [shouldGlow, requestsPerSecond]);

  return {
    shouldGlow,
    glowConfig,
    glowClassName: glowConfig.className,
  };
};

/**
 * Custom hook for general workflow animations
 */
export const useWorkflowAnimation = () => {
  const { requestsPerSecond, rpsRange, globalGlowType } = useWorkflowContext();

  const animationDuration = useMemo((): number => {
    return calculateAnimationDuration(requestsPerSecond);
  }, [requestsPerSecond]);

  const globalAnimationStyle = useMemo(() => {
    return {
      "--flow-animation-duration": `${animationDuration}s`,
    } as React.CSSProperties;
  }, [animationDuration]);

  return {
    animationDuration,
    globalAnimationStyle,
    rpsRange,
    globalGlowType,
  };
};
