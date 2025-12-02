export type NoteColor = "yellow" | "pink" | "blue" | "green";

export const NOTE_COLORS: NoteColor[] = ["yellow", "pink", "blue", "green"];

export type Note = {
  id: string;
  title: string;
  content: string;
  x: number;       // canvas coordinate X
  y: number;       // canvas coordinate Y
  color: NoteColor;
  zIndex: number;
};

export type CanvasTransform = {
  scale: number;   // e.g. 1.0 = 100%
  offsetX: number; // translateX in px
  offsetY: number; // translateY in px
};

export type PersistedState = {
  notes: Note[];
  canvas: CanvasTransform;
  nextZIndex: number;
};

// Firestore document types
export type NoteDoc = {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  color: NoteColor;
  zIndex: number;
  updatedAt: number; // Unix ms timestamp
};

export type LockDoc = {
  noteId: string;
  userId: string;
  username: string;
  userColor: string;
  lockedAt: number; // Unix ms timestamp
};

export type PresenceDoc = {
  userId: string;
  username: string;
  color: string;
  lastSeen: number; // Unix ms timestamp
};

export type CursorDoc = {
  userId: string;
  username: string;
  color: string;
  canvasX: number;
  canvasY: number;
  lastMovedAt: number; // Unix ms timestamp
};

// Local user session
export type LocalUser = {
  userId: string;
  username: string;
  color: string;
};

