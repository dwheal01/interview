import type { NoteColor } from '../types';
import { NOTE_COLORS } from '../types';

type ToolbarProps = {
  activeColor: NoteColor;
  onColorChange: (color: NoteColor) => void;
  zoomPercent: number;
  onResetView: () => void;
  onEnterAddMode: () => void;
};

export function Toolbar({
  activeColor,
  onColorChange,
  zoomPercent,
  onResetView,
  onEnterAddMode,
}: ToolbarProps) {
  const colors = NOTE_COLORS;

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-14 flex items-center px-4 gap-4 bg-white shadow z-50"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        transform: 'scale(1)',
        transformOrigin: '0 0',
        willChange: 'auto',
        isolation: 'isolate',
        contain: 'layout style paint'
      }}
    >
      <div className="text-sm font-semibold">Sticky Canvas</div>
      
      <div className="flex gap-2">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-6 h-6 border ${
              color === "yellow" ? "bg-yellow-200" :
              color === "pink" ? "bg-pink-200" :
              color === "blue" ? "bg-sky-200" :
              "bg-green-200"
            } ${activeColor === color ? "ring-2 ring-black" : ""}`}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>

      <button
        className="px-3 py-1 border text-sm"
        onClick={onEnterAddMode}
      >
        Add Note
      </button>

      <div className="text-sm text-gray-500">
        Zoom: {zoomPercent}%
      </div>

      <button
        className="px-3 py-1 border text-sm"
        onClick={onResetView}
      >
        Reset View
      </button>
    </div>
  );
}

