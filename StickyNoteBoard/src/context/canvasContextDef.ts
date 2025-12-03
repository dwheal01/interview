import { createContext } from 'react';
import type { CanvasTransform } from '../types';

export type CanvasContextType = {
  canvas: CanvasTransform;
  setCanvas: (canvas: CanvasTransform | ((prev: CanvasTransform) => CanvasTransform)) => void;
  onPan: (deltaX: number, deltaY: number) => void;
  onZoom: (scaleFactor: number, screenX: number, screenY: number) => void;
  onResetViewFit: (notes: Array<{ x: number; y: number }>) => void;
  nextZIndex: number;
  setNextZIndex: (value: number | ((prev: number) => number)) => void;
};

export const CanvasContext = createContext<CanvasContextType | null>(null);

