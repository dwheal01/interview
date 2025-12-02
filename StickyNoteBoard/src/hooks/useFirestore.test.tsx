import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useNotes,
  useLocks,
  usePresence,
  useCursors,
  usePresenceHeartbeat,
  createNote,
  updateNote,
  deleteNote,
  acquireLock,
  releaseLock,
  updateCursor,
} from './useFirestore';
import {
  mockFirestore,
  createMockSnapshot,
  createMockDoc,
  mockCollection,
  mockQuery,
} from '../test/mocks/firebase';
import { setupLocalStorageMock, clearLocalStorageMock } from '../test/mocks/localStorage';
import { createMockNote, createMockUser } from '../test/utils/testUtils';
import * as firebaseConfig from '../config/firebase';

// Mock the firebase config module
vi.mock('../config/firebase', async () => {
  const actual = await vi.importActual('../config/firebase');
  return {
    ...actual,
    isFirebaseEnabled: vi.fn(() => true),
    getDb: vi.fn(() => mockFirestore),
    WORKSPACE_ID: 'default',
  };
});

describe('useFirestore hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearLocalStorageMock();
    setupLocalStorageMock();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useNotes', () => {
    it('should initialize with empty array', async () => {
      mockCollection.mockReturnValue({ id: 'notes', path: 'workspaces/default/notes' });
      mockQuery.mockReturnValue({ id: 'notes', path: 'workspaces/default/notes' });
      
      mockFirestore.onSnapshot.mockImplementation((q, onNext) => {
        onNext(createMockSnapshot([]));
        return () => {};
      });

      const { result } = renderHook(() => useNotes());
      
      await waitFor(() => {
        expect(result.current).toEqual([]);
      });
    });

    it('should subscribe to Firestore and update notes', async () => {
      mockCollection.mockReturnValue({ id: 'notes', path: 'workspaces/default/notes' });
      mockQuery.mockReturnValue({ id: 'notes', path: 'workspaces/default/notes' });
      
      const mockNote1 = createMockNote({ id: 'note-1', title: 'Note 1' });
      const mockNote2 = createMockNote({ id: 'note-2', title: 'Note 2' });

      mockFirestore.onSnapshot.mockImplementation((q, onNext) => {
        onNext(createMockSnapshot([
          createMockDoc('note-1', mockNote1),
          createMockDoc('note-2', mockNote2),
        ]));
        return () => {};
      });

      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current).toHaveLength(2);
      });

      expect(result.current[0]).toMatchObject(mockNote1);
      expect(result.current[1]).toMatchObject(mockNote2);
    });

    it('should fallback to localStorage when Firebase is disabled', () => {
      vi.mocked(firebaseConfig.isFirebaseEnabled).mockReturnValue(false);
      
      const storedNotes = [
        createMockNote({ id: 'note-1' }),
        createMockNote({ id: 'note-2' }),
      ];
      localStorage.setItem('sticky-board-notes', JSON.stringify(storedNotes));

      const { result } = renderHook(() => useNotes());

      expect(result.current).toHaveLength(2);
      expect(localStorage.getItem).toHaveBeenCalledWith('sticky-board-notes');
    });

    it('should handle Firestore errors and fallback to localStorage', async () => {
      const storedNotes = [createMockNote({ id: 'note-1' })];
      localStorage.setItem('sticky-board-notes', JSON.stringify(storedNotes));

      mockFirestore.onSnapshot.mockImplementation((q, onNext, onError) => {
        onError?.(new Error('Firestore error'));
        return () => {};
      });

      const { result } = renderHook(() => useNotes());

      await waitFor(() => {
        expect(result.current).toHaveLength(1);
      });
    });
  });

  describe('useLocks', () => {
    it('should initialize with empty object', async () => {
      mockCollection.mockReturnValue({ id: 'locks', path: 'workspaces/default/locks' });
      mockQuery.mockReturnValue({ id: 'locks', path: 'workspaces/default/locks' });
      
      mockFirestore.onSnapshot.mockImplementation((q, onNext) => {
        onNext(createMockSnapshot([]));
        return () => {};
      });

      const { result } = renderHook(() => useLocks());
      
      await waitFor(() => {
        expect(result.current).toEqual({});
      });
    });

    it('should map locks by noteId', async () => {
      mockCollection.mockReturnValue({ id: 'locks', path: 'workspaces/default/locks' });
      mockQuery.mockReturnValue({ id: 'locks', path: 'workspaces/default/locks' });
      
      const lock1 = {
        noteId: 'note-1',
        userId: 'user-1',
        username: 'User 1',
        userColor: '#f97316',
        lockedAt: Date.now(),
      };
      const lock2 = {
        noteId: 'note-2',
        userId: 'user-2',
        username: 'User 2',
        userColor: '#3b82f6',
        lockedAt: Date.now(),
      };

      mockFirestore.onSnapshot.mockImplementation((q, onNext) => {
        onNext(createMockSnapshot([
          createMockDoc('note-1', lock1),
          createMockDoc('note-2', lock2),
        ]));
        return () => {};
      });

      const { result } = renderHook(() => useLocks());

      await waitFor(() => {
        expect(Object.keys(result.current)).toHaveLength(2);
      });

      expect(result.current['note-1']).toMatchObject(lock1);
      expect(result.current['note-2']).toMatchObject(lock2);
    });
  });

  describe('usePresence', () => {
    it('should return list of present users', async () => {
      mockCollection.mockReturnValue({ id: 'presence', path: 'workspaces/default/presence' });
      mockQuery.mockReturnValue({ id: 'presence', path: 'workspaces/default/presence' });
      
      const presence1 = {
        userId: 'user-1',
        username: 'User 1',
        color: '#f97316',
        lastSeen: Date.now(),
      };
      const presence2 = {
        userId: 'user-2',
        username: 'User 2',
        color: '#3b82f6',
        lastSeen: Date.now(),
      };

      mockFirestore.onSnapshot.mockImplementation((q, onNext) => {
        onNext(createMockSnapshot([
          createMockDoc('user-1', presence1),
          createMockDoc('user-2', presence2),
        ]));
        return () => {};
      });

      const { result } = renderHook(() => usePresence());

      await waitFor(() => {
        expect(result.current).toHaveLength(2);
      });
    });
  });

  describe('useCursors', () => {
    it('should filter out local user cursor', async () => {
      mockCollection.mockReturnValue({ id: 'cursors', path: 'workspaces/default/cursors' });
      mockQuery.mockReturnValue({ id: 'cursors', path: 'workspaces/default/cursors' });
      
      const localUserId = 'user-1';
      const cursor1 = {
        userId: 'user-1',
        username: 'Local User',
        color: '#f97316',
        canvasX: 100,
        canvasY: 100,
        lastMovedAt: Date.now(),
      };
      const cursor2 = {
        userId: 'user-2',
        username: 'Remote User',
        color: '#3b82f6',
        canvasX: 200,
        canvasY: 200,
        lastMovedAt: Date.now(),
      };

      mockFirestore.onSnapshot.mockImplementation((q, onNext) => {
        onNext(createMockSnapshot([
          createMockDoc('user-1', cursor1),
          createMockDoc('user-2', cursor2),
        ]));
        return () => {};
      });

      const { result } = renderHook(() => useCursors(localUserId));

      await waitFor(() => {
        expect(result.current).toHaveLength(1);
        expect(result.current[0].userId).toBe('user-2');
      });
    });
  });

  describe('usePresenceHeartbeat', () => {
    it('should update presence on mount', async () => {
      vi.useFakeTimers();
      mockDoc.mockReturnValue({ id: 'user-1', path: 'workspaces/default/presence/user-1' });
      
      const user = createMockUser();
      mockFirestore.setDoc.mockResolvedValue(undefined);

      renderHook(() => usePresenceHeartbeat(user));

      await waitFor(() => {
        expect(mockFirestore.setDoc).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('should send heartbeat at intervals', async () => {
      vi.useFakeTimers();
      mockDoc.mockReturnValue({ id: 'user-1', path: 'workspaces/default/presence/user-1' });
      
      const user = createMockUser();
      mockFirestore.setDoc.mockResolvedValue(undefined);

      renderHook(() => usePresenceHeartbeat(user));

      // Initial call
      await waitFor(() => {
        expect(mockFirestore.setDoc).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });

      // Advance timer
      vi.advanceTimersByTime(15000);

      await waitFor(() => {
        expect(mockFirestore.setDoc).toHaveBeenCalledTimes(2);
      }, { timeout: 1000 });
    });

    it('should cleanup presence on unmount', async () => {
      mockDoc.mockReturnValue({ id: 'user-1', path: 'workspaces/default/presence/user-1' });
      mockFirestore.deleteDoc.mockResolvedValue(undefined);
      mockFirestore.setDoc.mockResolvedValue(undefined);
      
      const user = createMockUser();

      const { unmount } = renderHook(() => usePresenceHeartbeat(user));

      unmount();

      await waitFor(() => {
        expect(mockFirestore.deleteDoc).toHaveBeenCalled();
      }, { timeout: 1000 });
    });
  });

  describe('createNote', () => {
    it('should create note in Firestore when enabled', async () => {
      mockDoc.mockReturnValue({ id: 'note-1', path: 'workspaces/default/notes/note-1' });
      const note = createMockNote();
      mockFirestore.setDoc.mockResolvedValue(undefined);

      await createNote(note);

      expect(mockFirestore.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        note
      );
    });

    it('should fallback to localStorage when Firebase is disabled', async () => {
      vi.mocked(firebaseConfig.isFirebaseEnabled).mockReturnValue(false);
      const note = createMockNote();

      await createNote(note);

      const stored = JSON.parse(localStorage.getItem('sticky-board-notes') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject(note);
    });
  });

  describe('updateNote', () => {
    it('should update note in Firestore', async () => {
      mockDoc.mockReturnValue({ id: 'note-1', path: 'workspaces/default/notes/note-1' });
      const noteId = 'note-1';
      const updates = { title: 'Updated Title' };
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      await updateNote(noteId, updates);

      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining(updates)
      );
    });

    it('should fallback to localStorage when Firebase is disabled', async () => {
      vi.mocked(firebaseConfig.isFirebaseEnabled).mockReturnValue(false);
      const note = createMockNote({ id: 'note-1', title: 'Original' });
      localStorage.setItem('sticky-board-notes', JSON.stringify([note]));

      await updateNote('note-1', { title: 'Updated' });

      const stored = JSON.parse(localStorage.getItem('sticky-board-notes') || '[]');
      expect(stored[0].title).toBe('Updated');
    });
  });

  describe('deleteNote', () => {
    it('should delete note from Firestore', async () => {
      mockDoc.mockReturnValue({ id: 'note-1', path: 'workspaces/default/notes/note-1' });
      const noteId = 'note-1';
      mockFirestore.deleteDoc.mockResolvedValue(undefined);

      await deleteNote(noteId);

      expect(mockFirestore.deleteDoc).toHaveBeenCalledTimes(2); // Note + lock
    });

    it('should fallback to localStorage when Firebase is disabled', async () => {
      vi.mocked(firebaseConfig.isFirebaseEnabled).mockReturnValue(false);
      const notes = [
        createMockNote({ id: 'note-1' }),
        createMockNote({ id: 'note-2' }),
      ];
      localStorage.setItem('sticky-board-notes', JSON.stringify(notes));

      await deleteNote('note-1');

      const stored = JSON.parse(localStorage.getItem('sticky-board-notes') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('note-2');
    });
  });

  describe('acquireLock', () => {
    it('should create lock document', async () => {
      mockDoc.mockReturnValue({ id: 'note-1', path: 'workspaces/default/locks/note-1' });
      const noteId = 'note-1';
      const user = createMockUser();
      mockFirestore.setDoc.mockResolvedValue(undefined);

      await acquireLock(noteId, user);

      expect(mockFirestore.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          noteId,
          userId: user.userId,
          username: user.username,
        })
      );
    });
  });

  describe('releaseLock', () => {
    it('should delete lock document', async () => {
      mockDoc.mockReturnValue({ id: 'note-1', path: 'workspaces/default/locks/note-1' });
      const noteId = 'note-1';
      mockFirestore.deleteDoc.mockResolvedValue(undefined);

      await releaseLock(noteId);

      expect(mockFirestore.deleteDoc).toHaveBeenCalled();
    });
  });

  describe('updateCursor', () => {
    it('should throttle cursor updates', async () => {
      vi.useFakeTimers();
      mockDoc.mockReturnValue({ id: 'user-1', path: 'workspaces/default/cursors/user-1' });
      const user = createMockUser();
      mockFirestore.setDoc.mockResolvedValue(undefined);

      // Call multiple times rapidly
      updateCursor(100, 100, user);
      updateCursor(110, 110, user);
      updateCursor(120, 120, user);

      // Only first call should go through immediately
      await waitFor(() => {
        expect(mockFirestore.setDoc).toHaveBeenCalledTimes(1);
      });

      // After throttle period, next call should go through
      vi.advanceTimersByTime(100);
      updateCursor(130, 130, user);

      await waitFor(() => {
        expect(mockFirestore.setDoc).toHaveBeenCalledTimes(2);
      });
    });
  });
});

