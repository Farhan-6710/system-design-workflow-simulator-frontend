/**
 * Canvas state management utilities
 * Handles serialization, restoration, and state persistence
 */

import type { FabricCanvas, CanvasState } from "./types";

/**
 * Serialize canvas to state
 */
export function serializeCanvas(canvas: FabricCanvas): CanvasState {
  const canvasJSON = canvas.toJSON(["id", "selectable", "evented"]);
  return {
    version: "1.0",
    objects: (canvasJSON.objects as Record<string, unknown>[]) || [],
  };
}

/**
 * Restore canvas from state
 */
export function restoreCanvas(
  canvas: FabricCanvas,
  state: CanvasState
): Promise<void> {
  return new Promise((resolve) => {
    if (!state?.objects) {
      resolve();
      return;
    }

    const canvasData = {
      version: state.version || "1.0",
      objects: state.objects,
    };

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        canvas.renderAll();
        resolve();
      }
    }, 300);

    try {
      // loadFromJSON internally calls clear() which can fail with clearRect error
      canvas.loadFromJSON(canvasData, () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          canvas.renderAll();
          resolve();
        }
      });
    } catch {
      // This catches the clearRect error from canvas.clear()
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve();
      }
    }
  });
}
