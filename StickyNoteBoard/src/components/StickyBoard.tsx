import { useRef, useState, useEffect } from 'react';
import type { NoteDoc, CanvasTransform, LockDoc, CursorDoc } from '../types';
import { NoteCard } from './NoteCard';
import { RemoteCursorsLayer } from './RemoteCursorsLayer';
import { ZOOM_IN_FACTOR, ZOOM_OUT_FACTOR, DRAG_THRESHOLD_PX, GRID_SIZE } from '../constants';
import { checkTrashOverlap as checkTrashOverlapUtil } from '../utils/collisionDetection';
import { screenToCanvas, getRelativeCoordinates } from '../utils/canvasUtils';

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
  onCursorMove: (canvasX: number, canvasY: number) => void;
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

  // Convert screen coordinates to canvas coordinates using element-relative coordinates
  const screenToCanvasLocal = (clientX: number, clientY: number): { x: number; y: number } => {
    if (!boardRef.current) return { x: 0, y: 0 };
    const rect = boardRef.current.getBoundingClientRect();
    return screenToCanvas(clientX, clientY, canvas, undefined, undefined, rect);
  };

  // Check if note card overlaps with trash
  const checkTrashOverlap = (note: NoteDoc) => {
    if (!boardRef.current) {
      setIsOverTrash(false);
      return;
    }

    const boardRect = boardRef.current.getBoundingClientRect();
    const overlaps = checkTrashOverlapUtil(note, canvas, boardRect);
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
      const { x: screenX, y: screenY } = getRelativeCoordinates(event.clientX, event.clientY, rect);
      const zoomFactor = event.deltaY < 0 ? ZOOM_IN_FACTOR : ZOOM_OUT_FACTOR;
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
      const canvasPos = screenToCanvasLocal(e.clientX, e.clientY);
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
      const canvasPos = screenToCanvas(e.clientX, e.clientY, canvas, undefined, undefined, rect);
      onCursorMove(canvasPos.x, canvasPos.y);
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
      const { x: screenX, y: screenY } = getRelativeCoordinates(e.clientX, e.clientY, rect);

      const deltaScreenX = screenX - dragState.startMouseX;
      const deltaScreenY = screenY - dragState.startMouseY;
      
      // Only start dragging if mouse moved more than threshold
      const distance = Math.sqrt(deltaScreenX * deltaScreenX + deltaScreenY * deltaScreenY);
      if (distance > DRAG_THRESHOLD_PX) {
        if (!isDragging) {
          setIsDragging(true);
          const canvasPos = screenToCanvasLocal(e.clientX, e.clientY);
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
        const { x: startMouseX, y: startMouseY } = getRelativeCoordinates(e.clientX, e.clientY, rect);
        setDragState({
          noteId,
          startMouseX,
          startMouseY,
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
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
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

