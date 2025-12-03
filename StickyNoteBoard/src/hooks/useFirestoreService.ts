import { useContext } from 'react';
import { FirestoreContext } from '../context/firestoreContextDef';
import type { FirestoreService } from '../services/firestoreService';

/**
 * Hook to access Firestore service from context
 * Returns null if not provided (for localStorage-only mode)
 */
export function useFirestoreService(): FirestoreService | null {
  return useContext(FirestoreContext);
}

