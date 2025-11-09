"use client";

import { useState } from "react";
import { DashboardView } from "@/components/main-sections/dashboard/DashboardView";
import { NewVideoView } from "@/components/main-sections/new-video-view/NewVideoView";
import { AIResearchView } from "@/components/main-sections/ai-assistant/AIResearchView";
import { AnalyticsView } from "@/components/main-sections/analytics/AnalyticsView";
import { MainLayout } from "@/app/MainLayout";
import WorkflowStudio from "@/components/main-sections/workflow-studio/WorflowStudio";

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("system-design");

  const renderPage = () => {
    switch (currentPage) {
      case "my-progress":
        return <DashboardView onNavigate={setCurrentPage} />;
      case "bug-practice":
        return <NewVideoView />;
      case "system-design":
        return <WorkflowStudio />;
      case "challenges":
        return <AnalyticsView />;
      case "recruiter-assessment":
        return <AIResearchView />;
      case "settings":
        return <AnalyticsView />;
      default:
        return <WorkflowStudio />;
    }
  };
  return (
    <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  );
}
