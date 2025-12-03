import { createContext } from 'react';
import type { FirestoreService } from '../services/firestoreService';

export const FirestoreContext = createContext<FirestoreService | null>(null);

