import { createContext } from 'react';
import type { NoteColor } from '../types';

export type UIStateContextType = {
  activeColor: NoteColor;
  setActiveColor: (color: NoteColor) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  editingNoteId: string | null;
  setEditingNoteId: (id: string | null) => void;
};

export const UIStateContext = createContext<UIStateContextType | null>(null);

