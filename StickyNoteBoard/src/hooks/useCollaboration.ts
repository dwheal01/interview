import { useCallback } from 'react';
import type { LocalUser } from '../types';
import { useNotes, useLocks, usePresence, useCursors, usePresenceHeartbeat, updateCursor } from './useFirestore';

/**
 * Custom hook that manages all collaboration-related state and operations
 * Encapsulates Firestore subscriptions for notes, locks, presence, and cursors
 */
export function useCollaboration(localUserId: string) {
  const notes = useNotes();
  const locks = useLocks();
  const presence = usePresence();
  const cursors = useCursors(localUserId);
  
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
        updateCursor(canvasX, canvasY, localUser);
      }
    },
    [localUser]
  );

  return { handleCursorMove };
}

