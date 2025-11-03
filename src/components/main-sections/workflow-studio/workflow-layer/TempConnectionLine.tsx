import { useWorkflowStore } from "@/stores/workflowStore";
import React from "react";

export const TempConnectionLine = () => {
  const tempLine = useWorkflowStore((state) => state.tempLine);

  // Don't render anything if tempLine is null
  if (!tempLine) {
    return null;
  }

  return (
    <g>
      <path
        d={`M${tempLine.x1},${tempLine.y1} Q${
          (tempLine.x1 + tempLine.x2) / 2
        },${(tempLine.y1 + tempLine.y2) / 3 + 30} ${tempLine.x2},${
          tempLine.y2
        }`}
        stroke="#f97316"
        strokeWidth="1"
        fill="none"
        strokeDasharray="2.5,2.5"
        opacity="0.7"
        strokeLinecap="round"
      />
    </g>
  );
};
