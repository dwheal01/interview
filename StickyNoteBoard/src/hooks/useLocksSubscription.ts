import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import type { LockDoc } from '../types';
import { isFirebaseEnabled, getDb, WORKSPACE_ID } from '../config/firebase';
import { validateLockDoc } from '../utils/validation';

/**
 * Hook to subscribe to locks from Firestore
 * Returns empty object if Firebase is not enabled (single-user mode)
 */
export function useLocksSubscription() {
  const [locks, setLocks] = useState<Record<string, LockDoc>>({});

  useEffect(() => {
    if (isFirebaseEnabled()) {
      const db = getDb();
      if (!db) return;

      const q = query(collection(db, 'workspaces', WORKSPACE_ID, 'locks'));
      const unsub = onSnapshot(q, (snapshot) => {
        const locksMap: Record<string, LockDoc> = {};
        snapshot.forEach((docSnap) => {
          const validated = validateLockDoc(docSnap.data());
          if (validated) {
            locksMap[validated.noteId] = validated;
          }
        });
        setLocks(locksMap);
      });

      return unsub;
    }
    // No locks in localStorage mode (single-user)
  }, []);

  return locks;
}

