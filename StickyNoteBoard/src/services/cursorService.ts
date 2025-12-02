import { doc, setDoc } from 'firebase/firestore';
import type { LocalUser } from '../types';
import { isFirebaseEnabled, getDb, WORKSPACE_ID } from '../config/firebase';
import { CURSOR_THROTTLE_MS } from '../constants';

// Throttle cursor updates to reduce Firestore writes
let cursorUpdateThrottle: ReturnType<typeof setTimeout> | null = null;

/**
 * Service for cursor operations
 * Cursors are only available in Firebase mode
 */
export const cursorService = {
  async updateCursor(canvasX: number, canvasY: number, localUser: LocalUser): Promise<void> {
    if (!isFirebaseEnabled()) return; // No cursors in localStorage mode

    // Throttle updates
    if (cursorUpdateThrottle) return;

    cursorUpdateThrottle = setTimeout(() => {
      cursorUpdateThrottle = null;
    }, CURSOR_THROTTLE_MS);

    const db = getDb();
    if (!db) return;

    try {
      await setDoc(
        doc(db, 'workspaces', WORKSPACE_ID, 'cursors', localUser.userId),
        {
          userId: localUser.userId,
          username: localUser.username,
          color: localUser.color,
          canvasX,
          canvasY,
          lastMovedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Failed to update cursor:', error);
      // Don't throw - cursor updates are non-critical
    }
  },
};

