/**
 * TypeScript interfaces and types for annotation layer
 */

import type { Tool } from "@/components/main-sections/workflow-studio/annotation-layer/AnnotationLayer";

// Fabric.js types
export interface FabricCanvas {
  add(object: FabricObject): void;
  remove(object: FabricObject): void;
  clear(): void;
  dispose(): void;
  renderAll(): void;
  getPointer(e: Event): { x: number; y: number };
  getObjects(): FabricObject[];
  getActiveObjects(): FabricObject[];
  getActiveObject(): FabricObject | null;
  setActiveObject(object: FabricObject): void;
  discardActiveObject(): void;
  setDimensions(dimensions: { width: number; height: number }): void;
  getWidth(): number;
  getHeight(): number;
  toJSON(propertiesToInclude?: string[]): Record<string, unknown>;
  loadFromJSON(json: Record<string, unknown>, callback: () => void): void;
  toDataURL(options?: Record<string, unknown>): string;
  toSVG(): string;
  setViewportTransform(vpt: number[]): void;

  // Canvas properties
  isDrawingMode: boolean;
  selection: boolean;
  skipTargetFind: boolean;
  defaultCursor: string;
  hoverCursor: string;
  moveCursor: string;
  freeDrawingBrush: {
    width: number;
    color: string;
  } | null;

  // Event methods
  on(eventName: string, handler: (e?: unknown) => void): void;
  off(eventName: string, handler: (e?: unknown) => void): void;
}

export interface FabricObject {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  radius?: number;
  scaleX?: number;
  scaleY?: number;
  type?: string;
  set(options: Record<string, unknown>): void;
  setCoords(): void;
}

export interface Point {
  x: number;
  y: number;
}

export interface CanvasState {
  version: string;
  objects: Record<string, unknown>[];
}

// Re-export Tool type for convenience
export type { Tool };
