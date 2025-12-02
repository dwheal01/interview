import { useEffect } from 'react';
import type { LocalUser } from '../types';
import { isFirebaseEnabled } from '../config/firebase';
import { presenceService } from '../services/presenceService';

/**
 * Hook to manage presence heartbeat
 * Updates presence at regular intervals and cleans up on unmount
 */
export function usePresenceHeartbeat(localUser: LocalUser | null) {
  useEffect(() => {
    if (!localUser || !isFirebaseEnabled()) return;

    const updatePresence = async () => {
      try {
        await presenceService.updatePresence(localUser);
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
        presenceService.removePresence(localUser.userId).catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, [localUser]);
}

