import { useRef, useState, useEffect, useMemo, useCallback, memo } from 'react';
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

function StickyBoardComponent({
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
  const checkTrashOverlap = useCallback((note: NoteDoc) => {
    if (!boardRef.current) {
      setIsOverTrash(false);
      return;
    }

    const boardRect = boardRef.current.getBoundingClientRect();
    const overlaps = checkTrashOverlapUtil(note, canvas, boardRect);
    setIsOverTrash(overlaps);
  }, [canvas, setIsOverTrash]);

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
  }, []); // Empty deps - onZoomRef is stable

  const handleMouseDownCanvas = useCallback((e: React.MouseEvent) => {
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
  }, [mode, screenToCanvasLocal, onCanvasClick, onSelectNote]);

  const handleMouseMoveCanvas = useCallback((e: React.MouseEvent) => {
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
  }, [canvas, onCursorMove, panStart, dragState, isDragging, screenToCanvasLocal, onPan, onBeginDragNote, onDragNote, notes, checkTrashOverlap]);

  const handleMouseUpCanvas = useCallback((_e: React.MouseEvent) => {
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
  }, [panStart, dragState, isDragging, onEndDragNote]);

  const handleNoteMouseDown = useCallback((e: React.MouseEvent, noteId: string) => {
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
  }, [locks, localUserId, onSelectNote, notes]);


  // Memoize note color classes map (moved outside component for better performance)
  const NOTE_COLOR_CLASSES_MAP: Record<string, string> = {
    "yellow": "bg-yellow-200 border-yellow-300",
    "pink": "bg-pink-200 border-pink-300",
    "blue": "bg-sky-200 border-sky-300",
    "green": "bg-green-200 border-green-300",
  };

  // Memoize note color classes function
  const noteColorClasses = useCallback((color: string) => {
    return NOTE_COLOR_CLASSES_MAP[color] || NOTE_COLOR_CLASSES_MAP["yellow"];
  }, []);

  // Memoize ghost note style to avoid recalculation
  const ghostNoteStyle = useMemo(() => ({
    left: ghostPosition?.x ?? 0,
    top: ghostPosition?.y ?? 0,
  }), [ghostPosition]);

  // Memoize ghost note className
  const ghostNoteClassName = useMemo(() => {
    return `absolute w-44 min-h-44 border shadow-sm flex flex-col p-2 text-sm pointer-events-none opacity-50 ${noteColorClasses(activeColor)}`;
  }, [activeColor, noteColorClasses]);

  // Memoize canvas transform style
  const canvasTransformStyle = useMemo(() => ({
    transform: `translate(${canvas.offsetX}px, ${canvas.offsetY}px) scale(${canvas.scale})`,
    transformOrigin: "center center" as const,
  }), [canvas.offsetX, canvas.offsetY, canvas.scale]);

  // Memoize background style (static, never changes)
  const backgroundStyle = useMemo(() => ({
    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)',
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
  }), []);

  // Memoize individual note handlers to prevent NoteCard re-renders
  // Create handlers map only when notes array reference changes
  const noteHandlersMap = useMemo(() => {
    const map = new Map<string, {
      onMouseDown: (e: React.MouseEvent) => void;
      onChange: (fields: Partial<NoteDoc>) => void;
      onStartEdit: () => void;
      onStopEdit: () => void;
    }>();
    
    notes.forEach((note) => {
      map.set(note.id, {
        onMouseDown: (e: React.MouseEvent) => handleNoteMouseDown(e, note.id),
        onChange: (fields: Partial<NoteDoc>) => onUpdateNote(note.id, fields),
        onStartEdit: () => onStartEdit(note.id),
        onStopEdit: () => onStopEdit(note.id),
      });
    });
    
    return map;
  }, [notes, handleNoteMouseDown, onUpdateNote, onStartEdit, onStopEdit]);

  return (
    <div
      ref={boardRef}
      className="fixed inset-0 top-14 bg-slate-50 overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        ref={canvasRef}
        className="w-full h-full relative"
        style={backgroundStyle}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        onMouseLeave={handleMouseUpCanvas}
      >
        <div
          className="absolute top-1/2 left-1/2"
          style={canvasTransformStyle}
        >
          {notes.map((note) => {
            const handlers = noteHandlersMap.get(note.id);
            if (!handlers) return null;
            return (
              <NoteCard
                key={note.id}
                note={note}
                isSelected={selectedNoteId === note.id}
                lock={locks[note.id] || null}
                localUserId={localUserId}
                onMouseDown={handlers.onMouseDown}
                onChange={handlers.onChange}
                onStartEdit={handlers.onStartEdit}
                onStopEdit={handlers.onStopEdit}
              />
            );
          })}
          
          <RemoteCursorsLayer cursors={cursors} canvas={canvas} />
          
          {mode === "adding" && ghostPosition && (
            <div
              className={ghostNoteClassName}
              style={ghostNoteStyle}
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

// Memoize StickyBoard to prevent unnecessary re-renders
// Only re-renders when props actually change
// Note: Callback props are assumed to be stable (memoized in parent)
export const StickyBoard = memo(StickyBoardComponent, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  // Check if any meaningful props have changed
  // We skip callback props as they should be memoized in parent
  return (
    prevProps.notes === nextProps.notes &&
    prevProps.selectedNoteId === nextProps.selectedNoteId &&
    prevProps.canvas.scale === nextProps.canvas.scale &&
    prevProps.canvas.offsetX === nextProps.canvas.offsetX &&
    prevProps.canvas.offsetY === nextProps.canvas.offsetY &&
    prevProps.mode === nextProps.mode &&
    prevProps.ghostPosition?.x === nextProps.ghostPosition?.x &&
    prevProps.ghostPosition?.y === nextProps.ghostPosition?.y &&
    prevProps.draggingNoteId === nextProps.draggingNoteId &&
    prevProps.activeColor === nextProps.activeColor &&
    prevProps.localUserId === nextProps.localUserId &&
    // Deep comparison for cursors array (check length and each item)
    prevProps.cursors.length === nextProps.cursors.length &&
    prevProps.cursors.every((cursor, i) => {
      const next = nextProps.cursors[i];
      return cursor && next &&
        cursor.userId === next.userId &&
        cursor.canvasX === next.canvasX &&
        cursor.canvasY === next.canvasY &&
        cursor.lastMovedAt === next.lastMovedAt;
    }) &&
    // For locks, do a shallow comparison of keys and values
    Object.keys(prevProps.locks).length === Object.keys(nextProps.locks).length &&
    Object.keys(prevProps.locks).every(key => {
      const prevLock = prevProps.locks[key];
      const nextLock = nextProps.locks[key];
      return prevLock?.userId === nextLock?.userId &&
        prevLock?.noteId === nextLock?.noteId &&
        prevLock?.username === nextLock?.username;
    })
  );
});

