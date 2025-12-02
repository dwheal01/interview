import { useRef, useState, useEffect } from 'react';
import type { Note, CanvasTransform } from '../types';
import { NoteCard } from './NoteCard';

type AppMode = "idle" | "adding" | "dragging" | "panning";

type StickyBoardProps = {
  notes: Note[];
  selectedNoteId: string | null;
  canvas: CanvasTransform;
  mode: AppMode;
  ghostPosition: { x: number; y: number } | null;
  draggingNoteId: string | null;
  activeColor: string;
  onCanvasClick: (canvasX: number, canvasY: number) => void;
  onSelectNote: (id: string | null) => void;
  onBeginDragNote: (id: string, startCanvasX: number, startCanvasY: number) => void;
  onDragNote: (id: string, newCanvasX: number, newCanvasY: number) => void;
  onEndDragNote: (id: string) => void;
  onPan: (deltaX: number, deltaY: number) => void;
  onZoom: (scaleFactor: number, screenX: number, screenY: number) => void;
  onUpdateNote: (id: string, fields: Partial<Note>) => void;
  setIsOverTrash: (value: boolean) => void;
};

export function StickyBoard({
  notes,
  selectedNoteId,
  canvas,
  mode,
  ghostPosition,
  draggingNoteId,
  activeColor,
  onCanvasClick,
  onSelectNote,
  onBeginDragNote,
  onDragNote,
  onEndDragNote,
  onPan,
  onZoom,
  onUpdateNote,
  setIsOverTrash,
}: StickyBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [dragState, setDragState] = useState<{
    noteId: string;
    startMouseX: number;
    startMouseY: number;
    startNoteX: number;
    startNoteY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (clientX: number, clientY: number): { x: number; y: number } => {
    if (!boardRef.current) return { x: 0, y: 0 };
    const rect = boardRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    
    // Account for the transform origin being at center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const canvasX = (relativeX - centerX - canvas.offsetX) / canvas.scale;
    const canvasY = (relativeY - centerY - canvas.offsetY) / canvas.scale;
    
    return { x: canvasX, y: canvasY };
  };

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = (canvasX: number, canvasY: number): { x: number; y: number } => {
    if (!boardRef.current) return { x: 0, y: 0 };
    const rect = boardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const screenX = centerX + canvas.offsetX + canvasX * canvas.scale;
    const screenY = centerY + canvas.offsetY + canvasY * canvas.scale;
    return { x: screenX, y: screenY };
  };

  // Check if note overlaps with trash
  const checkTrashOverlap = (note: Note) => {
    const trashSize = 48;
    const trashRight = window.innerWidth - 16;
    const trashBottom = window.innerHeight - 16;
    const trashLeft = trashRight - trashSize;
    const trashTop = trashBottom - trashSize;

    const screenPos = canvasToScreen(note.x, note.y);
    const noteSize = 176 * canvas.scale; // w-44 = 176px
    const noteRect = {
      left: screenPos.x,
      top: screenPos.y,
      right: screenPos.x + noteSize,
      bottom: screenPos.y + noteSize,
    };

    const overlaps = !(
      noteRect.right < trashLeft ||
      noteRect.left > trashRight ||
      noteRect.bottom < trashTop ||
      noteRect.top > trashBottom
    );

    setIsOverTrash(overlaps);
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    onZoom(zoomFactor, screenX, screenY);
  };

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    // Don't handle if clicking on a note
    const target = e.target as HTMLElement;
    if (target.closest('.absolute.w-44')) {
      return; // Let NoteCard handle it
    }

    if (e.button === 2) {
      // Right mouse button - panning
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    } else if (e.button === 0 && mode === "adding") {
      // Left mouse button in add mode
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      onCanvasClick(canvasPos.x, canvasPos.y);
    } else if (e.button === 0 && mode === "idle") {
      // Left click on empty canvas - deselect
      onSelectNote(null);
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (panStart) {
      // Panning
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      onPan(deltaX, deltaY);
      setPanStart({ x: e.clientX, y: e.clientY });
    }

    if (dragState) {
      // Dragging a note
      if (!boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      const deltaScreenX = screenX - dragState.startMouseX;
      const deltaScreenY = screenY - dragState.startMouseY;
      
      // Only start dragging if mouse moved more than 3px
      const distance = Math.sqrt(deltaScreenX * deltaScreenX + deltaScreenY * deltaScreenY);
      if (distance > 3) {
        if (!isDragging) {
          setIsDragging(true);
          const canvasPos = screenToCanvas(e.clientX, e.clientY);
          onBeginDragNote(dragState.noteId, canvasPos.x, canvasPos.y);
        }

        const deltaCanvasX = deltaScreenX / canvas.scale;
        const deltaCanvasY = deltaScreenY / canvas.scale;

        const newX = dragState.startNoteX + deltaCanvasX;
        const newY = dragState.startNoteY + deltaCanvasY;

        onDragNote(dragState.noteId, newX, newY);

        // Check trash overlap
        const note = notes.find(n => n.id === dragState.noteId);
        if (note) {
          checkTrashOverlap({ ...note, x: newX, y: newY });
        }
      }
    }
  };

  const handleMouseUpCanvas = (e: React.MouseEvent) => {
    if (panStart) {
      setPanStart(null);
    }
    if (dragState) {
      if (isDragging) {
        onEndDragNote(dragState.noteId);
      }
      setDragState(null);
      setIsDragging(false);
    }
  };

  const handleNoteMouseDown = (e: React.MouseEvent, noteId: string) => {
    if (e.button === 0) {
      // Left mouse button - select the note first
      onSelectNote(noteId);
      
      if (!boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setDragState({
          noteId,
          startMouseX: e.clientX - rect.left,
          startMouseY: e.clientY - rect.top,
          startNoteX: note.x,
          startNoteY: note.y,
        });
        setIsDragging(false);
      }
    }
  };


  function noteColorClasses(color: string): string {
    switch (color) {
      case "yellow": return "bg-yellow-200 border-yellow-300";
      case "pink":   return "bg-pink-200 border-pink-300";
      case "blue":   return "bg-sky-200 border-sky-300";
      case "green":  return "bg-green-200 border-green-300";
      default: return "bg-yellow-200 border-yellow-300";
    }
  }

  return (
    <div
      ref={boardRef}
      className="fixed inset-0 top-14 bg-slate-50 overflow-hidden"
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        ref={canvasRef}
        className="w-full h-full relative"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        onMouseLeave={handleMouseUpCanvas}
      >
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            transform: `translate(${canvas.offsetX}px, ${canvas.offsetY}px) scale(${canvas.scale})`,
            transformOrigin: "center center",
          }}
        >
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={selectedNoteId === note.id}
              onMouseDown={(e) => handleNoteMouseDown(e, note.id)}
              onChange={(fields) => onUpdateNote(note.id, fields)}
            />
          ))}
          
          {mode === "adding" && ghostPosition && (
            <div
              className={`absolute w-44 h-44 border shadow-sm flex flex-col p-2 text-sm pointer-events-none opacity-50 ${
                noteColorClasses(activeColor)
              }`}
              style={{ left: ghostPosition.x, top: ghostPosition.y }}
            >
              <div className="w-full border-none bg-transparent font-semibold text-xs mb-1">
                New Note
              </div>
              <div className="flex-1 w-full border-none bg-transparent text-xs">
                Click to place
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

