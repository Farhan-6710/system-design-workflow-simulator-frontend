import React, { createContext, useContext, ReactNode } from "react";
import { useCanvasControls } from "@/hooks/workflow-studio/useViewportControls";
import { CanvasControlsHook } from "@/types/workflow-studio";

const CanvasControlsContext = createContext<CanvasControlsHook | undefined>(
  undefined
);

export const useCanvasControlsContext = (): CanvasControlsHook => {
  const context = useContext(CanvasControlsContext);
  if (!context) {
    throw new Error(
      "useCanvasControlsContext must be used within a CanvasControlsProvider"
    );
  }
  return context;
};

interface CanvasControlsProviderProps {
  children: ReactNode;
}

export const CanvasControlsProvider: React.FC<CanvasControlsProviderProps> = ({
  children,
}) => {
  const canvasControls = useCanvasControls();

  return (
    <CanvasControlsContext.Provider value={canvasControls}>
      {children}
    </CanvasControlsContext.Provider>
  );
};
