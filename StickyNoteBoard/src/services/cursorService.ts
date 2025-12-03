import type { LocalUser } from '../types';
import type { FirestoreService } from './firestoreService';
import { isFirebaseEnabled, getDb, WORKSPACE_ID } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { CURSOR_THROTTLE_MS } from '../constants';

// Throttle cursor updates to reduce Firestore writes
let cursorUpdateThrottle: ReturnType<typeof setTimeout> | null = null;

/**
 * Service for cursor operations
 * Cursors are only available in Firebase mode
 * Accepts optional FirestoreService for dependency injection
 */
export const cursorService = {
  async updateCursor(
    canvasX: number,
    canvasY: number,
    localUser: LocalUser,
    firestoreService?: FirestoreService | null
  ): Promise<void> {
    // Throttle updates
    if (cursorUpdateThrottle) return;

    cursorUpdateThrottle = setTimeout(() => {
      cursorUpdateThrottle = null;
    }, CURSOR_THROTTLE_MS);

    // Use injected service if provided, otherwise fallback to direct import
    if (firestoreService) {
      if (!firestoreService.isEnabled()) return;
      try {
        await firestoreService.updateCursor(canvasX, canvasY, localUser);
      } catch (error) {
        console.error('Failed to update cursor:', error);
        // Don't throw - cursor updates are non-critical
      }
      return;
    }

    // Fallback to direct import (for backward compatibility)
    if (!isFirebaseEnabled()) return;
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

