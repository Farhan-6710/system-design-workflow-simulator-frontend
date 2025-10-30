import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { internalToDisplayZoom } from "@/constants/canvas";

interface ZoomIndicatorProps {
  currentZoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomChange: (zoom: number) => void;
  onResetZoom?: () => void;
  className?: string;
}

export const ZoomIndicator: React.FC<ZoomIndicatorProps> = ({
  currentZoom,
  minZoom,
  maxZoom,
  onZoomChange,
  onResetZoom,
  className,
}) => {
  const [tooltipY, setTooltipY] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Convert zoom scale to percentage for slider (0-100)
  const zoomToSliderValue = (zoom: number): number => {
    return ((zoom - minZoom) / (maxZoom - minZoom)) * 100;
  };

  // Convert slider percentage back to zoom scale
  const sliderValueToZoom = (value: number): number => {
    return minZoom + (value / 100) * (maxZoom - minZoom);
  };

  const handleSliderChange = (values: number[]) => {
    const newZoom = sliderValueToZoom(values[0]);
    onZoomChange(newZoom);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (sliderContainerRef.current) {
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const relativeY = event.clientY - rect.top;
      setTooltipY(relativeY);
    }
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const currentSliderValue = zoomToSliderValue(currentZoom);

  // Convert internal zoom scale to user-friendly display percentage
  const displayPercentage = Math.round(internalToDisplayZoom(currentZoom));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className={cn(
        "flex flex-col items-center gap-3 bg-white/20 dark:bg-slate-900/10 backdrop-blur-md border border-slate-900/20 dark:border-white/10 rounded-xl p-4 shadow-lg dark:shadow-2xl w-14",
        className
      )}
    >
      {/* Zoom In Icon */}
      <button
        onClick={() => onZoomChange(Math.min(currentZoom + 0.1, maxZoom))}
        className="p-2 rounded-lg bg-white/30 dark:bg-white/10 backdrop-blur-sm border border-slate-900/20 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/20 hover:border-slate-900/30 dark:hover:border-white/30 transition-colors group"
        title="Zoom In"
        disabled={currentZoom >= maxZoom}
      >
        <ZoomIn
          size={16}
          className="text-slate-700 dark:text-white group-disabled:opacity-40"
        />
      </button>

      {/* Vertical Slider Container with Tooltip */}
      <div
        ref={sliderContainerRef}
        className="flex flex-col items-center justify-center h-64 w-full relative"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Slider
          value={[currentSliderValue]}
          onValueChange={handleSliderChange}
          max={100}
          min={0}
          step={1}
          orientation="vertical"
          className="[&_[data-slot=slider-track]]:bg-slate-300 dark:[&_[data-slot=slider-track]]:bg-slate-600 [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-primary [&_[data-slot=slider-thumb]]:size-3"
        />

        {/* Dynamic Tooltip */}
        <div
          className={`absolute right-full mr-2 transition-opacity duration-200 pointer-events-none z-50 ${
            showTooltip ? "opacity-100" : "opacity-0"
          }`}
          style={{ top: `${tooltipY}px`, transform: "translateY(-50%)" }}
        >
          <div className="text-xs font-medium py-1 px-2 rounded-md bg-black/90 backdrop-filter backdrop-blur-[10px] border border-white/10 text-white shadow-lg">
            {displayPercentage}%{/* Tooltip arrow pointing right */}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-4 border-transparent border-l-black/90"></div>
          </div>
        </div>
      </div>

      {/* Zoom Out Icon */}
      <button
        onClick={() => onZoomChange(Math.max(currentZoom - 0.1, minZoom))}
        className="p-2 rounded-lg bg-white/30 dark:bg-white/10 backdrop-blur-sm border border-slate-900/20 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/20 hover:border-slate-900/30 dark:hover:border-white/30 transition-colors group"
        title="Zoom Out"
        disabled={currentZoom <= minZoom}
      >
        <ZoomOut
          size={16}
          className="text-slate-700 dark:text-white group-disabled:opacity-40"
        />
      </button>

      {/* Reset Zoom Button */}
      {onResetZoom && (
        <button
          onClick={onResetZoom}
          className="p-1.5 rounded-lg bg-white/30 dark:bg-white/10 backdrop-blur-sm border border-slate-900/20 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/20 hover:border-slate-900/30 dark:hover:border-white/30 transition-colors group"
          title="Reset Zoom (100%)"
        >
          <RotateCcw size={14} className="text-slate-700 dark:text-white" />
        </button>
      )}
    </motion.div>
  );
};

export default ZoomIndicator;
