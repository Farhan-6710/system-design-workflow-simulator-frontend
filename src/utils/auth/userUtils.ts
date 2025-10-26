import { User } from "@supabase/supabase-js";

/**
 * Generate user initials from user metadata
 */
export const getUserInitials = (user: User): string => {
  const name = user.user_metadata?.full_name || user.email || "";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Get user display name from user metadata
 */
export const getUserDisplayName = (user: User): string => {
  return user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
};
