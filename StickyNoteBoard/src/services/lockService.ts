import type { LocalUser } from '../types';
import type { FirestoreService } from './firestoreService';
import { isFirebaseEnabled, getDb, WORKSPACE_ID } from '../config/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

/**
 * Service for lock operations
 * Locks are only available in Firebase mode (not localStorage)
 * Accepts optional FirestoreService for dependency injection
 */
export const lockService = {
  async acquireLock(
    noteId: string,
    localUser: LocalUser,
    firestoreService?: FirestoreService | null
  ): Promise<void> {
    // Use injected service if provided, otherwise fallback to direct import
    if (firestoreService) {
      if (!firestoreService.isEnabled()) return;
      await firestoreService.acquireLock(noteId, localUser);
      return;
    }

    // Fallback to direct import (for backward compatibility)
    if (!isFirebaseEnabled()) return;
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

  async releaseLock(noteId: string, firestoreService?: FirestoreService | null): Promise<void> {
    // Use injected service if provided, otherwise fallback to direct import
    if (firestoreService) {
      if (!firestoreService.isEnabled()) return;
      await firestoreService.releaseLock(noteId);
      return;
    }

    // Fallback to direct import (for backward compatibility)
    if (!isFirebaseEnabled()) return;
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

