/**
 * Canvas theme hook
 * Handles theme changes and applies appropriate colors to canvas objects
 */

import { useEffect } from "react";
import {
  applyThemeColors,
  type FabricCanvas,
} from "@/utils/workflow-studio/annotation-layer";

export interface UseCanvasThemeProps {
  fabricRef: React.RefObject<FabricCanvas | null>;
}

export const useCanvasTheme = ({ fabricRef }: UseCanvasThemeProps) => {
  useEffect(() => {
    if (!fabricRef.current) return;

    applyThemeColors(fabricRef.current);

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      if (fabricRef.current) {
        applyThemeColors(fabricRef.current);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      if (fabricRef.current) {
        applyThemeColors(fabricRef.current);
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [fabricRef]);

  return null; // This hook doesn't return anything
};
