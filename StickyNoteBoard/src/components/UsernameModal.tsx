import { useState, useCallback, memo } from 'react';

type UsernameModalProps = {
  onJoin: (username: string) => void;
};

function UsernameModalComponent({ onJoin }: UsernameModalProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Username cannot be empty');
      return;
    }
    onJoin(trimmed);
  }, [username, onJoin]);

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setError('');
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Join the Board</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter a username to join the board
          </label>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            placeholder="Your username"
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm mb-2">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}

// Memoize UsernameModal to prevent unnecessary re-renders
export const UsernameModal = memo(UsernameModalComponent);

