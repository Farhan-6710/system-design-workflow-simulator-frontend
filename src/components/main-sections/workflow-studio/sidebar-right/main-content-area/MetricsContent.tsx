import React from "react";
import { Input } from "@/components/ui/input";
import {
  calculateServerLoad,
  getServerStatus,
  getLoadColor,
  getRPSColor,
} from "@/utils/workflow-studio/workflow-layer/systemLoadUtils";
import { MetricsContentProps } from "@/types/workflow-studio/sidebar-right";

const MetricsContent: React.FC<MetricsContentProps> = ({
  requestsPerSecond,
  onRequestsPerSecondChange,
}) => {
  const handleRPSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(
      0,
      Math.min(50000, parseInt(e.target.value) || 0)
    );
    onRequestsPerSecondChange(newValue);
  };

  const serverLoad = calculateServerLoad(requestsPerSecond);
  const { status, statusClass, iconClass } = getServerStatus(serverLoad);
  const rpsColorClass = getRPSColor(requestsPerSecond);

  return (
    <>
      <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          System Metrics
        </h3>
      </div>

      {/* RPS Input Control */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
        <label
          htmlFor="rps-input"
          className="block text-xs font-medium text-cyan-600 dark:text-cyan-400 mb-2 uppercase tracking-wide"
        >
          REQUESTS/SEC
        </label>
        <Input
          id="rps-input"
          type="number"
          min="0"
          max="50000"
          value={requestsPerSecond}
          onChange={handleRPSChange}
          className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-center text-sm font-mono"
        />
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          0-50,000 range
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-3">
        {/* Current RPS Display */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center space-x-2 mb-1">
            <div
              className={`w-2 h-2 rounded-full ${rpsColorClass} animate-pulse`}
            ></div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              REQUESTS/S
            </span>
          </div>
          <div className={`text-lg font-bold font-mono ${rpsColorClass}`}>
            {requestsPerSecond.toLocaleString()}
          </div>
        </div>

        {/* Server Load */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 rounded border border-red-500 flex items-center justify-center">
              <div className="w-1 h-1 bg-red-500 rounded-sm"></div>
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              SERVER LOAD
            </span>
          </div>
          <div
            className={`text-lg font-bold font-mono ${
              getLoadColor(serverLoad).split(" ")[0]
            }`}
          >
            {serverLoad}%
          </div>
        </div>

        {/* Status */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center space-x-2 mb-1">
            <div
              className={`w-3 h-3 rounded-full border-2 ${iconClass} flex items-center justify-center`}
            >
              <div
                className={`w-1 h-1 rounded-full ${iconClass.replace(
                  "text-",
                  "bg-"
                )}`}
              ></div>
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              STATUS
            </span>
          </div>
          <div className={`text-sm font-bold ${statusClass}`}>{status}</div>
        </div>

        {/* Motion Indicator */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 rounded-full border-2 border-green-500 flex items-center justify-center">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              MOTION
            </span>
          </div>
          <div className="text-sm font-bold text-green-400">Active</div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="text-xs text-slate-500">Max: 50K RPS</div>
        <div className="flex items-center space-x-1 text-xs text-slate-400">
          <span className="font-mono">⚡</span>
          <span>Live</span>
        </div>
      </div>
    </>
  );
};

export default MetricsContent;
