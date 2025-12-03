import { useEffect, useRef, memo, useMemo, useCallback } from 'react';
import type { NoteDoc, NoteColor, LockDoc } from '../types';
import { BLUR_DELAY_MS, TEXTAREA_MIN_HEIGHT } from '../constants';

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

// Memoize color classes map
const NOTE_COLOR_CLASSES: Record<NoteColor, string> = {
  "yellow": "bg-yellow-200 border-yellow-300",
  "pink": "bg-pink-200 border-pink-300",
  "blue": "bg-sky-200 border-sky-300",
  "green": "bg-green-200 border-green-300",
};

function NoteCardComponent({ 
  note, 
  isSelected, 
  lock, 
  localUserId,
  onMouseDown, 
  onChange, 
  onStartEdit,
  onStopEdit 
}: NoteCardProps) {
  const lockedByOther = useMemo(() => !!(lock && lock.userId !== localUserId), [lock, localUserId]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [note.content]);

  const handleFocus = useCallback(() => {
    onStartEdit();
  }, [onStartEdit]);

  const handleBlur = useCallback(() => {
    // Delay to allow focus to move between fields
    setTimeout(() => {
      if (!document.activeElement?.closest('.note-card-input')) {
        onStopEdit();
      }
    }, BLUR_DELAY_MS);
  }, [onStopEdit]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (lockedByOther) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onMouseDown(e);
  }, [lockedByOther, onMouseDown]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ content: e.target.value });
    // Auto-resize on change
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }, [onChange]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ title: e.target.value });
  }, [onChange]);

  // Memoize style object
  const noteStyle = useMemo(() => ({
    left: note.x,
    top: note.y,
    zIndex: note.zIndex,
  }), [note.x, note.y, note.zIndex]);

  // Memoize className
  const noteClassName = useMemo(() => {
    const baseClasses = "absolute w-44 min-h-44 border shadow-sm flex flex-col p-2 text-sm select-none";
    const cursorClass = lockedByOther ? 'cursor-not-allowed' : 'cursor-move';
    const colorClass = NOTE_COLOR_CLASSES[note.color];
    const selectedClass = isSelected ? 'shadow-[0_0_0_2px_rgba(0,0,0,0.3)]' : '';
    return `${baseClasses} ${cursorClass} ${colorClass} ${selectedClass}`;
  }, [lockedByOther, note.color, isSelected]);

  return (
    <div
      data-note-id={note.id}
      className={noteClassName}
      style={noteStyle}
      onMouseDown={handleMouseDown}
    >
      <input
        className="note-card-input w-full border-none bg-transparent font-semibold text-xs mb-1 outline-none placeholder-gray-400"
        value={note.title}
        onChange={handleTitleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={(e) => e.stopPropagation()}
        placeholder="Title"
        readOnly={lockedByOther}
      />
      <textarea
        ref={textareaRef}
        className="note-card-input w-full border-none bg-transparent text-xs resize-none outline-none placeholder-gray-400 overflow-hidden"
        value={note.content}
        onChange={handleTextareaChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={(e) => e.stopPropagation()}
        placeholder="Note..."
        readOnly={lockedByOther}
        rows={1}
        style={{ minHeight: TEXTAREA_MIN_HEIGHT }}
      />
      {lockedByOther && lock && (
        <div className="absolute inset-0 bg-gray-300/60 flex items-end justify-end px-1 py-1 pointer-events-none">
          <span className="text-[10px] text-gray-700 bg-white/70 rounded px-1">
            {lock.username} is editing…
          </span>
        </div>
      )}
    </div>
  );
}

// Memoize NoteCard to prevent unnecessary re-renders
// Only re-renders when note data, selection, or lock status changes
export const NoteCard = memo(NoteCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.title === nextProps.note.title &&
    prevProps.note.content === nextProps.note.content &&
    prevProps.note.x === nextProps.note.x &&
    prevProps.note.y === nextProps.note.y &&
    prevProps.note.color === nextProps.note.color &&
    prevProps.note.zIndex === nextProps.note.zIndex &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.localUserId === nextProps.localUserId &&
    prevProps.lock?.userId === nextProps.lock?.userId &&
    prevProps.lock?.noteId === nextProps.lock?.noteId
  );
});

