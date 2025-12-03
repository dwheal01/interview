import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CanvasTransform } from '../types';
import { DEFAULT_SCALE } from '../constants';
import { calculateZoom, calculateFitToView } from '../utils/zoomUtils';
import { statePersistence } from '../services/statePersistence';
import { CanvasContext } from './canvasContextDef';

export function CanvasProvider({ children }: { children: ReactNode }) {
  // Use lazy initialization to load from localStorage during initial render
  // This avoids calling setState synchronously in an effect
  const [canvas, setCanvas] = useState<CanvasTransform>(() => {
    const persisted = statePersistence.loadCanvas();
    return persisted?.canvas || { scale: DEFAULT_SCALE, offsetX: 0, offsetY: 0 };
  });
  const [nextZIndex, setNextZIndex] = useState(() => {
    const persisted = statePersistence.loadCanvas();
    return persisted?.nextZIndex || 1;
  });
  // Initialize as true since state is set during initial render via lazy initialization
  const [isLoaded] = useState(true);

  // Persist canvas to localStorage using state persistence service
  useEffect(() => {
    if (!isLoaded) return;
    statePersistence.saveCanvas(canvas, nextZIndex);
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

// Hook moved to hooks/useCanvas.ts to satisfy Fast Refresh requirements

