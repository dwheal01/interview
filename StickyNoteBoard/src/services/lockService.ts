import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import type { LocalUser } from '../types';
import { isFirebaseEnabled, getDb, WORKSPACE_ID } from '../config/firebase';

/**
 * Service for lock operations
 * Locks are only available in Firebase mode (not localStorage)
 */
export const lockService = {
  async acquireLock(noteId: string, localUser: LocalUser): Promise<void> {
    if (!isFirebaseEnabled()) return; // No locks in localStorage mode

    const db = getDb();
    if (!db) return;

    try {
      await setDoc(
        doc(db, 'workspaces', WORKSPACE_ID, 'locks', noteId),
        {
          noteId,
          userId: localUser.userId,
          username: localUser.username,
          userColor: localUser.color,
          lockedAt: Date.now(),
        }
      );
    } catch (error) {
      console.error('Failed to acquire lock:', error);
      throw error;
    }
  },

  async releaseLock(noteId: string): Promise<void> {
    if (!isFirebaseEnabled()) return; // No locks in localStorage mode

    const db = getDb();
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'workspaces', WORKSPACE_ID, 'locks', noteId));
    } catch (error) {
      console.error('Failed to release lock:', error);
      throw error;
    }
  },
};

