import type { Note, NoteColor } from '../types';

type NoteCardProps = {
  note: Note;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onChange: (fields: Partial<Note>) => void;
};

function noteColorClasses(color: NoteColor): string {
  switch (color) {
    case "yellow": return "bg-yellow-200 border-yellow-300";
    case "pink":   return "bg-pink-200 border-pink-300";
    case "blue":   return "bg-sky-200 border-sky-300";
    case "green":  return "bg-green-200 border-green-300";
  }
}

export function NoteCard({ note, isSelected, onMouseDown, onChange }: NoteCardProps) {
  return (
    <div
      className={`absolute w-44 h-44 border shadow-sm flex flex-col p-2 text-sm select-none cursor-move ${
        noteColorClasses(note.color)
      } ${isSelected ? 'shadow-[0_0_0_2px_rgba(0,0,0,0.3)]' : ''}`}
      style={{ left: note.x, top: note.y, zIndex: note.zIndex }}
      onMouseDown={onMouseDown}
    >
      <input
        className="w-full border-none bg-transparent font-semibold text-xs mb-1 outline-none"
        value={note.title}
        onChange={(e) => onChange({ title: e.target.value })}
        onClick={(e) => e.stopPropagation()}
      />
      <textarea
        className="flex-1 w-full border-none bg-transparent text-xs resize-none outline-none"
        value={note.content}
        onChange={(e) => onChange({ content: e.target.value })}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

