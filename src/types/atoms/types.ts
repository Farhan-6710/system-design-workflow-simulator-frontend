import { SidebarRightItem } from "../workflow-studio";

export interface TooltipComponentProps {
  /** The content to be wrapped with tooltip functionality */
  children: React.ReactNode;
  /** The tooltip text to display */
  tooltip: string;
  /** Position of the tooltip relative to the children */
  position?: "left" | "right" | "top" | "bottom";
  /** Additional CSS classes to apply to the wrapper */
  className?: string;
}

export interface DockComponentProps {
  activeItem?: string | null;
  position?: "top" | "bottom" | "left" | "right" | "top-left";
  collapsible?: boolean;
  direction?: "horizontal" | "vertical"; // New prop to control layout direction
  tooltipPosition?: "left" | "right" | "top" | "bottom"; // New prop to control tooltip placement
  items: SidebarRightItem[]; // Accept items as prop
  onItemClick?: (itemId: string, index: number) => void; // Optional custom click handler
  onMouseEnter?: (index: number) => void; // Optional mouse enter handler
  onMouseLeave?: () => void; // Optional mouse leave handler
  className?: string; // Additional custom classes
  idMapping?: Record<string, string>; // Optional mapping for active state detection
}
