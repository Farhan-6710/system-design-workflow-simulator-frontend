"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { getUserInitials, getUserDisplayName } from "@/utils/auth/userUtils";
import { ConfirmationModal } from "@/components/atoms/ConfirmationModal";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

export function UserAvatar() {
  const { user, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to sign out";
      toast.error(message);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative">
          <Avatar className="w-10 h-10 cursor-pointer border-2 border-transparent hover:border-primary dark:hover:border-primary transition-colors">
            <AvatarFallback className="bg-gradient-primary text-white font-semibold">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {getUserDisplayName(user)}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogoutClick}
          className="cursor-pointer text-red-600 dark:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <ConfirmationModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        title="Logout"
        description="Are you sure you want to log out from your account?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleSignOut}
        variant="destructive"
        toastMessage="Logged out successfully"
        toastDescription="You have been signed out of your account"
      />
    </DropdownMenu>
  );
}
