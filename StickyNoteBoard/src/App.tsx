import { useState, useEffect, useRef } from 'react';
import type { NoteColor, CanvasTransform, NoteDoc, LockDoc, LocalUser } from './types';
import { Toolbar } from './components/Toolbar';
import { StickyBoard } from './components/StickyBoard';
import { TrashBin } from './components/TrashBin';
import { UsernameModal } from './components/UsernameModal';
import { PresenceBar } from './components/PresenceBar';
import { getLocalUser, createLocalUser } from './utils/userSession';
import { 
  useNotes, 
  useLocks, 
  usePresence, 
  useCursors,
  usePresenceHeartbeat,
  createNote,
  updateNote,
  deleteNote,
  acquireLock,
  releaseLock,
  updateCursor
} from './hooks/useFirestore';

type AppMode = "idle" | "adding" | "dragging" | "panning";

const STORAGE_KEY = "sticky-board-canvas";

function App() {
  // Local user session
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  // Firestore subscriptions
  const notes = useNotes();
  const locks = useLocks();
  const presence = usePresence();
  const cursors = useCursors(localUser?.userId || '');
  usePresenceHeartbeat(localUser);

  // UI state
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<NoteColor>("yellow");
  const [canvas, setCanvas] = useState<CanvasTransform>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [mode, setMode] = useState<AppMode>("idle");
  const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Initialize local user
  useEffect(() => {
    const user = getLocalUser();
    if (user) {
      setLocalUser(user);
    } else {
      setShowUsernameModal(true);
    }
    setIsLoaded(true);
  }, []);

  // Load canvas from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const persisted = JSON.parse(raw);
        setCanvas(persisted.canvas || { scale: 1, offsetX: 0, offsetY: 0 });
        setNextZIndex(persisted.nextZIndex || 1);
      }
    } catch (e) {
      console.error('Failed to load canvas from localStorage:', e);
    }
  }, []);

  // Persist canvas to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ canvas, nextZIndex }));
    } catch (e) {
      console.error('Failed to save canvas to localStorage:', e);
    }
  }, [canvas, nextZIndex, isLoaded]);

  // Prevent browser zoom shortcuts
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Update ghost position on mouse move in add mode
  useEffect(() => {
    if (mode !== "adding") {
      setGhostPosition(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight - 56;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;
      
      const screenX = e.clientX;
      const screenY = e.clientY - 56;
      
      const canvasX = (screenX - centerX - canvas.offsetX) / canvas.scale;
      const canvasY = (screenY - centerY - canvas.offsetY) / canvas.scale;
      
      setGhostPosition({ x: canvasX, y: canvasY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mode, canvas]);

  const handleJoin = (username: string) => {
    const user = createLocalUser(username);
    setLocalUser(user);
    setShowUsernameModal(false);
  };

  const onAddNoteMode = () => {
    setMode("adding");
    setGhostPosition(null);
  };

  const onPlaceNote = async (canvasX: number, canvasY: number) => {
    if (!localUser) return;
    
    const id = crypto.randomUUID?.() ?? String(Date.now());
    const newNote: NoteDoc = {
      id,
      title: "",
      content: "",
      x: canvasX,
      y: canvasY,
      color: activeColor,
      zIndex: nextZIndex,
      updatedAt: Date.now(),
    };
    
    await createNote(newNote);
    setNextZIndex(prev => prev + 1);
    setSelectedNoteId(id);
    setMode("idle");
    setGhostPosition(null);
  };

  const onUpdateNote = async (noteId: string, fields: Partial<NoteDoc>) => {
    if (!localUser) return;
    const lock = locks[noteId];
    if (lock && lock.userId !== localUser.userId) return; // Can't edit if locked by someone else
    
    await updateNote(noteId, fields);
  };

  const onSelectNote = (id: string | null) => {
    setSelectedNoteId(id);
  };

  const onStartEdit = async (noteId: string) => {
    if (!localUser) return;
    const lock = locks[noteId];
    if (lock && lock.userId !== localUser.userId) {
      // Can't edit - locked by someone else
      return;
    }
    setEditingNoteId(noteId);
    await acquireLock(noteId, localUser);
  };

  const onStopEdit = async (noteId: string) => {
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      await releaseLock(noteId);
    }
  };

  const onBeginDragNote = async (id: string, startCanvasX: number, startCanvasY: number) => {
    if (!localUser) return;
    const lock = locks[id];
    if (lock && lock.userId !== localUser.userId) return; // Can't drag if locked by someone else
    
    setMode("dragging");
    setDraggingNoteId(id);
    
    // Increase z-index
    const note = notes.find(n => n.id === id);
    if (note) {
      await updateNote(id, { zIndex: nextZIndex });
      setNextZIndex(prev => prev + 1);
    }
  };

  const onDragNote = async (id: string, newCanvasX: number, newCanvasY: number) => {
    if (!localUser) return;
    const lock = locks[id];
    if (lock && lock.userId !== localUser.userId) return; // Can't drag if locked by someone else
    
    await updateNote(id, { x: newCanvasX, y: newCanvasY });
  };

  const onEndDragNote = async (id: string) => {
    if (isOverTrash) {
      await deleteNote(id);
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
    const viewportHeight = window.innerHeight - 56;

    const scaleX = (viewportWidth - padding * 2) / contentWidth;
    const scaleY = (viewportHeight - padding * 2) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 2.0);

    const centerCanvasX = (minX + maxX) / 2;
    const centerCanvasY = (minY + maxY) / 2;

    const newOffsetX = -centerCanvasX * newScale;
    const newOffsetY = -centerCanvasY * newScale;

    setCanvas({ scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY });
  };

  const handleCanvasClick = (canvasX: number, canvasY: number) => {
    if (mode === "adding") {
      onPlaceNote(canvasX, canvasY);
    }
  };

  if (!localUser || showUsernameModal) {
    return <UsernameModal onJoin={handleJoin} />;
  }

  return (
    <div style={{ transform: 'none' }}>
      <Toolbar
        activeColor={activeColor}
        onColorChange={setActiveColor}
        zoomPercent={Math.round(canvas.scale * 100)}
        onResetView={onResetViewFit}
        onEnterAddMode={onAddNoteMode}
      />
      <PresenceBar users={presence} localUserId={localUser.userId} />
      <StickyBoard
        notes={notes}
        selectedNoteId={selectedNoteId}
        canvas={canvas}
        mode={mode}
        ghostPosition={ghostPosition}
        draggingNoteId={draggingNoteId}
        activeColor={activeColor}
        locks={locks}
        localUserId={localUser.userId}
        cursors={cursors}
        onCanvasClick={handleCanvasClick}
        onSelectNote={onSelectNote}
        onBeginDragNote={onBeginDragNote}
        onDragNote={onDragNote}
        onEndDragNote={onEndDragNote}
        onPan={onPan}
        onZoom={onZoom}
        onUpdateNote={onUpdateNote}
        onStartEdit={onStartEdit}
        onStopEdit={onStopEdit}
        setIsOverTrash={setIsOverTrash}
        onCursorMove={updateCursor}
        localUser={localUser}
      />
      <TrashBin isActive={isOverTrash} />
    </div>
  );
}

export default App;
