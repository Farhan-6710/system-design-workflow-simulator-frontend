/**
 * Fabric.js module loading utilities
 * Handles safe dynamic loading of fabric.js in browser environment
 */

// Fabric.js module import with safety
export const getFabric = () => {
  if (typeof window === "undefined") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fabricModule = require("fabric");
    return fabricModule.fabric || fabricModule;
  } catch {
    return null;
  }
};

/**
 * Check if Fabric.js is available
 */
export const isFabricAvailable = (): boolean => {
  return getFabric() !== null;
};
