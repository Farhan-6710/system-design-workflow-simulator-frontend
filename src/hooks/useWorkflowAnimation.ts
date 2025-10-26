import { useMemo } from "react";
import { useWorkflowContext } from "@/contexts/WorkflowContext";
import { EdgeStyle, NodeGlowConfig, GlowType } from "@/types/workflow-studio";
import { calculateAnimationDuration } from "@/utils/workflow-studio/animationUtils";
import {
  getEdgeStyle,
  getNodeGlowConfig,
  shouldNodeGlow,
  getGlowTypeFromRPS,
} from "@/utils/workflow-studio/stylingUtils";

/**
 * Custom hook for edge animations
 */
export const useEdgeAnimation = () => {
  const { requestsPerSecond, rpsRange } = useWorkflowContext();

  const edgeStyle = useMemo((): EdgeStyle => {
    return getEdgeStyle(rpsRange);
  }, [rpsRange]);

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
 * Custom hook for node animations
 */
export const useNodeAnimation = (nodeLabel: string) => {
  const { rpsRange } = useWorkflowContext();

  const shouldGlow = useMemo((): boolean => {
    return shouldNodeGlow(nodeLabel);
  }, [nodeLabel]);

  const glowConfig = useMemo((): NodeGlowConfig => {
    if (!shouldGlow) {
      return getNodeGlowConfig(GlowType.NONE);
    }

    const glowType = getGlowTypeFromRPS(rpsRange);
    return getNodeGlowConfig(glowType);
  }, [shouldGlow, rpsRange]);

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
