import { useRef, useState, useEffect } from 'react';
import type { NoteDoc, CanvasTransform, LockDoc, CursorDoc, LocalUser } from '../types';
import { NoteCard } from './NoteCard';
import { RemoteCursorsLayer } from './RemoteCursorsLayer';

type AppMode = "idle" | "adding" | "dragging" | "panning";

type StickyBoardProps = {
  notes: NoteDoc[];
  selectedNoteId: string | null;
  canvas: CanvasTransform;
  mode: AppMode;
  ghostPosition: { x: number; y: number } | null;
  draggingNoteId: string | null;
  activeColor: string;
  locks: Record<string, LockDoc>;
  localUserId: string;
  cursors: CursorDoc[];
  onCanvasClick: (canvasX: number, canvasY: number) => void;
  onSelectNote: (id: string | null) => void;
  onBeginDragNote: (id: string, startCanvasX: number, startCanvasY: number) => void;
  onDragNote: (id: string, newCanvasX: number, newCanvasY: number) => void;
  onEndDragNote: (id: string) => void;
  onPan: (deltaX: number, deltaY: number) => void;
  onZoom: (scaleFactor: number, screenX: number, screenY: number) => void;
  onUpdateNote: (id: string, fields: Partial<NoteDoc>) => void;
  onStartEdit: (id: string) => void;
  onStopEdit: (id: string) => void;
  setIsOverTrash: (value: boolean) => void;
  onCursorMove: (canvasX: number, canvasY: number, localUser: LocalUser) => void;
  localUser: LocalUser;
};

export function StickyBoard({
  notes,
  selectedNoteId,
  canvas,
  mode,
  ghostPosition,
  draggingNoteId: _draggingNoteId,
  activeColor,
  locks,
  localUserId,
  cursors,
  onCanvasClick,
  onSelectNote,
  onBeginDragNote,
  onDragNote,
  onEndDragNote,
  onPan,
  onZoom,
  onUpdateNote,
  onStartEdit,
  onStopEdit,
  setIsOverTrash,
  onCursorMove,
  localUser,
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

  // Check if note card overlaps with trash
  const checkTrashOverlap = (note: NoteDoc) => {
    if (!boardRef.current) {
      setIsOverTrash(false);
      return;
    }

    const trashSize = 48;
    const trashRight = window.innerWidth - 16;
    const trashBottom = window.innerHeight - 16;
    const trashLeft = trashRight - trashSize;
    const trashTop = trashBottom - trashSize;

    // Get note's screen position relative to board
    const boardRect = boardRef.current.getBoundingClientRect();
    const screenPos = canvasToScreen(note.x, note.y);
    const noteWidth = 176 * canvas.scale; // w-44 = 176px
    
    // Try to find the actual note element to get its real height
    // If not found, use default height
    let noteHeight = 176 * canvas.scale; // Default h-44 = 176px
    const noteElement = document.querySelector(`[data-note-id="${note.id}"]`) as HTMLElement;
    if (noteElement) {
      const elementRect = noteElement.getBoundingClientRect();
      noteHeight = elementRect.height;
    }
    
    // Convert to window/client coordinates
    const noteRect = {
      left: boardRect.left + screenPos.x,
      top: boardRect.top + screenPos.y,
      right: boardRect.left + screenPos.x + noteWidth,
      bottom: boardRect.top + screenPos.y + noteHeight,
    };

    const trashRect = {
      left: trashLeft,
      top: trashTop,
      right: trashRight,
      bottom: trashBottom,
    };

    // Check if rectangles overlap
    const overlaps = !(
      noteRect.right < trashRect.left ||
      noteRect.left > trashRect.right ||
      noteRect.bottom < trashRect.top ||
      noteRect.top > trashRect.bottom
    );

    setIsOverTrash(overlaps);
  };

  // Store onZoom in a ref to avoid re-adding listener
  const onZoomRef = useRef(onZoom);
  useEffect(() => {
    onZoomRef.current = onZoom;
  }, [onZoom]);

  // Handle wheel events with non-passive listener to allow preventDefault
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;
      const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
      onZoomRef.current(zoomFactor, screenX, screenY);
    };

    const element = boardRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        element.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

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
    // Update cursor position
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const canvasX = (screenX - centerX - canvas.offsetX) / canvas.scale;
      const canvasY = (screenY - centerY - canvas.offsetY) / canvas.scale;
      
      onCursorMove(canvasX, canvasY, localUser);
    }

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

        // Check if note card overlaps with trash
        const note = notes.find(n => n.id === dragState.noteId);
        if (note) {
          checkTrashOverlap({ ...note, x: newX, y: newY });
        }
      }
    }
  };

  const handleMouseUpCanvas = (_e: React.MouseEvent) => {
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
      // Check if note is locked by someone else
      const lock = locks[noteId];
      if (lock && lock.userId !== localUserId) {
        // Can't drag if locked by someone else
        return;
      }

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
              lock={locks[note.id] || null}
              localUserId={localUserId}
              onMouseDown={(e) => handleNoteMouseDown(e, note.id)}
              onChange={(fields) => onUpdateNote(note.id, fields)}
              onStartEdit={() => onStartEdit(note.id)}
              onStopEdit={() => onStopEdit(note.id)}
            />
          ))}
          
          <RemoteCursorsLayer cursors={cursors} canvas={canvas} />
          
          {mode === "adding" && ghostPosition && (
            <div
              className={`absolute w-44 min-h-44 border shadow-sm flex flex-col p-2 text-sm pointer-events-none opacity-50 ${
                noteColorClasses(activeColor)
              }`}
              style={{ left: ghostPosition.x, top: ghostPosition.y }}
            >
              <div className="w-full border-none bg-transparent font-semibold text-xs mb-1">
                New Note
              </div>
              <div className="w-full border-none bg-transparent text-xs">
                Click to place
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

