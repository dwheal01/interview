import { useState, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CanvasTransform, AppMode } from '../types';
import { screenToCanvas } from '../utils/canvasUtils';
import { AppModeContext } from './appModeContextDef';

export function AppModeProvider({ 
  children,
  canvas,
}: { 
  children: ReactNode;
  canvas: CanvasTransform;
}) {
  const [mode, setMode] = useState<AppMode>("idle");
  const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const isAddingModeRef = useRef(false);

  const enterAddMode = useCallback(() => {
    setMode("adding");
    setGhostPosition(null);
    isAddingModeRef.current = true;
  }, []);

  const exitAddMode = useCallback(() => {
    isAddingModeRef.current = false;
    setMode("idle");
    setGhostPosition(null);
  }, []);

  // Update ghost position on mouse move in add mode
  useEffect(() => {
    const isAdding = mode === "adding";
    isAddingModeRef.current = isAdding;
    
    // Don't set state synchronously in effect - exitAddMode already handles clearing ghost position
    if (!isAdding) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isAddingModeRef.current) {
        return;
      }
      
      const canvasPos = screenToCanvas(e.clientX, e.clientY, canvas);
      setGhostPosition(canvasPos);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      isAddingModeRef.current = false;
      // Don't set state in cleanup - let exitAddMode handle it
    };
  }, [mode, canvas]);

  return (
    <AppModeContext.Provider
      value={{
        mode,
        setMode,
        ghostPosition,
        setGhostPosition,
        draggingNoteId,
        setDraggingNoteId,
        isOverTrash,
        setIsOverTrash,
        enterAddMode,
        exitAddMode,
      }}
    >
      {children}
    </AppModeContext.Provider>
  );
}

// Hook exported separately to satisfy Fast Refresh requirements
// Fast Refresh requires files to export either only components or only non-components
// Hook moved to hooks/useAppMode.ts to satisfy Fast Refresh requirements

