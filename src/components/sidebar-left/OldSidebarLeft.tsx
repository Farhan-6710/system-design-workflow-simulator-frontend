import { motion } from "framer-motion";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Home,
  Settings,
  Sparkles,
  Video,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

// Animation variants for consistent styling with dashboard
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

interface SidebarLeftProps {
  sidebarExpanded: boolean;
  showTooltips: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
  handleToggleSidebar: () => void;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({
  sidebarExpanded,
  showTooltips,
  currentPage,
  onNavigate,
  handleToggleSidebar,
}) => {
  const [credits] = useState(850);
  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarExpanded ? 284 : 74 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col relative"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center"
      >
        <motion.div
          initial={false}
          animate={{ scale: sidebarExpanded ? 1 : 1 }}
          className={`flex items-center ${sidebarExpanded ? "gap-3" : "gap-0"}`}
        >
          <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <motion.div
            initial={false}
            animate={{
              opacity: sidebarExpanded ? 1 : 0,
              x: sidebarExpanded ? 0 : -20,
            }}
            transition={{ duration: 0.2, delay: sidebarExpanded ? 0.15 : 0 }}
            className={`overflow-hidden ${
              sidebarExpanded ? "block" : "hidden"
            }`}
          >
            <h1 className="text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap">
              System Design
            </h1>
            <p className="text-xs text-slate-500 whitespace-nowrap">Pro Plan</p>
          </motion.div>
        </motion.div>
      </motion.div>

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
              {!sidebarExpanded && (
                <TooltipContent side="right">
                  <p>{navItem.label}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </motion.div>
        ))}

        {sidebarExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 w-full"
          >
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-5 border border-primary/20 dark:border-primary shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  Credits
                </span>
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary dark:text-white mb-3">
                {credits}
              </div>
              <Button
                size="sm"
                className="w-full bg-primary hover:bg-primary/90 text-gray-200 text-xs font-bold"
              >
                Add More
              </Button>
            </div>
          </motion.div>
        )}
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="p-4 px-2 border-t border-slate-200 dark:border-slate-800 space-y-2"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-11 w-full",
                  sidebarExpanded
                    ? "justify-start gap-3 px-4"
                    : "justify-center gap-0 px-0"
                )}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
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
                  className={`whitespace-nowrap font-medium ${
                    sidebarExpanded ? "block" : "hidden"
                  }`}
                >
                  Settings
                </motion.span>
              </Button>
            </TooltipTrigger>
            {!sidebarExpanded && showTooltips && (
              <TooltipContent side="right">
                <p>Settings</p>
              </TooltipContent>
            )}
          </Tooltip>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0, duration: 0.4 }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-11 w-full",
                  sidebarExpanded
                    ? "justify-start gap-3 px-4"
                    : "justify-center gap-0 px-0"
                )}
              >
                <HelpCircle className="w-5 h-5 flex-shrink-0" />
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
                  className={`whitespace-nowrap font-medium ${
                    sidebarExpanded ? "block" : "hidden"
                  }`}
                >
                  Help
                </motion.span>
              </Button>
            </TooltipTrigger>
            {!sidebarExpanded && showTooltips && (
              <TooltipContent side="right">
                <p>Help</p>
              </TooltipContent>
            )}
          </Tooltip>
        </motion.div>
      </motion.div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleSidebar}
        className="absolute -right-3 top-24 h-7 w-7 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
      >
        {sidebarExpanded ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </Button>
    </motion.aside>
  );
};

export default SidebarLeft;
