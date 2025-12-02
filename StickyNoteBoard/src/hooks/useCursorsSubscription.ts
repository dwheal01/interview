import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import type { CursorDoc } from '../types';
import { isFirebaseEnabled, getDb, WORKSPACE_ID } from '../config/firebase';
import { validateCursorDoc } from '../utils/validation';

/**
 * Hook to subscribe to cursors from Firestore
 * Filters out the local user's cursor
 * Returns empty array if Firebase is not enabled (single-user mode)
 */
export function useCursorsSubscription(localUserId: string) {
  const [cursors, setCursors] = useState<CursorDoc[]>([]);

  useEffect(() => {
    if (isFirebaseEnabled()) {
      const db = getDb();
      if (!db) return;

      const q = query(collection(db, 'workspaces', WORKSPACE_ID, 'cursors'));
      const unsub = onSnapshot(q, (snapshot) => {
        const cursorsList: CursorDoc[] = [];
        snapshot.forEach((docSnap) => {
          const validated = validateCursorDoc(docSnap.data());
          // Filter out local user's cursor and invalid cursors
          if (validated && validated.userId !== localUserId) {
            cursorsList.push(validated);
          }
        });
        setCursors(cursorsList);
      });

      return unsub;
    }
    // No cursors in localStorage mode (single-user)
  }, [localUserId]);

  return cursors;
}

