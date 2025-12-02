import { useCallback } from 'react';
import type { LocalUser } from '../types';
import { useNotesSubscription } from './useNotesSubscription';
import { useLocksSubscription } from './useLocksSubscription';
import { usePresenceSubscription } from './usePresenceSubscription';
import { useCursorsSubscription } from './useCursorsSubscription';
import { usePresenceHeartbeat } from './usePresenceHeartbeat';
import { cursorService } from '../services/cursorService';

/**
 * Custom hook that manages all collaboration-related state and operations
 * Encapsulates Firestore subscriptions for notes, locks, presence, and cursors
 */
export function useCollaboration(localUserId: string) {
  const notes = useNotesSubscription();
  const locks = useLocksSubscription();
  const presence = usePresenceSubscription();
  const cursors = useCursorsSubscription(localUserId);
  
  return {
    notes,
    locks,
    presence,
    cursors,
  };
}

/**
 * Hook to manage presence heartbeat
 * Should be called separately as it needs localUser
 */
export function useCollaborationHeartbeat(localUser: LocalUser | null) {
  usePresenceHeartbeat(localUser);
}

/**
 * Hook to handle cursor movement updates
 */
export function useCursorUpdates(localUser: LocalUser | null) {
  const handleCursorMove = useCallback(
    (canvasX: number, canvasY: number) => {
      if (localUser) {
        cursorService.updateCursor(canvasX, canvasY, localUser);
      }
    },
    [localUser]
  );

  return { handleCursorMove };
}

