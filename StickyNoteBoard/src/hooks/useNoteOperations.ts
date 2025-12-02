import { useState, useCallback } from 'react';
import type { NoteColor, NoteDoc, LocalUser } from '../types';
import {
  createNote,
  updateNote,
  deleteNote,
  acquireLock,
  releaseLock,
} from './useFirestore';

type UseNoteOperationsParams = {
  localUser: LocalUser | null;
  locks: Record<string, any>;
  notes: NoteDoc[];
  activeColor: NoteColor;
  nextZIndex: number;
  setNextZIndex: (value: number | ((prev: number) => number)) => void;
  setMode: (mode: 'idle' | 'adding' | 'dragging' | 'panning') => void;
  setDraggingNoteId: (id: string | null) => void;
  setIsOverTrash: (value: boolean) => void;
  exitAddMode: () => void;
};

type UseNoteOperationsReturn = {
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  editingNoteId: string | null;
  onPlaceNote: (canvasX: number, canvasY: number) => Promise<void>;
  onUpdateNote: (noteId: string, fields: Partial<NoteDoc>) => Promise<void>;
  onSelectNote: (id: string | null) => void;
  onStartEdit: (noteId: string) => Promise<void>;
  onStopEdit: (noteId: string) => Promise<void>;
  onBeginDragNote: (id: string, startCanvasX: number, startCanvasY: number) => Promise<void>;
  onDragNote: (id: string, newCanvasX: number, newCanvasY: number) => Promise<void>;
  onEndDragNote: (id: string, isOverTrash: boolean) => Promise<void>;
};

/**
 * Custom hook that encapsulates all note operation logic
 * Coordinates between Firestore, locks, mode, canvas, and UI state
 */
export function useNoteOperations({
  localUser,
  locks,
  notes,
  activeColor,
  nextZIndex,
  setNextZIndex,
  setMode,
  setDraggingNoteId,
  setIsOverTrash,
  exitAddMode,
}: UseNoteOperationsParams): UseNoteOperationsReturn {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const onPlaceNote = useCallback(
    async (canvasX: number, canvasY: number) => {
      if (!localUser) return;

      exitAddMode();

      const id = crypto.randomUUID?.() ?? String(Date.now());
      const newNote: NoteDoc = {
        id,
        title: '',
        content: '',
        x: canvasX,
        y: canvasY,
        color: activeColor,
        zIndex: nextZIndex,
        updatedAt: Date.now(),
      };

      await createNote(newNote);
      setNextZIndex((prev) => prev + 1);
      setSelectedNoteId(id);
    },
    [localUser, activeColor, nextZIndex, setNextZIndex, exitAddMode]
  );

  const onUpdateNote = useCallback(
    async (noteId: string, fields: Partial<NoteDoc>) => {
      if (!localUser) return;
      const lock = locks[noteId];
      if (lock && lock.userId !== localUser.userId) return;

      await updateNote(noteId, fields);
    },
    [localUser, locks]
  );

  const onSelectNote = useCallback(
    (id: string | null) => {
      setSelectedNoteId(id);
      // Exit add mode if selecting a note (handled by parent checking mode)
    },
    []
  );

  const onStartEdit = useCallback(
    async (noteId: string) => {
      if (!localUser) return;
      const lock = locks[noteId];
      if (lock && lock.userId !== localUser.userId) {
        return;
      }
      setEditingNoteId(noteId);
      await acquireLock(noteId, localUser);
    },
    [localUser, locks]
  );

  const onStopEdit = useCallback(async (noteId: string) => {
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      await releaseLock(noteId);
    }
  }, [editingNoteId]);

  const onBeginDragNote = useCallback(
    async (id: string, _startCanvasX: number, _startCanvasY: number) => {
      if (!localUser) return;
      const lock = locks[id];
      if (lock && lock.userId !== localUser.userId) return;

      setMode('dragging');
      setDraggingNoteId(id);

      // Increase z-index
      const note = notes.find((n) => n.id === id);
      if (note) {
        await updateNote(id, { zIndex: nextZIndex });
        setNextZIndex((prev) => prev + 1);
      }
    },
    [localUser, locks, notes, nextZIndex, setNextZIndex, setMode, setDraggingNoteId]
  );

  const onDragNote = useCallback(
    async (id: string, newCanvasX: number, newCanvasY: number) => {
      if (!localUser) return;
      const lock = locks[id];
      if (lock && lock.userId !== localUser.userId) return;

      await updateNote(id, { x: newCanvasX, y: newCanvasY });
    },
    [localUser, locks]
  );

  const onEndDragNote = useCallback(
    async (id: string, isOverTrash: boolean) => {
      if (isOverTrash) {
        await deleteNote(id);
        if (selectedNoteId === id) {
          setSelectedNoteId(null);
        }
      }
      setIsOverTrash(false);
      setMode('idle');
      setDraggingNoteId(null);
    },
    [selectedNoteId, setIsOverTrash, setMode, setDraggingNoteId]
  );

  return {
    selectedNoteId,
    setSelectedNoteId,
    editingNoteId,
    onPlaceNote,
    onUpdateNote,
    onSelectNote,
    onStartEdit,
    onStopEdit,
    onBeginDragNote,
    onDragNote,
    onEndDragNote,
  };
}

