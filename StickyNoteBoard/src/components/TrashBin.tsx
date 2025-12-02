
type TrashBinProps = {
  isActive: boolean;
};

export function TrashBin({ isActive }: TrashBinProps) {
  return (
    <div
      className={`fixed bottom-4 right-4 w-12 h-12 border rounded-full flex items-center justify-center text-xs bg-white shadow ${
        isActive ? 'bg-red-100 border-red-400 shadow-lg' : ''
      }`}
    >
      🗑
    </div>
  );
}

