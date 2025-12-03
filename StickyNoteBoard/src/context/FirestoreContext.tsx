import type { ReactNode } from 'react';
import type { FirestoreService } from '../services/firestoreService';
import { FirestoreContext } from './firestoreContextDef';

export interface FirestoreProviderProps {
  children: ReactNode;
  firestoreService: FirestoreService;
}

/**
 * Provider component that injects Firestore service into the component tree
 */
export function FirestoreProvider({ children, firestoreService }: FirestoreProviderProps) {
  return (
    <FirestoreContext.Provider value={firestoreService}>
      {children}
    </FirestoreContext.Provider>
  );
}

// Hook moved to hooks/useFirestoreService.ts to satisfy Fast Refresh requirements

