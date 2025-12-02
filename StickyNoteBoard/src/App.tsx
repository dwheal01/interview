import { useState, useCallback, useMemo } from 'react';
import type { NoteColor } from './types';
import { Toolbar } from './components/Toolbar';
import { StickyBoard } from './components/StickyBoard';
import { TrashBin } from './components/TrashBin';
import { UsernameModal } from './components/UsernameModal';
import { PresenceBar } from './components/PresenceBar';
import { CanvasProvider, useCanvas } from './context/CanvasContext';
import { AppModeProvider, useAppMode } from './context/AppModeContext';
import { UserSessionProvider, useUserSession } from './context/UserSessionContext';
import { useNoteOperations } from './hooks/useNoteOperations';
import { useCollaboration, useCollaborationHeartbeat, useCursorUpdates } from './hooks/useCollaboration';
import { useBrowserZoomPrevention } from './hooks/useBrowserZoomPrevention';

function AppContent() {
  // User session
  const { localUser, showUsernameModal, handleJoin } = useUserSession();

  // Canvas state
  const { canvas, onPan, onZoom, onResetViewFit, nextZIndex, setNextZIndex } = useCanvas();

  // App mode state
  const {
    mode,
    setMode,
    ghostPosition,
    draggingNoteId,
    setDraggingNoteId,
    isOverTrash,
    setIsOverTrash,
    enterAddMode,
    exitAddMode,
  } = useAppMode();

  // Collaboration (Firestore subscriptions)
  const { notes, locks, presence, cursors } = useCollaboration(localUser?.userId || '');
  useCollaborationHeartbeat(localUser);
  const { handleCursorMove } = useCursorUpdates(localUser);

  // UI state
  const [activeColor, setActiveColor] = useState<NoteColor>('yellow');

  // Note operations (encapsulates all note CRUD and lock management)
  const noteOperations = useNoteOperations({
    localUser,
    locks,
    notes,
    activeColor,
    nextZIndex,
    setNextZIndex,
    setMode,
    setDraggingNoteId,
    setIsOverTrash,
    exitAddMode,
  });

  // Prevent browser zoom shortcuts
  useBrowserZoomPrevention();

  // Event handlers
  const handleCanvasClick = useCallback(
    (canvasX: number, canvasY: number) => {
      if (mode === 'adding') {
        noteOperations.onPlaceNote(canvasX, canvasY);
      }
    },
    [mode, noteOperations]
  );

  const handleResetView = useCallback(() => {
    onResetViewFit(notes);
  }, [notes, onResetViewFit]);

  const handleSelectNote = useCallback(
    (id: string | null) => {
      noteOperations.onSelectNote(id);
      if (mode === 'adding') {
        exitAddMode();
      }
    },
    [mode, exitAddMode, noteOperations]
  );

  const handleEndDragNote = useCallback(
    async (id: string) => {
      await noteOperations.onEndDragNote(id, isOverTrash);
    },
    [isOverTrash, noteOperations]
  );

  // Memoized zoom percent
  const zoomPercent = useMemo(() => Math.round(canvas.scale * 100), [canvas.scale]);

  if (!localUser || showUsernameModal) {
    return <UsernameModal onJoin={handleJoin} />;
  }

  return (
    <div style={{ transform: 'none' }}>
      <Toolbar
        activeColor={activeColor}
        onColorChange={setActiveColor}
        zoomPercent={zoomPercent}
        onResetView={handleResetView}
        onEnterAddMode={enterAddMode}
      />
      <PresenceBar users={presence} localUserId={localUser.userId} />
      <StickyBoard
        notes={notes}
        selectedNoteId={noteOperations.selectedNoteId}
        canvas={canvas}
        mode={mode}
        ghostPosition={ghostPosition}
        draggingNoteId={draggingNoteId}
        activeColor={activeColor}
        locks={locks}
        localUserId={localUser.userId}
        cursors={cursors}
        onCanvasClick={handleCanvasClick}
        onSelectNote={handleSelectNote}
        onBeginDragNote={noteOperations.onBeginDragNote}
        onDragNote={noteOperations.onDragNote}
        onEndDragNote={handleEndDragNote}
        onPan={onPan}
        onZoom={onZoom}
        onUpdateNote={noteOperations.onUpdateNote}
        onStartEdit={noteOperations.onStartEdit}
        onStopEdit={noteOperations.onStopEdit}
        setIsOverTrash={setIsOverTrash}
        onCursorMove={handleCursorMove}
        localUser={localUser}
      />
      <TrashBin isActive={isOverTrash} />
    </div>
  );
}

function App() {
  return (
    <UserSessionProvider>
      <CanvasProvider>
        <AppModeProviderWrapper />
      </CanvasProvider>
    </UserSessionProvider>
  );
}

function AppModeProviderWrapper() {
  const { canvas } = useCanvas();
  return (
    <AppModeProvider canvas={canvas}>
      <AppContent />
    </AppModeProvider>
  );
}

export default App;
