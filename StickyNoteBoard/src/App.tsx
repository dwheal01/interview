import { useState, useEffect } from 'react';
import type { Note, NoteColor, CanvasTransform, PersistedState } from './types';
import { Toolbar } from './components/Toolbar';
import { StickyBoard } from './components/StickyBoard';
import { TrashBin } from './components/TrashBin';

type AppMode = "idle" | "adding" | "dragging" | "panning";

const STORAGE_KEY = "sticky-board-state";

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<NoteColor>("yellow");
  const [canvas, setCanvas] = useState<CanvasTransform>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [mode, setMode] = useState<AppMode>("idle");
  const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Prevent browser zoom shortcuts
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Prevent zoom with Ctrl/Cmd + scroll
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent zoom with Ctrl/Cmd + +/-/0
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '-' || e.key === '0' || e.key === '+' || e.key === '_')) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const persisted: PersistedState = JSON.parse(raw);
        setNotes(persisted.notes || []);
        setCanvas(persisted.canvas || { scale: 1, offsetX: 0, offsetY: 0 });
        setNextZIndex(persisted.nextZIndex || 1);
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist to localStorage whenever notes, canvas, or nextZIndex changes
  // Only save after initial load is complete to avoid overwriting with empty state
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      const persisted: PersistedState = {
        notes,
        canvas,
        nextZIndex,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [notes, canvas, nextZIndex, isLoaded]);

  // Update ghost position on mouse move in add mode
  useEffect(() => {
    if (mode !== "adding") {
      setGhostPosition(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate canvas position from screen coordinates
      // The board starts at top: 56px (toolbar height)
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight - 56;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;
      
      const screenX = e.clientX;
      const screenY = e.clientY - 56; // Account for toolbar
      
      const canvasX = (screenX - centerX - canvas.offsetX) / canvas.scale;
      const canvasY = (screenY - centerY - canvas.offsetY) / canvas.scale;
      
      setGhostPosition({ x: canvasX, y: canvasY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mode, canvas]);

  const onAddNoteMode = () => {
    setMode("adding");
    setGhostPosition(null);
  };

  const onPlaceNote = (canvasX: number, canvasY: number) => {
    const id = crypto.randomUUID?.() ?? String(Date.now());
    const newNote: Note = {
      id,
      title: "",
      content: "",
      x: canvasX,
      y: canvasY,
      color: activeColor,
      zIndex: nextZIndex,
    };
    
    setNotes([...notes, newNote]);
    setNextZIndex(nextZIndex + 1);
    setSelectedNoteId(id);
    setMode("idle");
    setGhostPosition(null);
  };

  const onUpdateNote = (noteId: string, fields: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...fields } : n));
  };

  const onSelectNote = (id: string | null) => {
    setSelectedNoteId(id);
  };

  const onBeginDragNote = (id: string, startCanvasX: number, startCanvasY: number) => {
    setMode("dragging");
    setDraggingNoteId(id);
    
    // Increase z-index
    setNotes(prev =>
      prev.map(n =>
        n.id === id ? { ...n, zIndex: nextZIndex } : n
      )
    );
    setNextZIndex(prev => prev + 1);
  };

  const onDragNote = (id: string, newCanvasX: number, newCanvasY: number) => {
    setNotes(prev =>
      prev.map(n =>
        n.id === id ? { ...n, x: newCanvasX, y: newCanvasY } : n
      )
    );
  };

  const onEndDragNote = (id: string) => {
    if (isOverTrash) {
      setNotes(prev => prev.filter(n => n.id !== id));
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
    }
    setIsOverTrash(false);
    setMode("idle");
    setDraggingNoteId(null);
  };

  const onPan = (deltaX: number, deltaY: number) => {
    setCanvas(prev => ({
      ...prev,
      offsetX: prev.offsetX + deltaX,
      offsetY: prev.offsetY + deltaY,
    }));
  };

  const onZoom = (scaleFactor: number, screenX: number, screenY: number) => {
    setCanvas(prev => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight - 56;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;
      
      const prevScale = prev.scale;
      const worldX = (screenX - centerX - prev.offsetX) / prevScale;
      const worldY = (screenY - centerY - prev.offsetY) / prevScale;
      
      let newScale = prevScale * scaleFactor;
      newScale = Math.min(2.0, Math.max(0.3, newScale));
      
      const newOffsetX = screenX - centerX - worldX * newScale;
      const newOffsetY = screenY - centerY - worldY * newScale;
      
      return { scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY };
    });
  };

  const onResetViewFit = () => {
    if (notes.length === 0) {
      setCanvas({ scale: 1, offsetX: 0, offsetY: 0 });
      return;
    }

    const minX = Math.min(...notes.map(n => n.x));
    const maxX = Math.max(...notes.map(n => n.x + 176));
    const minY = Math.min(...notes.map(n => n.y));
    const maxY = Math.max(...notes.map(n => n.y + 176));

    const padding = 40;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 56; // minus toolbar height

    const scaleX = (viewportWidth - padding * 2) / contentWidth;
    const scaleY = (viewportHeight - padding * 2) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 2.0);

    // Center of content in canvas coordinates
    const centerCanvasX = (minX + maxX) / 2;
    const centerCanvasY = (minY + maxY) / 2;

    // Since the transform div is at center (50%, 50%) with transformOrigin center,
    // we need to translate so that centerCanvasX, centerCanvasY appears at viewport center
    // The div center is at (viewportWidth/2, viewportHeight/2) in screen coords
    // After transform: screenX = viewportWidth/2 + offsetX + canvasX * scale
    // We want centerCanvasX to map to viewportWidth/2:
    // viewportWidth/2 = viewportWidth/2 + offsetX + centerCanvasX * scale
    // So: offsetX = -centerCanvasX * scale
    const newOffsetX = -centerCanvasX * newScale;
    const newOffsetY = -centerCanvasY * newScale;

    setCanvas({ scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY });
  };

  const handleCanvasClick = (canvasX: number, canvasY: number) => {
    if (mode === "adding") {
      onPlaceNote(canvasX, canvasY);
    }
  };

  return (
    <div style={{ transform: 'none' }}>
      <Toolbar
        activeColor={activeColor}
        onColorChange={setActiveColor}
        zoomPercent={Math.round(canvas.scale * 100)}
        onResetView={onResetViewFit}
        onEnterAddMode={onAddNoteMode}
      />
      <StickyBoard
        notes={notes}
        selectedNoteId={selectedNoteId}
        canvas={canvas}
        mode={mode}
        ghostPosition={ghostPosition}
        draggingNoteId={draggingNoteId}
        activeColor={activeColor}
        onCanvasClick={handleCanvasClick}
        onSelectNote={onSelectNote}
        onBeginDragNote={onBeginDragNote}
        onDragNote={onDragNote}
        onEndDragNote={onEndDragNote}
        onPan={onPan}
        onZoom={onZoom}
        onUpdateNote={onUpdateNote}
        setIsOverTrash={setIsOverTrash}
      />
      <TrashBin isActive={isOverTrash} />
    </div>
  );
}

export default App;
