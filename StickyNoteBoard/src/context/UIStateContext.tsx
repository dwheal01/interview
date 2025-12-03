import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { NoteColor } from '../types';
import { UIStateContext } from './uiStateContextDef';

/**
 * UI State Context
 * Manages UI-specific state (color selection, note selection, editing state)
 * Separated from business logic for better separation of concerns
 */
export function UIStateProvider({ children }: { children: ReactNode }) {
  // Load activeColor from localStorage if available
  const [activeColor, setActiveColorState] = useState<NoteColor>(() => {
    // Could load from localStorage if we want to persist color preference
    // For now, default to yellow
    return 'yellow';
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const setActiveColor = useCallback((color: NoteColor) => {
    setActiveColorState(color);
    // Could persist to localStorage if we want to remember user's color preference
  }, []);

  return (
    <UIStateContext.Provider
      value={{
        activeColor,
        setActiveColor,
        selectedNoteId,
        setSelectedNoteId,
        editingNoteId,
        setEditingNoteId,
      }}
    >
      {children}
    </UIStateContext.Provider>
  );
}

// Hook moved to hooks/useUIState.ts to satisfy Fast Refresh requirements

