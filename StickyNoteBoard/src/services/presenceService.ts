import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import type { LocalUser } from '../types';
import { isFirebaseEnabled, getDb, WORKSPACE_ID } from '../config/firebase';

const HEARTBEAT_MS = 15_000;

/**
 * Service for presence operations
 * Presence is only available in Firebase mode
 */
export const presenceService = {
  async updatePresence(localUser: LocalUser): Promise<void> {
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

  async removePresence(userId: string): Promise<void> {
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
    return HEARTBEAT_MS;
  },
};

