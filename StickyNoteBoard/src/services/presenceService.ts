import type { LocalUser } from '../types';
import type { FirestoreService } from './firestoreService';
import { isFirebaseEnabled, getDb, WORKSPACE_ID } from '../config/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { PRESENCE_HEARTBEAT_MS } from '../constants';

/**
 * Service for presence operations
 * Presence is only available in Firebase mode
 * Accepts optional FirestoreService for dependency injection
 */
export const presenceService = {
  async updatePresence(
    localUser: LocalUser,
    firestoreService?: FirestoreService | null
  ): Promise<void> {
    // Use injected service if provided, otherwise fallback to direct import
    if (firestoreService) {
      if (!firestoreService.isEnabled()) return;
      await firestoreService.updatePresence(localUser);
      return;
    }

    // Fallback to direct import (for backward compatibility)
    if (!isFirebaseEnabled()) return;
    const db = getDb();
    if (!db) return;

    try {
      await setDoc(
        doc(db, 'workspaces', WORKSPACE_ID, 'presence', localUser.userId),
        {
          userId: localUser.userId,
          username: localUser.username,
          color: localUser.color,
          lastSeen: Date.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Failed to update presence:', error);
      throw error;
    }
  },

  async removePresence(
    userId: string,
    firestoreService?: FirestoreService | null
  ): Promise<void> {
    // Use injected service if provided, otherwise fallback to direct import
    if (firestoreService) {
      if (!firestoreService.isEnabled()) return;
      await firestoreService.removePresence(userId);
      return;
    }

    // Fallback to direct import (for backward compatibility)
    if (!isFirebaseEnabled()) return;
    const db = getDb();
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'workspaces', WORKSPACE_ID, 'presence', userId));
    } catch (error) {
      console.error('Failed to remove presence:', error);
      // Don't throw - cleanup failures are non-critical
    }
  },

  getHeartbeatInterval(): number {
    return PRESENCE_HEARTBEAT_MS;
  },
};

