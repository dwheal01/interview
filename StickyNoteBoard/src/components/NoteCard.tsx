import { useState } from 'react';
import type { NoteDoc, NoteColor, LockDoc } from '../types';

type NoteCardProps = {
  note: NoteDoc;
  isSelected: boolean;
  lock: LockDoc | null;
  localUserId: string;
  onMouseDown: (e: React.MouseEvent) => void;
  onChange: (fields: Partial<NoteDoc>) => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
};

function noteColorClasses(color: NoteColor): string {
  switch (color) {
    case "yellow": return "bg-yellow-200 border-yellow-300";
    case "pink":   return "bg-pink-200 border-pink-300";
    case "blue":   return "bg-sky-200 border-sky-300";
    case "green":  return "bg-green-200 border-green-300";
  }
}

export function NoteCard({ 
  note, 
  isSelected, 
  lock, 
  localUserId,
  onMouseDown, 
  onChange, 
  onStartEdit,
  onStopEdit 
}: NoteCardProps) {
  const [hasFocus, setHasFocus] = useState(false);
  
  const lockedByOther = lock && lock.userId !== localUserId;
  const lockedByMe = lock && lock.userId === localUserId;

  const handleFocus = () => {
    setHasFocus(true);
    onStartEdit();
  };

  const handleBlur = () => {
    setHasFocus(false);
    // Delay to allow focus to move between fields
    setTimeout(() => {
      if (!document.activeElement?.closest('.note-card-input')) {
        onStopEdit();
      }
    }, 100);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (lockedByOther) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onMouseDown(e);
  };

  return (
    <div
      className={`absolute w-44 h-44 border shadow-sm flex flex-col p-2 text-sm select-none ${
        lockedByOther ? 'cursor-not-allowed' : 'cursor-move'
      } ${noteColorClasses(note.color)} ${isSelected ? 'shadow-[0_0_0_2px_rgba(0,0,0,0.3)]' : ''}`}
      style={{ left: note.x, top: note.y, zIndex: note.zIndex }}
      onMouseDown={handleMouseDown}
    >
      <input
        className="note-card-input w-full border-none bg-transparent font-semibold text-xs mb-1 outline-none placeholder-gray-400"
        value={note.title}
        onChange={(e) => onChange({ title: e.target.value })}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={(e) => e.stopPropagation()}
        placeholder="Title"
        readOnly={lockedByOther}
      />
      <textarea
        className="note-card-input flex-1 w-full border-none bg-transparent text-xs resize-none outline-none placeholder-gray-400"
        value={note.content}
        onChange={(e) => onChange({ content: e.target.value })}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={(e) => e.stopPropagation()}
        placeholder="Note..."
        readOnly={lockedByOther}
      />
      {lockedByOther && (
        <div className="absolute inset-0 bg-gray-300/60 flex items-end justify-end px-1 py-1 pointer-events-none">
          <span className="text-[10px] text-gray-700 bg-white/70 rounded px-1">
            {lock.username} is editing…
          </span>
        </div>
      )}
    </div>
  );
}

