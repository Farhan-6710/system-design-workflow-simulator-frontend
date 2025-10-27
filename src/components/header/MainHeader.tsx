"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "../extras/ModeToggele";
import { Badge, Bell, Menu } from "lucide-react";
import { UserAvatar } from "../auth/UserAvatar";
import { AuthDialog } from "../auth/AuthDialog";
import { useAuth } from "@/contexts/auth-context";

interface HeaderProps {
  onToggle: () => void;
}

const MainHeader: React.FC<HeaderProps> = ({ onToggle }) => {
  const { user, loading } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
      <Button variant="ghost" size="icon" onClick={onToggle}>
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-4">
        <ModeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white">
            3
          </Badge>
        </Button>

        {!loading && (
          <>
            {user ? (
              <UserAvatar />
            ) : (
              <Button
                onClick={() => setAuthDialogOpen(true)}
                className="bg-gradient-primary hover:bg-gradient-primary/70 text-white cursor-pointer"
              >
                Get Started
              </Button>
            )}
          </>
        )}

        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </div>
    </header>
  );
};

export default MainHeader;
