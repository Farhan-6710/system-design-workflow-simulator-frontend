import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CreditCard,
  HelpCircle,
  Home,
  Sparkles,
  Video,
} from "lucide-react";

const navItems = [
  { id: "my-progress", label: "My Progress", icon: Home },
  { id: "bug-practice", label: "Bug Practice", icon: Video },
  { id: "system-design", label: "System Design", icon: Sparkles },
  { id: "challenges", label: "Challenges", icon: BarChart3 },
  {
    id: "recruiter-assessments",
    label: "Recruiter Assessments",
    icon: CreditCard,
  },
  { id: "settings", label: "Settings", icon: HelpCircle },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

interface SidebarNavigationProps {
  sidebarExpanded: boolean;
  showTooltips: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  sidebarExpanded,
  showTooltips,
  currentPage,
  onNavigate,
}) => {
  return (
    <motion.nav
      variants={container}
      initial="hidden"
      animate="show"
      className={`flex-1 px-3 py-4 space-y-2 overflow-y-auto flex flex-col transition-all ${
        sidebarExpanded
          ? "items-start duration-200"
          : "items-start duration-200 delay-300"
      }`}
    >
      {navItems.map((navItem, index) => (
        <motion.div
          key={navItem.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
          className={`${sidebarExpanded ? "w-full" : "w-fit"}`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentPage === navItem.id ? "default" : "ghost"}
                className={cn(
                  "h-11 rounded-xl",
                  sidebarExpanded
                    ? "justify-start gap-3 w-full !px-6"
                    : "justify-center gap-0 w-12 px-0",
                  currentPage === navItem.id &&
                    "bg-primary text-white shadow-md"
                )}
                onClick={() => onNavigate(navItem.id)}
              >
                <navItem.icon className="w-8 h-8 flex-shrink-0" />
                <motion.span
                  initial={false}
                  animate={{
                    opacity: sidebarExpanded ? 1 : 0,
                    x: sidebarExpanded ? 0 : -10,
                  }}
                  transition={{
                    duration: 0.2,
                    delay: sidebarExpanded ? 0.15 : 0,
                  }}
                  className={`whitespace-nowrap font-semibold text-md ${
                    sidebarExpanded ? "block" : "hidden"
                  }`}
                >
                  {navItem.label}
                </motion.span>
              </Button>
            </TooltipTrigger>
            {!sidebarExpanded && showTooltips && (
              <TooltipContent side="right">
                <p>{navItem.label}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </motion.div>
      ))}
    </motion.nav>
  );
};
