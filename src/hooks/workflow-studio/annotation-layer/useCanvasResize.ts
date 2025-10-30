/**
 * Canvas resize hook
 * Handles container resize and updates canvas dimensions accordingly
 */

import { useEffect } from "react";
import type { FabricCanvas } from "@/utils/workflow-studio/annotation-layer";

export interface UseCanvasResizeProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  fabricRef: React.RefObject<FabricCanvas | null>;
}

export const useCanvasResize = ({
  containerRef,
  fabricRef,
}: UseCanvasResizeProps) => {
  useEffect(() => {
    if (!containerRef.current || !fabricRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && fabricRef.current) {
        const { width, height } = entry.contentRect;
        fabricRef.current.setDimensions({ width, height });
        fabricRef.current.renderAll();
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [containerRef, fabricRef]);

  return null; // This hook doesn't return anything
};
