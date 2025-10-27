import React from "react";

const NoSelectionView: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
        Selected Edge/Node Summary
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Select an edge or node to view its details and configuration.
      </p>
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          No edge or node selected
        </p>
      </div>
    </div>
  );
};

export default NoSelectionView;