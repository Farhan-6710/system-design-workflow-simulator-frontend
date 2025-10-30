"use client";

import { useState, useEffect } from "react";
import SidebarLeft from "@/components/sidebar-left/SidebarLeft";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainHeader from "../components/header/MainHeader";
import { useWorkflowStore } from "@/stores/workflowStore";

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function MainLayout({
  children,
  currentPage,
  onNavigate,
}: MainLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const setSidebarRightExpanded = useWorkflowStore(
    (state) => state.setSidebarRightExpanded
  );
  const setSelectedTab = useWorkflowStore((state) => state.setSelectedTab);

  // Auto-collapse sidebar when navigating to system-design
  useEffect(() => {
    if (currentPage === "system-design") {
      setSidebarExpanded(false);
      setSidebarRightExpanded(true);
      setSelectedTab("add-node");
    }
  }, [currentPage, setSidebarRightExpanded, setSelectedTab]);

  const handleToggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Simple: show tooltips when sidebar is collapsed
  const showTooltips = !sidebarExpanded;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <SidebarLeft
          sidebarExpanded={sidebarExpanded}
          showTooltips={showTooltips}
          currentPage={currentPage}
          onNavigate={onNavigate}
          handleToggleSidebar={handleToggleSidebar}
        />

        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <MainHeader onToggle={handleToggleSidebar} />

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
