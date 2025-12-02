import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CanvasTransform } from '../types';
import { STORAGE_KEY_CANVAS, DEFAULT_SCALE } from '../constants';
import { calculateZoom, calculateFitToView } from '../utils/zoomUtils';

type CanvasContextType = {
  canvas: CanvasTransform;
  setCanvas: (canvas: CanvasTransform | ((prev: CanvasTransform) => CanvasTransform)) => void;
  onPan: (deltaX: number, deltaY: number) => void;
  onZoom: (scaleFactor: number, screenX: number, screenY: number) => void;
  onResetViewFit: (notes: Array<{ x: number; y: number }>) => void;
  nextZIndex: number;
  setNextZIndex: (value: number | ((prev: number) => number)) => void;
};

const CanvasContext = createContext<CanvasContextType | null>(null);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [canvas, setCanvas] = useState<CanvasTransform>({ 
    scale: DEFAULT_SCALE, 
    offsetX: 0, 
    offsetY: 0 
  });
  const [nextZIndex, setNextZIndex] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load canvas from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CANVAS);
      if (raw) {
        const persisted = JSON.parse(raw);
        setCanvas(persisted.canvas || { scale: DEFAULT_SCALE, offsetX: 0, offsetY: 0 });
        setNextZIndex(persisted.nextZIndex || 1);
      }
    } catch (e) {
      console.error('Failed to load canvas from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist canvas to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_CANVAS, JSON.stringify({ canvas, nextZIndex }));
    } catch (e) {
      console.error('Failed to save canvas to localStorage:', e);
    }
  }, [canvas, nextZIndex, isLoaded]);

  const onPan = useCallback((deltaX: number, deltaY: number) => {
    setCanvas(prev => ({
      ...prev,
      offsetX: prev.offsetX + deltaX,
      offsetY: prev.offsetY + deltaY,
    }));
  }, []);

  const onZoom = useCallback((scaleFactor: number, screenX: number, screenY: number) => {
    setCanvas(prev => calculateZoom(scaleFactor, screenX, screenY, prev));
  }, []);

  const onResetViewFit = useCallback((notes: Array<{ x: number; y: number }>) => {
    setCanvas(calculateFitToView(notes));
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        canvas,
        setCanvas,
        onPan,
        onZoom,
        onResetViewFit,
        nextZIndex,
        setNextZIndex,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within CanvasProvider');
  }
  return context;
}

