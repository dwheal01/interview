import { createContext } from 'react';
import type { AppMode } from '../types';

export type AppModeContextType = {
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

export const AppModeContext = createContext<AppModeContextType | null>(null);

