import { vi } from 'vitest';

// Mock Firebase Firestore
export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  onSnapshot: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
};

// Mock Firebase App
export const mockFirebaseApp = {
  name: '[DEFAULT]',
  options: {},
};

// Mock Firebase initialization
export const mockInitializeApp = vi.fn(() => mockFirebaseApp);
export const mockGetFirestore = vi.fn(() => mockFirestore);

// Export mock functions for use in tests
export const mockCollection = vi.fn((db, ...path) => ({
  id: path[path.length - 1],
  path: path.join('/'),
  _path: path,
}));

export const mockDoc = vi.fn((db, ...path) => ({
  id: path[path.length - 1],
  path: path.join('/'),
  _path: path,
}));

export const mockQuery = vi.fn((collectionRef) => collectionRef);

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: mockInitializeApp,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: mockGetFirestore,
  collection: mockCollection,
  doc: mockDoc,
  query: mockQuery,
  onSnapshot: mockFirestore.onSnapshot,
  setDoc: mockFirestore.setDoc,
  updateDoc: mockFirestore.updateDoc,
  deleteDoc: mockFirestore.deleteDoc,
  getDoc: mockFirestore.getDoc,
  getDocs: mockFirestore.getDocs,
  serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
}));

// Helper to create mock snapshot
export function createMockSnapshot(docs: Array<{ id: string; data: () => any }>) {
  return {
    docs,
    forEach: (callback: (doc: any) => void) => {
      docs.forEach(callback);
    },
    empty: docs.length === 0,
    size: docs.length,
  };
}

// Helper to create mock document
export function createMockDoc(id: string, data: any) {
  return {
    id,
    data: () => data,
    exists: () => true,
  };
}

