/**
 * Shape creation, updating, and finalization utilities
 * Handles all drawing tools and shape manipulation
 */

import type { FabricCanvas, FabricObject, Point, Tool } from "./types";
import { getFabric } from "./fabricLoader";
import { getThemeColor } from "./themeUtils";

/**
 * Create a shape based on tool type
 */
export function createShape(
  tool: Tool,
  startPoint: Point
): FabricObject | null {
  const fabric = getFabric();
  if (!fabric) return null;

  const color = getThemeColor();
  const commonProps = {
    stroke: color,
    strokeWidth: 2,
    fill: "transparent",
    selectable: false,
    evented: false,
  };

  switch (tool) {
    case "rectangle":
      return new fabric.Rect({
        ...commonProps,
        left: startPoint.x,
        top: startPoint.y,
        width: 0,
        height: 0,
      });

    case "circle":
      return new fabric.Circle({
        ...commonProps,
        left: startPoint.x,
        top: startPoint.y,
        radius: 0,
      });

    case "line":
      return new fabric.Line(
        [startPoint.x, startPoint.y, startPoint.x, startPoint.y],
        {
          ...commonProps,
          fill: undefined,
        }
      );

    case "arrow":
      const line = new fabric.Line(
        [startPoint.x, startPoint.y, startPoint.x, startPoint.y],
        {
          ...commonProps,
          fill: undefined,
        }
      );
      (line as unknown as { arrowType: string }).arrowType = "arrow";
      return line;

    case "text":
      return new fabric.Textbox("Type here...", {
        left: startPoint.x,
        top: startPoint.y,
        width: 200,
        fill: color,
        fontSize: 18,
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        selectable: true,
        evented: true,
        editable: true,
        hasBorders: true,
        hasControls: true,
      });

    default:
      return null;
  }
}

/**
 * Update shape during drawing
 */
export function updateShape(
  shape: FabricObject,
  tool: Tool,
  startPoint: Point,
  currentPoint: Point
): void {
  if (!shape) return;

  switch (tool) {
    case "rectangle":
      const left = Math.min(startPoint.x, currentPoint.x);
      const top = Math.min(startPoint.y, currentPoint.y);
      const width = Math.abs(currentPoint.x - startPoint.x);
      const height = Math.abs(currentPoint.y - startPoint.y);
      shape.set({ left, top, width, height });
      break;

    case "circle":
      const deltaX = currentPoint.x - startPoint.x;
      const deltaY = currentPoint.y - startPoint.y;
      const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 2;
      shape.set({
        left: Math.min(startPoint.x, currentPoint.x),
        top: Math.min(startPoint.y, currentPoint.y),
        radius: radius,
      });
      break;

    case "line":
    case "arrow":
      (
        shape as unknown as { set: (props: { x2: number; y2: number }) => void }
      ).set({
        x2: currentPoint.x,
        y2: currentPoint.y,
      });
      break;
  }
}

/**
 * Finalize shape after drawing
 */
export function finalizeShape(
  canvas: FabricCanvas,
  shape: FabricObject,
  tool: Tool
): void {
  if (!shape) return;

  // Make shape selectable and interactive
  shape.set({
    selectable: true,
    evented: true,
    hasBorders: true,
    hasControls: true,
  });
  shape.setCoords();

  // Add arrowhead for arrows
  if (tool === "arrow") {
    addArrowhead(canvas, shape);
  }

  // Handle text editing - only auto-edit if this is a text tool
  if (tool === "text") {
    canvas.setActiveObject(shape);
    setTimeout(() => {
      const textObj = shape as unknown as {
        enterEditing?: () => void;
        hiddenTextarea?: HTMLTextAreaElement;
      };
      if (textObj.enterEditing) {
        textObj.enterEditing();
        if (textObj.hiddenTextarea) {
          textObj.hiddenTextarea.select();
        }
      }
    }, 100);
  }
}

/**
 * Add arrowhead to line
 */
function addArrowhead(canvas: FabricCanvas, lineShape: FabricObject): void {
  const fabric = getFabric();
  if (!fabric) return;

  const line = lineShape as unknown as {
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    stroke?: string;
    strokeWidth?: number;
  };
  const x1 = line.x1 ?? 0;
  const y1 = line.y1 ?? 0;
  const x2 = line.x2 ?? 0;
  const y2 = line.y2 ?? 0;

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLength = 15;
  const headAngle = Math.PI / 6;

  const arrowPoint1X = x2 - headLength * Math.cos(angle - headAngle);
  const arrowPoint1Y = y2 - headLength * Math.sin(angle - headAngle);
  const arrowPoint2X = x2 - headLength * Math.cos(angle + headAngle);
  const arrowPoint2Y = y2 - headLength * Math.sin(angle + headAngle);

  const arrowLine1 = new fabric.Line([x2, y2, arrowPoint1X, arrowPoint1Y], {
    stroke: line.stroke || getThemeColor(),
    strokeWidth: line.strokeWidth || 2,
    selectable: false,
    evented: false,
  });

  const arrowLine2 = new fabric.Line([x2, y2, arrowPoint2X, arrowPoint2Y], {
    stroke: line.stroke || getThemeColor(),
    strokeWidth: line.strokeWidth || 2,
    selectable: false,
    evented: false,
  });

  canvas.add(arrowLine1);
  canvas.add(arrowLine2);
}
