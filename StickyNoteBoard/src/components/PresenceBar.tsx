import { useMemo, memo, useState, useEffect } from 'react';
import type { PresenceDoc } from '../types';

type PresenceBarProps = {
  users: PresenceDoc[];
  localUserId: string;
};

const PRESENCE_TIMEOUT_MS = 30_000;
const PRESENCE_UPDATE_INTERVAL_MS = 5_000; // Update every 5 seconds

function PresenceBarComponent({ users, localUserId }: PresenceBarProps) {
  // Use state to track current time, updated via effect (not during render)
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Update current time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, PRESENCE_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  // Memoize filtered users to avoid recalculating on every render
  const onlineUsers = useMemo(() => {
    return users.filter(
      user => currentTime - user.lastSeen < PRESENCE_TIMEOUT_MS
    );
  }, [users, currentTime]);

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

