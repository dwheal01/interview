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

