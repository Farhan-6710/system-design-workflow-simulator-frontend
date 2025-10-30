# Annotation Layer - Refactored Architecture

This directory contains the refactored, modular annotation layer utilities that provide a clean, maintainable, and DRY code structure for canvas annotation functionality.

## Directory Structure

```
annotation-layer/
├── index.ts                    # Main entry point - re-exports all utilities
├── types.ts                   # TypeScript interfaces and types
├── fabricLoader.ts            # Fabric.js module loading utilities
├── canvasSetup.ts            # Canvas initialization and configuration
├── shapeCreation.ts          # Shape creation, updating, and finalization
├── canvasState.ts            # Canvas serialization and state management
├── themeUtils.ts             # Theme-aware styling and colors
└── utilities.ts              # General helper functions
```

## Key Improvements

### 🎯 **Single Responsibility Principle**

Each file has a focused, single purpose:

- `types.ts` - Only type definitions
- `fabricLoader.ts` - Only Fabric.js loading logic
- `canvasSetup.ts` - Only canvas initialization
- etc.

### 🔄 **DRY (Don't Repeat Yourself)**

- Common interfaces are centralized in `types.ts`
- Shared utilities are in dedicated files
- No duplicate code across modules

### 🧹 **Clean Code**

- Clear, descriptive function names
- Comprehensive JSDoc comments
- Consistent error handling
- Type safety throughout

### 📦 **Modular Architecture**

- Easy to import only what you need
- Simple to test individual modules
- Straightforward to extend or modify

## Usage Examples

### Basic Import (Recommended)

```typescript
import {
  initializeCanvas,
  createShape,
  FabricCanvas,
} from "@/utils/workflow-studio/annotation-layer";
```

### Specific Module Import

```typescript
import { createShape } from "@/utils/workflow-studio/annotation-layer/shapeCreation";
import { getThemeColor } from "@/utils/workflow-studio/annotation-layer/themeUtils";
```

## Module Descriptions

### `types.ts`

Contains all TypeScript interfaces and type definitions:

- `FabricCanvas` - Complete Fabric.js canvas interface
- `FabricObject` - Fabric.js object interface
- `Point` - 2D coordinate interface
- `CanvasState` - Canvas serialization state
- `Tool` - Drawing tool types

### `fabricLoader.ts`

Safe Fabric.js module loading:

- `getFabric()` - Safely load Fabric.js module
- `isFabricAvailable()` - Check if Fabric.js is available

### `canvasSetup.ts`

Canvas initialization and configuration:

- `initializeCanvas()` - Create and configure new canvas
- `updateCanvasMode()` - Switch between drawing modes

### `shapeCreation.ts`

Shape creation and manipulation:

- `createShape()` - Create shapes based on tool type
- `updateShape()` - Update shape during drawing
- `finalizeShape()` - Complete shape creation

### `canvasState.ts`

Canvas state management:

- `serializeCanvas()` - Convert canvas to JSON state
- `restoreCanvas()` - Restore canvas from JSON state

### `themeUtils.ts`

Theme-aware styling:

- `getThemeColor()` - Get appropriate color for theme
- `applyThemeColors()` - Apply theme colors to canvas
- `configureBrush()` - Configure drawing brush

### `utilities.ts`

General helper functions:

- `debounce()` - Performance optimization utility
- `generateId()` - Unique ID generation
- `isPointInBounds()` - Collision detection
- `calculateDistance()` - Distance calculation

## Hooks Architecture

The annotation layer also includes modular hooks in `@/hooks/workflow-studio/annotation-layer/`:

- `useAnnotationCanvas` - Main orchestrating hook
- `useCanvasInitialization` - Canvas setup logic
- `useCanvasEvents` - Event handling
- `useCanvasHistory` - Undo/redo functionality
- `useCanvasTheme` - Theme management
- `useCanvasKeyboardShortcuts` - Keyboard interactions
- `useCanvasResize` - Responsive canvas sizing

## Migration Guide

### From Old Structure

```typescript
// Old way
import {
  initializeCanvas,
  createShape,
} from "@/utils/workflow-studio/AnnotationLayerUtils";
```

### To New Structure

```typescript
// New way - same imports, cleaner structure
import {
  initializeCanvas,
  createShape,
} from "@/utils/workflow-studio/annotation-layer";
```

The API remains the same, but the internal structure is much cleaner and more maintainable.

## Benefits

1. **Maintainability** - Easy to find and modify specific functionality
2. **Testability** - Each module can be tested independently
3. **Reusability** - Individual utilities can be used elsewhere
4. **Performance** - Import only what you need
5. **Developer Experience** - Clear structure and documentation
6. **Type Safety** - Comprehensive TypeScript coverage
7. **Extensibility** - Easy to add new features or tools

## Component Usage

### Refactored AnnotationCanvas

The new `AnnotationCanvas.refactored.tsx` demonstrates the clean component structure:

```typescript
// Simple, clean component using hooks
const {
  canvasRef,
  containerRef,
  handleUndo,
  handleRedo,
  // ... other functionality
} = useAnnotationCanvas({ onFinish, initialJSON });
```

This approach separates concerns and makes the component much more readable and maintainable.
