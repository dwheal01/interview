import { useMemo, memo } from 'react';
import type { PresenceDoc } from '../types';

type PresenceBarProps = {
  users: PresenceDoc[];
  localUserId: string;
};

const PRESENCE_TIMEOUT_MS = 30_000;

function PresenceBarComponent({ users, localUserId }: PresenceBarProps) {
  // Memoize filtered users to avoid recalculating on every render
  const onlineUsers = useMemo(() => {
    const now = Date.now();
    return users.filter(
      user => now - user.lastSeen < PRESENCE_TIMEOUT_MS
    );
  }, [users]);

  return (
    <div className="fixed top-16 right-4 flex -space-x-2 z-40">
      {onlineUsers.map((user) => (
        <div
          key={user.userId}
          className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold cursor-default ${
            user.userId === localUserId ? 'ring-2 ring-black/20' : ''
          }`}
          style={{ backgroundColor: user.color }}
          title={user.username}
        >
          {user.username.charAt(0).toUpperCase()}
        </div>
      ))}
    </div>
  );
}

// Memoize PresenceBar to prevent unnecessary re-renders
export const PresenceBar = memo(PresenceBarComponent);

