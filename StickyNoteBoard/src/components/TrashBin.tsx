import { memo, useMemo } from 'react';

type TrashBinProps = {
  isActive: boolean;
};

function TrashBinComponent({ isActive }: TrashBinProps) {
  // Memoize className to avoid recalculation
  const className = useMemo(() => {
    const baseClasses = "fixed bottom-4 right-4 w-12 h-12 border rounded-full flex items-center justify-center text-xs bg-white shadow transition-colors";
    return isActive 
      ? `${baseClasses} bg-pink-200 border-pink-400 shadow-lg`
      : baseClasses;
  }, [isActive]);
  return (
    <div className={className}>
      🗑
    </div>
  );
}

// Memoize TrashBin to prevent unnecessary re-renders
export const TrashBin = memo(TrashBinComponent);

