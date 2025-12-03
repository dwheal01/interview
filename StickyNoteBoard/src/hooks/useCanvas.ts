import { useContext } from 'react';
import { CanvasContext, type CanvasContextType } from '../context/canvasContextDef';

export function useCanvas(): CanvasContextType {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within CanvasProvider');
  }
  return context;
}

