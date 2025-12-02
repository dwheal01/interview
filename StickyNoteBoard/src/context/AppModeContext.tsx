import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CanvasTransform } from '../types';
import { screenToCanvas } from '../utils/canvasUtils';

export type AppMode = "idle" | "adding" | "dragging" | "panning";

type AppModeContextType = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  ghostPosition: { x: number; y: number } | null;
  setGhostPosition: (position: { x: number; y: number } | null) => void;
  draggingNoteId: string | null;
  setDraggingNoteId: (id: string | null) => void;
  isOverTrash: boolean;
  setIsOverTrash: (value: boolean) => void;
  enterAddMode: () => void;
  exitAddMode: () => void;
};

const AppModeContext = createContext<AppModeContextType | null>(null);

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
    
    if (!isAdding) {
      setGhostPosition(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isAddingModeRef.current) {
        setGhostPosition(null);
        return;
      }
      
      const canvasPos = screenToCanvas(e.clientX, e.clientY, canvas);
      
      if (isAddingModeRef.current) {
        setGhostPosition(canvasPos);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      setGhostPosition(null);
      isAddingModeRef.current = false;
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

export function useAppMode(): AppModeContextType {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within AppModeProvider');
  }
  return context;
}

