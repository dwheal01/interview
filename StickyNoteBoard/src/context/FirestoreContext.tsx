import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { FirestoreService } from '../services/firestoreService';

/**
 * Context for Firestore service dependency injection
 * Allows services and hooks to access Firestore without direct imports
 */
const FirestoreContext = createContext<FirestoreService | null>(null);

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

/**
 * Hook to access Firestore service from context
 * Returns null if not provided (for localStorage-only mode)
 */
export function useFirestoreService(): FirestoreService | null {
  return useContext(FirestoreContext);
}

