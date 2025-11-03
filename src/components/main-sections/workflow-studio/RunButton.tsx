"use client";

import React from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Play, Square } from "lucide-react";
import { useWorkflowStore } from "@/stores/workflowStore";
import { toast } from "sonner";

interface RunButtonProps {
  runCode: boolean;
  onToggle: (checked: boolean) => void;
}

const RunButton: React.FC<RunButtonProps> = ({ runCode, onToggle }) => {
  const requestsPerSecond = useWorkflowStore(
    (state) => state.requestsPerSecond
  );

  const handleToggle = (checked: boolean) => {
    if (checked && requestsPerSecond < 1) {
      toast.error("0 requests per sec found", {
        description: "Please increase client requests per sec",
        duration: 3000,
      });
      onToggle(checked);
      return;
    }

    if (checked && requestsPerSecond > 0) {
      toast.success(`System running at ${requestsPerSecond} requests per sec`, {
        duration: 2000,
      });
    }

    onToggle(checked);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex items-center gap-3 p-3 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border border-slate-900/10 dark:border-white/10 rounded-xl shadow-lg"
    >
      {/* Status Icon */}
      <motion.div
        animate={{
          scale: runCode ? 1.1 : 1,
          rotate: runCode ? 360 : 0,
        }}
        transition={{
          scale: { duration: 0.2 },
          rotate: { duration: 0.5, ease: "easeInOut" },
        }}
        className={`p-2 rounded-lg transition-colors duration-200 ${
          runCode
            ? "bg-green-500/20 text-green-600 dark:text-green-400"
            : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
        }`}
      >
        {runCode ? (
          <Play size={16} className="fill-current" />
        ) : (
          <Square size={16} />
        )}
      </motion.div>

      {/* Label */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {runCode ? "Running" : "Stopped"}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Workflow Animation
        </span>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-medium transition-colors duration-200 ${
            !runCode
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Stop
        </span>
        <Switch
          checked={runCode}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-green-500"
        />
        <span
          className={`text-xs font-medium transition-colors duration-200 ${
            runCode
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Run
        </span>
      </div>

      {/* Animation Status Indicator */}
      {runCode && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="flex items-center gap-1"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default RunButton;
