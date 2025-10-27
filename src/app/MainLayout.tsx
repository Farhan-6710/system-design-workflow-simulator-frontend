"use client";

import { useState, useRef, useEffect } from "react";
import SidebarLeft from "@/components/sidebar-left/SidebarLeft";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainHeader from "../components/header/MainHeader";

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
  const [showTooltips, setShowTooltips] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleToggleSidebar = () => {
    // Clear any existing timeout to prevent overlapping timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setShowTooltips(false);
    setSidebarExpanded(!sidebarExpanded);

    // Store timeout reference for cleanup
    timeoutRef.current = setTimeout(() => {
      setShowTooltips(true);
      timeoutRef.current = null; // Clear reference after completion
    }, 400);
  };

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
