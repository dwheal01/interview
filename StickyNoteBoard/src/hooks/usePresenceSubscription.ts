import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import type { PresenceDoc } from '../types';
import { isFirebaseEnabled, getDb, WORKSPACE_ID } from '../config/firebase';
import { validatePresenceDoc } from '../utils/validation';

/**
 * Hook to subscribe to presence from Firestore
 * Returns empty array if Firebase is not enabled (single-user mode)
 */
export function usePresenceSubscription() {
  const [presence, setPresence] = useState<PresenceDoc[]>([]);

  useEffect(() => {
    if (isFirebaseEnabled()) {
      const db = getDb();
      if (!db) return;

      const q = query(collection(db, 'workspaces', WORKSPACE_ID, 'presence'));
      const unsub = onSnapshot(q, (snapshot) => {
        const presenceList: PresenceDoc[] = [];
        snapshot.forEach((docSnap) => {
          const validated = validatePresenceDoc(docSnap.data());
          if (validated) {
            presenceList.push(validated);
          }
        });
        setPresence(presenceList);
      });

      return unsub;
    }
    // No presence in localStorage mode (single-user)
  }, []);

  return presence;
}

