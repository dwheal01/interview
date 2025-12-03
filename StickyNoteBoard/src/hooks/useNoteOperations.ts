import { useCallback } from 'react';
import type { NoteDoc, LocalUser, NoteColor } from '../types';
import { noteService } from '../services/noteService';
import { lockService } from '../services/lockService';
import { useUIState } from '../context/UIStateContext';
import { useErrorNotification } from '../context/ErrorNotificationContext';
import { useFirestoreService } from '../context/FirestoreContext';

type UseNoteOperationsParams = {
  localUser: LocalUser | null;
  locks: Record<string, any>;
  notes: NoteDoc[];
  activeColor: NoteColor; // From UIState context
  nextZIndex: number;
  setNextZIndex: (value: number | ((prev: number) => number)) => void;
  setMode: (mode: 'idle' | 'adding' | 'dragging' | 'panning') => void;
  setDraggingNoteId: (id: string | null) => void;
  setIsOverTrash: (value: boolean) => void;
  exitAddMode: () => void;
};

type UseNoteOperationsReturn = {
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
  // Get UI state from context instead of managing it here
  const { selectedNoteId, setSelectedNoteId, editingNoteId, setEditingNoteId } = useUIState();
  const { showError } = useErrorNotification();
  const firestoreService = useFirestoreService();

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

      const result = await noteService.createNote(newNote);
      if (!result.success) {
        showError(result.message, 'error');
        return;
      }
      setNextZIndex((prev) => prev + 1);
      setSelectedNoteId(id);
    },
    [localUser, activeColor, nextZIndex, setNextZIndex, exitAddMode, showError]
  );

  const onUpdateNote = useCallback(
    async (noteId: string, fields: Partial<NoteDoc>) => {
      if (!localUser) return;
      const lock = locks[noteId];
      if (lock && lock.userId !== localUser.userId) return;

      const result = await noteService.updateNote(noteId, fields);
      if (!result.success) {
        showError(result.message, result.message.includes('locally') ? 'warning' : 'error');
      }
    },
    [localUser, locks, showError]
  );

  const onSelectNote = useCallback(
    (id: string | null) => {
      setSelectedNoteId(id);
      // Exit add mode if selecting a note (handled by parent checking mode)
    },
    [setSelectedNoteId]
  );

  const onStartEdit = useCallback(
    async (noteId: string) => {
      if (!localUser) return;
      const lock = locks[noteId];
      if (lock && lock.userId !== localUser.userId) {
        return;
      }
      setEditingNoteId(noteId);
      try {
        await lockService.acquireLock(noteId, localUser, firestoreService);
      } catch (error) {
        setEditingNoteId(null);
        showError('Failed to acquire edit lock. Another user may be editing this note.', 'error');
      }
    },
    [localUser, locks, showError, firestoreService]
  );

  const onStopEdit = useCallback(async (noteId: string) => {
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      try {
        await lockService.releaseLock(noteId, firestoreService);
      } catch (error) {
        // Non-critical error, just log it
        console.error('Failed to release lock:', error);
      }
    }
  }, [editingNoteId, firestoreService]);

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
        const result = await noteService.updateNote(id, { zIndex: nextZIndex });
        if (!result.success) {
          showError(result.message, result.message.includes('locally') ? 'warning' : 'error');
          return;
        }
        setNextZIndex((prev) => prev + 1);
      }
    },
    [localUser, locks, notes, nextZIndex, setNextZIndex, setMode, setDraggingNoteId, showError]
  );

  const onDragNote = useCallback(
    async (id: string, newCanvasX: number, newCanvasY: number) => {
      if (!localUser) return;
      const lock = locks[id];
      if (lock && lock.userId !== localUser.userId) return;

      const result = await noteService.updateNote(id, { x: newCanvasX, y: newCanvasY });
      if (!result.success) {
        // Don't show error for drag updates - too frequent, would spam user
        // Just log it for debugging
        console.error('Failed to update note position:', result.message);
      }
    },
    [localUser, locks, showError]
  );

  const onEndDragNote = useCallback(
    async (id: string, isOverTrash: boolean) => {
      if (isOverTrash) {
        const result = await noteService.deleteNote(id);
        if (!result.success) {
          showError(result.message, result.message.includes('locally') ? 'warning' : 'error');
          // Still clear selection even if delete failed (optimistic UI)
        }
        if (selectedNoteId === id) {
          setSelectedNoteId(null);
        }
      }
      setIsOverTrash(false);
      setMode('idle');
      setDraggingNoteId(null);
    },
    [selectedNoteId, setSelectedNoteId, setIsOverTrash, setMode, setDraggingNoteId, showError]
  );

  return {
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

