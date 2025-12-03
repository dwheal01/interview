import { useEffect } from 'react';
import type { LocalUser } from '../types';
import { presenceService } from '../services/presenceService';
import { useFirestoreService } from '../context/FirestoreContext';

/**
 * Hook to manage presence heartbeat
 * Updates presence at regular intervals and cleans up on unmount
 */
export function usePresenceHeartbeat(localUser: LocalUser | null) {
  const firestoreService = useFirestoreService();

  useEffect(() => {
    if (!localUser) return;

    const updatePresence = async () => {
      try {
        await presenceService.updatePresence(localUser, firestoreService);
      } catch (error) {
        console.error('Failed to update presence:', error);
      }
    };

    // Initial update
    updatePresence();

    // Heartbeat interval
    const interval = setInterval(updatePresence, presenceService.getHeartbeatInterval());

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      if (localUser) {
        presenceService.removePresence(localUser.userId, firestoreService).catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, [localUser, firestoreService]);
}

